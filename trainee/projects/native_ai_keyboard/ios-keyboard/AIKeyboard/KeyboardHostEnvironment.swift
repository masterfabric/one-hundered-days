import SwiftUI

/// KeyboardKit `KeyboardAppView` analogue — syncs config on launch and observes App Group changes.
struct KeyboardHostEnvironment<Content: View>: View {
    let config: KeyboardAppConfiguration
    @ViewBuilder let content: () -> Content

    init(config: KeyboardAppConfiguration = .current, @ViewBuilder content: @escaping () -> Content) {
        self.config = config
        self.content = content
    }

    var body: some View {
        content()
            .onAppear {
                KeyboardSettingsService.syncHostConfiguration(config)
                AppGroupStore.shared.purgeLegacyKeyboardUIRegionIfPresent()
            }
    }
}
