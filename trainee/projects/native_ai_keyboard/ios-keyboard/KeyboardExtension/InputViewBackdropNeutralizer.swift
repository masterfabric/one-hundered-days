import UIKit

/// Hides only UIKit blur/backdrop layers inside the extension's `UIInputView`.
/// Does not walk parent views or the system dock (`UIKeyboardDockView`).
enum InputViewBackdropNeutralizer {
    static func neutralize(in inputView: UIView, fillColor: UIColor, content: UIView) {
        inputView.isOpaque = true
        inputView.backgroundColor = fillColor
        (inputView as? UIInputView)?.backgroundColor = fillColor

        for sub in inputView.subviews where sub !== content {
            let typeName = String(describing: type(of: sub))
            if sub is UIVisualEffectView || typeName.localizedCaseInsensitiveContains("backdrop") {
                sub.isHidden = true
                sub.alpha = 0
            }
        }
    }
}
