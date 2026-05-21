import Foundation

/// Registers this device with Supabase Edge `register-device` and stores `deviceToken` in the App Group.
enum SupabaseDeviceAPI {
    enum RegisterError: Error {
        case missingSupabaseURL
        case badResponse(Int, String?)
    }

    private struct RegisterBody: Encodable {
        let deviceId: String
        let platform: String
        let locale: String?
    }

    private struct RegisterResponse: Decodable {
        let deviceToken: String
    }

    /// Call from host on launch and optionally from the extension before transform.
    static func registerIfNeeded() async throws {
        guard AppConfig.usesSupabaseTransform else { return }
        if let existing = AppGroupStore.shared.deviceTransformToken, !existing.isEmpty { return }
        try await registerForceRefresh()
    }

    static func registerForceRefresh() async throws {
        guard let base = AppConfig.supabaseFunctionsBaseURL() else {
            throw RegisterError.missingSupabaseURL
        }
        let url = base.appendingPathComponent("register-device")
        var req = URLRequest(url: url)
        req.httpMethod = "POST"
        req.setValue("application/json", forHTTPHeaderField: "Content-Type")
        req.timeoutInterval = 60

        let loc = AppGroupStore.shared.aiWritingLocaleIfSet
            ?? KeyboardUIRegion.resolved(from: AppGroupStore.shared.keyboardUIRegionRaw).stringsLanguageCode
        let body = RegisterBody(deviceId: DeviceId.idfv, platform: "ios", locale: loc)
        req.httpBody = try JSONEncoder().encode(body)

        let (data, resp) = try await URLSession.shared.data(for: req)
        guard let http = resp as? HTTPURLResponse else { throw RegisterError.badResponse(-1, nil) }
        guard (200 ... 299).contains(http.statusCode) else {
            let msg = String(data: data, encoding: .utf8)
            throw RegisterError.badResponse(http.statusCode, msg)
        }
        let out = try JSONDecoder().decode(RegisterResponse.self, from: data)
        AppGroupStore.shared.deviceTransformToken = out.deviceToken
    }
}
