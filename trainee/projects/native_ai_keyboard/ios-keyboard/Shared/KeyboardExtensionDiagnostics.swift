import Foundation

/// Ring-buffer log written by the keyboard `.appex` into the App Group (host app can read it).
enum KeyboardExtensionDiagnostics {
    private static let fileName = "keyboard_extension_log.txt"
    private static let maxLines = 48
    private static let queue = DispatchQueue(label: "com.nativeaikeyboard.extension.diagnostics")

    private static var logFileURL: URL? {
        FileManager.default
            .containerURL(forSecurityApplicationGroupIdentifier: AppConstants.appGroupId)?
            .appendingPathComponent(fileName)
    }

    static func log(
        _ message: String,
        file: String = #file,
        line: Int = #line
    ) {
        enqueue(entry(for: message, file: file, line: line), notify: true)
    }

    /// Flushes before returning — use on critical lifecycle boundaries so logs survive extension kills.
    static func logSync(
        _ message: String,
        file: String = #file,
        line: Int = #line
    ) {
        queue.sync {
            append(entry(for: message, file: file, line: line))
            AppGroupSettingsNotifier.post()
        }
    }

    static func recentText() -> String {
        queue.sync {
            guard let url = logFileURL,
                  let data = try? Data(contentsOf: url),
                  let text = String(data: data, encoding: .utf8)
            else { return "" }
            return text.trimmingCharacters(in: .whitespacesAndNewlines)
        }
    }

    static func clear() {
        queue.sync {
            guard let url = logFileURL else { return }
            try? FileManager.default.removeItem(at: url)
            AppGroupSettingsNotifier.post()
        }
    }

    private static func enqueue(_ entry: String, notify: Bool) {
        queue.async {
            append(entry)
            if notify {
                AppGroupSettingsNotifier.post()
            }
        }
    }

    private static func entry(for message: String, file: String, line: Int) -> String {
        let source = (file as NSString).lastPathComponent
        let stamp = ISO8601DateFormatter().string(from: Date())
        return "[\(stamp)] \(source):\(line) \(message)"
    }

    private static func append(_ entry: String) {
        guard let url = logFileURL else { return }
        var lines: [String] = []
        if let data = try? Data(contentsOf: url),
           let existing = String(data: data, encoding: .utf8),
           !existing.isEmpty
        {
            lines = existing.split(separator: "\n", omittingEmptySubsequences: false).map(String.init)
        }
        lines.append(entry)
        if lines.count > maxLines {
            lines = Array(lines.suffix(maxLines))
        }
        let body = lines.joined(separator: "\n") + "\n"
        try? body.write(to: url, atomically: true, encoding: .utf8)
    }
}
