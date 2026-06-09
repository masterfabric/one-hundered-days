import Foundation

/// KeyboardKit-style single config for host + keyboard extension (read from plist / App Group).
struct KeyboardAppConfiguration: Equatable {
    let appGroupId: String
    let deepLinkScheme: String
    let supabaseProjectURL: String
    let apiBaseURL: String

    static var current: KeyboardAppConfiguration {
        KeyboardAppConfiguration(
            appGroupId: AppConstants.appGroupId,
            deepLinkScheme: "aikeyboard",
            supabaseProjectURL: hostSupabaseURLFromPlist(),
            apiBaseURL: hostAPIBaseFromPlist()
        )
    }

    /// Host: copy Supabase URL into App Group so the extension reads one source of truth.
    func pushToAppGroupIfNeeded() {
        let trimmed = supabaseProjectURL.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !trimmed.isEmpty else { return }
        AppGroupStore.shared.supabaseProjectURLStored = trimmed
    }

    var deepLinkRefreshURL: URL? {
        URL(string: "\(deepLinkScheme)://refresh")
    }

    private static func hostSupabaseURLFromPlist() -> String {
        (Bundle.main.object(forInfoDictionaryKey: "SupabaseProjectURL") as? String ?? "")
            .trimmingCharacters(in: .whitespacesAndNewlines)
    }

    private static func hostAPIBaseFromPlist() -> String {
        (Bundle.main.object(forInfoDictionaryKey: "AIKeyboardAPIBaseURL") as? String ?? "")
            .trimmingCharacters(in: .whitespacesAndNewlines)
    }
}
