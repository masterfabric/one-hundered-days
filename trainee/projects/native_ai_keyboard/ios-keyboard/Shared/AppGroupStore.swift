import Foundation

/// Shared preferences between host app and keyboard extension.
final class AppGroupStore {
    static let shared = AppGroupStore()

    private let defaults: UserDefaults?

    private init() {
        defaults = UserDefaults(suiteName: AppConstants.appGroupId)
    }

    private enum Keys {
        static let sessionToken = "session_token"
        static let sessionExpires = "session_expires_at"
        static let conversationStyle = "conversation_style"
        static let entitlementActive = "entitlement_active"
        static let entitlementCheckedAt = "entitlement_checked_at"
        /// Dev/simulator: Mac LAN URL so the simulator can reach the API (127.0.0.1 is the simulator itself).
        static let apiBaseURLString = "api_base_url_override"
        /// When true, AI result shows on keyboard first; user taps Apply to insert. When false, insert immediately.
        static let aiPreviewBeforeApply = "ai_preview_before_apply"
        /// Keyboard extension UI region (flag picker); drives labels + alternate characters priority.
        static let keyboardUIRegion = "keyboard_ui_region"
        /// `system` | `light` | `dark` — extension + host read/write.
        static let keyboardAppearance = "keyboard_appearance_preference"
        /// Accent color preset for toolbar / AI highlights (`KeyboardChromeAccent` raw).
        static let keyboardChromeAccent = "keyboard_chrome_accent"
        /// Last successful in-app issue report (epoch seconds); used for one report per calendar day.
        static let issueReportLastSubmittedAt = "issue_report_last_submitted_at"
        /// Opaque Bearer from Supabase `register-device` for `transform` calls.
        static let deviceTransformToken = "device_transform_token"
        /// Short locale for AI (`tr`, `en`, …). Empty = derive from keyboard region.
        static let aiWritingLocale = "ai_writing_locale"
        /// Copied from host `Info.plist` (`SupabaseProjectURL`) so the keyboard `.appex` can call Supabase without its own copy.
        static let supabaseProjectURL = "supabase_project_url"
    }

    /// When set, `AppConfig.apiBaseURL` prefers this over Info.plist (shared with keyboard extension).
    var apiBaseURLString: String? {
        get {
            let s = defaults?.string(forKey: Keys.apiBaseURLString)
            return (s?.isEmpty == false) ? s : nil
        }
        set {
            if let newValue, !newValue.isEmpty {
                defaults?.set(newValue, forKey: Keys.apiBaseURLString)
            } else {
                defaults?.removeObject(forKey: Keys.apiBaseURLString)
            }
        }
    }

    var sessionToken: String? {
        get { defaults?.string(forKey: Keys.sessionToken) }
        set { defaults?.set(newValue, forKey: Keys.sessionToken) }
    }

    /// Seconds since 1970
    var sessionExpiresAt: TimeInterval {
        get { defaults?.double(forKey: Keys.sessionExpires) ?? 0 }
        set { defaults?.set(newValue, forKey: Keys.sessionExpires) }
    }

    var conversationStyle: ConversationStyle {
        get {
            let raw = defaults?.string(forKey: Keys.conversationStyle) ?? ConversationStyle.formal.rawValue
            return ConversationStyle(rawValue: raw) ?? .formal
        }
        set { defaults?.set(newValue.rawValue, forKey: Keys.conversationStyle) }
    }

    var entitlementActive: Bool {
        get { defaults?.bool(forKey: Keys.entitlementActive) ?? false }
        set { defaults?.set(newValue, forKey: Keys.entitlementActive) }
    }

    var entitlementCheckedAt: TimeInterval {
        get { defaults?.double(forKey: Keys.entitlementCheckedAt) ?? 0 }
        set { defaults?.set(newValue, forKey: Keys.entitlementCheckedAt) }
    }

    /// When true, AI shows a small preview on the keyboard with Apply / Discard before changing the field.
    /// Default **on** if the key was never set: `UserDefaults.bool(forKey:)` returns `false` for missing keys, which wrongly hid preview for everyone.
    var aiPreviewBeforeApply: Bool {
        get {
            guard let d = defaults else { return true }
            if d.object(forKey: Keys.aiPreviewBeforeApply) == nil { return true }
            return d.bool(forKey: Keys.aiPreviewBeforeApply)
        }
        set {
            defaults?.set(newValue, forKey: Keys.aiPreviewBeforeApply)
            defaults?.synchronize()
        }
    }

