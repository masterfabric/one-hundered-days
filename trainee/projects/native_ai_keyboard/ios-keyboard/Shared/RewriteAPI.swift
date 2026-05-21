import Foundation
import UIKit

enum RewriteMode: String, Encodable {
    case proofread
    case rewrite
    case shorten
    case expand
}

enum RewriteAPIError: Error {
    case noToken
    case badStatus(Int, String?)
}

extension RewriteAPIError: LocalizedError {
    var errorDescription: String? {
        switch self {
        case .noToken:
            if AppConfig.usesSupabaseTransform {
                return "Cihaz kaydı yok. Ana uygulamayı bir kez açın (Supabase register-device)."
            }
            return "Oturum yok. AI Keyboard uygulamasını açıp «Oturumu yenile» deyin."
        case let .badStatus(code, body):
            if code == 404 {
                return "404: API adresi yanlış. Info.plist içinde SupabaseProjectURL veya AIKeyboardAPIBaseURL kontrol edin."
            }
            if let body, !body.isEmpty { return body }
            return "Sunucu hatası (\(code))."
        }
    }
}

enum RewriteAPI {
    private struct ErrorEnvelope: Decodable {
        struct Err: Decodable {
            let code: String?
            let message: String?
        }

        let error: Err?
    }

    private static func userFacingServerMessage(status: Int, data: Data) -> String {
        if let env = try? JSONDecoder().decode(ErrorEnvelope.self, from: data), let e = env.error {
            switch e.code {
            case "gemini_not_configured":
                return "Gemini anahtarı yok: Supabase Dashboard → Edge Secrets → GEMINI_API_KEY."
            case "gemini_auth":
                return "Gemini anahtarı reddedildi. GEMINI_API_KEY’i kontrol edin."
            case "gemini_rate_limited":
                return "Gemini hız sınırı. Bir süre sonra tekrar deneyin."
            case "gemini_quota":
                return "Gemini kotası aşıldı."
            case "gemini_model":
                return "Gemini model adı geçersiz. GEMINI_MODEL secret’ını kontrol edin."
            case "gemini_bad_request", "gemini_upstream", "gemini_connection":
                if let m = e.message, !m.isEmpty {
                    return "Gemini: \(m)"
                }
                return "Gemini isteği tamamlanamadı."
            case "UNAUTHORIZED", "invalid_token":
                return "Yetkisiz: cihaz token’ı geçersiz. Ana uygulamayı açıp tekrar deneyin."
            case "payment_required":
                return "Abonelik gerekli."
            default:
                if let m = e.message, !m.isEmpty {
                    return "Sunucu \(status): \(m)"
                }
            }
        }
        if let raw = String(data: data, encoding: .utf8), !raw.isEmpty {
            return "Sunucu \(status): \(raw)"
        }
        return "Sunucu hatası (\(status))."
    }

    /// Maps `ConversationStyle` to plan `mode` (work / friends / family / flirt).
    private static func apiMode(for style: ConversationStyle) -> String {
        switch style {
        case .formal, .work:
            return "work"
        case .friends:
            return "friends"
        case .family:
            return "family"
        case .flirt:
            return "flirt"
        }
    }

    private static func mapAction(_ mode: RewriteMode) -> String? {
        switch mode {
        case .proofread: return "correct"
        case .rewrite: return "rewrite"
        case .shorten: return "shorten"
        case .expand: return "expand"
        }
    }

    private static func supabaseTransform(
        text: String,
        mode: RewriteMode,
        style: ConversationStyle,
    ) async throws -> String {
        try await SupabaseDeviceAPI.registerIfNeeded()
        guard let base = AppConfig.supabaseFunctionsBaseURL() else {
            throw RewriteAPIError.badStatus(-1, "Supabase URL eksik")
        }
        guard let bearer = AppGroupStore.shared.deviceTransformToken, !bearer.isEmpty else {
            throw RewriteAPIError.noToken
        }

        let url = base.appendingPathComponent("transform")
        var req = URLRequest(url: url)
        req.httpMethod = "POST"
        req.setValue("Bearer \(bearer)", forHTTPHeaderField: "Authorization")
        req.setValue("application/json", forHTTPHeaderField: "Content-Type")
        req.timeoutInterval = 180

        let keyboardLocale =
            AppGroupStore.shared.aiWritingLocaleIfSet
            ?? KeyboardUIRegion.resolved(from: AppGroupStore.shared.keyboardUIRegionRaw).stringsLanguageCode
        let deviceLocales = Locale.preferredLanguages.prefix(4).joined(separator: ", ")

        let themeRaw = AppGroupStore.shared.keyboardAppearancePreference.rawValue

        struct Body: Encodable {
            let text: String
            let mode: String
            let action: String
            let locale: String
            let theme: String
            let style: String
            let deviceLocales: String
        }

        guard let action = mapAction(mode) else {
            throw RewriteAPIError.badStatus(-1, "Desteklenmeyen mod")
        }

        let body = Body(
            text: text,
            mode: apiMode(for: style),
            action: action,
            locale: keyboardLocale,
            theme: themeRaw,
            style: style.rawValue,
            deviceLocales: deviceLocales,
        )
        req.httpBody = try JSONEncoder().encode(body)

        let (data, resp) = try await URLSession.shared.data(for: req)
        guard let http = resp as? HTTPURLResponse else { throw RewriteAPIError.badStatus(-1, nil) }
        guard (200 ... 299).contains(http.statusCode) else {
            let msg = Self.userFacingServerMessage(status: http.statusCode, data: data)
            throw RewriteAPIError.badStatus(http.statusCode, msg)
        }
        struct Out: Decodable {
            let result: String
        }
        let out = try JSONDecoder().decode(Out.self, from: data)
        return out.result
    }

