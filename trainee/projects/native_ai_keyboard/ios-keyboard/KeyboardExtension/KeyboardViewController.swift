import FirebaseCore
import FirebaseCrashlytics
import UIKit

/// Captured at rewrite request time so "Apply" after preview still deletes/inserts correctly (host context can look empty after interacting with the keyboard UI).
struct RewriteSnapshot {
    let usesSelection: Bool
    let utf16Before: Int
    let utf16After: Int
    /// True when API text came from full `UITextInput` range; partial before/after may be incomplete — prefer full-range replace.
    let replaceWholeDocumentPreferred: Bool
}

final class KeyboardViewController: UIInputViewController {
    private static var didConfigureFirebase = false

    private var layoutView: KeyboardLayoutView!
    /// Set when preview is shown; consumed on Apply or cleared on cancel / new action.
    private var pendingApplySnapshot: RewriteSnapshot?

    override func viewDidLoad() {
        super.viewDidLoad()
        if !Self.didConfigureFirebase {
            Self.didConfigureFirebase = true
            if Bundle.main.path(forResource: "GoogleService-Info", ofType: "plist") != nil {
                FirebaseApp.configure()
                Crashlytics.crashlytics().setUserID(DeviceId.idfv)
                #if DEBUG
                NonFatalLog.sendDebugNonfatalSmokeTestOnce()
                #endif
            }
        }
        registerForTraitChanges([UITraitUserInterfaceStyle.self]) { [weak self] (_: KeyboardViewController, _) in
            self?.applyKeyboardAppearancePreference()
        }
        applyKeyboardAppearancePreference()
        layoutView = KeyboardLayoutView(controller: self)
        layoutView.translatesAutoresizingMaskIntoConstraints = false
        view.addSubview(layoutView)
        NSLayoutConstraint.activate([
            layoutView.leadingAnchor.constraint(equalTo: view.leadingAnchor),
            layoutView.trailingAnchor.constraint(equalTo: view.trailingAnchor),
            layoutView.topAnchor.constraint(equalTo: view.topAnchor),
            layoutView.bottomAnchor.constraint(equalTo: view.bottomAnchor),
        ])
    }

    override func viewWillAppear(_ animated: Bool) {
        super.viewWillAppear(animated)
        applyKeyboardAppearancePreference()
    }

    /// Reads App Group appearance (set in host app or from keyboard theme control).
    func applyKeyboardAppearancePreference() {
        switch AppGroupStore.shared.keyboardAppearancePreference {
        case .light:
            overrideUserInterfaceStyle = .light
        case .dark:
            overrideUserInterfaceStyle = .dark
        case .system:
            overrideUserInterfaceStyle = .unspecified
        }
        layoutView?.applyAppearance(traits: traitCollection)
    }

    /// Custom keyboards cannot call `resignFirstResponder` on the host field; this is the supported API.
    func dismissKeyboardFromChrome() {
        dismissKeyboard()
    }

    func insertString(_ s: String) {
        textDocumentProxy.insertText(s)
    }

    func deleteBackward() {
        textDocumentProxy.deleteBackward()
    }

    func advanceToNextKeyboard() {
        advanceToNextInputMode()
    }

    /// Same text + snapshot in one pass (avoids mismatch when proxy updates between calls).
    func rewriteContext() -> (text: String, snapshot: RewriteSnapshot) {
        let proxy = textDocumentProxy

        if let sel = proxy.selectedText, !sel.isEmpty {
            return (
                sel,
                RewriteSnapshot(usesSelection: true, utf16Before: 0, utf16After: 0, replaceWholeDocumentPreferred: false)
            )
        }

        let before = proxy.documentContextBeforeInput ?? ""
        let after = proxy.documentContextAfterInput ?? ""
        let split = before + after
        let uBefore = KeyboardTextReplacement.utf16Length(before)
        let uAfter = KeyboardTextReplacement.utf16Length(after)

        if let input = proxy as? UITextInput {
            let start = input.beginningOfDocument
            let end = input.endOfDocument
            if let range = input.textRange(from: start, to: end), let whole = input.text(in: range) {
                // Always prefer full-document text when UITextInput exposes it so chained AI edits see the latest field.
                let text: String
                let useFullReplace: Bool
                if !whole.isEmpty {
                    text = whole
                    useFullReplace = true
                } else if !split.isEmpty {
                    text = split
                    useFullReplace = false
                } else {
                    text = ""
                    useFullReplace = false
                }
                return (
                    text,
                    RewriteSnapshot(
                        usesSelection: false,
                        utf16Before: uBefore,
                        utf16After: uAfter,
                        replaceWholeDocumentPreferred: useFullReplace
                    )
                )
            }
        }

        return (
            split,
            RewriteSnapshot(usesSelection: false, utf16Before: uBefore, utf16After: uAfter, replaceWholeDocumentPreferred: false)
        )
    }

