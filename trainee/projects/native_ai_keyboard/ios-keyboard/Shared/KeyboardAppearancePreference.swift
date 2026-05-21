import Foundation

/// Keyboard chrome light/dark; stored in App Group so host app and extension stay aligned.
enum KeyboardAppearancePreference: String, CaseIterable, Identifiable {
    case system
    case light
    case dark

    var id: String { rawValue }

    var localizationKey: String {
        switch self {
        case .system: return "appearance.system"
        case .light: return "appearance.light"
        case .dark: return "appearance.dark"
        }
    }

    /// Cycle for the compact control on the keyboard.
    func cycled() -> KeyboardAppearancePreference {
        switch self {
        case .system: return .light
        case .light: return .dark
        case .dark: return .system
        }
    }
}