    private static func legacyNodeRewrite(
        text: String,
        mode: RewriteMode,
        style: ConversationStyle,
    ) async throws -> String {
        let token = AppGroupStore.shared.sessionToken ?? ""
        if !AppConfig.devSessionBypass && token.isEmpty {
            throw RewriteAPIError.noToken
        }
        let rewriteURL = AppConfig.apiOriginURL.appendingPathComponent("v1").appendingPathComponent("rewrite")
        var req = URLRequest(url: rewriteURL)
        req.httpMethod = "POST"
        if !token.isEmpty {
            req.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
        }
        if AppConfig.devSessionBypass {
            req.setValue(DeviceId.idfv, forHTTPHeaderField: "X-Device-Id")
        }
        let langs = Locale.preferredLanguages.prefix(4).joined(separator: ", ")
        if !langs.isEmpty {
            req.setValue(langs, forHTTPHeaderField: "Accept-Language")
        }
        req.setValue("application/json", forHTTPHeaderField: "Content-Type")
        req.timeoutInterval = 180

        struct Body: Encodable {
            let text: String
            let mode: String
            let style: String
        }
        let body = Body(text: text, mode: mode.rawValue, style: style.rawValue)
        req.httpBody = try JSONEncoder().encode(body)

        let (data, resp) = try await URLSession.shared.data(for: req)
        guard let http = resp as? HTTPURLResponse else { throw RewriteAPIError.badStatus(-1, nil) }
        guard (200 ... 299).contains(http.statusCode) else {
            let msg = Self.userFacingServerMessage(status: http.statusCode, data: data)
            throw RewriteAPIError.badStatus(http.statusCode, msg)
        }
        struct Out: Decodable {
            let text: String
        }
        let out = try JSONDecoder().decode(Out.self, from: data)
        return out.text
    }

    /// True when neither App Group nor this process’s `Info.plist` has a non-empty `SupabaseProjectURL` (keyboard before first host launch, or misconfigured install).
    private static func isSupabaseProjectURLUnsetInPlistAndAppGroup() -> Bool {
        let group = AppGroupStore.shared.supabaseProjectURLStored?.trimmingCharacters(in: .whitespacesAndNewlines) ?? ""
        if !group.isEmpty { return false }
        let bundle = (Bundle.main.object(forInfoDictionaryKey: "SupabaseProjectURL") as? String ?? "")
            .trimmingCharacters(in: .whitespacesAndNewlines)
        return bundle.isEmpty
    }

    private static func mapConnectionError(_ error: Error) -> Error {
        let ns = error as NSError
        if ns.domain == NSURLErrorDomain || error is URLError {
            if AppConfig.usesSupabaseTransform {
                return RewriteAPIError.badStatus(
                    -1,
                    "Ağ hatası: Supabase’a ulaşılamadı. iOS Ayarlar → Klavye → AI Keyboard → Tam Erişim’i açın; ana uygulamada SupabaseProjectURL’i doldurup uygulamayı bir kez açıp «Oturumu ve cihazı yenile» deyin.",
                )
            }
            if isSupabaseProjectURLUnsetInPlistAndAppGroup() {
                return RewriteAPIError.badStatus(
                    -1,
                    "Supabase adresi yok: AIKeyboard/Info.plist içinde SupabaseProjectURL’i ayarlayın (https://…supabase.co, sonunda /functions/v1 olmasın), ana uygulamayı bir kez açıp «Oturumu ve cihazı yenile» deyin; klavyede Tam Erişim açık olsun.",
                )
            }
            return RewriteAPIError.badStatus(
                -1,
                "Ağ hatası: API sunucusuna ulaşılamadı. AIKeyboardAPIBaseURL ve ağ erişimini kontrol edin.",
            )
        }
        return error
    }

    static func rewrite(text: String, mode: RewriteMode, style: ConversationStyle) async throws -> String {
        do {
            if AppConfig.usesSupabaseTransform {
                if mode != .rewrite {
                    throw RewriteAPIError.badStatus(
                        400,
                        "Şimdilik sadece «Yeniden yaz» Supabase üzerinde. Diğer eylemler yakında.",
                    )
                }
                return try await supabaseTransform(text: text, mode: mode, style: style)
            }
            return try await legacyNodeRewrite(text: text, mode: mode, style: style)
        } catch {
            NonFatalLog.record(error, category: "rewrite_api")
            let mapped = mapConnectionError(error)
            throw mapped
        }
    }
}
