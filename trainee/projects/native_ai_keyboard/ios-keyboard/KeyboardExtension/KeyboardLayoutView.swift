import CoreGraphics
import CoreText
import UIKit

/// AI actions + optional result preview + QWERTY + bottom strip.
final class KeyboardLayoutView: UIView {
    private weak var controller: KeyboardViewController?

    /// Floats above the main stack so iOS does not clip the preview (keyboard height is fixed).
    private let previewOverlay = UIView()
    private let resultTitleLabel = UILabel()
    private let resultTextView = UITextView()
    private let resultButtonRow = UIStackView()
    private let resultDiscardButton = UIButton(type: .system)
    private let resultApplyButton = UIButton(type: .system)
    private var previewOverlayHeightConstraint: NSLayoutConstraint?

    private let actionsRow = UIStackView()
    private let keyContainer = UIStackView()
    private let bottomBar = UIStackView()
    private let statusRow = UIStackView()
    private let statusLabel = UILabel()
    private let openAppButton = UIButton(type: .system)

    private var sessionPollTimer: Timer?
    private var deleteRepeatTimer: Timer?
    private var deleteRepeatStartWork: DispatchWorkItem?

    /// Captured on AI button `touchDown` while the host field still has full `UITextInput` context (tap on same control clears context before `touchUp`).
    private var pendingRewriteFromTouchDown: (text: String, snapshot: RewriteSnapshot)?

    private weak var shiftKeyButton: UIButton?
    private weak var aiPrimaryButton: UIButton?
    private var alternatesHost: UIView?
    private var alternatesOptions: [String] = []
    /// One view per alternate “mini key” (hit-testing uses these frames).
    private var alternatesCells: [UIView] = []

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
    private weak var themeCycleButton: UIButton?

    private var kb: Bundle { .keyboardBundle }

    private static let keyGrayLight = UIColor(red: 0.82, green: 0.84, blue: 0.86, alpha: 1.0)
    private static let keyGrayDark = UIColor(white: 0.11, alpha: 1)

    /// Toolbar / AI tint from App Group (host app picker). SF Symbols + system font only — no third-party icon fonts.
    private func chromeAccentColor() -> UIColor {
        AppGroupStore.shared.keyboardChromeAccent.uiColor
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
        case "arrow.triangle.2.circlepath": fallback = "R"
        case "arrow.up.circle": fallback = "I"
        case "arrow.down.right.and.arrow.up.left": fallback = "S"
        case "arrow.up.left.and.arrow.down.right": fallback = "X"
        default: fallback = "•"
        }
        return symbolImage(systemName: systemName, pointSize: 15, weight: .semibold, fallbackLetter: fallback)
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

