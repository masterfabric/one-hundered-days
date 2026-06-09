import Foundation

/// Runtime checks for App Group provisioning and extension signing (logged into App Group diagnostics).
enum KeyboardExtensionSigningDiagnostics {
    static func logInfrastructure() {
        let bundleID = Bundle.main.bundleIdentifier ?? "unknown"
        let expectedGroup = AppConstants.appGroupId
        let containerURL = FileManager.default.containerURL(
            forSecurityApplicationGroupIdentifier: expectedGroup
        )
        let writeProbe = probeAppGroupWrite(at: containerURL)
        let diagnosticsWrite = KeyboardExtensionDiagnostics.recentText().isEmpty == false
            || containerURL != nil

        KeyboardExtensionDiagnostics.logSync("infra.bundleId=\(bundleID)")
        KeyboardExtensionDiagnostics.logSync(
            "infra.appGroup=\(expectedGroup) container=\(containerURL != nil) writeProbe=\(writeProbe)"
        )
        KeyboardExtensionDiagnostics.logSync(
            "infra.expectedHostBundle=com.masterfabric.nativeaikeyboard expectedExtensionBundle=com.masterfabric.nativeaikeyboard.keyboard"
        )
        KeyboardExtensionDiagnostics.logSync(
            "infra.minimalKeyboard=\(AppConfig.minimalKeyboard) diagnosticsWritable=\(diagnosticsWrite)"
        )
        KeyboardExtensionDiagnostics.logSync(
            "infra.hint=Product→Perform Action→Run Without Debugging; Console.app filter AIKeyboardKeyboard ReportCrash"
        )
    }

    private static func probeAppGroupWrite(at containerURL: URL?) -> Bool {
        guard let containerURL else { return false }
        let probe = containerURL.appendingPathComponent(".keyboard_signing_probe")
        defer { try? FileManager.default.removeItem(at: probe) }
        return (try? "ok".write(to: probe, atomically: true, encoding: .utf8)) != nil
    }
}
