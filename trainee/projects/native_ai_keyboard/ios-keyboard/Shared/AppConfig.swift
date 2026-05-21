import Foundation

enum AppConfig {
    /// e.g. `https://abcd.supabase.co` — enables Edge `register-device` + `transform` instead of Node `/v1/rewrite`.
    /// Prefer value synced from the host app into the App Group so the keyboard extension does not need its own plist copy.
    static var supabaseProjectURLString: String {
        if let stored = AppGroupStore.shared.supabaseProjectURLStored, !stored.isEmpty { return stored }
        return string("SupabaseProjectURL")
    }

    static var usesSupabaseTransform: Bool {
        !supabaseProjectURLString.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty
    }

    /// When true, keyboard allows AI without a paid entitlement if Supabase transform is configured (dev / MVP).
    static var supabaseSkipEntitlementCheck: Bool {
        if let b = Bundle.main.object(forInfoDictionaryKey: "SupabaseSkipEntitlementCheck") as? Bool { return b }
        if let n = Bundle.main.object(forInfoDictionaryKey: "SupabaseSkipEntitlementCheck") as? NSNumber { return n.boolValue }
        return false
    }

    static func supabaseFunctionsBaseURL() -> URL? {
        let s = supabaseProjectURLString.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !s.isEmpty, var c = URLComponents(string: s) else { return nil }
        c.path = "/functions/v1"
        c.query = nil
        c.fragment = nil
        return c.url
    }

    private static func string(_ key: String) -> String {
        (Bundle.main.object(forInfoDictionaryKey: key) as? String)?.trimmingCharacters(in: .whitespacesAndNewlines) ?? ""
    }

    /// Local testing: treat session as valid and call API with `X-Device-Id` only (server needs DEV_REWRITE_WITHOUT_JWT + ENTITLEMENT_BYPASS). Turn off for App Store builds.
    static var devSessionBypass: Bool {
        if let b = Bundle.main.object(forInfoDictionaryKey: "AIKeyboardDevSessionBypass") as? Bool { return b }
        if let n = Bundle.main.object(forInfoDictionaryKey: "AIKeyboardDevSessionBypass") as? NSNumber { return n.boolValue }
        return false
    }

    static var apiBaseURL: URL {
        if let override = AppGroupStore.shared.apiBaseURLString, let u = URL(string: override) {
            return u
        }
        let s = string("AIKeyboardAPIBaseURL")
        return URL(string: s) ?? URL(string: "http://127.0.0.1:8787")!
    }

    /// Scheme + host + port only. Ignores any path on the configured base (e.g. `http://host:8080/v1`) so we never request `/v1/v1/rewrite` → 404.
    static var apiOriginURL: URL {
        let u = apiBaseURL
        guard var c = URLComponents(url: u, resolvingAgainstBaseURL: false) else { return u }
        c.path = ""
        c.query = nil
        c.fragment = nil
        return c.url ?? u
    }

    /// Must match server `APP_REQUEST_SECRET` (host app only — still not embedded in keyboard binary ideally; keyboard needs it for session refresh only if we implement refresh there — we do NOT: host only refreshes session).
    static var appRequestSecret: String {
        string("AIKeyboardAppRequestSecret")
    }
}
