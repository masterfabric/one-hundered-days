import Foundation
#if canImport(FirebaseCore)
import FirebaseCore
#endif
#if canImport(FirebaseCrashlytics)
import FirebaseCrashlytics
#endif

/// Lazy Firebase setup for the keyboard extension (keeps Firebase off the controller hot path).
enum ExtensionFirebaseBootstrap {
    private static var didConfigure = false

    static func configureOnceIfNeeded(reportAccess: @escaping () -> Void) {
        guard !didConfigure else { return }
        didConfigure = true
        FirebaseBootstrap.prepareDevLaunchWithoutPlist()
        guard FirebaseBootstrap.hasGoogleServicePlist else { return }

        DispatchQueue.main.async {
            #if canImport(FirebaseCore)
            KeyboardExtensionDiagnostics.log("Firebase configure")
            FirebaseApp.configure()
            #if canImport(FirebaseCrashlytics)
            Crashlytics.crashlytics().setUserID(DeviceId.idfv)
            #if DEBUG
            NonFatalLog.sendDebugNonfatalSmokeTestOnce()
            #endif
            #endif
            #endif
            reportAccess()
        }
    }
}
