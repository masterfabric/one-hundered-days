import UIKit

/// KeyboardKit-style base controller: `viewWillSetupKeyboardKit` → `viewWillSetupKeyboardView`, deferred keyplane build.
class KeyboardInputController: UIInputViewController {
    enum KeyboardSetupResult {
        case success
        case degraded(reason: String)
    }

    let keyboardState = KeyboardState()
    private var didApplyConfiguration = false
    private var didInstallKeyboardView = false
    private var didBeginAppearSetup = false
    private let placeholderSurface = UIView()
    private var accessReportTimers: [Timer] = []
    private var didSyncViewportOnce = false
    private(set) var chromeOptionsPresenter: KeyboardChromeOptionsPresenter?

    var actions: KeyboardActionService {
        KeyboardActionService(proxy: textDocumentProxy)
    }

    /// KeyboardKit `setupKeyboardKit(for:completion:)` — App Group, settings, state.
    func setupKeyboardKit(for config: KeyboardAppConfiguration, completion: @escaping (KeyboardSetupResult) -> Void) {
        guard !didApplyConfiguration else {
            completion(.success)
            return
        }
        KeyboardExtensionSigningDiagnostics.logInfrastructure()
        didApplyConfiguration = true
        KeyboardSettingsService.syncHostConfiguration(config)
        keyboardState.apply(config)
        let appGroupOK = AppGroupStore.shared.isSharedContainerAvailable
        KeyboardExtensionDiagnostics.logSync(
            "controller.setupKeyboardKit.done appGroup=\(appGroupOK)"
        )
        if appGroupOK {
            completion(.success)
        } else {
            completion(.degraded(reason: "app_group_unavailable"))
        }
    }

    /// Override point — default runs `setupKeyboardKit` then installs the keyboard view on success/degraded.
    func viewWillSetupKeyboardKit() {
        KeyboardExtensionDiagnostics.logSync("controller.viewWillSetupKeyboardKit.begin")
        setupKeyboardKit(for: .current) { [weak self] result in
            guard let self else { return }
            switch result {
            case .success:
                KeyboardExtensionDiagnostics.logSync("controller.setupKeyboardKit.success")
            case .degraded(let reason):
                KeyboardExtensionDiagnostics.logSync("controller.setupKeyboardKit.degraded reason=\(reason)")
            }
            self.viewWillSetupKeyboardView()
        }
    }

    /// Override point — default installs `makeKeyboardContentView()` after kit setup completes.
    func viewWillSetupKeyboardView() {
        KeyboardExtensionDiagnostics.logSync("controller.viewWillSetupKeyboardView.begin")
        installFullKeyboardView()
        layoutContentView()?.syncSettingsFromAppGroup()
        KeyboardExtensionDiagnostics.logSync("controller.viewWillSetupKeyboardView.done")
    }

    func makeKeyboardContentView() -> UIView {
        KeyboardMinimalView(controller: self)
    }

    func installFullKeyboardView() {
        guard !didInstallKeyboardView else { return }
        didInstallKeyboardView = true
        KeyboardExtensionDiagnostics.logSync("controller.installLayout.begin")
        placeholderSurface.removeFromSuperview()
        applyKeyboardAppearancePreference()

        let layoutView = makeKeyboardContentView()
        layoutView.translatesAutoresizingMaskIntoConstraints = false
        view.addSubview(layoutView)
        NSLayoutConstraint.activate([
            layoutView.leadingAnchor.constraint(equalTo: view.leadingAnchor),
            layoutView.trailingAnchor.constraint(equalTo: view.trailingAnchor),
            layoutView.topAnchor.constraint(equalTo: view.topAnchor),
            layoutView.bottomAnchor.constraint(equalTo: view.bottomAnchor),
        ])
        if let layout = layoutView as? KeyboardLayoutView {
            installChromeOptionsPresenter(layoutView: layout)
        }
        KeyboardExtensionDiagnostics.logSync("controller.installLayout.done")
        reportKeyboardAccessToAppGroup()
    }

