import Foundation

/// KeyboardKit-style declarative keyplane model (data only — no UIKit).
enum KeyboardLayoutItem: Equatable {
    case letter(Character)
    case shift
    case delete
    case numbersToggle
    case abcToggle
    case space
    case `return`
    case symbol(String)
}

enum KeyboardLayoutRowStyle: Equatable {
    case uniform
    case staggered(horizontalInset: CGFloat)
    case shiftMiddle
    case bottom
}

struct KeyboardLayoutRowSpec: Equatable {
    let label: String
    let style: KeyboardLayoutRowStyle
    let items: [KeyboardLayoutItem]
}

struct KeyboardLayoutSpec: Equatable {
    let rows: [KeyboardLayoutRowSpec]

    private static func letters(_ string: String) -> [KeyboardLayoutItem] {
        string.map { .letter($0) }
    }

    /// Standard QWERTY letter keyplane (matches Apple layout reference).
    static let lettersQwerty = KeyboardLayoutSpec(rows: [
        KeyboardLayoutRowSpec(
            label: "top",
            style: .uniform,
            items: letters("qwertyuiop")
        ),
        KeyboardLayoutRowSpec(
            label: "middle",
            style: .staggered(horizontalInset: 18),
            items: letters("asdfghjkl")
        ),
        KeyboardLayoutRowSpec(
            label: "shift",
            style: .shiftMiddle,
            items: [.shift] + letters("zxcvbnm") + [.delete]
        ),
        KeyboardLayoutRowSpec(
            label: "bottom",
            style: .bottom,
            items: [.numbersToggle, .space, .return]
        ),
    ])
}
