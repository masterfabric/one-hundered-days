import Foundation
#if canImport(FirebaseCore)
import FirebaseCore
#endif
#if canImport(FirebaseCrashlytics)
import FirebaseCrashlytics
#endif

/// Records non-fatal errors and breadcrumbs to Crashlytics when Firebase is configured (host app + keyboard extension).
enum NonFatalLog {
    static func breadcrumb(_ message: String, category: String = "app") {
        #if canImport(FirebaseCrashlytics)
        #if canImport(FirebaseCore)
        guard FirebaseApp.app() != nil else { return }
        #endif
        Crashlytics.crashlytics().log("[\(category)] \(message)")
        #endif
    }

    static func record(_ error: Error, category: String) {
        #if canImport(FirebaseCrashlytics)
        #if canImport(FirebaseCore)
        guard FirebaseApp.app() != nil else { return }
        #endif
        Crashlytics.crashlytics().log("nonfatal.\(category)")
        Crashlytics.crashlytics().record(error: error)
        #endif
    }

    /// One-time per extension/process DEBUG: verifies non-fatals appear in the Crashlytics dashboard (not sent in Release).
    /// Important: only marks complete after Firebase is configured so a missing plist does not consume the one-shot.
    static func sendDebugNonfatalSmokeTestOnce() {
        #if DEBUG
        #if canImport(FirebaseCrashlytics) && canImport(FirebaseCore)
        guard FirebaseApp.app() != nil else { return }
        #endif
        #if canImport(FirebaseCrashlytics)
        let key = "crashlytics_debug_nonfatal_smoke_v2"
        guard UserDefaults.standard.bool(forKey: key) == false else { return }
        let e = NSError(
            domain: "AIKeyboardSmokeTest",
            code: 991,
            userInfo: [NSLocalizedDescriptionKey: "DEBUG non-fatal: Crashlytics connectivity check"]
        )
        Crashlytics.crashlytics().log("smoke_test_nonfatal")
        Crashlytics.crashlytics().record(error: e)
        UserDefaults.standard.set(true, forKey: key)
        #endif
        #endif
    }
}
