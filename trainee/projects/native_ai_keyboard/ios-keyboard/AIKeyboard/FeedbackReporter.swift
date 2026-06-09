import Foundation
import UIKit

// MARK: - Issue report copy (TR / EN)
// Host sheet strings; picks Turkish when `Locale` language is `tr`. User-facing errors stay generic (no raw API JSON).

enum IssueReportL10n {
    private static var useTurkish: Bool {
        let id = Locale.current.language.languageCode?.identifier ?? ""
        return id == "tr" || id.hasPrefix("tr")
    }

    static var openReport: String {
        useTurkish ? "Sorun bildir" : "Report a problem"
    }

    static var sheetTitle: String { openReport }

    static func sheetFooter(canSendToday: Bool) -> String {
        if useTurkish {
            return canSendToday
                ? "Takvim günü başına bir bildirim."
                : "Bugünkü bildiriminizi zaten gönderdiniz."
        }
        return canSendToday
            ? "One report per calendar day."
            : "You've already sent today's report."
    }

    static var reportPlaceholder: String {
        useTurkish ? "Sorunu buraya yazın (en az 10 karakter)…" : "Describe the issue (at least 10 characters)…"
    }

    /// Shown when the local daily cap is reached (no text field).
    static var sheetBlockedTitle: String {
        useTurkish ? "Bugün için kapalı" : "Closed for today"
    }

    static var sheetBlockedSubtitle: String {
        useTurkish
            ? "Bu cihazda bugün zaten bir bildirim gönderildi.\nYarın yeni bir bildirim gönderebilirsiniz."
            : "You already sent a report from this device today.\nYou can send another one tomorrow."
    }

    static var submit: String { useTurkish ? "Gönder" : "Send" }
    static var cancel: String { useTurkish ? "Vazgeç" : "Cancel" }
    static var sent: String {
        useTurkish ? "Teşekkürler — bildiriminiz alındı." : "Thanks — we received your report."
    }

    static var errorTooShort: String {
        useTurkish ? "Lütfen en az 10 karakter yazın." : "Please write at least 10 characters."
    }
    static var errorRateLimited: String {
        useTurkish
            ? "Günde yalnızca bir bildirim. Yarın tekrar deneyin."
            : "One report per day. Try again tomorrow."
    }
    static var errorSupabaseUnconfigured: String {
        useTurkish
            ? "Bildirim şu an kullanılamıyor. Uygulama yapılandırmasını kontrol edin."
            : "Reporting isn't available yet. Check the app configuration."
    }
    static var errorDeviceNotRegistered: String {
        useTurkish
            ? "Cihaz henüz kayıtlı değil. Ağ ve uygulama ayarlarını kontrol edin."
            : "This device isn't registered yet. Check network and app settings."
    }
    static var errorReportEndpointMissing: String {
        useTurkish
            ? "Rapor servisine ulaşılamadı. Daha sonra tekrar deneyin."
            : "We couldn't reach the report service. Try again later."
    }
    /// Likely missing `issue_reports` table / migration on the hosted project (HTTP 500 from PostgREST).
    static var errorReportDatabaseUnavailable: String {
        useTurkish
            ? "Rapor kaydedilemedi. Veritabanı henüz güncellenmemiş olabilir; bir süre sonra tekrar deneyin."
            : "Your report couldn't be saved. The server database may still be updating — try again later."
    }
    static var errorSubmitFailed: String {
        useTurkish
            ? "Bildirim gönderilemedi. Daha sonra yeniden deneyin."
            : "Could not submit the report. Try again later."
    }
}

/// Submits issue reports via Supabase Edge `submit-issue-report` (DB row + optional Resend email to the project owner).
enum FeedbackReporter {
    enum SubmitError: LocalizedError {
        case tooShort
        case rateLimited
        case supabaseUnconfigured
        case deviceNotRegistered
        /// Supabase gateway / missing Edge function (HTTP 404, “function not found”).
        case reportEndpointMissing
        /// Hosted DB missing `issue_reports` (or similar) — run `supabase db push` on the project.
        case reportDatabaseUnavailable
        /// Any other non-success HTTP; `diagnostic` is for Crashlytics only — never shown in the sheet.
        case serverFailed(status: Int, diagnostic: String)

