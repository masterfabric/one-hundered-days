import FirebaseAnalytics
import FirebaseAuth
import FirebaseCore
import FirebaseFirestore
import Foundation
import UIKit

/// Writes user issue reports to top-level `issue_reports/{doc}` with `idfv` on each doc (filter/group in console by `idfv`).
enum FeedbackReporter {
    enum SubmitError: LocalizedError {
        case tooShort
        case rateLimited
        case firebaseOff
        case notSignedIn
        case firestorePermissionDenied

        var errorDescription: String? {
            switch self {
            case .tooShort:
                return String(localized: "feedback.error.too_short")
            case .rateLimited:
                return String(localized: "feedback.error.rate_limited")
            case .firebaseOff:
                return String(localized: "feedback.error.firebase_off")
            case .notSignedIn:
                return String(localized: "feedback.error.not_signed_in")
            case .firestorePermissionDenied:
                return String(localized: "feedback.error.firestore_permission.title")
            }
        }

        /// Longer steps shown in the report sheet (scrollable); keep `errorDescription` short.
        var sheetDetail: String? {
            switch self {
            case .firestorePermissionDenied:
                return String(localized: "feedback.error.firestore_permission.detail")
            default:
                return nil
            }
        }
    }

    static func canSubmitToday() -> Bool {
        AppGroupStore.shared.canSubmitIssueReportToday()
    }

    static func submitReport(body: String) async throws {
        let trim = body.trimmingCharacters(in: .whitespacesAndNewlines)
        guard trim.count >= 10 else { throw SubmitError.tooShort }
        guard AppGroupStore.shared.canSubmitIssueReportToday() else { throw SubmitError.rateLimited }
        guard FirebaseApp.app() != nil else { throw SubmitError.firebaseOff }

        await FirebaseDeviceRegistry.ensureAnonymousUserIfNeeded()
        guard let user = Auth.auth().currentUser else { throw SubmitError.notSignedIn }
        _ = try await user.getIDToken(forcingRefresh: true)

        let id = DeviceId.idfv
        let db = Firestore.firestore()
        // Top-level collection keeps Firestore rules simple (nested `devices/.../issue_reports` is easy to mis-deploy).
        let ref = db.collection("issue_reports").document()
        let v = Bundle.main.infoDictionary?["CFBundleShortVersionString"] as? String ?? ""
        let build = Bundle.main.infoDictionary?["CFBundleVersion"] as? String ?? ""
        let langs = Locale.preferredLanguages.joined(separator: ",")

        do {
            try await ref.setData(
                [
                    "body": trim,
                    "createdAt": FieldValue.serverTimestamp(),
                    "idfv": id,
                    "appVersion": v,
                    "build": build,
                    "osVersion": UIDevice.current.systemVersion,
                    "localeIdentifier": Locale.current.identifier,
                    "preferredLanguages": langs,
                ]
            )
        } catch {
            let ns = error as NSError
            let permissionDeniedCode = 7
            let firestoreDomains: Set<String> = ["FIRFirestoreErrorDomain", "FirestoreErrorDomain"]
            if firestoreDomains.contains(ns.domain), ns.code == permissionDeniedCode {
                NonFatalLog.breadcrumb(
                    "issue_report denied domain=\(ns.domain) code=\(ns.code) desc=\(ns.localizedDescription)",
                    category: "feedback"
                )
                throw SubmitError.firestorePermissionDenied
            }
            let msg = ns.localizedDescription.lowercased()
            if msg.contains("insufficient permissions") || msg.contains("permission denied") {
                NonFatalLog.breadcrumb(
                    "issue_report denied (message) domain=\(ns.domain) code=\(ns.code)",
                    category: "feedback"
                )
                throw SubmitError.firestorePermissionDenied
            }
            throw error
        }

        AppGroupStore.shared.issueReportLastSubmittedAt = Date().timeIntervalSince1970
        Analytics.logEvent("issue_report_submitted", parameters: ["char_count": trim.count])
    }
}
