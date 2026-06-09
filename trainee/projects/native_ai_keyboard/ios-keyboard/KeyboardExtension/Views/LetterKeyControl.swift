import UIKit

/// Lightweight letter key — `UIControl` instead of `UIButton.Configuration` for deferred keyplane builds.
final class LetterKeyControl: UIControl {
    let baseLetter: Character

    private let titleLabel = UILabel()
    private var normalBackground: UIColor = .secondarySystemBackground
    private var pressedBackground: UIColor = .tertiarySystemBackground
    private(set) var displaysUppercase = false

    init(letter: Character, lightweight: Bool = true) {
        self.baseLetter = Character(String(letter).lowercased())
        super.init(frame: .zero)
        isUserInteractionEnabled = true
        isAccessibilityElement = true
        accessibilityIdentifier = "kb_\(baseLetter)"
        accessibilityTraits = .button

        layer.cornerRadius = 5
        if #available(iOS 13.0, *) {
            layer.cornerCurve = .continuous
        }
        clipsToBounds = true

        titleLabel.font = .systemFont(ofSize: 22, weight: .regular)
        titleLabel.textAlignment = .center
        titleLabel.isUserInteractionEnabled = false
        titleLabel.translatesAutoresizingMaskIntoConstraints = false
        addSubview(titleLabel)
        NSLayoutConstraint.activate([
            titleLabel.leadingAnchor.constraint(equalTo: leadingAnchor, constant: 2),
            titleLabel.trailingAnchor.constraint(equalTo: trailingAnchor, constant: -2),
            titleLabel.topAnchor.constraint(equalTo: topAnchor),
            titleLabel.bottomAnchor.constraint(equalTo: bottomAnchor),
        ])

        setContentHuggingPriority(.required, for: .horizontal)
        setContentCompressionResistancePriority(.required, for: .horizontal)
        setContentHuggingPriority(.defaultLow, for: .vertical)
        setContentCompressionResistancePriority(.defaultLow, for: .vertical)

        updateTitle()
        addTarget(self, action: #selector(touchDown), for: .touchDown)
        addTarget(self, action: #selector(touchUp), for: [.touchUpInside, .touchUpOutside, .touchCancel, .touchDragExit])

        _ = lightweight
    }

    @available(*, unavailable)
    required init?(coder: NSCoder) {
        fatalError("init(coder:) has not been implemented")
    }

    func applyCaps(uppercase: Bool) {
        displaysUppercase = uppercase
        updateTitle()
    }

    func applyColors(normal: UIColor, pressed: UIColor, text: UIColor) {
        normalBackground = normal
        pressedBackground = pressed
        titleLabel.textColor = text
        backgroundColor = isHighlighted ? pressedBackground : normalBackground
    }

    @objc private func touchDown() {
        backgroundColor = pressedBackground
    }

    @objc private func touchUp() {
        backgroundColor = normalBackground
    }

    private func updateTitle() {
        let letter = String(baseLetter)
        titleLabel.text = displaysUppercase ? letter.uppercased() : letter
        accessibilityLabel = titleLabel.text
    }
}
