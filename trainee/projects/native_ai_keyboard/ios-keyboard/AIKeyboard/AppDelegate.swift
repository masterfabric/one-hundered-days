import UIKit

extension Notification.Name {
    /// Posted when `application(_:open:options:)` receives `aikeyboard://` (e.g. from the keyboard extension). SwiftUI `onOpenURL` does not always run for that path.
    static let aiKeyboardOpenURL = Notification.Name("aiKeyboardOpenURL")
}

final class AppDelegate: NSObject, UIApplicationDelegate {
    func application(_ app: UIApplication, open url: URL, options: [UIApplication.OpenURLOptionsKey: Any] = [:]) -> Bool {
        guard url.scheme == "aikeyboard" else { return false }
        DispatchQueue.main.async {
            NotificationCenter.default.post(name: .aiKeyboardOpenURL, object: nil, userInfo: ["url": url])
        }
        return true
    }

    func application(
        _ application: UIApplication,
        didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]? = nil
    ) -> Bool {
        FirebaseBootstrap.prepareDevLaunchWithoutPlist()
        KeyboardAppConfiguration.current.pushToAppGroupIfNeeded()
        AppGroupStore.shared.purgeLegacyKeyboardUIRegionIfPresent()
        FirebaseDeviceRegistry.configureAtLaunch()

        #if targetEnvironment(simulator)
        if let base = ProcessInfo.processInfo.environment["AIKEYBOARD_API_BASE"], !base.isEmpty {
            AppGroupStore.shared.apiBaseURLString = base
        }
        #endif
        return true
    }
}
