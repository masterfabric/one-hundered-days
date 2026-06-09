import Foundation
#if canImport(FirebaseCore)
import FirebaseCore
#endif

/// Shared guard for optional Firebase in local dev (no `GoogleService-Info.plist`).
enum FirebaseBootstrap {
    static var hasGoogleServicePlist: Bool {
        Bundle.main.path(forResource: "GoogleService-Info", ofType: "plist") != nil
    }

    /// Call at process launch before any Firebase API when the plist may be absent.
    static func prepareDevLaunchWithoutPlist() {
        guard !hasGoogleServicePlist else { return }
        #if DEBUG
        #if canImport(FirebaseCore)
        FirebaseConfiguration.shared.setLoggerLevel(.min)
        #endif
        #endif
    }
}
