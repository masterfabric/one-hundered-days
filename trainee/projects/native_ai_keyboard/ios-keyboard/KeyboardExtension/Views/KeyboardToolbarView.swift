import UIKit

/// Toolbar zone — HTML-style `justify-between`: AI cluster (left) + spacer + + (right).
final class KeyboardToolbarView: UIStackView {
    let aiActionsRow = UIStackView()
    let plusButtonHost = UIStackView()
    private let bottomDivider = UIView()

    /// Back-compat alias used by `KeyboardLayoutView`.
    var actionsRow: UIStackView { aiActionsRow }

    override init(frame: CGRect) {
        super.init(frame: frame)
        axis = .vertical
        alignment = .fill
        distribution = .fill
        spacing = 3
        isLayoutMarginsRelativeArrangement = true
        layoutMargins = UIEdgeInsets(top: 4, left: 16, bottom: 3, right: 16)

        let topRow = UIStackView()
        topRow.axis = .horizontal
        topRow.alignment = .center
        topRow.distribution = .fill
        topRow.spacing = 0

        aiActionsRow.axis = .horizontal
        aiActionsRow.spacing = 16
        aiActionsRow.alignment = .center
        aiActionsRow.distribution = .fill
        aiActionsRow.isLayoutMarginsRelativeArrangement = true
        aiActionsRow.layoutMargins = UIEdgeInsets(top: 2, left: 0, bottom: 2, right: 0)

        plusButtonHost.axis = .horizontal
        plusButtonHost.alignment = .center
        plusButtonHost.distribution = .fill
        plusButtonHost.setContentHuggingPriority(.required, for: .horizontal)
        plusButtonHost.setContentCompressionResistancePriority(.required, for: .horizontal)

        let spacer = UIView()
        spacer.setContentHuggingPriority(.defaultLow, for: .horizontal)
        spacer.setContentCompressionResistancePriority(.defaultLow, for: .horizontal)

        topRow.addArrangedSubview(aiActionsRow)
        topRow.addArrangedSubview(spacer)
        topRow.addArrangedSubview(plusButtonHost)

        bottomDivider.backgroundColor = UIColor.separator.withAlphaComponent(0.2)
        bottomDivider.translatesAutoresizingMaskIntoConstraints = false
        bottomDivider.heightAnchor.constraint(equalToConstant: 1).isActive = true

        addArrangedSubview(topRow)
        addArrangedSubview(bottomDivider)
    }

    func applyDividerAppearance(isDark: Bool) {
        bottomDivider.backgroundColor = isDark
            ? UIColor.white.withAlphaComponent(0.12)
            : UIColor.black.withAlphaComponent(0.08)
    }

    @available(*, unavailable)
    required init(coder: NSCoder) {
        fatalError("init(coder:) has not been implemented")
    }
}
