import Foundation

/// Refreshes backend session (when configured) and mirrors device context into Firebase when available.
/// MVP: no in-app purchases — AI is enabled after device registration + Full Access for Supabase.
enum AccountSync {
    static func syncAll() async {
        let device = DeviceId.idfv
        let store = AppGroupStore.shared
        store.entitlementActive = true
        store.entitlementCheckedAt = Date().timeIntervalSince1970

        do {
            let session = try await SessionClient.refreshSession(deviceId: device)
            store.sessionToken = session.token
            store.sessionExpiresAt = Date().timeIntervalSince1970 + TimeInterval(session.expiresIn)
        } catch {
            // Already logged in `SessionClient.refreshSession`.
            store.sessionToken = nil
            store.sessionExpiresAt = 0
        }

        await FirebaseDeviceRegistry.recordPostSyncSnapshot()
    }
}
