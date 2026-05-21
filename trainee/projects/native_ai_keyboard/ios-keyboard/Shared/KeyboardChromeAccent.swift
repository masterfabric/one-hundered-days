import UIKit

/// Accent for AI / toolbar highlights on the custom keyboard (no third-party icon fonts).
enum KeyboardChromeAccent: String, CaseIterable, Identifiable, Hashable {
    case systemBlue
    case teal
    case green
    case orange
    case purple
    case pink

    var id: String { rawValue }

    var localizationKey: String { "accent.\(rawValue)" }

    var uiColor: UIColor {
        switch self {
        case .systemBlue:
            return UIColor(red: 0.0, green: 0.478, blue: 1.0, alpha: 1.0)
        case .teal:
            return UIColor(red: 0.08, green: 0.62, blue: 0.55, alpha: 1.0)
        case .green:
            return UIColor(red: 0.18, green: 0.72, blue: 0.32, alpha: 1.0)
        case .orange:
            return UIColor(red: 1.0, green: 0.52, blue: 0.05, alpha: 1.0)
        case .purple:
            return UIColor(red: 0.52, green: 0.32, blue: 0.95, alpha: 1.0)
        case .pink:
            return UIColor(red: 0.98, green: 0.28, blue: 0.52, alpha: 1.0)
        }
    }
}
