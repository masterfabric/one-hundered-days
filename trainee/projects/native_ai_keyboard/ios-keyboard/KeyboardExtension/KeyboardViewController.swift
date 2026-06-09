import UIKit

/// Extension entry (`NSExtensionPrincipalClass`). Rewrite preview state lives here; base lifecycle in `KeyboardInputController`.
final class KeyboardViewController: KeyboardInputController {
    private var pendingApplySnapshot: RewriteSnapshot?

    override func makeKeyboardContentView() -> UIView {
        if AppConfig.minimalKeyboard {
            KeyboardExtensionDiagnostics.logSync("controller.contentView=KeyboardMinimalView")
            return KeyboardMinimalView(controller: self)
        }
        KeyboardExtensionDiagnostics.logSync("controller.contentView=KeyboardLayoutView")
        return KeyboardLayoutView(controller: self)
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
}
