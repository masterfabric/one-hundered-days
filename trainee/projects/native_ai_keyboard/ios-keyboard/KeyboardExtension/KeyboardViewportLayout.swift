import UIKit

/// Positions the extension UI in the keyboard slot iOS allocates above the system dock (globe / mic).
enum KeyboardViewportLayout {
    private static var lastSyncedHostSize: CGSize = .zero

    /// Walk up to `UIInputSetHostView` / `UIInputSetContainerView` — the real keyboard canvas.
    static func hostContainer(for inputView: UIView) -> UIView {
        var candidate = inputView
        var current: UIView? = inputView.superview
        while let v = current {
            let name = String(describing: type(of: v))
            if name.contains("InputSetHost") { return v }
            if name.contains("InputSetContainer") { candidate = v }
            current = v.superview
        }
        return inputView.superview ?? candidate
    }

    /// Resize `UIInputView` to the host canvas when the host size changes (avoids layout loops).
    static func syncInputViewFrame(_ inputView: UIView) {
        let host = hostContainer(for: inputView)
        let size = host.bounds.size
        guard size.width > 1, size.height > 1 else { return }

        let hostUnchanged = abs(lastSyncedHostSize.width - size.width) < 0.5
            && abs(lastSyncedHostSize.height - size.height) < 0.5
        let frameMatches = abs(inputView.frame.width - size.width) < 0.5
            && abs(inputView.frame.height - size.height) < 0.5
        if hostUnchanged && frameMatches { return }

        lastSyncedHostSize = size
        var frame = inputView.frame
        frame.origin = .zero
        frame.size = size
        inputView.frame = frame
        inputView.bounds = CGRect(origin: .zero, size: size)
    }
}
