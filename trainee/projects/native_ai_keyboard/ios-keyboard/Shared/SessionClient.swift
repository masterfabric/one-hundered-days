import Foundation

enum SessionClientError: Error {
    case badStatus(Int, String?)
    case decoding
}

/// Fetches JWT session from backend (host app should call this; extension reads token from App Group).
enum SessionClient {
    static func refreshSession(deviceId: String) async throws -> (token: String, expiresIn: Int) {
        do {
            let ts = Int(Date().timeIntervalSince1970)
            let nonce = UUID().uuidString
            let canonical = HMACAuth.sessionCanonical(deviceId: deviceId, timestamp: ts, nonce: nonce)
            let signature = HMACAuth.hexHMACSHA256(secret: AppConfig.appRequestSecret, message: canonical)

            let sessionURL = AppConfig.apiOriginURL.appendingPathComponent("v1").appendingPathComponent("session")
            var req = URLRequest(url: sessionURL)
            req.httpMethod = "POST"
            req.setValue(deviceId, forHTTPHeaderField: "X-Device-Id")
            req.setValue("\(ts)", forHTTPHeaderField: "X-Timestamp")
            req.setValue(nonce, forHTTPHeaderField: "X-Nonce")
            req.setValue(signature, forHTTPHeaderField: "X-Signature")
            req.setValue("application/json", forHTTPHeaderField: "Content-Type")

            let (data, resp) = try await URLSession.shared.data(for: req)
            guard let http = resp as? HTTPURLResponse else { throw SessionClientError.badStatus(-1, nil) }
            guard (200 ... 299).contains(http.statusCode) else {
                let body = String(data: data, encoding: .utf8)
                throw SessionClientError.badStatus(http.statusCode, body)
            }
            struct Body: Decodable {
                let token: String
                let expires_in: Int
            }
            let decoded = try JSONDecoder().decode(Body.self, from: data)
            return (decoded.token, decoded.expires_in)
        } catch {
            NonFatalLog.record(error, category: "session_client")
            throw error
        }
    }
}
