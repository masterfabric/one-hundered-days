import Foundation

/// Host-app view of keyboard + Full Access readiness (extension writes, host reads).
struct KeyboardSetupStatus: Equatable {
    let appGroupAvailable: Bool
    let keyboardDetected: Bool
    let fullAccessOn: Bool

    var isReady: Bool {
        appGroupAvailable && keyboardDetected && fullAccessOn
    }

    static func resolve(from store: AppGroupStore = .shared) -> KeyboardSetupStatus {
        KeyboardSetupStatus(
            appGroupAvailable: store.isSharedContainerAvailable,
            keyboardDetected: store.keyboardHasBeenUsed,
            fullAccessOn: store.keyboardReportsFullAccess
        )
    }
}