    /// Toolbar / AI tint (shared with extension).
    var keyboardChromeAccent: KeyboardChromeAccent {
        get {
            let raw = defaults?.string(forKey: Keys.keyboardChromeAccent) ?? KeyboardChromeAccent.systemBlue.rawValue
            return KeyboardChromeAccent(rawValue: raw) ?? .systemBlue
        }
        set {
            defaults?.set(newValue.rawValue, forKey: Keys.keyboardChromeAccent)
            defaults?.synchronize()
        }
    }

    /// Light / dark / match system for the custom keyboard chrome.
    var keyboardAppearancePreference: KeyboardAppearancePreference {
        get {
            let raw = defaults?.string(forKey: Keys.keyboardAppearance) ?? KeyboardAppearancePreference.system.rawValue
            return KeyboardAppearancePreference(rawValue: raw) ?? .system
        }
        set {
            defaults?.set(newValue.rawValue, forKey: Keys.keyboardAppearance)
            defaults?.synchronize()
        }
    }

    /// Stored raw value of `KeyboardUIRegion` (keyboard extension).
    var keyboardUIRegionRaw: String {
        get {
            let s = defaults?.string(forKey: Keys.keyboardUIRegion)
            if let s, !s.isEmpty { return s }
            return KeyboardUIRegion.defaultRawForAppGroup
        }
        set {
            defaults?.set(newValue, forKey: Keys.keyboardUIRegion)
            defaults?.synchronize()
        }
    }

    func isSessionValid(now: Date = .init()) -> Bool {
        if AppConfig.devSessionBypass { return true }
        if AppConfig.usesSupabaseTransform, let tok = deviceTransformToken, !tok.isEmpty { return true }
        guard let token = sessionToken, !token.isEmpty else { return false }
        let exp = sessionExpiresAt
        if exp <= 0 { return true }
        return now.timeIntervalSince1970 < exp - 60
    }

    /// Seconds since 1970; set after a successful Firestore issue report.
    var issueReportLastSubmittedAt: TimeInterval {
        get { defaults?.double(forKey: Keys.issueReportLastSubmittedAt) ?? 0 }
        set {
            defaults?.set(newValue, forKey: Keys.issueReportLastSubmittedAt)
            defaults?.synchronize()
        }
    }

    var deviceTransformToken: String? {
        get { defaults?.string(forKey: Keys.deviceTransformToken) }
        set {
            if let newValue, !newValue.isEmpty {
                defaults?.set(newValue, forKey: Keys.deviceTransformToken)
            } else {
                defaults?.removeObject(forKey: Keys.deviceTransformToken)
            }
            defaults?.synchronize()
        }
    }

    var aiWritingLocaleIfSet: String? {
        get {
            let s = defaults?.string(forKey: Keys.aiWritingLocale)?.trimmingCharacters(in: .whitespacesAndNewlines) ?? ""
            return s.isEmpty ? nil : s
        }
        set {
            if let v = newValue?.trimmingCharacters(in: .whitespacesAndNewlines), !v.isEmpty {
                defaults?.set(v, forKey: Keys.aiWritingLocale)
            } else {
                defaults?.removeObject(forKey: Keys.aiWritingLocale)
            }
            defaults?.synchronize()
        }
    }

    /// Non-empty URL from the host app (e.g. `https://xxxx.supabase.co`). Keyboard reads this before `Bundle.main` plist.
    var supabaseProjectURLStored: String? {
        get {
            let s = defaults?.string(forKey: Keys.supabaseProjectURL)?.trimmingCharacters(in: .whitespacesAndNewlines) ?? ""
            return s.isEmpty ? nil : s
        }
        set {
            if let v = newValue?.trimmingCharacters(in: .whitespacesAndNewlines), !v.isEmpty {
                defaults?.set(v, forKey: Keys.supabaseProjectURL)
            } else {
                defaults?.removeObject(forKey: Keys.supabaseProjectURL)
            }
            defaults?.synchronize()
        }
    }

    /// At most one issue report per local calendar day (shared across app + keyboard via App Group).
    func canSubmitIssueReportToday(now: Date = .init()) -> Bool {
        let last = issueReportLastSubmittedAt
        guard last > 0 else { return true }
        let lastDate = Date(timeIntervalSince1970: last)
        return !Calendar.current.isDate(lastDate, inSameDayAs: now)
    }
}
