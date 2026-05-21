import Foundation

/// Maps to server `style` whitelist (see docs/AI_CONTRACT.md).
enum ConversationStyle: String, CaseIterable, Identifiable {
    case formal
    case work
    case friends
    case family
    case flirt

    var id: String { rawValue }

    var localizationKey: String {
        "style.\(rawValue)"
    }

    /// Short label in keyboard extension `Localizable.strings` (`keyboard.style.*`).
    func localizedKeyboardStyleName(bundle: Bundle) -> String {
        String(localized: String.LocalizationValue("keyboard.style.\(rawValue)"), bundle: bundle)
    }
}
