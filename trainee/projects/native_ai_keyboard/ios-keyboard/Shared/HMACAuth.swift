import CryptoKit
import Foundation

enum HMACAuth {
    static func hexHMACSHA256(secret: String, message: String) -> String {
        let key = SymmetricKey(data: Data(secret.utf8))
        let sig = HMAC<SHA256>.authenticationCode(for: Data(message.utf8), using: key)
        return Data(sig).map { String(format: "%02x", $0) }.joined()
    }

    static func sessionCanonical(deviceId: String, timestamp: Int, nonce: String) -> String {
        "\(deviceId)|\(timestamp)|\(nonce)"
    }
}