        for case let b as UIButton in actionsRow.arrangedSubviews {
            guard var cfg = b.configuration else { continue }
            cfg.baseForegroundColor = accent
            b.configuration = cfg
        }
    }

    private func refreshThemeCycleChrome() {
        guard let b = themeCycleButton else { return }
        let (name, letter): (String, String)
        switch AppGroupStore.shared.keyboardAppearancePreference {
        case .system: (name, letter) = ("circle.lefthalf.filled", "◐")
        case .light: (name, letter) = ("sun.max.fill", "L")
        case .dark: (name, letter) = ("moon.fill", "D")
        }
        let img = symbolImage(systemName: name, pointSize: 17, weight: .medium, fallbackLetter: letter)
        b.setImage(img, for: .normal)
        b.setTitle(nil, for: .normal)
        b.tintColor = .label
    }

    init(controller: KeyboardViewController) {
        self.controller = controller
        super.init(frame: .zero)
        buildResultPanel()
        buildActionsRow()
        rebuildKeyContainer()
        buildBottomBar()
        buildStatusRow()
        layoutRoot()
        applyAppearance(traits: controller.traitCollection)
        refreshOpenAppButtonVisibility()
        setResultPanelVisible(false, animated: false)
        syncRegionChrome()
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
        if window != nil {
            let t = Timer.scheduledTimer(withTimeInterval: 1.0, repeats: true) { [weak self] _ in
                self?.refreshOpenAppButtonVisibility()
            }
            RunLoop.main.add(t, forMode: .common)
            sessionPollTimer = t
            refreshOpenAppButtonVisibility()
        }
    }

    func applyAppearance(traits: UITraitCollection) {
        let isDark = traits.userInterfaceStyle == .dark
        backgroundColor = isDark ? Self.keyGrayDark : Self.keyGrayLight
        statusLabel.textColor = isDark ? .lightGray : .darkGray
        applyKeyCapsAppearance(isDark: isDark)
        applyAIPrimaryAppearance(isDark: isDark)
        applyResultPanelAppearance(isDark: isDark)
        refreshShiftAppearance()
        refreshThemeCycleChrome()
        refreshChromeAccents()
    }

    private func applyResultPanelAppearance(isDark: Bool) {
        previewOverlay.backgroundColor = isDark ? UIColor(white: 0.18, alpha: 1) : .white
        resultTitleLabel.textColor = isDark ? .white : .label
        resultTextView.backgroundColor = isDark ? UIColor(white: 0.14, alpha: 1) : UIColor(white: 0.96, alpha: 1)
        resultTextView.textColor = isDark ? .white : .label
    }

    private func applyKeyCapsAppearance(isDark: Bool) {
        let keyBG = isDark ? UIColor(white: 0.28, alpha: 1) : UIColor(white: 1.0, alpha: 1.0)
        let fg = isDark ? UIColor.white : UIColor.black
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
                ek.backgroundColor = keyBG
                ek.setNeedsDisplay()
                return
            }
            guard let b = view as? UIButton, var cfg = b.configuration else { return }
            cfg.baseBackgroundColor = keyBG
            cfg.baseForegroundColor = fg
            cfg.background.backgroundColor = keyBG
            b.configuration = cfg
        }
        keyContainer.arrangedSubviews.forEach { visit($0) }
    }

    private func applyAIPrimaryAppearance(isDark: Bool) {
        guard let b = aiPrimaryButton else { return }
        let keyBG = isDark ? UIColor(white: 0.28, alpha: 1) : UIColor(white: 1.0, alpha: 1.0)
        let symbolTint = isDark ? UIColor.white : chromeAccentColor()
        b.backgroundColor = keyBG
        b.tintColor = symbolTint
        b.layer.borderWidth = isDark ? 0 : 1
        b.layer.borderColor = isDark ? nil : UIColor(white: 0.78, alpha: 1).cgColor
    }

    // MARK: - Strings (follow system UI language, not the text field’s keyboard locale)

    /// Uses `Locale.preferredLanguages` (Settings → General → Language & Region). Do **not** use `Locale.current` here: in extensions it often tracks the **input** keyboard / field locale, so English UI + Turkish typing wrongly picked `tr`.
    private static func preferredKeyboardStringsLanguageCode() -> String {
        for id in Locale.preferredLanguages where !id.isEmpty {
            let low = id.lowercased()
            if low.hasPrefix("tr") { return "tr" }
            if low.hasPrefix("en") { return "en" }
        }
        return "en"
    }

    private func kbString(_ key: String) -> String {
        let code = Self.preferredKeyboardStringsLanguageCode()
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
        aiPrimaryButton?.accessibilityLabel = kbString("keyboard.ai_button_accessibility")
        refreshThemeCycleChrome()
        refreshChromeAccents()
    }

    private func refreshActionRowTitles() {
        let items: [(String, String)] = [
            ("arrow.triangle.2.circlepath", "keyboard.action_rewrite"),
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
        let root = UIStackView()
        root.axis = .vertical
        root.spacing = 8
        root.translatesAutoresizingMaskIntoConstraints = false
        addSubview(root)

        NSLayoutConstraint.activate([
            root.leadingAnchor.constraint(equalTo: leadingAnchor, constant: 8),
            root.trailingAnchor.constraint(equalTo: trailingAnchor, constant: -8),
            root.topAnchor.constraint(equalTo: topAnchor, constant: 6),
            root.bottomAnchor.constraint(equalTo: bottomAnchor, constant: -6),
        ])

        root.addArrangedSubview(actionsRow)
        root.addArrangedSubview(statusRow)
        root.addArrangedSubview(keyContainer)
        root.addArrangedSubview(bottomBar)

        bottomBar.heightAnchor.constraint(equalToConstant: 38).isActive = true

        previewOverlay.translatesAutoresizingMaskIntoConstraints = false
        previewOverlay.isUserInteractionEnabled = true
        previewOverlay.layer.cornerRadius = 22
        previewOverlay.clipsToBounds = true
        insertSubview(previewOverlay, aboveSubview: root)
        let oh = previewOverlay.heightAnchor.constraint(equalToConstant: 0)
        oh.priority = .required
        oh.isActive = true
        previewOverlayHeightConstraint = oh
        NSLayoutConstraint.activate([
            previewOverlay.topAnchor.constraint(equalTo: topAnchor, constant: 6),
            previewOverlay.leadingAnchor.constraint(equalTo: leadingAnchor, constant: 8),
            previewOverlay.trailingAnchor.constraint(equalTo: trailingAnchor, constant: -8),
            oh,
        ])
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
        statusLabel.text = kbString("keyboard.done")
    }

    private func buildStatusRow() {
        statusRow.axis = .horizontal
        statusRow.spacing = 8
        statusRow.alignment = .center
        statusRow.distribution = .fill

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

        statusRow.addArrangedSubview(statusLabel)
        statusRow.addArrangedSubview(openAppButton)
    }

    private func refreshOpenAppButtonVisibility() {
        let need = !AppGroupStore.shared.isSessionValid()
        openAppButton.isHidden = !need
        var ocfg = openAppButton.configuration
        ocfg?.title = kbString("keyboard.tap_open_app")
        ocfg?.baseForegroundColor = chromeAccentColor()
        openAppButton.configuration = ocfg
    }

    private func buildActionsRow() {
        actionsRow.axis = .horizontal
        actionsRow.spacing = 4
        actionsRow.distribution = .fillEqually
        actionsRow.alignment = .fill

        let items: [(String, String, RewriteMode)] = [
            ("arrow.triangle.2.circlepath", "keyboard.action_rewrite", .rewrite),
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
        cfg.imagePadding = 4
        cfg.baseForegroundColor = chromeAccentColor()
        cfg.titleLineBreakMode = .byTruncatingTail
        cfg.titleTextAttributesTransformer = UIConfigurationTextAttributesTransformer { incoming in
            var o = incoming
            o.font = .systemFont(ofSize: 11, weight: .semibold)
            return o
        }
        let b = UIButton(configuration: cfg)
        b.layer.cornerRadius = 10
        b.clipsToBounds = true
        b.backgroundColor = UIColor.clear
        b.addTarget(self, action: #selector(rewriteTouchDown), for: .touchDown)
        b.addTarget(self, action: #selector(rewriteTouchCancel), for: [.touchUpOutside, .touchCancel])
        return b
    }

    // MARK: - Keyplanes (letters / numbers / emoji)

    private func rebuildKeyContainer() {
        keyContainer.arrangedSubviews.forEach { $0.removeFromSuperview() }
        shiftKeyButton = nil
        keyContainer.axis = .vertical
        keyContainer.spacing = 6
        keyContainer.distribution = .fill

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

        refreshShiftAppearance()
        refreshLetterKeyCaps()
        refreshReturnKeyTitle()
        if let traits = controller?.traitCollection {
            applyKeyCapsAppearance(isDark: traits.userInterfaceStyle == .dark)
        }
    }

    private func rebuildLetterKeyboardContent() {
        addLetterRow(["q", "w", "e", "r", "t", "y", "u", "i", "o", "p"])
        addLetterRow(["a", "s", "d", "f", "g", "h", "j", "k", "l"])

        let row3 = UIStackView()
        row3.axis = .horizontal
        row3.spacing = 5
        row3.alignment = .fill
        row3.distribution = .fill

        let shiftBtn = keyCapsButton(title: "shift", isLetter: false)
        shiftBtn.widthAnchor.constraint(equalToConstant: 48).isActive = true
        shiftKeyButton = shiftBtn
        wireShiftGestures(shiftBtn)

        let middle = UIStackView()
        middle.axis = .horizontal
        middle.spacing = 5
        middle.distribution = .fillEqually
        for k in ["z", "x", "c", "v", "b", "n", "m"] {
            middle.addArrangedSubview(keyCapsButton(title: k, isLetter: true))
        }
        middle.setContentHuggingPriority(.defaultLow, for: .horizontal)

        let delBtn = keyCapsButton(title: "⌫", isLetter: false)
        delBtn.widthAnchor.constraint(equalToConstant: 48).isActive = true

        row3.addArrangedSubview(shiftBtn)
        row3.addArrangedSubview(middle)
        row3.addArrangedSubview(delBtn)
        keyContainer.addArrangedSubview(row3)

        addLettersModeBottomRow()
    }

    private func addLettersModeBottomRow() {
        let row4 = UIStackView()
        row4.axis = .horizontal
        row4.spacing = 5
        row4.alignment = .fill
        row4.distribution = .fill

        let numBtn = keyCapsButton(title: "123", isLetter: false)
        numBtn.widthAnchor.constraint(equalToConstant: 56).isActive = true

        let spaceBtn = keyCapsButton(title: "space", isLetter: false)
        spaceBtn.setContentHuggingPriority(UILayoutPriority(1), for: .horizontal)
        spaceBtn.setContentCompressionResistancePriority(.defaultLow, for: .horizontal)

        let retBtn = keyCapsButton(title: "return", isLetter: false)
        retBtn.widthAnchor.constraint(equalToConstant: 92).isActive = true

        row4.addArrangedSubview(numBtn)
        row4.addArrangedSubview(spaceBtn)
        row4.addArrangedSubview(retBtn)
        keyContainer.addArrangedSubview(row4)
    }

    private func addNumbersOrEmojiBottomRow() {
        let row4 = UIStackView()
        row4.axis = .horizontal
        row4.spacing = 5
        row4.alignment = .fill
        row4.distribution = .fill

        let abc = keyCapsButton(title: "ABC", isLetter: false)
        abc.widthAnchor.constraint(equalToConstant: 56).isActive = true
        abc.accessibilityIdentifier = "kb_ABC"

        let spaceBtn = keyCapsButton(title: "space", isLetter: false)
        spaceBtn.setContentHuggingPriority(UILayoutPriority(1), for: .horizontal)
        spaceBtn.setContentCompressionResistancePriority(.defaultLow, for: .horizontal)

        let retBtn = keyCapsButton(title: "return", isLetter: false)
        retBtn.widthAnchor.constraint(equalToConstant: 92).isActive = true

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
        row3.spacing = 5
        row3.alignment = .fill
        row3.distribution = .fill

        let toggleLabel = numbersSymbolsPage == 0 ? "#+=" : "123"
        let toggle = keyCapsButton(title: toggleLabel, isLetter: false)
        toggle.accessibilityIdentifier = "kb_sym_page"
        toggle.widthAnchor.constraint(equalToConstant: 56).isActive = true

        let mid = UIStackView()
        mid.axis = .horizontal
        mid.spacing = 5
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
        h.spacing = 5
        h.distribution = .fillEqually
        h.alignment = .fill
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
                ek.layer.shadowOpacity = 0.12
                ek.layer.shadowOffset = CGSize(width: 0, height: 1)
                ek.layer.shadowRadius = 0.5
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

        var cfg = UIButton.Configuration.filled()
        cfg.cornerStyle = .fixed
        cfg.background.cornerRadius = 5
        cfg.baseForegroundColor = .label
        cfg.baseBackgroundColor = .white
        cfg.background.backgroundColor = .white
        cfg.title = output
        cfg.titleTextAttributesTransformer = UIConfigurationTextAttributesTransformer { incoming in
            var o = incoming
            let isDigit = output.count == 1 && output.first.map { $0.isNumber } == true
            o.font = .systemFont(ofSize: isDigit ? 22 : 18, weight: .regular)
            return o
        }
        cfg.contentInsets = NSDirectionalEdgeInsets(top: 0, leading: 1, bottom: 0, trailing: 1)
        b.configuration = cfg

        b.heightAnchor.constraint(equalToConstant: 44).isActive = true
        if #available(iOS 13.0, *) {
            b.layer.cornerCurve = .continuous
        }
        b.layer.cornerRadius = 5
        b.layer.shadowColor = UIColor.black.cgColor
        b.layer.shadowOpacity = 0.12
        b.layer.shadowOffset = CGSize(width: 0, height: 1)
        b.layer.shadowRadius = 0.5
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

    private func addLetterRow(_ letters: [String]) {
        let h = UIStackView()
        h.axis = .horizontal
        h.spacing = 5
        h.distribution = .fillEqually
        h.alignment = .fill
        for k in letters {
            h.addArrangedSubview(keyCapsButton(title: k, isLetter: true))
        }
        keyContainer.addArrangedSubview(h)
    }

    private func keyCapsButton(title: String, isLetter: Bool) -> UIButton {
        var cfg = UIButton.Configuration.filled()
        cfg.cornerStyle = .fixed
        cfg.background.cornerRadius = 5
        cfg.baseForegroundColor = .label
        cfg.baseBackgroundColor = .white
        cfg.background.backgroundColor = .white
        if title == "space" {
            cfg.title = nil
        } else if title == "return" {
            cfg.title = kbString("keyboard.key_return")
        } else if title == "ABC" {
            cfg.title = kbString("keyboard.key_abc")
        } else {
            cfg.title = title
        }
        cfg.titleTextAttributesTransformer = UIConfigurationTextAttributesTransformer { incoming in
            var o = incoming
            o.font = .systemFont(ofSize: title == "return" ? 14 : 17, weight: .regular)
            return o
        }
        cfg.contentInsets = NSDirectionalEdgeInsets(top: 0, leading: 2, bottom: 0, trailing: 2)
        if title == "shift" {
            cfg.image = UIImage(systemName: "shift")
            cfg.title = nil
            cfg.preferredSymbolConfigurationForImage = UIImage.SymbolConfiguration(pointSize: 16, weight: .medium)
        }
        if title == "⌫" {
            cfg.image = UIImage(systemName: "delete.left")
            cfg.title = nil
            cfg.preferredSymbolConfigurationForImage = UIImage.SymbolConfiguration(pointSize: 18, weight: .medium)
        }
        let b = UIButton(configuration: cfg)
        b.heightAnchor.constraint(equalToConstant: 44).isActive = true
        if #available(iOS 13.0, *) {
            b.layer.cornerCurve = .continuous
        }
        b.layer.cornerRadius = 5
        b.clipsToBounds = false
        b.layer.shadowColor = UIColor.black.cgColor
        b.layer.shadowOpacity = 0.12
        b.layer.shadowOffset = CGSize(width: 0, height: 1)
        b.layer.shadowRadius = 0.5
        b.layer.masksToBounds = false

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

        if isLetter, title.count == 1, let ch = title.lowercased().first {
            let lp = UILongPressGestureRecognizer(target: self, action: #selector(letterLongPress(_:)))
            lp.minimumPressDuration = 0.38
            lp.cancelsTouchesInView = true
            b.addGestureRecognizer(lp)
            let region = KeyboardUIRegion.resolved(from: AppGroupStore.shared.keyboardUIRegionRaw)
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
            cfg.preferredSymbolConfigurationForImage = UIImage.SymbolConfiguration(pointSize: 16, weight: .medium)
        case .oneShot:
            cfg.image = UIImage(systemName: "shift.fill")
            cfg.preferredSymbolConfigurationForImage = UIImage.SymbolConfiguration(pointSize: 16, weight: .semibold)
        case .locked:
            cfg.image = UIImage(systemName: "capslock.fill") ?? UIImage(systemName: "shift.fill")
            cfg.preferredSymbolConfigurationForImage = UIImage.SymbolConfiguration(pointSize: 16, weight: .semibold)
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

    @objc private func letterLongPress(_ g: UILongPressGestureRecognizer) {
        guard keyplane == .letters,
              let btn = g.view as? UIButton, let id = btn.accessibilityIdentifier, id.hasPrefix("kb_") else { return }
        let suf = String(id.dropFirst(3))
        guard suf.count == 1, let ch = suf.lowercased().first else { return }
        let region = KeyboardUIRegion.resolved(from: AppGroupStore.shared.keyboardUIRegionRaw)
        let alts = region.alternates(forBaseLetter: ch)
        guard !alts.isEmpty else { return }

        switch g.state {
        case .began:
            hideAlternatesBar()
            showAlternatesBar(options: alts, source: btn)
        case .changed:
            if let h = alternatesHost {
                updateAlternatesSelection(for: g.location(in: h))
            }
        case .ended:
            if let h = alternatesHost {
                pickAlternateIfNeeded(touch: g.location(in: h))
            }
            hideAlternatesBar()
        case .cancelled, .failed:
            hideAlternatesBar()
        default:
            break
        }
    }

    /// Colors for the long-press tray + mini keys (close to system keyboard).
    private func alternatePopupPalette() -> (tray: UIColor, key: UIColor, keyHighlighted: UIColor, text: UIColor) {
        if traitCollection.userInterfaceStyle == .dark {
            return (
                UIColor(white: 0.2, alpha: 1),
                UIColor(white: 0.3, alpha: 1),
                UIColor(white: 0.42, alpha: 1),
                .white
            )
        }
        return (
            UIColor(white: 0.82, alpha: 1),
            .white,
            UIColor(white: 0.93, alpha: 1),
            .label
        )
    }

    private func showAlternatesBar(options: [String], source: UIButton) {
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

    private func pickAlternateIfNeeded(touch: CGPoint) {
        guard let host = alternatesHost else { return }
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
                break
            }
        }
    }

    private func hideAlternatesBar() {
        alternatesHost?.removeFromSuperview()
        alternatesHost = nil
        alternatesOptions = []
        alternatesCells = []
    }

    private func buildBottomBar() {
        bottomBar.axis = .horizontal
        bottomBar.spacing = 8
        bottomBar.alignment = .center
        bottomBar.distribution = .fill

        let primary = UIButton(type: .system)
        primary.translatesAutoresizingMaskIntoConstraints = false
        primary.accessibilityIdentifier = "kb_ai_primary"
        primary.layer.cornerRadius = 8
        primary.accessibilityLabel = kbString("keyboard.ai_button_accessibility")
        let chromeIcon: CGFloat = 17
        primary.setImage(symbolImage(systemName: "sparkles", pointSize: 19, weight: .medium, fallbackLetter: "*"), for: .normal)
        aiPrimaryButton = primary
        primary.addTarget(self, action: #selector(rewriteTouchDown), for: .touchDown)
        primary.addTarget(self, action: #selector(rewriteTouchCancel), for: [.touchUpOutside, .touchCancel])
        primary.addAction(UIAction { [weak self] _ in self?.runTransform(mode: .rewrite) }, for: .touchUpInside)
        NSLayoutConstraint.activate([
            primary.widthAnchor.constraint(equalToConstant: 36),
            primary.heightAnchor.constraint(equalToConstant: 36),
        ])

        let themeBtn = UIButton(type: .system)
        themeBtn.setContentHuggingPriority(.required, for: .horizontal)
        themeCycleButton = themeBtn
        refreshThemeCycleChrome()
        themeBtn.addAction(UIAction { [weak self] _ in self?.cycleKeyboardTheme() }, for: .touchUpInside)

        let accentBtn = bottomChromeSymbolButton(systemName: "paintpalette", pointSize: chromeIcon, accessibilityKey: "keyboard.accent_cycle_accessibility")
        accentBtn.addAction(UIAction { [weak self] _ in self?.cycleChromeAccent() }, for: .touchUpInside)

        let downBtn = bottomChromeSymbolButton(systemName: "chevron.compact.down", pointSize: chromeIcon, accessibilityKey: "keyboard.dismiss_keyboard_accessibility")
        downBtn.addAction(UIAction { [weak self] _ in self?.dismissChromeKeyboard() }, for: .touchUpInside)

        let spacer = UIView()
        spacer.setContentHuggingPriority(.defaultLow, for: .horizontal)
        spacer.setContentCompressionResistancePriority(.defaultLow, for: .horizontal)

        let rightSubs: [UIView] = {
            if Self.emojiKeyplaneEnabled {
                let emojiBtn = bottomChromeSymbolButton(systemName: "face.smiling", pointSize: chromeIcon, accessibilityKey: "keyboard.emoji_keyboard_accessibility")
                emojiBtn.addAction(UIAction { [weak self] _ in self?.switchToEmojiKeyplane() }, for: .touchUpInside)
                return [themeBtn, accentBtn, emojiBtn, downBtn]
            }
            return [themeBtn, accentBtn, downBtn]
        }()

        let rightCluster = UIStackView(arrangedSubviews: rightSubs)
        rightCluster.axis = .horizontal
        rightCluster.spacing = 8
        rightCluster.alignment = .center

        bottomBar.addArrangedSubview(primary)
        bottomBar.addArrangedSubview(spacer)
        bottomBar.addArrangedSubview(rightCluster)
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

    private func bottomChromeSymbolButton(systemName: String, pointSize: CGFloat, accessibilityKey: String) -> UIButton {
        let b = UIButton(type: .system)
        let letter = String(systemName.prefix(1).uppercased())
        b.setImage(symbolImage(systemName: systemName, pointSize: pointSize, weight: .medium, fallbackLetter: letter), for: .normal)
        b.setContentHuggingPriority(.required, for: .horizontal)
        b.tintColor = .label
        b.accessibilityLabel = kbString(accessibilityKey)
        return b
    }

    private func cycleKeyboardTheme() {
        let next = AppGroupStore.shared.keyboardAppearancePreference.cycled()
        AppGroupStore.shared.keyboardAppearancePreference = next
        controller?.applyKeyboardAppearancePreference()
        refreshThemeCycleChrome()
    }

    private func cycleChromeAccent() {
        let all = KeyboardChromeAccent.allCases
        let current = AppGroupStore.shared.keyboardChromeAccent
        let idx = (all.firstIndex(of: current) ?? 0) + 1
        AppGroupStore.shared.keyboardChromeAccent = all[idx % all.count]
        let isDark = traitCollection.userInterfaceStyle == .dark
        refreshChromeAccents()
        applyAIPrimaryAppearance(isDark: isDark)
    }

    private func switchToEmojiKeyplane() {
        guard Self.emojiKeyplaneEnabled else { return }
        keyplane = .emoji
        rebuildKeyContainer()
    }

    private func dismissChromeKeyboard() {
        controller?.dismissKeyboardFromChrome()
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

        let style = AppGroupStore.shared.conversationStyle
        let previewFirst = AppGroupStore.shared.aiPreviewBeforeApply

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
                    return
                }
                do {
                    let out = try await RewriteAPI.rewrite(text: text, mode: mode, style: style)
                    if previewFirst {
                        controller.setPendingApplySnapshot(snap)
                        self.showResultPanel(with: out)
                        self.statusLabel.text = self.kbString("keyboard.preview_ready")
                    } else {
                        controller.applyRewrite(result: out, snapshot: snap)
                        self.statusLabel.text = self.kbString("keyboard.done")
                    }
                    self.refreshOpenAppButtonVisibility()
                } catch {
                    // Non-fatal recorded in `RewriteAPI.rewrite` for API/decode failures.
                    self.statusLabel.text = error.localizedDescription
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
