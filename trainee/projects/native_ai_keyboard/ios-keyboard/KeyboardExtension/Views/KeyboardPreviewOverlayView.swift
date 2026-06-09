import UIKit

/// AI preview overlay zone (populated by `KeyboardLayoutView`).
final class KeyboardPreviewOverlayView: UIView {
    let titleLabel = UILabel()
    let textView = UITextView()
    let buttonRow = UIStackView()
    let discardButton = UIButton(type: .system)
    let applyButton = UIButton(type: .system)

    override init(frame: CGRect) {
        super.init(frame: frame)
        isHidden = true
        layer.masksToBounds = true
        titleLabel.font = .systemFont(ofSize: 13, weight: .semibold)
        textView.font = .systemFont(ofSize: 15)
        textView.isEditable = false
        textView.backgroundColor = .clear
        buttonRow.axis = .horizontal
        buttonRow.spacing = 12
        buttonRow.distribution = .fillEqually
        buttonRow.addArrangedSubview(discardButton)
        buttonRow.addArrangedSubview(applyButton)
    }

    @available(*, unavailable)
    required init(coder: NSCoder) {
        fatalError("init(coder:) has not been implemented")
    }
}
