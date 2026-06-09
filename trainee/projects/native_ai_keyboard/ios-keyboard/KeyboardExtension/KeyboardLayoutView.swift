import CoreGraphics
import CoreText
import UIKit

/// KeyboardKit-style zones: **toolbar** (AI + chrome) → **keyboard body** (keys only).
/// No extra row below the space/return line — that gap was exposing UIInputView backdrop.
final class KeyboardLayoutView: UIView {
    private weak var controller: KeyboardViewController?

    /// Floats above the main stack so iOS does not clip the preview (keyboard height is fixed).
    private let previewZone = KeyboardPreviewOverlayView()
    private var previewOverlay: UIView { previewZone }
    private var resultTitleLabel: UILabel { previewZone.titleLabel }
    private var resultTextView: UITextView { previewZone.textView }
    private var resultButtonRow: UIStackView { previewZone.buttonRow }
    private var resultDiscardButton: UIButton { previewZone.discardButton }
    private var resultApplyButton: UIButton { previewZone.applyButton }
    private var previewOverlayHeightConstraint: NSLayoutConstraint?
    private var statusRowHeightConstraint: NSLayoutConstraint?
    private var toolbarHeightConstraint: NSLayoutConstraint?
    private var keyplaneMinHeightConstraint: NSLayoutConstraint?
    private var lastFittedBounds: CGSize = .zero
    private var didFinishDeferredBuild = false
    private var isDeferredKeyplaneBuilding = false
    private var keyplanePlaceholderRows: [UIView] = []

    /// Opaque layer — paints over any UIInputView backdrop that peeks through.
    private let surfaceCover = UIView()

    /// Top slot — mirrors KeyboardKit `toolbar:` (AI actions + trailing chrome controls).
    private let toolbarZone = KeyboardToolbarView()
    var chromeToolbarAnchor: UIView { toolbarZone }
    private var toolbarRow: UIStackView { toolbarZone }
    private var actionsRow: UIStackView { toolbarZone.actionsRow }
    private var plusButtonHost: UIStackView { toolbarZone.plusButtonHost }
    /// Fills remaining height — mirrors KeyboardKit `KeyboardView` body.
    private let keyContainer = KeyboardKeyplaneView()
    private let statusZone = KeyboardStatusRowView()
    private var statusRow: UIStackView { statusZone }
    private var statusLabel: UILabel { statusZone.statusLabel }
    private var openAppButton: UIButton { statusZone.openAppButton }

    private var sessionPollTimer: Timer?
    private var settingsObserver: AppGroupSettingsObserverToken?
    private var deleteRepeatTimer: Timer?
    private var deleteRepeatStartWork: DispatchWorkItem?

    /// Captured on AI button `touchDown` while the host field still has full `UITextInput` context (tap on same control clears context before `touchUp`).
    private var pendingRewriteFromTouchDown: (text: String, snapshot: RewriteSnapshot)?

    private weak var shiftKeyButton: UIButton?
    private var alternatesHost: UIView?
    private var alternatesOptions: [String] = []
    /// One view per alternate “mini key” (hit-testing uses these frames).
    private var alternatesCells: [UIView] = []
    /// Swallows the trailing `touchUpInside` after an alternate was picked from the long-press tray.
    private var suppressNextLetterKeyTap = false

    private enum ShiftPhase {
        case off
        case oneShot
        case locked
    }

    private var shiftPhase: ShiftPhase = .off

    private enum Keyplane {
        case letters
        case numbers
        case emoji
    }

    private var keyplane: Keyplane = .letters
    /// 0 = main digits row, 1 = secondary symbols (#+= page).
    private var numbersSymbolsPage: Int = 0

    /// Emoji grid relies on color font rendering in the extension; set `true` again when glyphs draw reliably.
    private static let emojiKeyplaneEnabled = false

    private enum KeyMetrics {
        static let horizontalSpacing: CGFloat = 6
        static let rowSpacing: CGFloat = 10
        static let keyHeight: CGFloat = 52
        static let keyTopInset: CGFloat = 4
        static let keyBottomInset: CGFloat = 6
        static let keyHorizontalInset: CGFloat = 3
        static let keyCornerRadius: CGFloat = 5
        static let shiftDeleteWidth: CGFloat = 42
        static let bottomSideKeyWidth: CGFloat = 85
        static let staggeredRowIdentifier = "kb_row_staggered"
    }

    /// Target chrome + key block height at full size (toolbar 48 + 4 rows + gaps + insets).
    private enum LayoutFit {
        static let topCornerRadius: CGFloat = 24
        static let designHeight: CGFloat = 304
        static let designWidth: CGFloat = 390
        static let toolbarDesign: CGFloat = 48
        static let toolbarMin: CGFloat = 34
        static let rowSpacingMin: CGFloat = 3
        static let keyInsetMin: CGFloat = 4
        static let minReliableKeyboardHeight: CGFloat = designHeight * 0.72
        static let keyplaneMinHeight: CGFloat = KeyMetrics.keyHeight * 4
    }

    private enum KeyCapKind {
        case letter
        case functional
        case returnKey
    }

    private var kb: Bundle { .keyboardBundle }

    static func surfaceColor(isDark: Bool) -> UIColor {
        KeyboardNativePalette.surfaceColor(isDark: isDark)
    }

