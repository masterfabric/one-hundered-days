import Foundation

/// Shared preferences between host app and keyboard extension.
final class AppGroupStore {
    static let shared = AppGroupStore()

    private let defaults: UserDefaults?

    private init() {
        defaults = UserDefaults(suiteName: AppConstants.appGroupId)
    }

    /// True when the App Group container is provisioned for this build (host + keyboard must match entitlements).
    var isSharedContainerAvailable: Bool {
        FileManager.default.containerURL(forSecurityApplicationGroupIdentifier: AppConstants.appGroupId) != nil
    }

    private func publishSettingsChange() {
        defaults?.synchronize()
        AppGroupSettingsNotifier.post()
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
        /// `system` | `light` | `dark` — extension + host read/write.
        static let keyboardAppearance = "keyboard_appearance_preference"
        /// Accent color preset for toolbar / AI highlights (`KeyboardChromeAccent` raw).
        static let keyboardChromeAccent = "keyboard_chrome_accent"
        /// Last successful in-app issue report (epoch seconds); used for one report per calendar day.
        static let issueReportLastSubmittedAt = "issue_report_last_submitted_at"
        /// Opaque Bearer from Supabase `register-device` for `transform` calls.
        static let deviceTransformToken = "device_transform_token"
        /// Short locale for AI (`tr`, `en`, …). Empty = derive from iOS preferred languages (same as keyboard chrome).
        static let aiWritingLocale = "ai_writing_locale"
        /// Copied from host `Info.plist` (`SupabaseProjectURL`) so the keyboard `.appex` can call Supabase without its own copy.
        static let supabaseProjectURL = "supabase_project_url"
        /// Written by the keyboard extension (`hasFullAccess`); read by the host app.
        static let keyboardHasFullAccess = "keyboard_has_full_access"
        static let keyboardLastSeenAt = "keyboard_last_seen_at"
    }

    struct KeyboardAccessReport: Codable {
        let hasFullAccess: Bool
        let lastSeenAt: TimeInterval
    }

    private var accessReportFileURL: URL? {
        FileManager.default
            .containerURL(forSecurityApplicationGroupIdentifier: AppConstants.appGroupId)?
            .appendingPathComponent("keyboard_access_report.json")
    }

    /// Extension calls this whenever the keyboard is shown.
    func updateKeyboardAccessReport(hasFullAccess: Bool) {
        let now = Date().timeIntervalSince1970
        writeAccessReportFile(hasFullAccess: hasFullAccess, lastSeenAt: now)
        if let defaults {
            defaults.set(hasFullAccess, forKey: Keys.keyboardHasFullAccess)
            defaults.set(now, forKey: Keys.keyboardLastSeenAt)
            defaults.synchronize()
        }
        publishSettingsChange()
    }

    /// Merges App Group `UserDefaults` and file fallback; prefers the newest `lastSeenAt` (host + extension processes).
    func resolvedKeyboardAccessReport() -> KeyboardAccessReport? {
        defaults?.synchronize()
        let fromFile = readAccessReportFile()
        let fromDefaults: KeyboardAccessReport? = {
            guard let defaults, defaults.object(forKey: Keys.keyboardLastSeenAt) != nil else { return nil }
            let seen = defaults.double(forKey: Keys.keyboardLastSeenAt)
            guard seen > 0 else { return nil }
            return KeyboardAccessReport(
                hasFullAccess: defaults.bool(forKey: Keys.keyboardHasFullAccess),
                lastSeenAt: seen
            )
        }()
        switch (fromFile, fromDefaults) {
        case let (file?, defaults?) where file.lastSeenAt >= defaults.lastSeenAt:
            return file
        case let (file?, defaults?) where defaults.lastSeenAt > file.lastSeenAt:
            return defaults
        case let (file?, nil):
            return file
        case let (nil, defaults?):
            return defaults
        default:
            return nil
        }
    }

    var keyboardReportsFullAccess: Bool {
        resolvedKeyboardAccessReport()?.hasFullAccess ?? false
    }

    /// Epoch seconds when the keyboard extension last appeared (written with access report).
    var keyboardLastSeenAt: TimeInterval {
        resolvedKeyboardAccessReport()?.lastSeenAt ?? 0
    }

    private func writeAccessReportFile(hasFullAccess: Bool, lastSeenAt: TimeInterval) {
        guard let url = accessReportFileURL else { return }
        let report = KeyboardAccessReport(hasFullAccess: hasFullAccess, lastSeenAt: lastSeenAt)
        guard let data = try? JSONEncoder().encode(report) else { return }
        try? data.write(to: url, options: .atomic)
    }

    private func readAccessReportFile() -> KeyboardAccessReport? {
        guard let url = accessReportFileURL,
              let data = try? Data(contentsOf: url),
              let report = try? JSONDecoder().decode(KeyboardAccessReport.self, from: data)
        else { return nil }
        return report
    }

    var keyboardHasBeenUsed: Bool {
        keyboardLastSeenAt > 0
    }

    /// Host app shows a one-tap Settings prompt while Full Access is off.
    /// iOS does not expose Settings state to the host — we only know after the keyboard extension runs and reports `hasFullAccess`.
    var shouldPromptForFullAccessInHostApp: Bool {
        guard isSharedContainerAvailable else { return false }
        guard keyboardHasBeenUsed else { return false }
        return !keyboardReportsFullAccess
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
        set {
            defaults?.set(newValue.rawValue, forKey: Keys.conversationStyle)
            publishSettingsChange()
        }
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
            publishSettingsChange()
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
            publishSettingsChange()
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
            publishSettingsChange()
        }
    }

    /// `tr` / `en` / … for keyboard `.lproj` strings. Uses `Locale.current` plus **Language & Region**; any Turkish/German/French/Spanish in that list wins before English.
    var keyboardChromeStringsLanguageCode: String {
        KeyboardUIRegion.inferredFromPreferredLanguages().stringsLanguageCode
    }

    /// Removes legacy `keyboard_ui_region` from the App Group. Older app builds wrote a fixed region so changing iOS language did not update toolbar labels.
    func purgeLegacyKeyboardUIRegionIfPresent() {
        guard let d = defaults, d.object(forKey: "keyboard_ui_region") != nil else { return }
        d.removeObject(forKey: "keyboard_ui_region")
        d.synchronize()
    }

    func isSessionValid(now: Date = .init()) -> Bool {
        if AppConfig.devSessionBypass { return true }
        if AppConfig.usesSupabaseTransform, let tok = deviceTransformToken, !tok.isEmpty { return true }
        guard let token = sessionToken, !token.isEmpty else { return false }
        let exp = sessionExpiresAt
        if exp <= 0 { return true }
        return now.timeIntervalSince1970 < exp - 60
    }

    /// Seconds since 1970; set after a successful Supabase issue report (host `FeedbackReporter`).
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
        if AppConfig.issueReportBypassDailyLimitForTesting { return true }
        let last = issueReportLastSubmittedAt
        guard last > 0 else { return true }
        let lastDate = Date(timeIntervalSince1970: last)
        return !Calendar.current.isDate(lastDate, inSameDayAs: now)
    }

    /// Same calendar-day rule as `canSubmitIssueReportToday`, ignoring the dev plist bypass (for UI “blocked” state).
    func isIssueReportBlockedByLocalDay(now: Date = .init()) -> Bool {
        let last = issueReportLastSubmittedAt
        guard last > 0 else { return false }
        let lastDate = Date(timeIntervalSince1970: last)
        return Calendar.current.isDate(lastDate, inSameDayAs: now)
    }
}
