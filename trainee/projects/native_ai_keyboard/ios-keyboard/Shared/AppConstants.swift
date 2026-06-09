import Foundation

enum AppConstants {
    static let appGroupId = "group.com.nativeaikeyboard.shared"

    /// Firebase Hosting base, e.g. `https://your-project.web.app` — set `LegalBaseURL` in the host app Info.plist.
    static var legalBaseURL: URL? {
        let raw = (Bundle.main.object(forInfoDictionaryKey: "LegalBaseURL") as? String)?
            .trimmingCharacters(in: .whitespacesAndNewlines) ?? ""
        guard !raw.isEmpty, let url = URL(string: raw) else { return nil }
        return url
    }

    static var legalPrivacyURL: URL? { legalPageURL(path: "privacy") }
    static var legalTermsURL: URL? { legalPageURL(path: "terms") }
    static var legalSupportURL: URL? { legalPageURL(path: "support") }

    private static func legalPageURL(path: String) -> URL? {
        guard let base = legalBaseURL else { return nil }
        var root = base.absoluteString.trimmingCharacters(in: .whitespacesAndNewlines)
        while root.hasSuffix("/") { root.removeLast() }
        return URL(string: "\(root)/\(path)/")
    }
}