    func installChromeOptionsPresenter(layoutView: KeyboardLayoutView) {
        guard chromeOptionsPresenter == nil else { return }
        let presenter = KeyboardChromeOptionsPresenter(delegate: layoutView)
        presenter.install(on: layoutView, toolbarAnchor: layoutView.chromeToolbarAnchor)
        chromeOptionsPresenter = presenter
    }

    func toggleChromeOptionsPanel() {
        chromeOptionsPresenter?.toggle()
    }

    func hideChromeOptionsPanel() {
        chromeOptionsPresenter?.hide()
    }

    override func loadView() {
        KeyboardExtensionDiagnostics.logSync("controller.loadView")
        let inputView = UIInputView(frame: .zero, inputViewStyle: .default)
        inputView.allowsSelfSizing = false
        inputView.clipsToBounds = false
        view = inputView
    }

    override func viewDidLoad() {
        super.viewDidLoad()
        KeyboardExtensionDiagnostics.logSync("controller.viewDidLoad.begin")
        installPlaceholderSurface()
        KeyboardExtensionDiagnostics.logSync("controller.viewDidLoad.end")
    }

    override func traitCollectionDidChange(_ previousTraitCollection: UITraitCollection?) {
        super.traitCollectionDidChange(previousTraitCollection)
        applyKeyboardAppearancePreference()
    }

    override func viewWillAppear(_ animated: Bool) {
        super.viewWillAppear(animated)
        KeyboardExtensionDiagnostics.logSync(
            "controller.viewWillAppear bounds=\(view.bounds.size) hasFullAccess=\(hasFullAccess)"
        )
        reportKeyboardAccessToAppGroup()
        AppGroupStore.shared.purgeLegacyKeyboardUIRegionIfPresent()
        scheduleAppearSetupIfNeeded()
    }

    override func viewDidAppear(_ animated: Bool) {
        super.viewDidAppear(animated)
        syncKeyboardSurface()
        reportKeyboardAccessToAppGroup()
        scheduleFollowUpAccessReports()
        ExtensionFirebaseBootstrap.configureOnceIfNeeded { [weak self] in
            self?.reportKeyboardAccessToAppGroup()
        }
        scheduleDeferredKeyboardBuild()
        KeyboardExtensionDiagnostics.logSync("controller.viewDidAppear bounds=\(view.bounds.size)")
    }

    override func viewWillDisappear(_ animated: Bool) {
        super.viewWillDisappear(animated)
        hideChromeOptionsPanel()
        KeyboardExtensionDiagnostics.log("controller.viewWillDisappear")
    }

    deinit {
        accessReportTimers.forEach { $0.invalidate() }
        KeyboardExtensionDiagnostics.log("controller.deinit")
    }

    func syncKeyboardSurface() {
        let surface = KeyboardLayoutView.surfaceColor(
            isDark: traitCollection.userInterfaceStyle == .dark
        )
        let content = view.subviews.first { $0 is KeyboardLayoutView || $0 is KeyboardMinimalView }
        guard let content else { return }
        InputViewBackdropNeutralizer.neutralize(in: view, fillColor: surface, content: content)
    }

    func applyKeyboardAppearancePreference() {
        switch AppGroupStore.shared.keyboardAppearancePreference {
        case .light: overrideUserInterfaceStyle = .light
        case .dark: overrideUserInterfaceStyle = .dark
        case .system: overrideUserInterfaceStyle = .unspecified
        }
        layoutContentView()?.applyAppearance(traits: traitCollection)
    }

    func reportKeyboardAccessToAppGroup() {
        let appGroupOK = AppGroupStore.shared.isSharedContainerAvailable
        AppGroupStore.shared.updateKeyboardAccessReport(hasFullAccess: hasFullAccess)
        KeyboardExtensionDiagnostics.log(
            "accessReport hasFullAccess=\(hasFullAccess) appGroupWrite=\(appGroupOK)"
        )
    }

