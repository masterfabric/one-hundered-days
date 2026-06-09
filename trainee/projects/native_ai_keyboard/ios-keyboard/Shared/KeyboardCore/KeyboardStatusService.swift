import Foundation

/// Host-side keyboard readiness (KeyboardKit Status module analogue).
enum KeyboardStatusService {
    static func resolve(from store: AppGroupStore = .shared) -> KeyboardSetupStatus {
        KeyboardSetupStatus.resolve(from: store)
    }

    static func shouldPromptForFullAccess(from store: AppGroupStore = .shared) -> Bool {
        store.shouldPromptForFullAccessInHostApp
    }
}