    static func applyTopOvalMask(to view: UIView) {
        view.layer.cornerRadius = LayoutFit.topCornerRadius
        view.layer.maskedCorners = [.layerMinXMinYCorner, .layerMaxXMinYCorner]
        if #available(iOS 13.0, *) {
            view.layer.cornerCurve = .continuous
        }
        view.clipsToBounds = true
    }

    private func nativePalette(isDark: Bool? = nil) -> KeyboardNativePalette.Colors {
        let dark = isDark ?? (traitCollection.userInterfaceStyle == .dark)
        return KeyboardNativePalette.colors(isDark: dark)
    }

    private func attachNativeKeyPressFeedback(to button: UIButton, kind: KeyCapKind) {
        button.configurationUpdateHandler = { [weak self] btn in
            guard let self, var cfg = btn.configuration else { return }
            let palette = self.nativePalette()
            let pressed = btn.isHighlighted || btn.isSelected
            let (base, pressedColor): (UIColor, UIColor) = switch kind {
            case .letter:
                (palette.letterKey, palette.letterKeyPressed)
            case .functional:
                (palette.functionalKey, palette.functionalKeyPressed)
            case .returnKey:
                (self.chromeAccentColor(), self.chromeAccentPressedColor())
            }
            let bg = pressed ? pressedColor : base
            cfg.baseBackgroundColor = bg
            cfg.background.backgroundColor = bg
            btn.configuration = cfg
        }
    }

    /// Toolbar / AI tint from App Group (host app picker). SF Symbols + system font only — no third-party icon fonts.
    private func chromeAccentColor() -> UIColor {
        AppGroupStore.shared.keyboardChromeAccent.uiColor
    }

    private func chromeAccentPressedColor() -> UIColor {
        let base = chromeAccentColor()
        var h: CGFloat = 0, s: CGFloat = 0, b: CGFloat = 0, a: CGFloat = 0
        if base.getHue(&h, saturation: &s, brightness: &b, alpha: &a) {
            return UIColor(hue: h, saturation: s, brightness: max(0, b * 0.82), alpha: a)
        }
        return base.withAlphaComponent(0.85)
    }

    /// SF Symbol with a small system-font fallback bitmap if a name is missing (avoids “?” placeholders in extensions).
    private func symbolImage(systemName: String, pointSize: CGFloat, weight: UIImage.SymbolWeight = .medium, fallbackLetter: String) -> UIImage {
        let symCfg = UIImage.SymbolConfiguration(pointSize: pointSize, weight: weight)
        if let img = UIImage(systemName: systemName, withConfiguration: symCfg) {
            return img.withRenderingMode(.alwaysTemplate)
        }
        let s = CGSize(width: max(22, pointSize + 8), height: max(22, pointSize + 8))
        return UIGraphicsImageRenderer(size: s).image { _ in
            let attrs: [NSAttributedString.Key: Any] = [
                .font: UIFont.systemFont(ofSize: pointSize * 0.72, weight: .semibold),
                .foregroundColor: UIColor.black,
            ]
            let str = fallbackLetter as NSString
            let ts = str.size(withAttributes: attrs)
            str.draw(at: CGPoint(x: (s.width - ts.width) / 2, y: (s.height - ts.height) / 2), withAttributes: attrs)
        }.withRenderingMode(.alwaysTemplate)
    }

    private func actionRowSymbolImage(systemName: String) -> UIImage {
        let fallback: String
        switch systemName {
        case "arrow.up.circle": fallback = "I"
        case "arrow.down.right.and.arrow.up.left": fallback = "S"
        case "arrow.up.left.and.arrow.down.right": fallback = "X"
        default: fallback = "•"
        }
        return symbolImage(systemName: systemName, pointSize: 13, weight: .semibold, fallbackLetter: fallback)
    }

    private func refreshChromeAccents() {
        let accent = chromeAccentColor()
        openAppButton.tintColor = accent
        var ocfg = openAppButton.configuration
        ocfg?.baseForegroundColor = accent
        openAppButton.configuration = ocfg

        if var ac = resultApplyButton.configuration {
            ac.baseBackgroundColor = accent
            resultApplyButton.configuration = ac
        }

        let buttons = actionsRow.arrangedSubviews.compactMap { $0 as? UIButton }
        for button in buttons {
            guard var cfg = button.configuration else { continue }
            cfg.baseForegroundColor = accent
            button.configuration = cfg
        }

        if let traits = controller?.traitCollection {
            applyKeyCapsAppearance(isDark: traits.userInterfaceStyle == .dark)
        }
    }

    override var intrinsicContentSize: CGSize {
        CGSize(width: UIView.noIntrinsicMetric, height: UIView.noIntrinsicMetric)
    }

    override func layoutSubviews() {
        super.layoutSubviews()
        surfaceCover.frame = bounds
        Self.applyTopOvalMask(to: self)
        Self.applyTopOvalMask(to: surfaceCover)
        guard !isDeferredKeyplaneBuilding else { return }
        fitLayoutToAvailableBounds()
    }

    /// Apply fit once after deferred keyplane build when bounds are stable.
    func applyStableLayoutFit() {
        isDeferredKeyplaneBuilding = false
        lastFittedBounds = .zero
        fitLayoutToAvailableBounds(force: true)
    }

    /// Shrink toolbar + key gaps/insets when iOS allocates a shorter keyboard slot (landscape / small devices).
    private func fitLayoutToAvailableBounds(force: Bool = false) {
        if isDeferredKeyplaneBuilding {
            KeyboardExtensionDiagnostics.log("fitLayout skipped=deferred")
            return
        }
        let size = bounds.size
        guard size.width > 1, size.height > 1 else { return }
        guard size.height >= LayoutFit.minReliableKeyboardHeight else {
            KeyboardExtensionDiagnostics.log(
                String(format: "fitLayout skipped=transient size=%.0fx%.0f", size.width, size.height)
            )
            return
        }
        if !force,
           abs(size.width - lastFittedBounds.width) < 0.5,
           abs(size.height - lastFittedBounds.height) < 0.5
        {
            return
        }
        lastFittedBounds = size

        let heightScale = min(1, size.height / LayoutFit.designHeight)
        let widthScale = min(1, size.width / LayoutFit.designWidth)
        let scale = min(heightScale, widthScale)

        let toolbarH = max(LayoutFit.toolbarMin, LayoutFit.toolbarDesign * scale)
        toolbarHeightConstraint?.constant = toolbarH

        let rowSpacing = max(LayoutFit.rowSpacingMin, KeyMetrics.rowSpacing * scale)
        keyContainer.spacing = rowSpacing

        let topInset = max(LayoutFit.keyInsetMin, KeyMetrics.keyTopInset * scale)
        let bottomInset = max(LayoutFit.keyInsetMin, KeyMetrics.keyBottomInset * scale)
        keyContainer.layoutMargins = UIEdgeInsets(
            top: topInset,
            left: KeyMetrics.keyHorizontalInset,
            bottom: bottomInset,
            right: KeyMetrics.keyHorizontalInset
        )
        applyStaggeredRowInsets(width: size.width)
        KeyboardExtensionDiagnostics.logSync(
            String(format: "fitLayout size=%.0fx%.0f scale=%.2f toolbar=%.0f applied", size.width, size.height, scale, toolbarH)
        )
    }

    init(controller: KeyboardViewController) {
        KeyboardExtensionDiagnostics.logSync("KeyboardLayoutView phase1 begin")
        self.controller = controller
        super.init(frame: .zero)
        clipsToBounds = false
        isOpaque = true
        KeyboardExtensionDiagnostics.logSync("build step: resultPanel")
        buildResultPanel()
        KeyboardExtensionDiagnostics.logSync("build step: actionsRow")
        buildActionsRow()
        KeyboardExtensionDiagnostics.logSync("build step: toolbarChrome")
        buildToolbarChrome()
        KeyboardExtensionDiagnostics.logSync("build step: statusRow")
        buildStatusRow()
        KeyboardExtensionDiagnostics.logSync("build step: layoutRoot")
        layoutRoot()
        KeyboardExtensionDiagnostics.logSync("build step: appearance")
        applyAppearance(traits: controller.traitCollection)
        setResultPanelVisible(false, animated: false)
        KeyboardExtensionDiagnostics.logSync("KeyboardLayoutView phase1 done")
    }

    /// Phase 2: heavy keyplane + chrome overlay — deferred until after first appear frame.
    /// Letter rows are built across run-loop turns to avoid extension watchdog kills.
    func finishDeferredBuildIfNeeded(completion: (() -> Void)? = nil) {
        guard !didFinishDeferredBuild else {
            completion?()
            return
        }
        didFinishDeferredBuild = true
        isDeferredKeyplaneBuilding = true
        KeyboardExtensionDiagnostics.logSync("build step: deferred start")
        removeKeyplanePlaceholderRows()
        resetKeyContainerLayout()
        if keyplane == .letters {
            continueIncrementalLetterBuild(step: 0, completion: completion)
        } else {
            rebuildKeyContainerContent()
            applyKeyContainerFinishStyling()
            wireKeyInteractionExtras()
            finishDeferredBuildTail(completion: completion)
        }
    }

    @available(*, unavailable)
    required init?(coder: NSCoder) {
        fatalError("init(coder:) has not been implemented")
    }

    deinit {
        sessionPollTimer?.invalidate()
        deleteRepeatTimer?.invalidate()
        deleteRepeatStartWork?.cancel()
    }

    override func didMoveToWindow() {
        super.didMoveToWindow()
        sessionPollTimer?.invalidate()
        sessionPollTimer = nil
        settingsObserver = nil
        if window != nil {
            settingsObserver = AppGroupSettingsNotifier.observe { [weak self] in
                self?.syncSettingsFromAppGroup()
            }
            let t = Timer.scheduledTimer(withTimeInterval: 1.0, repeats: true) { [weak self] _ in
                self?.refreshOpenAppButtonVisibility()
            }
            RunLoop.main.add(t, forMode: .common)
            sessionPollTimer = t
            refreshOpenAppButtonVisibility()
            syncSettingsFromAppGroup()
        }
    }

    /// Refresh toolbar strings + host-app settings (preview toggle, accent, etc.).
    func syncSettingsFromAppGroup() {
        syncRegionChrome()
        if !AppGroupStore.shared.aiPreviewBeforeApply {
            hideResultPanel()
        }
        refreshOpenAppButtonVisibility()
        refreshChromeAccents()
        controller?.chromeOptionsPresenter?.rebuildIfVisible()
    }

    func refreshChromeStringsFromAppGroup() {
        syncSettingsFromAppGroup()
    }

    func applyAppearance(traits: UITraitCollection) {
        let isDark = traits.userInterfaceStyle == .dark
        let surface = Self.surfaceColor(isDark: isDark)
        isOpaque = true
        backgroundColor = surface
        surfaceCover.backgroundColor = surface
        Self.applyTopOvalMask(to: self)
        Self.applyTopOvalMask(to: surfaceCover)
        controller?.syncKeyboardSurface()
        statusLabel.textColor = isDark ? .lightGray : .darkGray
        keyContainer.backgroundColor = surface
        applyKeyCapsAppearance(isDark: isDark)
        applyResultPanelAppearance(isDark: isDark)
        toolbarZone.applyDividerAppearance(isDark: isDark)
        controller?.chromeOptionsPresenter?.applyAppearance()
        refreshShiftAppearance()
        refreshChromeAccents()
    }

    private func applyResultPanelAppearance(isDark: Bool) {
        let palette = nativePalette(isDark: isDark)
        previewOverlay.backgroundColor = palette.previewPanel
        resultTitleLabel.textColor = palette.primaryText
        resultTextView.backgroundColor = palette.previewField
        resultTextView.textColor = palette.primaryText
    }

    private func applyKeyCapsAppearance(isDark: Bool) {
        let palette = nativePalette(isDark: isDark)
        func visit(_ view: UIView) {
            if let s = view as? UIStackView {
                s.arrangedSubviews.forEach { visit($0) }
                return
            }
            if let scroll = view as? UIScrollView {
                scroll.subviews.forEach { visit($0) }
                return
            }
            if let ek = view as? EmojiDrawKeyControl {
                ek.backgroundColor = palette.letterKey
                ek.setNeedsDisplay()
                return
            }
            if let letter = view as? LetterKeyControl {
                letter.applyColors(
                    normal: palette.letterKey,
                    pressed: palette.letterKeyPressed,
                    text: palette.primaryText
                )
                return
            }
            guard let b = view as? UIButton, var cfg = b.configuration else { return }
            let isReturn = b.accessibilityIdentifier == "kb_return"
            let kind: KeyCapKind
            if isReturn {
                kind = .returnKey
            } else if isFunctionalKeyButton(b) {
                kind = .functional
            } else {
                kind = .letter
            }
            let bg: UIColor = switch kind {
            case .letter: palette.letterKey
            case .functional: palette.functionalKey
            case .returnKey: chromeAccentColor()
            }
            let foreground = isReturn ? palette.returnText : palette.primaryText
            cfg.baseBackgroundColor = bg
            cfg.baseForegroundColor = foreground
            cfg.background.backgroundColor = bg
            b.configuration = cfg
            b.layer.shadowOpacity = palette.keyShadowOpacity
            b.setNeedsUpdateConfiguration()
        }
        keyContainer.arrangedSubviews.forEach { visit($0) }
    }

    private func isFunctionalKeyButton(_ button: UIButton) -> Bool {
        guard let id = button.accessibilityIdentifier else { return false }
        return ["kb_shift", "kb_delete", "kb_123", "kb_ABC", "kb_return", "kb_sym_page"].contains(id)
    }

    // MARK: - Strings (Language & Region + typing locale: non-English preferred before English in the merged list)

    private func kbString(_ key: String) -> String {
        let code = AppGroupStore.shared.keyboardChromeStringsLanguageCode
        let main = Bundle(for: KeyboardLayoutView.self)
        if let path = main.path(forResource: code, ofType: "lproj"),
           let b = Bundle(path: path)
        {
            let s = NSLocalizedString(key, tableName: nil, bundle: b, value: "\u{1}", comment: "")
            if s != "\u{1}" { return s }
        }
        if let path = main.path(forResource: "en", ofType: "lproj"), let b = Bundle(path: path) {
            return NSLocalizedString(key, tableName: nil, bundle: b, value: key, comment: "")
        }
        return key
    }

    @objc private func rewriteTouchDown() {
        guard let c = controller else { return }
        pendingRewriteFromTouchDown = c.rewriteContext()
    }

    @objc private func rewriteTouchCancel() {
        pendingRewriteFromTouchDown = nil
    }

    private func syncRegionChrome() {
        refreshActionRowTitles()
        refreshReturnKeyTitle()
        refreshLetterKeyCaps()
        resultTitleLabel.text = kbString("keyboard.result_preview_title")
        var discardCfg = resultDiscardButton.configuration
        discardCfg?.title = kbString("keyboard.discard_result")
        resultDiscardButton.configuration = discardCfg
        var applyCfg = resultApplyButton.configuration
        applyCfg?.title = kbString("keyboard.apply_result")
        resultApplyButton.configuration = applyCfg
        refreshChromeAccents()
    }

    private func refreshActionRowTitles() {
        let items: [(String, String)] = [
            ("arrow.up.circle", "keyboard.action_improve"),
            ("arrow.down.right.and.arrow.up.left", "keyboard.action_shorten"),
            ("arrow.up.left.and.arrow.down.right", "keyboard.action_expand"),
        ]
        let buttons = actionsRow.arrangedSubviews.compactMap { $0 as? UIButton }
        for (i, b) in buttons.enumerated() where i < items.count {
            var cfg = b.configuration
            cfg?.title = kbString(items[i].1)
            cfg?.image = actionRowSymbolImage(systemName: items[i].0)
            b.configuration = cfg
        }
    }

    private func refreshReturnKeyTitle() {
        keyContainer.arrangedSubviews.forEach { row in
            guard let stack = row as? UIStackView else { return }
            for v in stack.arrangedSubviews {
                guard let b = v as? UIButton, b.accessibilityIdentifier == "kb_return" else { continue }
                var cfg = b.configuration
                cfg?.title = kbString("keyboard.key_return")
                b.configuration = cfg
            }
        }
    }

    private func layoutRoot() {
        let constraints = KeyboardRootViewLayout.install(
            on: self,
            surfaceCover: surfaceCover,
            toolbarRow: toolbarZone,
            statusRow: statusZone,
            keyContainer: keyContainer,
            previewOverlay: previewZone,
            toolbarDesignHeight: LayoutFit.toolbarDesign
        )
        toolbarHeightConstraint = constraints.toolbarHeight
        statusRowHeightConstraint = constraints.statusHeight
        previewOverlayHeightConstraint = constraints.previewHeight
        keyplaneMinHeightConstraint = constraints.keyplaneMinHeight
        installKeyplanePlaceholderRows()
        updateStatusRowVisibility()
    }

    private func installKeyplanePlaceholderRows() {
        removeKeyplanePlaceholderRows()
        keyplanePlaceholderRows = (0 ..< 4).map { _ in
            let row = UIView()
            row.isUserInteractionEnabled = false
            row.backgroundColor = .clear
            row.setContentHuggingPriority(.defaultHigh, for: .vertical)
            row.setContentCompressionResistancePriority(.defaultHigh, for: .vertical)
            let height = row.heightAnchor.constraint(equalToConstant: KeyMetrics.keyHeight)
            height.priority = .defaultHigh
            height.isActive = true
            keyContainer.addArrangedSubview(row)
            return row
        }
    }

    private func removeKeyplanePlaceholderRows() {
        keyplanePlaceholderRows.forEach {
            keyContainer.removeArrangedSubview($0)
            $0.removeFromSuperview()
        }
        keyplanePlaceholderRows = []
    }

    func toggleChromeOptionsPanel() {
        hideAlternatesBar()
        controller?.toggleChromeOptionsPanel()
    }

    private func buildResultPanel() {
        let outer = UIStackView()
        outer.axis = .vertical
        outer.spacing = 8
        outer.translatesAutoresizingMaskIntoConstraints = false
        previewOverlay.addSubview(outer)

        NSLayoutConstraint.activate([
            outer.leadingAnchor.constraint(equalTo: previewOverlay.leadingAnchor, constant: 12),
            outer.trailingAnchor.constraint(equalTo: previewOverlay.trailingAnchor, constant: -12),
            outer.topAnchor.constraint(equalTo: previewOverlay.topAnchor, constant: 10),
            outer.bottomAnchor.constraint(equalTo: previewOverlay.bottomAnchor, constant: -10),
        ])

        resultTitleLabel.font = .systemFont(ofSize: 13, weight: .semibold)
        resultTitleLabel.text = kbString("keyboard.result_preview_title")
        resultTitleLabel.numberOfLines = 1

        resultTextView.font = .systemFont(ofSize: 14, weight: .regular)
        resultTextView.isEditable = false
        resultTextView.isScrollEnabled = true
        resultTextView.textContainerInset = UIEdgeInsets(top: 8, left: 8, bottom: 8, right: 8)
        resultTextView.layer.cornerRadius = 10
        resultTextView.clipsToBounds = true
        resultTextView.textContainer.lineFragmentPadding = 0
        resultTextView.setContentCompressionResistancePriority(.defaultLow, for: .vertical)
        resultTextView.heightAnchor.constraint(greaterThanOrEqualToConstant: 72).isActive = true
        resultTextView.heightAnchor.constraint(lessThanOrEqualToConstant: 140).withPriority(.required).isActive = true

        resultButtonRow.axis = .horizontal
        resultButtonRow.spacing = 12
        resultButtonRow.distribution = .fillEqually
        resultButtonRow.alignment = .fill

        var discardCfg = UIButton.Configuration.bordered()
        discardCfg.title = kbString("keyboard.discard_result")
        discardCfg.cornerStyle = .capsule
        discardCfg.buttonSize = .small
        resultDiscardButton.configuration = discardCfg
        resultDiscardButton.addAction(UIAction { [weak self] _ in self?.hideResultPanel() }, for: .touchUpInside)

        var applyCfg = UIButton.Configuration.filled()
        applyCfg.title = kbString("keyboard.apply_result")
        applyCfg.cornerStyle = .capsule
        applyCfg.buttonSize = .small
        applyCfg.baseBackgroundColor = chromeAccentColor()
        applyCfg.baseForegroundColor = .white
        resultApplyButton.configuration = applyCfg
        resultApplyButton.addAction(UIAction { [weak self] _ in self?.applyPendingResult() }, for: .touchUpInside)

        resultButtonRow.addArrangedSubview(resultDiscardButton)
        resultButtonRow.addArrangedSubview(resultApplyButton)

        outer.addArrangedSubview(resultTitleLabel)
        outer.addArrangedSubview(resultTextView)
        outer.addArrangedSubview(resultButtonRow)
    }

    private func setResultPanelVisible(_ visible: Bool, animated: Bool) {
        previewOverlay.isHidden = !visible
        previewOverlayHeightConstraint?.constant = visible ? 218 : 0
        if visible {
            bringSubviewToFront(previewOverlay)
        }
        if animated {
            UIView.animate(withDuration: 0.2) { self.layoutIfNeeded() }
        } else {
            layoutIfNeeded()
        }
    }

    private func showResultPanel(with text: String) {
        guard AppGroupStore.shared.aiPreviewBeforeApply else { return }
        resultTextView.text = text
        setResultPanelVisible(true, animated: true)
        bringSubviewToFront(previewOverlay)
    }

    private func hideResultPanel() {
        resultTextView.text = ""
        setResultPanelVisible(false, animated: true)
        controller?.clearPendingApplySnapshot()
    }

    private func applyPendingResult() {
        guard let controller else { return }
        let text = resultTextView.text ?? ""
        controller.applyPreviewResult(text)
        resultTextView.text = ""
        setResultPanelVisible(false, animated: true)
        statusLabel.text = ""
    }

    private func buildStatusRow() {
        statusLabel.font = .preferredFont(forTextStyle: .caption2)
        statusLabel.textAlignment = .left
        statusLabel.numberOfLines = 2
        statusLabel.setContentCompressionResistancePriority(.defaultLow, for: .horizontal)

        var ocfg = UIButton.Configuration.bordered()
        ocfg.title = kbString("keyboard.tap_open_app")
        ocfg.baseForegroundColor = chromeAccentColor()
        ocfg.buttonSize = .mini
        ocfg.cornerStyle = .capsule
        openAppButton.configuration = ocfg
        openAppButton.addAction(UIAction { [weak self] _ in
            self?.controller?.openHostAppForSessionRefresh()
        }, for: .touchUpInside)
        openAppButton.setContentHuggingPriority(.required, for: .horizontal)
        openAppButton.setContentCompressionResistancePriority(.required, for: .horizontal)
    }

    private func refreshOpenAppButtonVisibility() {
        let need = !AppGroupStore.shared.isSessionValid()
        openAppButton.isHidden = !need
        var ocfg = openAppButton.configuration
        ocfg?.title = kbString("keyboard.tap_open_app")
        ocfg?.baseForegroundColor = chromeAccentColor()
        openAppButton.configuration = ocfg
        updateStatusRowVisibility()
    }

    private func updateStatusRowVisibility() {
        let hasStatusText = !(statusLabel.text ?? "").trimmingCharacters(in: .whitespacesAndNewlines).isEmpty
        let show = hasStatusText || !openAppButton.isHidden
        statusRow.isHidden = !show
        statusRowHeightConstraint?.constant = show ? 22 : 0
    }

    private func buildActionsRow() {
        let items: [(String, String, RewriteMode)] = [
            ("arrow.up.circle", "keyboard.action_improve", .proofread),
            ("arrow.down.right.and.arrow.up.left", "keyboard.action_shorten", .shorten),
            ("arrow.up.left.and.arrow.down.right", "keyboard.action_expand", .expand),
        ]
        for (symbol, key, mode) in items {
            let b = makeBlueActionButton(symbolName: symbol, titleKey: key)
            b.addAction(UIAction { [weak self] _ in self?.runTransform(mode: mode) }, for: .touchUpInside)
            actionsRow.addArrangedSubview(b)
        }
    }

    private func makeBlueActionButton(symbolName: String, titleKey: String) -> UIButton {
        var cfg = UIButton.Configuration.plain()
        cfg.image = actionRowSymbolImage(systemName: symbolName)
        cfg.title = kbString(titleKey)
        cfg.imagePlacement = .top
        cfg.imagePadding = 2
        cfg.baseForegroundColor = chromeAccentColor()
        cfg.titleLineBreakMode = .byTruncatingTail
        cfg.titleTextAttributesTransformer = UIConfigurationTextAttributesTransformer { incoming in
            var o = incoming
            o.font = .systemFont(ofSize: 9, weight: .semibold)
            return o
        }
        let b = UIButton(configuration: cfg)
        b.clipsToBounds = false
        b.backgroundColor = UIColor.clear
        b.setContentCompressionResistancePriority(.required, for: .vertical)
        b.setContentHuggingPriority(.defaultHigh, for: .vertical)
        b.addTarget(self, action: #selector(rewriteTouchDown), for: .touchDown)
        b.addTarget(self, action: #selector(rewriteTouchCancel), for: [.touchUpOutside, .touchCancel])
        return b
    }

    // MARK: - Keyplanes (letters / numbers / emoji)

    private func resetKeyContainerLayout() {
        keyContainer.arrangedSubviews.forEach { $0.removeFromSuperview() }
        shiftKeyButton = nil
        keyContainer.axis = .vertical
        keyContainer.spacing = KeyMetrics.rowSpacing
        keyContainer.distribution = .fillEqually
        keyContainer.alignment = .fill
        keyContainer.layoutMargins = UIEdgeInsets(
            top: KeyMetrics.keyTopInset,
            left: KeyMetrics.keyHorizontalInset,
            bottom: KeyMetrics.keyBottomInset,
            right: KeyMetrics.keyHorizontalInset
        )
        keyContainer.isLayoutMarginsRelativeArrangement = true
    }

    private func rebuildKeyContainerContent() {
        switch keyplane {
        case .letters:
            rebuildLetterKeyboardContent()
        case .numbers:
            rebuildNumbersKeyboardContent()
        case .emoji:
            if Self.emojiKeyplaneEnabled {
                rebuildEmojiKeyboardContent()
            } else {
                keyplane = .letters
                rebuildLetterKeyboardContent()
            }
        }
    }

    private func applyKeyContainerFinishStyling() {
        refreshShiftAppearance()
        refreshLetterKeyCaps()
        refreshReturnKeyTitle()
        if let traits = controller?.traitCollection {
            applyKeyCapsAppearance(isDark: traits.userInterfaceStyle == .dark)
        }
    }

    private func continueIncrementalLetterBuild(step: Int, completion: (() -> Void)?) {
        guard step == 0 else { return }
        KeyboardExtensionDiagnostics.logSync("layoutEngine spec=lettersQwerty sync")
        keyContainer.alpha = 0
        UIView.performWithoutAnimation {
            KeyboardLayoutEngine.buildSynchronously(
                spec: KeyboardLayoutSpec.lettersQwerty,
                context: makeLayoutBuildContext(),
                onRowInstalled: { [weak self] row in
                    self?.keyContainer.addArrangedSubview(row)
                }
            )
        }
        applyKeyContainerFinishStyling()
        wireKeyInteractionExtras()
        keyContainer.alpha = 1
        finishDeferredBuildTail(completion: completion)
    }

    private func row2HorizontalInset(for width: CGFloat) -> CGFloat {
        let w = width > 1 ? width : LayoutFit.designWidth
        return max(4, w * 0.05)
    }

    private func applyStaggeredRowInsets(width: CGFloat) {
        let inset = row2HorizontalInset(for: width)
        for row in keyContainer.arrangedSubviews {
            guard let stack = row as? UIStackView,
                  stack.accessibilityIdentifier == KeyMetrics.staggeredRowIdentifier
            else { continue }
            stack.layoutMargins = UIEdgeInsets(top: 0, left: inset, bottom: 0, right: inset)
        }
    }

    private func makeLayoutBuildContext() -> KeyboardLayoutEngine.Context {
        KeyboardLayoutEngine.Context(
            metrics: .init(
                horizontalSpacing: KeyMetrics.horizontalSpacing,
                row2HorizontalInset: row2HorizontalInset(for: bounds.width),
                shiftDeleteWidth: KeyMetrics.shiftDeleteWidth,
                bottomSideKeyWidth: KeyMetrics.bottomSideKeyWidth
            ),
            makeLetterKey: { [weak self] letter in
                guard let self else { return UIView() }
                return self.letterKeyControl(letter: letter, lightweight: true)
            },
            makeFunctionalKey: { [weak self] title, width in
                guard let self else { return UIView() }
                let button = self.keyCapsButton(title: title, isLetter: false, lightweight: true)
                if let width {
                    button.widthAnchor.constraint(equalToConstant: width).isActive = true
                }
                return button
            },
            configureExpandableRow: { [weak self] row in
                self?.configureExpandableKeyRow(row)
            },
            configureUniformLetterKey: { [weak self] key in
                self?.configureUniformLetterKey(key)
            },
            appendKey: { [weak self] key, row in
                self?.appendDeferredKey(key, to: row)
            },
            onShiftKeyResolved: { [weak self] button in
                self?.shiftKeyButton = button
            },
            log: { message in
                KeyboardExtensionDiagnostics.logSync(message)
            }
        )
    }

    private func letterKeyControl(letter: Character, lightweight: Bool = true) -> LetterKeyControl {
        let control = LetterKeyControl(letter: letter, lightweight: lightweight)
        let palette = nativePalette()
        control.applyCaps(uppercase: shiftPhase != .off)
        control.applyColors(
            normal: palette.letterKey,
            pressed: palette.letterKeyPressed,
            text: palette.primaryText
        )
        if lightweight {
            control.addTarget(self, action: #selector(letterKeyTapped(_:)), for: .touchUpInside)
        }
        return control
    }

    private func appendDeferredKey(_ key: UIView, to row: UIStackView) {
        UIView.performWithoutAnimation {
            row.addArrangedSubview(key)
        }
    }

    private func collectKeyInteractionTargets(in view: UIView) -> [UIView] {
        if let stack = view as? UIStackView {
            return stack.arrangedSubviews.flatMap { collectKeyInteractionTargets(in: $0) }
        }
        if let scroll = view as? UIScrollView {
            return scroll.subviews.flatMap { collectKeyInteractionTargets(in: $0) }
        }
        if let letter = view as? LetterKeyControl {
            return [letter]
        }
        if let button = view as? UIButton, button.configuration != nil {
            return [button]
        }
        return []
    }

    private func wireKeyInteractionExtras() {
        let targets = keyContainer.arrangedSubviews.flatMap { collectKeyInteractionTargets(in: $0) }
        for target in targets {
            attachInteractionExtras(to: target)
        }
        if let shiftBtn = shiftKeyButton {
            wireShiftGestures(shiftBtn)
        }
        KeyboardExtensionDiagnostics.logSync("keyplane interactions wired")
    }

    private func attachInteractionExtras(to target: UIView) {
        if let letter = target as? LetterKeyControl {
            attachLetterAlternatesLongPress(to: letter, baseLetter: letter.baseLetter)
            return
        }
        guard let button = target as? UIButton else { return }
        guard let id = button.accessibilityIdentifier else { return }
        let isReturn = id == "kb_return"
        let kind: KeyCapKind
        if isReturn {
            kind = .returnKey
        } else if isFunctionalKeyButton(button) {
            kind = .functional
        } else {
            kind = .letter
        }
        attachNativeKeyPressFeedback(to: button, kind: kind)

        if id == "kb_shift" || id == "kb_delete" { return }
        guard id.hasPrefix("kb_") else { return }
        let suffix = String(id.dropFirst(3))
        guard suffix.count == 1, let ch = suffix.lowercased().first else { return }
        attachLetterAlternatesLongPress(to: button, baseLetter: ch)
    }

    private func attachLetterAlternatesLongPress(to view: UIView, baseLetter: Character) {
        let hasLongPress = view.gestureRecognizers?.contains(where: { $0 is UILongPressGestureRecognizer }) ?? false
        guard !hasLongPress else { return }
        let lp = UILongPressGestureRecognizer(target: self, action: #selector(letterLongPress(_:)))
        lp.minimumPressDuration = 0.38
        lp.cancelsTouchesInView = false
        view.addGestureRecognizer(lp)
        let region = KeyboardUIRegion.inferredFromPreferredLanguages()
        view.accessibilityHint = region.alternates(forBaseLetter: baseLetter).isEmpty
            ? nil
            : kbString("keyboard.accessibility_alternates_hint")
    }

    private func finishDeferredBuildTail(completion: (() -> Void)?) {
        refreshOpenAppButtonVisibility()
        syncRegionChrome()
        if let traits = controller?.traitCollection {
            applyKeyCapsAppearance(isDark: traits.userInterfaceStyle == .dark)
        }
        KeyboardExtensionDiagnostics.logSync("build step: deferred done")
        completion?()
    }

    private func rebuildKeyContainer() {
        resetKeyContainerLayout()
        rebuildKeyContainerContent()
        applyKeyContainerFinishStyling()
    }

    private func rebuildLetterKeyboardContent() {
        let topRow = makeUniformLetterKeyRow(["q", "w", "e", "r", "t", "y", "u", "i", "o", "p"])
        keyContainer.addArrangedSubview(topRow.stack)
        keyContainer.addArrangedSubview(
            makeStaggeredLetterKeyRow(["a", "s", "d", "f", "g", "h", "j", "k", "l"])
        )
        keyContainer.addArrangedSubview(makeShiftLetterKeyRow())
        addLettersModeBottomRow()
    }

    private func addLettersModeBottomRow(lightweight: Bool = false) {
        let row4 = UIStackView()
        row4.axis = .horizontal
        row4.spacing = KeyMetrics.horizontalSpacing
        row4.alignment = .fill
        row4.distribution = .fill
        configureExpandableKeyRow(row4)

        let numBtn = keyCapsButton(title: "123", isLetter: false, lightweight: lightweight)
        numBtn.widthAnchor.constraint(equalToConstant: KeyMetrics.bottomSideKeyWidth).isActive = true

        let spaceBtn = keyCapsButton(title: "space", isLetter: false, lightweight: lightweight)
        spaceBtn.setContentHuggingPriority(UILayoutPriority(1), for: .horizontal)
        spaceBtn.setContentCompressionResistancePriority(.defaultLow, for: .horizontal)

        let retBtn = keyCapsButton(title: "return", isLetter: false, lightweight: lightweight)
        retBtn.widthAnchor.constraint(equalToConstant: KeyMetrics.bottomSideKeyWidth).isActive = true

        row4.addArrangedSubview(numBtn)
        row4.addArrangedSubview(spaceBtn)
        row4.addArrangedSubview(retBtn)
        keyContainer.addArrangedSubview(row4)
    }

    private func addNumbersOrEmojiBottomRow() {
        let row4 = UIStackView()
        row4.axis = .horizontal
        row4.spacing = KeyMetrics.horizontalSpacing
        row4.alignment = .fill
        row4.distribution = .fill
        configureExpandableKeyRow(row4)

        let abc = keyCapsButton(title: "ABC", isLetter: false)
        abc.widthAnchor.constraint(equalToConstant: KeyMetrics.bottomSideKeyWidth).isActive = true
        abc.accessibilityIdentifier = "kb_ABC"

        let spaceBtn = keyCapsButton(title: "space", isLetter: false)
        spaceBtn.setContentHuggingPriority(UILayoutPriority(1), for: .horizontal)
        spaceBtn.setContentCompressionResistancePriority(.defaultLow, for: .horizontal)

        let retBtn = keyCapsButton(title: "return", isLetter: false)
        retBtn.widthAnchor.constraint(equalToConstant: KeyMetrics.bottomSideKeyWidth).isActive = true

        row4.addArrangedSubview(abc)
        row4.addArrangedSubview(spaceBtn)
        row4.addArrangedSubview(retBtn)
        keyContainer.addArrangedSubview(row4)
    }

    private func rebuildNumbersKeyboardContent() {
        if numbersSymbolsPage == 0 {
            addNumberOutputRow(["1", "2", "3", "4", "5", "6", "7", "8", "9", "0"])
            addNumberOutputRow(["-", "/", ":", ";", "(", ")", "$", "&", "@", "\""])
        } else {
            addNumberOutputRow(["[", "]", "{", "}", "#", "%", "^", "*", "+", "="])
            addNumberOutputRow(["_", "\\", "|", "~", "<", ">", "€", "£", "¥", "·"])
        }

        let row3 = UIStackView()
        row3.axis = .horizontal
        row3.spacing = KeyMetrics.horizontalSpacing
        row3.alignment = .fill
        row3.distribution = .fill
        configureExpandableKeyRow(row3)

        let toggleLabel = numbersSymbolsPage == 0 ? "#+=" : "123"
        let toggle = keyCapsButton(title: toggleLabel, isLetter: false)
        toggle.accessibilityIdentifier = "kb_sym_page"
        toggle.widthAnchor.constraint(equalToConstant: 56).isActive = true

        let mid = UIStackView()
        mid.axis = .horizontal
        mid.spacing = KeyMetrics.horizontalSpacing
        mid.distribution = .fillEqually
        for sym in [",", ".", "?", "!", "'"] {
            mid.addArrangedSubview(makeOutputKeyButton(output: sym))
        }
        mid.setContentHuggingPriority(.defaultLow, for: .horizontal)

        let delBtn = keyCapsButton(title: "⌫", isLetter: false)
        delBtn.widthAnchor.constraint(equalToConstant: 48).isActive = true

        row3.addArrangedSubview(toggle)
        row3.addArrangedSubview(mid)
        row3.addArrangedSubview(delBtn)
        keyContainer.addArrangedSubview(row3)

        addNumbersOrEmojiBottomRow()
    }

    private func addNumberOutputRow(_ keys: [String]) {
        let h = UIStackView()
        h.axis = .horizontal
        h.spacing = KeyMetrics.horizontalSpacing
        h.distribution = .fillEqually
        h.alignment = .fill
        configureExpandableKeyRow(h)
        for k in keys {
            h.addArrangedSubview(makeOutputKeyButton(output: k))
        }
        keyContainer.addArrangedSubview(h)
    }

    /// Popular emoji grid (scrollable); tap inserts one character.
    private static let emojiPalette: [String] = [
        "😀", "😃", "😄", "😁", "😆", "😅", "🤣", "😂", "🙂", "🙃", "😉", "😊", "😇", "🥰", "😍", "🤩", "😘", "😗", "☺️", "😚", "😙", "😋", "😛", "😜", "🤪", "😝", "🤑", "🤗", "🤭", "🤫", "🤔", "🤐", "🤨", "😐", "😑", "😶", "😏", "😒", "🙄", "😬", "😌", "😔", "😪", "🤤", "😴", "😷", "🤒", "🤕", "🤢", "🤮", "🥵", "🥶", "🥴", "😵", "🤯", "🥳", "😎", "🤓", "🧐",
        "😕", "🫤", "😟", "🙁", "☹️", "😮", "😯", "😲", "😳", "🥺", "🥹", "😦", "😧", "😨", "😰", "😥", "😢", "😭", "😱", "😖", "😣", "😞", "😓", "😩", "😫", "🥱", "😤", "😡", "😠", "🤬", "😈", "👿", "💀", "☠️", "💩", "🤡", "👹", "👺", "👻", "👽", "👾", "🤖", "😺", "😸", "😹", "😻", "😼", "😽", "🙀", "😿", "😾",
        "❤️", "🧡", "💛", "💚", "💙", "💜", "🖤", "🤍", "🤎", "💔", "❤️‍🔥", "❤️‍🩹", "💕", "💞", "💓", "💗", "💖", "💘", "💝", "💟",
        "👍", "👎", "👊", "✊", "🤛", "🤜", "🫶", "👏", "🙌", "👐", "🤲", "🤝", "🙏", "✍️", "💅", "🤳", "💪", "🦾", "🦵", "🦿", "🦶", "👂", "🦻", "👃", "🧠", "👀", "👅", "👄", "💋",
        "🔥", "✨", "🌟", "💫", "⭐", "🎉", "🎊", "🎁", "🏆", "🥇", "🥈", "🥉", "⚽️", "🏀", "🏈", "⚾️", "🎾", "🏐", "🎱", "🏓", "🎮", "🕹️", "🎲", "🧩", "♠️", "♥️", "♦️", "♣️",
    ]

    private func rebuildEmojiKeyboardContent() {
        let scroll = UIScrollView()
        scroll.showsVerticalScrollIndicator = true
        scroll.alwaysBounceVertical = true
        scroll.translatesAutoresizingMaskIntoConstraints = false

        let inner = UIStackView()
        inner.axis = .vertical
        inner.spacing = 6
        inner.translatesAutoresizingMaskIntoConstraints = false
        scroll.addSubview(inner)

        let cols = 8
        let emojis = Self.emojiPalette
        var i = 0
        while i < emojis.count {
            let row = UIStackView()
            row.axis = .horizontal
            row.spacing = 4
            row.distribution = .fillEqually
            row.alignment = .fill
            let end = min(i + cols, emojis.count)
            for j in i ..< end {
                let ek = EmojiDrawKeyControl(emoji: emojis[j])
                ek.accessibilityLabel = emojis[j]
                ek.isAccessibilityElement = true
                ek.addTarget(self, action: #selector(emojiDrawKeyTapped(_:)), for: .touchUpInside)
                ek.heightAnchor.constraint(equalToConstant: 44).isActive = true
                if #available(iOS 13.0, *) {
                    ek.layer.cornerCurve = .continuous
                }
                ek.layer.cornerRadius = 5
                ek.layer.shadowColor = UIColor.black.cgColor
                ek.layer.shadowOpacity = nativePalette().keyShadowOpacity
                ek.layer.shadowOffset = CGSize(width: 0, height: 1)
                ek.layer.shadowRadius = 0
                row.addArrangedSubview(ek)
            }
            inner.addArrangedSubview(row)
            i = end
        }

        NSLayoutConstraint.activate([
            inner.leadingAnchor.constraint(equalTo: scroll.contentLayoutGuide.leadingAnchor),
            inner.trailingAnchor.constraint(equalTo: scroll.contentLayoutGuide.trailingAnchor),
            inner.topAnchor.constraint(equalTo: scroll.contentLayoutGuide.topAnchor),
            inner.bottomAnchor.constraint(equalTo: scroll.contentLayoutGuide.bottomAnchor),
            inner.widthAnchor.constraint(equalTo: scroll.frameLayoutGuide.widthAnchor),
        ])

        keyContainer.addArrangedSubview(scroll)
        scroll.heightAnchor.constraint(equalToConstant: 160).isActive = true
        addNumbersOrEmojiBottomRow()
    }

    private func makeOutputKeyButton(output: String) -> KeyboardOutputButton {
        let b = KeyboardOutputButton(type: .custom)
        b.output = output

        let palette = nativePalette()

        var cfg = UIButton.Configuration.filled()
        cfg.cornerStyle = .fixed
        cfg.background.cornerRadius = KeyMetrics.keyCornerRadius
        cfg.baseForegroundColor = palette.primaryText
        cfg.baseBackgroundColor = palette.letterKey
        cfg.background.backgroundColor = palette.letterKey
        cfg.title = output
        cfg.titleTextAttributesTransformer = UIConfigurationTextAttributesTransformer { incoming in
            var o = incoming
            let isDigit = output.count == 1 && output.first.map { $0.isNumber } == true
            o.font = .systemFont(ofSize: isDigit ? 22 : 18, weight: .light)
            return o
        }
        cfg.contentInsets = NSDirectionalEdgeInsets(top: 2, leading: 1, bottom: 4, trailing: 1)
        b.configuration = cfg

        b.contentVerticalAlignment = .fill
        b.setContentHuggingPriority(.defaultLow, for: .vertical)
        b.setContentCompressionResistancePriority(.defaultLow, for: .vertical)
        if #available(iOS 13.0, *) {
            b.layer.cornerCurve = .continuous
        }
        b.layer.cornerRadius = KeyMetrics.keyCornerRadius
        b.layer.shadowColor = UIColor.black.cgColor
        b.layer.shadowOpacity = palette.keyShadowOpacity
        b.layer.shadowOffset = CGSize(width: 0, height: 1)
        b.layer.shadowRadius = 0
        attachNativeKeyPressFeedback(to: b, kind: .letter)
        b.addTarget(self, action: #selector(outputKeyTap(_:)), for: .touchUpInside)
        return b
    }

    @objc private func outputKeyTap(_ sender: UIButton) {
        guard let b = sender as? KeyboardOutputButton else { return }
        controller?.insertString(b.output)
        if keyplane == .letters, shiftPhase == .oneShot {
            shiftPhase = .off
            refreshShiftAppearance()
            refreshLetterKeyCaps()
        }
    }

    @objc private func emojiDrawKeyTapped(_ sender: EmojiDrawKeyControl) {
        controller?.insertString(sender.emojiText)
        if keyplane == .letters, shiftPhase == .oneShot {
            shiftPhase = .off
            refreshShiftAppearance()
            refreshLetterKeyCaps()
        }
    }

    private struct LetterKeyRow {
        let stack: UIStackView
    }

    private func makeUniformLetterKeyRow(_ letters: [String], lightweight: Bool = false) -> LetterKeyRow {
        let row = UIStackView()
        row.axis = .horizontal
        row.spacing = KeyMetrics.horizontalSpacing
        row.distribution = .fillEqually
        row.alignment = .fill
        configureExpandableKeyRow(row)

        for letter in letters {
            guard let ch = letter.lowercased().first else { continue }
            let key = letterKeyControl(letter: ch, lightweight: lightweight)
            configureUniformLetterKey(key)
            row.addArrangedSubview(key)
        }
        return LetterKeyRow(stack: row)
    }

    /// ASDF row: HTML `.row-2 { margin: 5% }` — inset applied from available width.
    private func makeStaggeredLetterKeyRow(_ letters: [String], lightweight: Bool = false) -> UIStackView {
        let row = UIStackView()
        row.axis = .horizontal
        row.spacing = KeyMetrics.horizontalSpacing
        row.distribution = .fillEqually
        row.alignment = .fill
        row.isLayoutMarginsRelativeArrangement = true
        row.accessibilityIdentifier = KeyMetrics.staggeredRowIdentifier
        let inset = row2HorizontalInset(for: bounds.width)
        row.layoutMargins = UIEdgeInsets(top: 0, left: inset, bottom: 0, right: inset)
        configureExpandableKeyRow(row)

        for letter in letters {
            guard let ch = letter.lowercased().first else { continue }
            let key = letterKeyControl(letter: ch, lightweight: lightweight)
            configureUniformLetterKey(key)
            row.addArrangedSubview(key)
        }
        return row
    }

    private func makeShiftLetterKeyRow(lightweight: Bool = false) -> UIStackView {
        let row = UIStackView()
        row.axis = .horizontal
        row.spacing = KeyMetrics.horizontalSpacing
        row.distribution = .fill
        row.alignment = .fill
        configureExpandableKeyRow(row)

        let shiftBtn = keyCapsButton(title: "shift", isLetter: false, lightweight: lightweight)
        shiftBtn.widthAnchor.constraint(equalToConstant: KeyMetrics.shiftDeleteWidth).isActive = true
        shiftKeyButton = shiftBtn
        if !lightweight {
            wireShiftGestures(shiftBtn)
        }
        row.addArrangedSubview(shiftBtn)

        let middle = UIStackView()
        middle.axis = .horizontal
        middle.spacing = KeyMetrics.horizontalSpacing
        middle.distribution = .fillEqually
        middle.alignment = .fill
        for letter in ["z", "x", "c", "v", "b", "n", "m"] {
            guard let ch = letter.lowercased().first else { continue }
            let key = letterKeyControl(letter: ch, lightweight: lightweight)
            configureUniformLetterKey(key)
            middle.addArrangedSubview(key)
        }
        middle.setContentHuggingPriority(.defaultLow, for: .horizontal)
        middle.setContentCompressionResistancePriority(.defaultLow, for: .horizontal)
        row.addArrangedSubview(middle)

        let delBtn = keyCapsButton(title: "⌫", isLetter: false, lightweight: lightweight)
        delBtn.widthAnchor.constraint(equalToConstant: KeyMetrics.shiftDeleteWidth).isActive = true
        row.addArrangedSubview(delBtn)
        return row
    }

    private func configureUniformLetterKey(_ key: UIView) {
        key.setContentHuggingPriority(.defaultLow, for: .vertical)
        key.setContentCompressionResistancePriority(.defaultLow, for: .vertical)
        key.setContentHuggingPriority(.required, for: .horizontal)
        key.setContentCompressionResistancePriority(.required, for: .horizontal)
    }

    private func configureExpandableKeyRow(_ row: UIStackView) {
        row.setContentHuggingPriority(.defaultLow, for: .vertical)
        row.setContentCompressionResistancePriority(.defaultLow, for: .vertical)
    }

    private func keyCapsButton(title: String, isLetter: Bool, lightweight: Bool = false) -> UIButton {
        let palette = nativePalette()
        let isFunctional = ["shift", "⌫", "123", "ABC", "return", "#+="].contains(title)
        let isReturn = title == "return"
        let isSpace = title == "space"

        let kind: KeyCapKind
        if isReturn {
            kind = .returnKey
        } else if isFunctional {
            kind = .functional
        } else {
            kind = .letter
        }

        let bg: UIColor = switch kind {
        case .letter: palette.letterKey
        case .functional: palette.functionalKey
        case .returnKey: chromeAccentColor()
        }

        let fg: UIColor = isReturn ? palette.returnText : palette.primaryText

        var cfg = UIButton.Configuration.filled()
        cfg.cornerStyle = .fixed
        cfg.background.cornerRadius = KeyMetrics.keyCornerRadius
        cfg.baseForegroundColor = fg
        cfg.baseBackgroundColor = bg
        cfg.background.backgroundColor = bg
        if isSpace {
            cfg.title = nil
        } else if isReturn {
            cfg.title = kbString("keyboard.key_return")
        } else if title == "ABC" {
            cfg.title = kbString("keyboard.key_abc")
        } else {
            cfg.title = title
        }
        if !lightweight {
            let letterFontSize: CGFloat = 22
            let specialFontSize: CGFloat = 16
            let titleFontSize: CGFloat = isLetter ? letterFontSize : specialFontSize
            let titleFontWeight: UIFont.Weight = isReturn ? .medium : .regular
            cfg.titleTextAttributesTransformer = UIConfigurationTextAttributesTransformer { incoming in
                var o = incoming
                o.font = .systemFont(ofSize: titleFontSize, weight: titleFontWeight)
                return o
            }
        }
        cfg.contentInsets = NSDirectionalEdgeInsets(top: 0, leading: 2, bottom: 0, trailing: 2)
        if title == "shift" {
            cfg.image = UIImage(systemName: "shift")
            cfg.title = nil
            cfg.preferredSymbolConfigurationForImage = UIImage.SymbolConfiguration(pointSize: 14, weight: .regular)
        }
        if title == "⌫" {
            cfg.image = UIImage(systemName: "delete.left")
            cfg.title = nil
            cfg.preferredSymbolConfigurationForImage = UIImage.SymbolConfiguration(pointSize: 14, weight: .regular)
        }
        let b = UIButton(configuration: cfg)
        b.contentVerticalAlignment = .fill
        b.setContentHuggingPriority(.defaultLow, for: .vertical)
        b.setContentCompressionResistancePriority(.defaultLow, for: .vertical)
        if #available(iOS 13.0, *) {
            b.layer.cornerCurve = .continuous
        }
        b.layer.cornerRadius = KeyMetrics.keyCornerRadius
        if lightweight {
            b.clipsToBounds = true
            b.layer.masksToBounds = true
        } else {
            b.clipsToBounds = false
            b.layer.shadowColor = UIColor.black.cgColor
            b.layer.shadowOpacity = palette.keyShadowOpacity
            b.layer.shadowOffset = CGSize(width: 0, height: 1)
            b.layer.shadowRadius = 0
            b.layer.masksToBounds = false
            attachNativeKeyPressFeedback(to: b, kind: kind)
        }

        switch title {
        case "space":
            b.accessibilityIdentifier = "kb_space"
        case "shift":
            b.accessibilityIdentifier = "kb_shift"
        case "⌫":
            b.accessibilityIdentifier = "kb_delete"
        case "return":
            b.accessibilityIdentifier = "kb_return"
        case "123":
            b.accessibilityIdentifier = "kb_123"
        case "ABC":
            b.accessibilityIdentifier = "kb_ABC"
        default:
            b.accessibilityIdentifier = "kb_\(title)"
        }
        if title == "⌫" {
            b.addTarget(self, action: #selector(deleteTouchDown), for: .touchDown)
            b.addTarget(self, action: #selector(deleteTouchUp), for: [.touchUpInside, .touchUpOutside, .touchCancel])
        } else if title != "shift" {
            b.addTarget(self, action: #selector(keyTap(_:)), for: .touchUpInside)
        }

        if !lightweight, isLetter, title.count == 1, let ch = title.lowercased().first {
            let lp = UILongPressGestureRecognizer(target: self, action: #selector(letterLongPress(_:)))
            lp.minimumPressDuration = 0.38
            lp.cancelsTouchesInView = false
            b.addGestureRecognizer(lp)
            let region = KeyboardUIRegion.inferredFromPreferredLanguages()
            b.accessibilityHint = region.alternates(forBaseLetter: ch).isEmpty
                ? nil
                : kbString("keyboard.accessibility_alternates_hint")
        }

        return b
    }

    private func wireShiftGestures(_ btn: UIButton) {
        let doubleTap = UITapGestureRecognizer(target: self, action: #selector(shiftDoubleTapped))
        doubleTap.numberOfTapsRequired = 2
        let singleTap = UITapGestureRecognizer(target: self, action: #selector(shiftSingleTapped))
        singleTap.require(toFail: doubleTap)
        btn.addGestureRecognizer(doubleTap)
        btn.addGestureRecognizer(singleTap)
    }

    @objc private func shiftSingleTapped() {
        switch shiftPhase {
        case .locked:
            shiftPhase = .off
        case .oneShot:
            shiftPhase = .off
        case .off:
            shiftPhase = .oneShot
        }
        refreshShiftAppearance()
        refreshLetterKeyCaps()
    }

    @objc private func shiftDoubleTapped() {
        shiftPhase = shiftPhase == .locked ? .off : .locked
        refreshShiftAppearance()
        refreshLetterKeyCaps()
    }

    @objc private func deleteTouchDown() {
        stopDeleteRepeat()
        controller?.deleteBackward()
        let work = DispatchWorkItem { [weak self] in
            guard let self else { return }
            self.deleteRepeatTimer?.invalidate()
            let t = Timer.scheduledTimer(withTimeInterval: 0.07, repeats: true) { [weak self] _ in
                self?.controller?.deleteBackward()
            }
            RunLoop.main.add(t, forMode: .common)
            self.deleteRepeatTimer = t
        }
        deleteRepeatStartWork = work
        DispatchQueue.main.asyncAfter(deadline: .now() + 0.42, execute: work)
    }

    @objc private func deleteTouchUp() {
        stopDeleteRepeat()
    }

    private func stopDeleteRepeat() {
        deleteRepeatStartWork?.cancel()
        deleteRepeatStartWork = nil
        deleteRepeatTimer?.invalidate()
        deleteRepeatTimer = nil
    }

    private func refreshShiftAppearance() {
        guard let b = shiftKeyButton, var cfg = b.configuration else { return }
        switch shiftPhase {
        case .off:
            cfg.image = UIImage(systemName: "shift")
            cfg.preferredSymbolConfigurationForImage = UIImage.SymbolConfiguration(pointSize: 13, weight: .medium)
        case .oneShot:
            cfg.image = UIImage(systemName: "shift.fill")
            cfg.preferredSymbolConfigurationForImage = UIImage.SymbolConfiguration(pointSize: 13, weight: .semibold)
        case .locked:
            cfg.image = UIImage(systemName: "capslock.fill") ?? UIImage(systemName: "shift.fill")
            cfg.preferredSymbolConfigurationForImage = UIImage.SymbolConfiguration(pointSize: 13, weight: .semibold)
        }
        b.configuration = cfg
        let isDark = traitCollection.userInterfaceStyle == .dark
        applyKeyCapsAppearance(isDark: isDark)
    }

    private func refreshLetterKeyCaps() {
        guard keyplane == .letters else { return }
        let upper = shiftPhase != .off
        func visit(_ view: UIView) {
            if let s = view as? UIStackView {
                s.arrangedSubviews.forEach { visit($0) }
                return
            }
            if let letter = view as? LetterKeyControl {
                letter.applyCaps(uppercase: upper)
                return
            }
            guard let b = view as? UIButton, let id = b.accessibilityIdentifier, id.hasPrefix("kb_") else { return }
            let suf = String(id.dropFirst(3))
            guard suf.count == 1, suf != " ", suf.rangeOfCharacter(from: CharacterSet.letters) != nil else { return }
            guard var cfg = b.configuration else { return }
            let letter = suf.lowercased()
            cfg.title = upper ? letter.uppercased() : letter
            b.configuration = cfg
        }
        keyContainer.arrangedSubviews.forEach { visit($0) }
    }

    @objc private func letterKeyTapped(_ sender: LetterKeyControl) {
        if suppressNextLetterKeyTap {
            suppressNextLetterKeyTap = false
            return
        }
        guard keyplane == .letters else { return }
        let out: String
        switch shiftPhase {
        case .locked, .oneShot:
            out = String(sender.baseLetter).uppercased()
        case .off:
            out = String(sender.baseLetter)
        }
        controller?.insertString(out)
        if shiftPhase == .oneShot {
            shiftPhase = .off
            refreshShiftAppearance()
            refreshLetterKeyCaps()
        }
    }

    @objc private func letterLongPress(_ g: UILongPressGestureRecognizer) {
        guard keyplane == .letters else { return }
        let ch: Character?
        if let letter = g.view as? LetterKeyControl {
            ch = letter.baseLetter
        } else if let btn = g.view as? UIButton,
                  let id = btn.accessibilityIdentifier,
                  id.hasPrefix("kb_")
        {
            let suf = String(id.dropFirst(3))
            ch = suf.count == 1 ? suf.lowercased().first : nil
        } else {
            return
        }
        guard let ch else { return }
        let region = KeyboardUIRegion.inferredFromPreferredLanguages()
        let alts = region.alternates(forBaseLetter: ch)
        guard !alts.isEmpty else { return }

        guard let sourceView = g.view else { return }
        switch g.state {
        case .began:
            hideAlternatesBar()
            showAlternatesBar(options: alts, source: sourceView)
        case .changed:
            if let h = alternatesHost {
                updateAlternatesSelection(for: g.location(in: h))
            }
        case .ended:
            var pickedAlternate = false
            if let h = alternatesHost {
                pickedAlternate = pickAlternateIfNeeded(touch: g.location(in: h))
            }
            hideAlternatesBar()
            if pickedAlternate {
                suppressNextLetterKeyTap = true
            }
        case .cancelled, .failed:
            hideAlternatesBar()
        default:
            break
        }
    }

    /// Colors for the long-press tray + mini keys (native keyboard popup).
    private func alternatePopupPalette() -> (tray: UIColor, key: UIColor, keyHighlighted: UIColor, text: UIColor) {
        let palette = nativePalette()
        return (palette.alternateTray, palette.alternateKey, palette.alternateKeyHighlighted, palette.alternateText)
    }

    private func showAlternatesBar(options: [String], source: UIView) {
        alternatesOptions = options
        alternatesCells.removeAll()

        let palette = alternatePopupPalette()
        let btnFrame = source.convert(source.bounds, to: self)
        let margin: CGFloat = 8
        let maxBarWidth = max(0, bounds.width - margin * 2)
        let interKey: CGFloat = 5
        let padH: CGFloat = 10
        let padV: CGFloat = 8
        let keyH: CGFloat = 48
        let n = options.count

        var keyW = max(36, floor(source.bounds.width))
        var barW = padH * 2 + CGFloat(n) * keyW + CGFloat(max(0, n - 1)) * interKey
        if barW > maxBarWidth, n > 0 {
            keyW = floor((maxBarWidth - padH * 2 - CGFloat(max(0, n - 1)) * interKey) / CGFloat(n))
            keyW = max(32, keyW)
            barW = padH * 2 + CGFloat(n) * keyW + CGFloat(max(0, n - 1)) * interKey
        }

        let host = UIView()
        host.backgroundColor = palette.tray
        host.layer.cornerRadius = 10
        if #available(iOS 13.0, *) {
            host.layer.cornerCurve = .continuous
        }
        host.clipsToBounds = true
        host.translatesAutoresizingMaskIntoConstraints = false

        let stack = UIStackView()
        stack.axis = .horizontal
        stack.spacing = interKey
        stack.distribution = .fill
        stack.alignment = .center
        stack.translatesAutoresizingMaskIntoConstraints = false
        host.addSubview(stack)

        for opt in options {
            let cell = UIView()
            cell.translatesAutoresizingMaskIntoConstraints = false
            cell.backgroundColor = palette.key
            cell.layer.cornerRadius = 5
            if #available(iOS 13.0, *) {
                cell.layer.cornerCurve = .continuous
            }
            cell.clipsToBounds = true

            let lab = UILabel()
            lab.translatesAutoresizingMaskIntoConstraints = false
            lab.text = opt
            lab.textAlignment = .center
            lab.font = .systemFont(ofSize: 24, weight: .regular)
            lab.adjustsFontSizeToFitWidth = true
            lab.minimumScaleFactor = 0.5
            lab.textColor = palette.text
            cell.addSubview(lab)

            NSLayoutConstraint.activate([
                cell.widthAnchor.constraint(equalToConstant: keyW),
                cell.heightAnchor.constraint(equalToConstant: keyH),
                lab.leadingAnchor.constraint(equalTo: cell.leadingAnchor, constant: 2),
                lab.trailingAnchor.constraint(equalTo: cell.trailingAnchor, constant: -2),
                lab.centerYAnchor.constraint(equalTo: cell.centerYAnchor),
            ])

            stack.addArrangedSubview(cell)
            alternatesCells.append(cell)
        }

        NSLayoutConstraint.activate([
            stack.leadingAnchor.constraint(equalTo: host.leadingAnchor, constant: padH),
            stack.trailingAnchor.constraint(equalTo: host.trailingAnchor, constant: -padH),
            stack.topAnchor.constraint(equalTo: host.topAnchor, constant: padV),
            stack.bottomAnchor.constraint(equalTo: host.bottomAnchor, constant: -padV),
        ])

        addSubview(host)
        alternatesHost = host
        bringSubviewToFront(host)

        let hostHeight = padV * 2 + keyH
        let gapAboveKey: CGFloat = 12
        var originX = btnFrame.midX - barW / 2
        originX = max(margin, min(originX, bounds.width - margin - barW))
        var originY = btnFrame.minY - hostHeight - gapAboveKey
        if originY < margin {
            originY = min(btnFrame.maxY + gapAboveKey, bounds.height - hostHeight - margin)
        }

        NSLayoutConstraint.activate([
            host.widthAnchor.constraint(equalToConstant: barW),
            host.heightAnchor.constraint(equalToConstant: hostHeight),
            host.leadingAnchor.constraint(equalTo: leadingAnchor, constant: originX),
            host.topAnchor.constraint(equalTo: topAnchor, constant: originY),
        ])
        layoutIfNeeded()
    }

    private func updateAlternatesSelection(for point: CGPoint) {
        guard let host = alternatesHost else { return }
        let p = convert(point, from: host)
        let palette = alternatePopupPalette()
        for cell in alternatesCells {
            let f = cell.convert(cell.bounds, to: self)
            cell.backgroundColor = f.contains(p) ? palette.keyHighlighted : palette.key
        }
    }

    @discardableResult
    private func pickAlternateIfNeeded(touch: CGPoint) -> Bool {
        guard let host = alternatesHost else { return false }
        let p = convert(touch, from: host)
        let palette = alternatePopupPalette()
        for (i, cell) in alternatesCells.enumerated() {
            let f = cell.convert(cell.bounds, to: self)
            if f.contains(p), i < alternatesOptions.count {
                controller?.insertString(alternatesOptions[i])
                cell.backgroundColor = palette.keyHighlighted
                if shiftPhase == .oneShot {
                    shiftPhase = .off
                    refreshShiftAppearance()
                    refreshLetterKeyCaps()
                }
                return true
            }
        }
        return false
    }

    private func hideAlternatesBar() {
        alternatesHost?.removeFromSuperview()
        alternatesHost = nil
        alternatesOptions = []
        alternatesCells = []
    }

    /// Trailing settings chrome control (HTML: spacer + gear on the right).
    private func buildToolbarChrome() {
        if Self.emojiKeyplaneEnabled {
            let emojiBtn = makeToolbarIconActionButton(
                systemName: "face.smiling",
                pointSize: 20,
                accessibilityKey: "keyboard.emoji_keyboard_accessibility"
            )
            emojiBtn.isExclusiveTouch = true
            emojiBtn.addAction(UIAction { [weak self] _ in self?.switchToEmojiKeyplane() }, for: .touchUpInside)
            plusButtonHost.addArrangedSubview(emojiBtn)
        }

        let settingsBtn = makeToolbarIconActionButton(
            systemName: "gearshape",
            pointSize: 17,
            accessibilityKey: "keyboard.chrome_more_accessibility"
        )
        settingsBtn.isExclusiveTouch = true
        settingsBtn.addAction(UIAction { [weak self] _ in
            self?.toggleChromeOptionsPanel()
        }, for: .touchUpInside)
        plusButtonHost.addArrangedSubview(settingsBtn)
    }

    @objc private func keyTap(_ sender: UIButton) {
        guard let id = sender.accessibilityIdentifier else { return }
        switch id {
        case "kb_space":
            controller?.insertString(" ")
            if shiftPhase == .oneShot {
                shiftPhase = .off
                refreshShiftAppearance()
                refreshLetterKeyCaps()
            }
        case "kb_return":
            controller?.insertString("\n")
            if shiftPhase == .oneShot {
                shiftPhase = .off
                refreshShiftAppearance()
                refreshLetterKeyCaps()
            }
        case "kb_shift":
            break
        case "kb_123":
            keyplane = .numbers
            numbersSymbolsPage = 0
            rebuildKeyContainer()
        case "kb_ABC":
            keyplane = .letters
            numbersSymbolsPage = 0
            rebuildKeyContainer()
        case "kb_sym_page":
            numbersSymbolsPage = numbersSymbolsPage == 0 ? 1 : 0
            rebuildKeyContainer()
        default:
            if suppressNextLetterKeyTap {
                suppressNextLetterKeyTap = false
                return
            }
            guard keyplane == .letters else { return }
            if id.hasPrefix("kb_") {
                let suf = String(id.dropFirst(3))
                guard suf.count == 1, let lc = suf.lowercased().first else { return }
                let out: String
                switch shiftPhase {
                case .locked, .oneShot:
                    out = String(lc).uppercased()
                case .off:
                    out = String(lc)
                }
                controller?.insertString(out)
                if shiftPhase == .oneShot {
                    shiftPhase = .off
                    refreshShiftAppearance()
                    refreshLetterKeyCaps()
                }
            }
        }
    }

    private func makeToolbarIconActionButton(
        systemName: String,
        pointSize: CGFloat,
        accessibilityKey: String
    ) -> UIButton {
        let b = UIButton(type: .system)
        let letter = String(systemName.prefix(1).uppercased())
        b.setImage(
            symbolImage(systemName: systemName, pointSize: pointSize, weight: .medium, fallbackLetter: letter),
            for: .normal
        )
        b.tintColor = .label
        b.accessibilityLabel = kbString(accessibilityKey)
        b.contentVerticalAlignment = .center
        b.contentHorizontalAlignment = .center
        b.setContentHuggingPriority(.defaultLow, for: .horizontal)
        b.setContentCompressionResistancePriority(.defaultLow, for: .horizontal)
        b.setContentHuggingPriority(.defaultLow, for: .vertical)
        b.setContentCompressionResistancePriority(.defaultLow, for: .vertical)
        return b
    }

    private func switchToEmojiKeyplane() {
        guard Self.emojiKeyplaneEnabled else { return }
        keyplane = .emoji
        rebuildKeyContainer()
    }

    private func runTransform(mode: RewriteMode) {
        guard let controller else { return }
        let touchDownCapture = pendingRewriteFromTouchDown
        pendingRewriteFromTouchDown = nil
        // `touchDown` often runs while `textDocumentProxy` still reports empty context; re-read synchronously here.
        let syncLive = controller.rewriteContext()
        let capTrim = touchDownCapture?.text.trimmingCharacters(in: .whitespacesAndNewlines) ?? ""
        let syncTrim = syncLive.0.trimmingCharacters(in: .whitespacesAndNewlines)
        let baseline: (text: String, snapshot: RewriteSnapshot) = {
            if capTrim.isEmpty && !syncTrim.isEmpty { return syncLive }
            if let td = touchDownCapture, !capTrim.isEmpty { return (td.text, td.snapshot) }
            return syncLive
        }()

        controller.clearPendingApplySnapshot()
        hideResultPanel()

        guard AppGroupStore.shared.isSessionValid() else {
            statusLabel.text = kbString("keyboard.open_host")
            updateStatusRowVisibility()
            refreshOpenAppButtonVisibility()
            return
        }

        let working: String
        switch mode {
        case .proofread:
            working = kbString("keyboard.working_proofread")
        case .rewrite:
            working = kbString("keyboard.working_rewrite")
        case .shorten:
            working = kbString("keyboard.working_shorten")
        case .expand:
            working = kbString("keyboard.working_expand")
        }
        statusLabel.text = working
        updateStatusRowVisibility()

        let style = AppGroupStore.shared.conversationStyle

        DispatchQueue.main.async { [weak self] in
            Task { @MainActor in
                await Task.yield()
                await Task.yield()
                guard let self, let controller = self.controller else { return }
                let live = controller.rewriteContext()
                let liveTrim = live.0.trimmingCharacters(in: .whitespacesAndNewlines)
                let baseTrim = baseline.0.trimmingCharacters(in: .whitespacesAndNewlines)
                // Prefer baseline from touch-up when the field still matches or grew shorter after UI interaction;
                // prefer live only when strictly longer (user typed more before release).
                let (raw, snapshot): (String, RewriteSnapshot) = {
                    if liveTrim.count > baseTrim.count { return live }
                    if !baseTrim.isEmpty { return (baseline.0, baseline.snapshot) }
                    return live
                }()
                var text = raw.trimmingCharacters(in: .whitespacesAndNewlines)
                var snap = snapshot
                if text.isEmpty {
                    let retry = controller.rewriteContext()
                    let rTrim = retry.0.trimmingCharacters(in: .whitespacesAndNewlines)
                    if !rTrim.isEmpty {
                        text = rTrim
                        snap = retry.1
                    }
                }
                guard !text.isEmpty else {
                    self.statusLabel.text = self.kbString("keyboard.empty_text")
                    self.updateStatusRowVisibility()
                    return
                }
                do {
                    let out = try await RewriteAPI.rewrite(text: text, mode: mode, style: style)
                    let previewFirst = AppGroupStore.shared.aiPreviewBeforeApply
                    if previewFirst {
                        controller.setPendingApplySnapshot(snap)
                        self.showResultPanel(with: out)
                        self.statusLabel.text = self.kbString("keyboard.preview_ready")
                    } else {
                        controller.applyRewrite(result: out, snapshot: snap)
                        self.statusLabel.text = self.kbString("keyboard.done")
                    }
                    self.updateStatusRowVisibility()
                    self.refreshOpenAppButtonVisibility()
                } catch {
                    // Non-fatal recorded in `RewriteAPI.rewrite` for API/decode failures.
                    self.statusLabel.text = error.localizedDescription
                    self.updateStatusRowVisibility()
                }
            }
        }
    }
}

/// Emoji grid key: `draw(_:)` using bundled **Noto Color Emoji** (SIL OFL). Resolves `UIFont` via `CTFontManagerRegisterFontsForURL` + `UIFont(name:size:)` (PostScript / common names); falls back to `CTFont` in attributes when name lookup fails in the extension.
private final class EmojiDrawKeyControl: UIControl {
    let emojiText: String

    private static func notoFontURL(in bundle: Bundle) -> URL? {
        if let u = bundle.url(forResource: "NotoColorEmoji", withExtension: "ttf", subdirectory: "Fonts") { return u }
        if let u = bundle.url(forResource: "NotoColorEmoji", withExtension: "ttf") { return u }
        if let urls = bundle.urls(forResourcesWithExtension: "ttf", subdirectory: "Fonts") {
            if let hit = urls.first(where: { $0.lastPathComponent == "NotoColorEmoji.ttf" }) { return hit }
        }
        if let urls = bundle.urls(forResourcesWithExtension: "ttf", subdirectory: nil) {
            if let hit = urls.first(where: { $0.lastPathComponent == "NotoColorEmoji.ttf" }) { return hit }
        }
        return nil
    }

    private static let notoBytes: Data? = {
        let b = Bundle(for: EmojiDrawKeyControl.self)
        return notoFontURL(in: b).flatMap { try? Data(contentsOf: $0) }
    }()

    private static let notoCacheLock = NSLock()
    private static var notoUIFontByBucket: [Int: UIFont] = [:]

    private static func notoUIFont(forSize size: CGFloat) -> UIFont? {
        guard notoBytes != nil else { return nil }
        let bucket = Int((size * 4).rounded())
        notoCacheLock.lock()
        if let hit = notoUIFontByBucket[bucket] {
            notoCacheLock.unlock()
            return hit
        }
        let font: UIFont? = {
            _ = Self.registerNotoURL
            guard let ct = notoCTFont(forSize: size) else { return nil }
            var names: [String] = []
            if let ps = CTFontCopyPostScriptName(ct) as String?, !ps.isEmpty { names.append(ps) }
            names.append(contentsOf: ["NotoColorEmoji", "Noto Color Emoji"])
            for name in names {
                if let f = UIFont(name: name, size: size) { return f }
            }
            return nil
        }()
        if let font { notoUIFontByBucket[bucket] = font }
        notoCacheLock.unlock()
        return font
    }

    private static func notoCTFont(forSize size: CGFloat) -> CTFont? {
        guard let data = notoBytes,
              let provider = CGDataProvider(data: data as CFData),
              let cgFont = CGFont(provider)
        else { return nil }
        return CTFontCreateWithGraphicsFont(cgFont, size, nil, nil)
    }

    private static let registerNotoURL: Void = {
        let b = Bundle(for: EmojiDrawKeyControl.self)
        guard let url = notoFontURL(in: b) else { return }
        var err: Unmanaged<CFError>?
        _ = CTFontManagerRegisterFontsForURL(url as CFURL, .process, &err)
    }()

    init(emoji: String) {
        self.emojiText = emoji
        super.init(frame: .zero)
        _ = Self.registerNotoURL
        backgroundColor = .white
        clipsToBounds = true
        contentMode = .redraw
        isOpaque = false
    }

    override func draw(_ rect: CGRect) {
        guard rect.width > 2, rect.height > 2 else { return }
        (backgroundColor ?? .white).setFill()
        UIRectFill(rect)

        let fs = max(14, min(rect.width, rect.height) * 0.56)
        let paragraph = NSMutableParagraphStyle()
        paragraph.alignment = .center

        var attrs: [NSAttributedString.Key: Any] = [.paragraphStyle: paragraph]

        // 1) Bundled Noto from in-memory TTF (CBDT) — most reliable in app extensions
        if let noto = Self.notoUIFont(forSize: fs) {
            attrs[.font] = noto
        } else if let notoCT = Self.notoCTFont(forSize: fs) {
            attrs[NSAttributedString.Key(kCTFontAttributeName as String)] = notoCT
        }

        // 2) Name lookup after optional registration
        if attrs[.font] == nil && attrs[NSAttributedString.Key(kCTFontAttributeName as String)] == nil {
            for n in ["Noto Color Emoji", "NotoColorEmoji"] {
                if let f = UIFont(name: n, size: fs) {
                    attrs[.font] = f
                    break
                }
            }
        }

        if attrs[.font] == nil && attrs[NSAttributedString.Key(kCTFontAttributeName as String)] == nil {
            let ctNames: [String] = ["AppleColorEmoji", ".AppleColorEmojiUI", "Apple Color Emoji"]
            var ctFont: CTFont?
            for n in ctNames {
                let f = CTFontCreateWithName(n as CFString, fs, nil)
                let ps = (CTFontCopyPostScriptName(f) as String?) ?? ""
                if ps.contains("LastResort") { continue }
                ctFont = f
                break
            }
            if let ctFont {
                attrs[NSAttributedString.Key(kCTFontAttributeName as String)] = ctFont
            } else {
                let uiNames = [".AppleColorEmojiUI", "Apple Color Emoji", "AppleColorEmoji"]
                var uif: UIFont?
                for n in uiNames {
                    if let f = UIFont(name: n, size: fs) {
                        uif = f
                        break
                    }
                }
                attrs[.font] = uif ?? UIFont.systemFont(ofSize: fs)
            }
        }

        let attr = NSAttributedString(string: emojiText, attributes: attrs)
        let opts: NSStringDrawingOptions = [.usesLineFragmentOrigin, .usesFontLeading]
        let bound = attr.boundingRect(with: CGSize(width: rect.width + 4, height: 2000), options: opts, context: nil)
        let drawRect = CGRect(
            x: (rect.width - min(bound.width, rect.width + 4)) / 2,
            y: (rect.height - bound.height) / 2,
            width: min(bound.width, rect.width + 4),
            height: min(bound.height, rect.height)
        )
        attr.draw(with: drawRect, options: opts, context: nil)
    }

    override func layoutSubviews() {
        super.layoutSubviews()
        setNeedsDisplay()
    }

    @available(*, unavailable)
    required init?(coder: NSCoder) {
        fatalError("init(coder:) has not been implemented")
    }
}

/// Inserts a fixed string (digit, symbol, or emoji grapheme).
private final class KeyboardOutputButton: UIButton {
    var output: String = ""
}

private extension NSLayoutConstraint {
    func withPriority(_ p: UILayoutPriority) -> NSLayoutConstraint {
        priority = p
        return self
    }
}

private extension Bundle {
    static var keyboardBundle: Bundle {
        Bundle(for: KeyboardLayoutView.self)
    }
}

extension KeyboardLayoutView: KeyboardChromeOptionsDelegate {
    func chromeOptionsLocalize(_ key: String) -> String {
        kbString(key)
    }

    func chromeOptionsDidChangeAppearance() {
        controller?.applyKeyboardAppearancePreference()
        syncSettingsFromAppGroup()
    }

    func chromeOptionsDidChangeAccent() {
        syncSettingsFromAppGroup()
    }

    func chromeOptionsIsDark() -> Bool {
        traitCollection.userInterfaceStyle == .dark
    }
}
