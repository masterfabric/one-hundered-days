import UIKit

/// Native iOS keyboard colors (light + dark), aligned with Apple keyboard tray and key caps.
enum KeyboardNativePalette {
    struct Colors {
        let tray: UIColor
        let letterKey: UIColor
        let letterKeyPressed: UIColor
        let functionalKey: UIColor
        let functionalKeyPressed: UIColor
        let returnKey: UIColor
        let returnKeyPressed: UIColor
        let primaryText: UIColor
        let returnText: UIColor
        let onSurfaceVariant: UIColor
        let keyShadowOpacity: Float
        let chromeOverlayScrim: CGFloat
        let chromeCard: UIColor
        let alternateTray: UIColor
        let alternateKey: UIColor
        let alternateKeyHighlighted: UIColor
        let alternateText: UIColor
        let previewPanel: UIColor
        let previewField: UIColor
    }

    static func colors(isDark: Bool) -> Colors {
        if isDark {
            return Colors(
                tray: rgba(28, 28, 30),
                letterKey: rgba(99, 99, 102),
                letterKeyPressed: rgba(124, 124, 128),
                functionalKey: rgba(58, 58, 60),
                functionalKeyPressed: rgba(72, 72, 74),
                returnKey: rgba(0, 122, 255),
                returnKeyPressed: rgba(0, 102, 214),
                primaryText: .white,
                returnText: .white,
                onSurfaceVariant: rgba(142, 142, 147),
                keyShadowOpacity: 0.30,
                chromeOverlayScrim: 0.45,
                chromeCard: rgba(44, 44, 46),
                alternateTray: rgba(44, 44, 46),
                alternateKey: rgba(72, 72, 74),
                alternateKeyHighlighted: rgba(99, 99, 102),
                alternateText: .white,
                previewPanel: rgba(44, 44, 46),
                previewField: rgba(28, 28, 30)
            )
        }
        return Colors(
            tray: rgba(210, 213, 219),
            letterKey: .white,
            letterKeyPressed: rgba(173, 180, 190),
            functionalKey: rgba(173, 180, 190),
            functionalKeyPressed: .white,
            returnKey: rgba(0, 122, 255),
            returnKeyPressed: rgba(0, 102, 214),
            primaryText: .black,
            returnText: .white,
            onSurfaceVariant: rgba(73, 69, 79),
            keyShadowOpacity: 0.35,
            chromeOverlayScrim: 0.28,
            chromeCard: .white,
            alternateTray: rgba(199, 203, 209),
            alternateKey: .white,
            alternateKeyHighlighted: rgba(237, 239, 242),
            alternateText: .black,
            previewPanel: .white,
            previewField: rgba(245, 245, 247)
        )
    }

    static func surfaceColor(isDark: Bool) -> UIColor {
        colors(isDark: isDark).tray
    }

    private static func rgba(_ r: CGFloat, _ g: CGFloat, _ b: CGFloat, alpha: CGFloat = 1) -> UIColor {
        UIColor(red: r / 255, green: g / 255, blue: b / 255, alpha: alpha)
    }
}