        var errorDescription: String? {
            switch self {
            case .tooShort:
                return IssueReportL10n.errorTooShort
            case .rateLimited:
                return IssueReportL10n.errorRateLimited
            case .supabaseUnconfigured:
                return IssueReportL10n.errorSupabaseUnconfigured
            case .deviceNotRegistered:
                return IssueReportL10n.errorDeviceNotRegistered
            case .reportEndpointMissing:
                return IssueReportL10n.errorReportEndpointMissing
            case .reportDatabaseUnavailable:
                return IssueReportL10n.errorReportDatabaseUnavailable
            case .serverFailed:
                return IssueReportL10n.errorSubmitFailed
            }
        }

        /// Raw API bodies are not shown here (avoids JSON / “NOT FOUND” noise in the UI).
        var sheetDetail: String? { nil }

        /// Richer context for `NonFatalLog` / Crashlytics.
        func loggableUnderlyingError() -> Error {
            switch self {
            case .reportEndpointMissing:
                return NSError(
                    domain: "AIKeyboard.issue_report",
                    code: 404,
                    userInfo: [NSLocalizedDescriptionKey: "issue_report HTTP 404 (submit-issue-report missing or wrong URL)"]
                )
            case .reportDatabaseUnavailable:
                return NSError(
                    domain: "AIKeyboard.issue_report",
                    code: 500,
                    userInfo: [NSLocalizedDescriptionKey: "issue_report DB schema (issue_reports missing or migration not applied)"]
                )
            case .serverFailed(let status, let diagnostic):
                return NSError(
                    domain: "AIKeyboard.issue_report",
                    code: status,
                    userInfo: [
                        NSLocalizedDescriptionKey: "issue_report HTTP \(status)",
                        "responseBody": diagnostic,
                    ]
                )
            default:
                return self
            }
        }
    }

    private struct SubmitBody: Encodable {
        let body: String
        let appVersion: String
        let build: String
        let osVersion: String
        let localeIdentifier: String
        let preferredLanguages: String
    }

    private struct SubmitOk: Decodable {
        let ok: Bool?
        let mailSent: Bool?
        let mailDetail: String?
    }

    private struct ApiErrorBody: Decodable {
        let error: ApiErr?
        struct ApiErr: Decodable {
            let code: String?
            let message: String?
        }
    }

    /// Supabase gateway errors are often flat `{ "code", "message" }`; our Edge returns `{ "error": { … } }`.
    private struct FlatGatewayError: Decodable {
        let code: String?
        let message: String?
    }

    /// Maps Supabase gateway 404 / NOT_FOUND bodies to a single user-facing “endpoint missing” error.
    private static func responseLooksLikeMissingFunction(status: Int, data: Data) -> Bool {
        if status == 404 { return true }
        let flat = try? JSONDecoder().decode(FlatGatewayError.self, from: data)
        if let code = flat?.code?.uppercased(), code == "NOT_FOUND" { return true }
        let msg = (flat?.message ?? "").lowercased()
        let needles = [
            "requested function was not found",
            "function was not found",
            "no function",
        ]
        if needles.contains(where: { msg.contains($0) }) { return true }
        if let raw = String(data: data, encoding: .utf8)?.lowercased(),
           needles.contains(where: { raw.contains($0) })
        {
            return true
        }
        return false
    }

    private static func extractEdgeErrorMessage(data: Data) -> String? {
        if let nested = try? JSONDecoder().decode(ApiErrorBody.self, from: data),
           let m = nested.error?.message?.trimmingCharacters(in: .whitespacesAndNewlines), !m.isEmpty
        {
            return m
        }
        if let flat = try? JSONDecoder().decode(FlatGatewayError.self, from: data),
           let m = flat.message?.trimmingCharacters(in: .whitespacesAndNewlines), !m.isEmpty
        {
            return m
        }
        return nil
    }

