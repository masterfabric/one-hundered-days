import FirebaseAnalytics
import FirebaseAuth
import FirebaseCore
import FirebaseCrashlytics
import FirebaseFirestore
import Foundation
import UIKit

// TODO(Firebase): Add real `GoogleService-Info.plist` under `AIKeyboard/Resources/` and the keyboard target’s Copy Bundle Resources so Crashlytics/Analytics/Firestore and in-app feedback work in production. See `ios-keyboard/README.md`.

/// Host-app only: Crashlytics + Analytics + Firestore device row (IDFV matches `AccountSync` / device id).
enum FirebaseDeviceRegistry {
    /// Call once at launch. No-op if `GoogleService-Info.plist` is missing (local dev without Firebase).
    static func configureAtLaunch() {
        guard FirebaseBootstrap.hasGoogleServicePlist else { return }
        if FirebaseApp.app() != nil { return }
        FirebaseApp.configure()
        Analytics.setAnalyticsCollectionEnabled(true)
        #if DEBUG
        NonFatalLog.sendDebugNonfatalSmokeTestOnce()
        #endif
    }

    /// After session sync; updates Crashlytics context, Analytics, and `devices/{idfv}` in Firestore.
    static func recordPostSyncSnapshot() async {
        guard FirebaseApp.app() != nil else { return }
        await ensureAnonymousUserIfNeeded()

        let id = DeviceId.idfv
        let store = AppGroupStore.shared

        Crashlytics.crashlytics().setUserID(id)
        Crashlytics.crashlytics().setCustomValue(store.entitlementActive, forKey: "entitlement_active")
        Crashlytics.crashlytics().setCustomValue(store.sessionExpiresAt, forKey: "session_expires_at")

        Analytics.setUserID(id)
        Analytics.setUserProperty(id, forName: "device_id")
        Analytics.setUserProperty(store.entitlementActive ? "1" : "0", forName: "entitlement_active")
        let params: [String: Any] = [
            "active": store.entitlementActive,
            "marketing_version": Bundle.main.object(forInfoDictionaryKey: "CFBundleShortVersionString") as? String ?? "",
        ]
        Analytics.logEvent("entitlement_snapshot", parameters: params)

        let v = Bundle.main.infoDictionary?["CFBundleShortVersionString"] as? String ?? ""
        let build = Bundle.main.infoDictionary?["CFBundleVersion"] as? String ?? ""
        let langs = Locale.preferredLanguages.joined(separator: ",")

        let db = Firestore.firestore()
        do {
            try await db.collection("devices").document(id).setData(
                [
                    "idfv": id,
                    "entitlementActive": store.entitlementActive,
                    "entitlementCheckedAt": store.entitlementCheckedAt,
                    "sessionExpiresAt": store.sessionExpiresAt,
                    "appVersion": v,
                    "build": build,
                    "osVersion": UIDevice.current.systemVersion,
                    "preferredLanguages": langs,
                    "platform": "ios",
                    "updatedAt": FieldValue.serverTimestamp(),
                ],
                merge: true
            )
        } catch {
            NonFatalLog.record(error, category: "firestore_device_sync")
        }
    }

    /// Enables Firestore rules like `request.auth != null` without Apple Sign-In. Turn on **Anonymous** in Firebase Console → Authentication → Sign-in method.
    static func ensureAnonymousUserIfNeeded() async {
        guard Auth.auth().currentUser == nil else { return }
        do {
            _ = try await Auth.auth().signInAnonymously()
        } catch {
            NonFatalLog.record(error, category: "firebase_anonymous_auth")
        }
    }
}
