import Foundation

/// Host app only: copies `SupabaseProjectURL` from the host `Info.plist` into the App Group so the keyboard extension can reach Edge Functions without duplicating the value in the `.appex` plist.
enum HostSupabaseConfigSync {
    static func pushToAppGroupIfNeeded() {
        KeyboardAppConfiguration.current.pushToAppGroupIfNeeded()
    }
}