    /// PostgREST errors when `issue_reports` (or related) is missing on the hosted project.
    private static func responseLooksLikeMissingIssueReportsTable(status: Int, data: Data) -> Bool {
        guard status == 500 else { return false }
        let parsed = extractEdgeErrorMessage(data: data) ?? ""
        let raw = String(data: data, encoding: .utf8) ?? ""
        let blob = (parsed + "\n" + raw).lowercased()
        if blob.contains("issue_reports") { return true }
        if blob.contains("does not exist") || blob.contains("could not find the table") { return true }
        if blob.contains("schema cache") { return true }
        if blob.contains("pgrst") && blob.contains("relation") { return true }
        return false
    }

    /// Local calendar-day gate (App Group). Server also enforces one report per device per UTC day.
    static func canSubmitToday() -> Bool {
        AppGroupStore.shared.canSubmitIssueReportToday()
    }

    /// POST `submit-issue-report` with Bearer `deviceTransformToken` from `register-device`.
    static func submitReport(body: String) async throws {
        let trim = body.trimmingCharacters(in: .whitespacesAndNewlines)
        guard trim.count >= 10 else { throw SubmitError.tooShort }
        guard AppGroupStore.shared.canSubmitIssueReportToday() else { throw SubmitError.rateLimited }
        guard AppConfig.usesSupabaseTransform else { throw SubmitError.supabaseUnconfigured }
        guard let fnBase = AppConfig.supabaseFunctionsBaseURL() else { throw SubmitError.supabaseUnconfigured }

        do {
            try await SupabaseDeviceAPI.registerIfNeeded()
        } catch {
            throw SubmitError.deviceNotRegistered
        }
        guard let token = AppGroupStore.shared.deviceTransformToken, !token.isEmpty else {
            throw SubmitError.deviceNotRegistered
        }

        let url = fnBase.appendingPathComponent("submit-issue-report")
        var req = URLRequest(url: url)
        req.httpMethod = "POST"
        req.setValue("application/json", forHTTPHeaderField: "Content-Type")
        req.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
        req.timeoutInterval = 60

        let v = Bundle.main.infoDictionary?["CFBundleShortVersionString"] as? String ?? ""
        let build = Bundle.main.infoDictionary?["CFBundleVersion"] as? String ?? ""
        let langs = Locale.preferredLanguages.joined(separator: ",")
        let payload = SubmitBody(
            body: trim,
            appVersion: v,
            build: build,
            osVersion: UIDevice.current.systemVersion,
            localeIdentifier: Locale.current.identifier,
            preferredLanguages: langs
        )
        req.httpBody = try JSONEncoder().encode(payload)

        let (data, resp) = try await URLSession.shared.data(for: req)
        guard let http = resp as? HTTPURLResponse else {
            throw SubmitError.serverFailed(status: -1, diagnostic: "non-http response")
        }

        if http.statusCode == 429 {
            throw SubmitError.rateLimited
        }
        if http.statusCode == 401 {
            throw SubmitError.deviceNotRegistered
        }

        if !(200 ... 299).contains(http.statusCode) {
            // Classify common hosted misconfigurations before generic serverFailed (diagnostic → Crashlytics only).
            if Self.responseLooksLikeMissingFunction(status: http.statusCode, data: data) {
                throw SubmitError.reportEndpointMissing
            }
            if Self.responseLooksLikeMissingIssueReportsTable(status: http.statusCode, data: data) {
                throw SubmitError.reportDatabaseUnavailable
            }
            let raw = String(data: data, encoding: .utf8) ?? ""
            let parsed = Self.extractEdgeErrorMessage(data: data)
            let diagnostic: String
            if let parsed, !parsed.isEmpty {
                diagnostic = "parsedMessage=\(parsed)\nraw=\(raw)"
            } else {
                diagnostic = raw.isEmpty ? "(empty body)" : raw
            }
            throw SubmitError.serverFailed(status: http.statusCode, diagnostic: diagnostic)
        }

        _ = try? JSONDecoder().decode(SubmitOk.self, from: data)

        // Local daily UI lock; independent of server UTC rate limit.
        AppGroupStore.shared.issueReportLastSubmittedAt = Date().timeIntervalSince1970
    }
}
