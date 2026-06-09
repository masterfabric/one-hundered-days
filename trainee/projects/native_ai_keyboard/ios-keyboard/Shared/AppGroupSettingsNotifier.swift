import Foundation

/// Cross-process signal when host app writes App Group settings (keyboard cannot use NotificationCenter across processes).
enum AppGroupSettingsNotifier {
    static let darwinName = CFNotificationName("com.nativeaikeyboard.settings.changed" as CFString)

    static func post() {
        CFNotificationCenterPostNotification(
            CFNotificationCenterGetDarwinNotifyCenter(),
            darwinName,
            nil,
            nil,
            true
        )
    }

    static func observe(_ handler: @escaping () -> Void) -> AppGroupSettingsObserverToken {
        AppGroupSettingsObserverToken(handler: handler)
    }
}

final class AppGroupSettingsObserverToken {
    private let handler: () -> Void

    init(handler: @escaping () -> Void) {
        self.handler = handler
        CFNotificationCenterAddObserver(
            CFNotificationCenterGetDarwinNotifyCenter(),
            Unmanaged.passUnretained(self).toOpaque(),
            { _, observer, _, _, _ in
                guard let observer else { return }
                let token = Unmanaged<AppGroupSettingsObserverToken>.fromOpaque(observer).takeUnretainedValue()
                DispatchQueue.main.async { token.handler() }
            },
            AppGroupSettingsNotifier.darwinName.rawValue,
            nil,
            .deliverImmediately
        )
    }

    deinit {
        CFNotificationCenterRemoveEveryObserver(
            CFNotificationCenterGetDarwinNotifyCenter(),
            Unmanaged.passUnretained(self).toOpaque()
        )
    }
}
