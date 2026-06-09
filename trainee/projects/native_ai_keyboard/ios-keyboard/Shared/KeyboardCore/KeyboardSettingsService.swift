import Foundation

/// Keyboard-facing settings read/write via App Group (KeyboardKit Settings module analogue).
enum KeyboardSettingsService {
    static func syncHostConfiguration(_ config: KeyboardAppConfiguration) {
        config.pushToAppGroupIfNeeded()
    }

    static var appearance: KeyboardAppearancePreference {
        get { AppGroupStore.shared.keyboardAppearancePreference }
        set { AppGroupStore.shared.keyboardAppearancePreference = newValue }
    }

    static var chromeAccent: KeyboardChromeAccent {
        get { AppGroupStore.shared.keyboardChromeAccent }
        set { AppGroupStore.shared.keyboardChromeAccent = newValue }
    }
}
