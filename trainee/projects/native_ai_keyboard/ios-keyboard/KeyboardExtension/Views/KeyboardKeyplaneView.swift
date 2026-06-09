import UIKit

/// Keyplane zone — QWERTY / numbers / emoji rows (populated by `KeyboardLayoutView`).
final class KeyboardKeyplaneView: UIStackView {
    override init(frame: CGRect) {
        super.init(frame: frame)
        axis = .vertical
        alignment = .fill
        distribution = .fillEqually
        isLayoutMarginsRelativeArrangement = true
        layoutMargins = UIEdgeInsets(top: 4, left: 3, bottom: 6, right: 3)
        spacing = 10
    }

    @available(*, unavailable)
    required init(coder: NSCoder) {
        fatalError("init(coder:) has not been implemented")
    }
}
