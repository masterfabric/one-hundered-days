import UIKit

/// DEBUG smoke UI — proves the extension process loads without building the full keyplane.
final class KeyboardMinimalView: UIView {
    private weak var controller: KeyboardInputController?

    init(controller: KeyboardInputController) {
        self.controller = controller
        super.init(frame: .zero)
        backgroundColor = KeyboardLayoutView.surfaceColor(isDark: controller.traitCollection.userInterfaceStyle == .dark)
        KeyboardExtensionDiagnostics.logSync("KeyboardMinimalView init")
        buildUI()
        KeyboardExtensionDiagnostics.logSync("KeyboardMinimalView ready")
    }

    @available(*, unavailable)
    required init?(coder: NSCoder) {
        fatalError("init(coder:) has not been implemented")
    }

    private func buildUI() {
        let label = UILabel()
        label.text = "AI Keyboard OK"
        label.font = .systemFont(ofSize: 15, weight: .semibold)
        label.textAlignment = .center
        label.translatesAutoresizingMaskIntoConstraints = false

        let space = UIButton(type: .system)
        var cfg = UIButton.Configuration.filled()
        cfg.title = "space"
        cfg.cornerStyle = .medium
        space.configuration = cfg
        space.translatesAutoresizingMaskIntoConstraints = false
        space.addAction(UIAction { [weak self] _ in
            self?.controller?.insertString(" ")
        }, for: .touchUpInside)

        let stack = UIStackView(arrangedSubviews: [label, space])
        stack.axis = .vertical
        stack.spacing = 12
        stack.translatesAutoresizingMaskIntoConstraints = false
        addSubview(stack)

        NSLayoutConstraint.activate([
            stack.leadingAnchor.constraint(equalTo: leadingAnchor, constant: 12),
            stack.trailingAnchor.constraint(equalTo: trailingAnchor, constant: -12),
            stack.centerYAnchor.constraint(equalTo: centerYAnchor),
            space.heightAnchor.constraint(equalToConstant: 44),
        ])
    }
}