    private func scheduleFollowUpAccessReports() {
        accessReportTimers.forEach { $0.invalidate() }
        accessReportTimers = [0.35, 1.0, 2.5].map { delay in
            Timer.scheduledTimer(withTimeInterval: delay, repeats: false) { [weak self] _ in
                self?.reportKeyboardAccessToAppGroup()
            }
        }
    }

    func dismissKeyboardFromChrome() {
        dismissKeyboard()
    }

    func insertString(_ s: String) {
        actions.insertString(s)
    }

    func deleteBackward() {
        actions.deleteBackward()
    }

    func rewriteContext() -> (text: String, snapshot: RewriteSnapshot) {
        actions.rewriteContext()
    }

    func currentTextForRewrite() -> String {
        rewriteContext().text
    }

    func makeRewriteSnapshot() -> RewriteSnapshot {
        rewriteContext().snapshot
    }

    func applyRewrite(result: String, snapshot: RewriteSnapshot) {
        if snapshot.replaceWholeDocumentPreferred {
            if let input = textDocumentProxy as? UITextInput {
                let start = input.beginningOfDocument
                let end = input.endOfDocument
                if let range = input.textRange(from: start, to: end) {
                    input.replace(range, withText: result)
                    return
                }
            }
            DispatchQueue.main.async { [weak self] in
                guard let self else { return }
                self.actions.applyRewrite(result: result, snapshot: snapshot)
            }
            return
        }
        actions.applyRewrite(result: result, snapshot: snapshot)
    }

    func openHostAppForSessionRefresh() {
        guard hasFullAccess, let url = KeyboardAppConfiguration.current.deepLinkRefreshURL else { return }
        extensionContext?.open(url, completionHandler: nil)
    }

    private func layoutContentView() -> KeyboardLayoutView? {
        view.subviews.compactMap { $0 as? KeyboardLayoutView }.first
    }

    private func installPlaceholderSurface() {
        placeholderSurface.translatesAutoresizingMaskIntoConstraints = false
        placeholderSurface.isUserInteractionEnabled = false
        placeholderSurface.backgroundColor = KeyboardLayoutView.surfaceColor(
            isDark: traitCollection.userInterfaceStyle == .dark
        )
        view.addSubview(placeholderSurface)
        NSLayoutConstraint.activate([
            placeholderSurface.leadingAnchor.constraint(equalTo: view.leadingAnchor),
            placeholderSurface.trailingAnchor.constraint(equalTo: view.trailingAnchor),
            placeholderSurface.topAnchor.constraint(equalTo: view.topAnchor),
            placeholderSurface.bottomAnchor.constraint(equalTo: view.bottomAnchor),
        ])
    }

    private func scheduleAppearSetupIfNeeded() {
        guard !didBeginAppearSetup else { return }
        didBeginAppearSetup = true
        DispatchQueue.main.async { [weak self] in
            self?.viewWillSetupKeyboardKit()
        }
    }

    private func scheduleDeferredKeyboardBuild() {
        DispatchQueue.main.async { [weak self] in
            guard let self else { return }
            self.layoutContentView()?.finishDeferredBuildIfNeeded { [weak self] in
                guard let self else { return }
                self.layoutContentView()?.applyStableLayoutFit()
                self.syncViewportOnceIfNeeded()
                self.syncKeyboardSurface()
                self.applyKeyboardAppearancePreference()
            }
        }
    }

    private func syncViewportOnceIfNeeded() {
        guard !didSyncViewportOnce else { return }
        didSyncViewportOnce = true
        let size = view.bounds.size
        guard size.width > 1, size.height > 1 else { return }
        KeyboardExtensionDiagnostics.logSync("controller.viewportSync bounds=\(size)")
        KeyboardViewportLayout.syncInputViewFrame(view)
    }
}