    func currentTextForRewrite() -> String {
        rewriteContext().text
    }

    /// Call on the main thread immediately before starting the rewrite API task.
    func makeRewriteSnapshot() -> RewriteSnapshot {
        rewriteContext().snapshot
    }

    func clearPendingApplySnapshot() {
        pendingApplySnapshot = nil
    }

    func setPendingApplySnapshot(_ snapshot: RewriteSnapshot) {
        pendingApplySnapshot = snapshot
    }

    func applyPreviewResult(_ result: String) {
        let snap = pendingApplySnapshot ?? rewriteContext().snapshot
        pendingApplySnapshot = nil
        applyRewrite(result: result, snapshot: snap)
    }

    func replaceCurrentText(with result: String) {
        applyRewrite(result: result, snapshot: rewriteContext().snapshot)
    }

    func applyRewrite(result: String, snapshot: RewriteSnapshot) {
        let proxy = textDocumentProxy

        if snapshot.usesSelection {
            if let input = proxy as? UITextInput,
               let selected = input.selectedTextRange,
               input.offset(from: selected.start, to: selected.end) != 0
            {
                input.replace(selected, withText: result)
                return
            }
        } else {
            if let input = proxy as? UITextInput {
                let start = input.beginningOfDocument
                let end = input.endOfDocument
                if let range = input.textRange(from: start, to: end) {
                    input.replace(range, withText: result)
                    return
                }
            }
        }

        if snapshot.usesSelection {
            let len = KeyboardTextReplacement.utf16Length(proxy.selectedText ?? "")
            if len > 0 {
                for _ in 0 ..< len {
                    proxy.deleteBackward()
                }
                proxy.insertText(result)
            } else {
                proxy.insertText(result)
            }
            return
        }

        if snapshot.replaceWholeDocumentPreferred {
            if let input = proxy as? UITextInput {
                let start = input.beginningOfDocument
                let end = input.endOfDocument
                if let range = input.textRange(from: start, to: end) {
                    input.replace(range, withText: result)
                    return
                }
            }
            // Host may not be ready on the same turn as the last replace; retry next run loop.
            DispatchQueue.main.async { [weak self] in
                guard let self else { return }
                let proxy = self.textDocumentProxy
                if let input = proxy as? UITextInput {
                    let start = input.beginningOfDocument
                    let end = input.endOfDocument
                    if let range = input.textRange(from: start, to: end) {
                        input.replace(range, withText: result)
                        return
                    }
                }
                self.applyRewriteDeleteFallback(proxy: proxy, snapshot: snapshot, result: result)
            }
            return
        }

        applyRewriteDeleteFallback(proxy: proxy, snapshot: snapshot, result: result)
    }

    private func applyRewriteDeleteFallback(proxy: UITextDocumentProxy, snapshot: RewriteSnapshot, result: String) {
        for _ in 0 ..< snapshot.utf16Before {
            proxy.deleteBackward()
        }
        if snapshot.utf16After > 0 {
            proxy.adjustTextPosition(byCharacterOffset: snapshot.utf16After)
            for _ in 0 ..< snapshot.utf16After {
                proxy.deleteBackward()
            }
        }
        proxy.insertText(result)
    }

    func openHostAppForSessionRefresh() {
        guard hasFullAccess, let url = URL(string: "aikeyboard://refresh") else { return }
        extensionContext?.open(url, completionHandler: nil)
    }

    func presentStylePicker(sourceView: UIView, onPick: @escaping (ConversationStyle) -> Void) {
        let kb = Bundle(for: KeyboardViewController.self)
        let langCode: String = {
            let p = Locale.preferredLanguages.first ?? "en"
            if p.hasPrefix("tr") { return "tr" }
            return "en"
        }()
        let stringsBundle: Bundle = {
            if let path = kb.path(forResource: langCode, ofType: "lproj"),
               let b = Bundle(path: path)
            {
                return b
            }
            if let path = kb.path(forResource: "en", ofType: "lproj"), let b = Bundle(path: path) {
                return b
            }
            return kb
        }()
        let sheet = UIAlertController(
            title: String(localized: "keyboard.style_picker_title", bundle: stringsBundle),
            message: String(localized: "keyboard.style_picker_message", bundle: stringsBundle),
            preferredStyle: .actionSheet
        )
        for s in ConversationStyle.allCases {
            sheet.addAction(UIAlertAction(title: s.localizedKeyboardStyleName(bundle: stringsBundle), style: .default) { _ in
                onPick(s)
            })
        }
        sheet.addAction(UIAlertAction(title: String(localized: "keyboard.cancel", bundle: stringsBundle), style: .cancel))
        if let pop = sheet.popoverPresentationController {
            pop.sourceView = sourceView
            pop.sourceRect = sourceView.bounds
        }
        present(sheet, animated: true)
    }
}
