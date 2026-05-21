import Foundation

/// Host app only: copies `SupabaseProjectURL` from the host `Info.plist` into the App Group so the keyboard extension can reach Edge Functions without duplicating the value in the `.appex` plist.
enum HostSupabaseConfigSync {
    static func pushToAppGroupIfNeeded() {
        let fromPlist = (Bundle.main.object(forInfoDictionaryKey: "SupabaseProjectURL") as? String ?? "")
            .trimmingCharacters(in: .whitespacesAndNewlines)
        guard !fromPlist.isEmpty else { return }
        AppGroupStore.shared.supabaseProjectURLStored = fromPlist
    }
}
