import Foundation

/// Observable snapshot shared between controller and views (KeyboardKit `state` analogue).
final class KeyboardState {
    var appearance: KeyboardAppearancePreference = AppGroupStore.shared.keyboardAppearancePreference
    var chromeAccent: KeyboardChromeAccent = AppGroupStore.shared.keyboardChromeAccent
    var conversationStyle: ConversationStyle = AppGroupStore.shared.conversationStyle
    var aiPreviewBeforeApply: Bool = AppGroupStore.shared.aiPreviewBeforeApply
    var sessionValid: Bool = AppGroupStore.shared.isSessionValid()

    func refreshFromAppGroup() {
        let store = AppGroupStore.shared
        appearance = store.keyboardAppearancePreference
        chromeAccent = store.keyboardChromeAccent
        conversationStyle = store.conversationStyle
        aiPreviewBeforeApply = store.aiPreviewBeforeApply
        sessionValid = store.isSessionValid()
    }

    func apply(_ config: KeyboardAppConfiguration) {
        config.pushToAppGroupIfNeeded()
        refreshFromAppGroup()
    }
}
