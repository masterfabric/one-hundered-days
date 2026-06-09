import UIKit

/// Status zone — session hint + open-host button (populated by `KeyboardLayoutView`).
final class KeyboardStatusRowView: UIStackView {
    let statusLabel = UILabel()
    let openAppButton = UIButton(type: .system)

    override init(frame: CGRect) {
        super.init(frame: frame)
        axis = .horizontal
        alignment = .center
        spacing = 8
        isLayoutMarginsRelativeArrangement = true
        layoutMargins = UIEdgeInsets(top: 2, left: 8, bottom: 2, right: 8)
        statusLabel.font = .systemFont(ofSize: 12, weight: .medium)
        statusLabel.numberOfLines = 2
        statusLabel.setContentHuggingPriority(.defaultLow, for: .horizontal)
        openAppButton.setContentHuggingPriority(.required, for: .horizontal)
        addArrangedSubview(statusLabel)
        addArrangedSubview(openAppButton)
        isHidden = true
    }

    @available(*, unavailable)
    required init(coder: NSCoder) {
        fatalError("init(coder:) has not been implemented")
    }
}
