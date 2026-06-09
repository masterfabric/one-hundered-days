import UIKit

/// Vertical stack orchestration: toolbar → status → keyplane (KeyboardKit root layout zone).
enum KeyboardRootViewLayout {
    struct Constraints {
        var toolbarHeight: NSLayoutConstraint?
        var statusHeight: NSLayoutConstraint?
        var previewHeight: NSLayoutConstraint?
        var keyplaneMinHeight: NSLayoutConstraint?
    }

    static func install(
        on parent: UIView,
        surfaceCover: UIView,
        toolbarRow: UIView,
        statusRow: UIView,
        keyContainer: UIView,
        previewOverlay: UIView,
        toolbarDesignHeight: CGFloat
    ) -> Constraints {
        surfaceCover.translatesAutoresizingMaskIntoConstraints = false
        surfaceCover.isUserInteractionEnabled = false
        parent.addSubview(surfaceCover)
        NSLayoutConstraint.activate([
            surfaceCover.leadingAnchor.constraint(equalTo: parent.leadingAnchor),
            surfaceCover.trailingAnchor.constraint(equalTo: parent.trailingAnchor),
            surfaceCover.topAnchor.constraint(equalTo: parent.topAnchor),
            surfaceCover.bottomAnchor.constraint(equalTo: parent.bottomAnchor),
        ])

        let root = UIStackView()
        root.axis = .vertical
        root.spacing = 1
        root.distribution = .fill
        root.alignment = .fill
        root.isLayoutMarginsRelativeArrangement = true
        root.layoutMargins = UIEdgeInsets(top: 0, left: 0, bottom: 8, right: 0)
        root.translatesAutoresizingMaskIntoConstraints = false
        parent.addSubview(root)

        NSLayoutConstraint.activate([
            root.leadingAnchor.constraint(equalTo: parent.leadingAnchor),
            root.trailingAnchor.constraint(equalTo: parent.trailingAnchor),
            root.topAnchor.constraint(equalTo: parent.topAnchor),
            root.bottomAnchor.constraint(equalTo: parent.bottomAnchor),
        ])

        let fixedVertical = UILayoutPriority.required
        let expandVertical = UILayoutPriority(1)
        toolbarRow.setContentHuggingPriority(.defaultHigh, for: .vertical)
        toolbarRow.setContentCompressionResistancePriority(.defaultHigh, for: .vertical)
        statusRow.setContentHuggingPriority(fixedVertical, for: .vertical)
        statusRow.setContentCompressionResistancePriority(fixedVertical, for: .vertical)
        keyContainer.setContentHuggingPriority(expandVertical, for: .vertical)
        keyContainer.setContentCompressionResistancePriority(expandVertical, for: .vertical)

        root.addArrangedSubview(toolbarRow)
        root.addArrangedSubview(statusRow)
        root.addArrangedSubview(keyContainer)

        let toolbarH = toolbarRow.heightAnchor.constraint(equalToConstant: toolbarDesignHeight)
        toolbarH.priority = .defaultHigh
        toolbarH.isActive = true

        let statusH = statusRow.heightAnchor.constraint(equalToConstant: 0)
        statusH.priority = .defaultHigh
        statusH.isActive = true

        let keyplaneMinH = keyContainer.heightAnchor.constraint(greaterThanOrEqualToConstant: 208)
        keyplaneMinH.priority = .defaultHigh
        keyplaneMinH.isActive = true

        previewOverlay.translatesAutoresizingMaskIntoConstraints = false
        previewOverlay.isUserInteractionEnabled = true
        previewOverlay.layer.cornerRadius = 22
        previewOverlay.clipsToBounds = true
        parent.insertSubview(previewOverlay, aboveSubview: root)

        let oh = previewOverlay.heightAnchor.constraint(equalToConstant: 0)
        oh.priority = .required
        oh.isActive = true
        NSLayoutConstraint.activate([
            previewOverlay.topAnchor.constraint(equalTo: parent.topAnchor, constant: 4),
            previewOverlay.leadingAnchor.constraint(equalTo: parent.leadingAnchor, constant: 8),
            previewOverlay.trailingAnchor.constraint(equalTo: parent.trailingAnchor, constant: -8),
            oh,
        ])

        return Constraints(
            toolbarHeight: toolbarH,
            statusHeight: statusH,
            previewHeight: oh,
            keyplaneMinHeight: keyplaneMinH
        )
    }
}
