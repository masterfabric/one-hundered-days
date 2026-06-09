import SwiftUI
import UIKit
import WebKit

struct ContentView: View {
    @Environment(\.scenePhase) private var scenePhase

    @State private var style: ConversationStyle = AppGroupStore.shared.conversationStyle
    @State private var appearance: KeyboardAppearancePreference = AppGroupStore.shared.keyboardAppearancePreference
    @State private var chromeAccent: KeyboardChromeAccent = AppGroupStore.shared.keyboardChromeAccent
    @State private var aiPreviewBeforeApply: Bool = AppGroupStore.shared.aiPreviewBeforeApply
    @State private var showReportProblem = false
    @State private var showFullAccessPrompt = false
    @State private var fullAccessPromptSuppressedThisSession = false
    @State private var settingsObserver: AppGroupSettingsObserverToken?
    @State private var legalWebURL: URL?

    var body: some View {
        NavigationStack {
            Form {
                Section {
                    Picker(String(localized: "settings.conversation_style"), selection: $style) {
                        ForEach(ConversationStyle.allCases) { s in
                            Text(LocalizedStringKey(s.localizationKey)).tag(s)
                        }
                    }
                    .onChange(of: style) { _, new in
                        AppGroupStore.shared.conversationStyle = new
                    }

                    Toggle(String(localized: "settings.ai_preview_toggle"), isOn: $aiPreviewBeforeApply)
                        .onChange(of: aiPreviewBeforeApply) { _, new in
                            AppGroupStore.shared.aiPreviewBeforeApply = new
                        }
                    Picker(String(localized: "appearance.section_title"), selection: $appearance) {
                        ForEach(KeyboardAppearancePreference.allCases) { p in
                            Text(LocalizedStringKey(p.localizationKey)).tag(p)
                        }
                    }
                    .onChange(of: appearance) { _, new in
                        AppGroupStore.shared.keyboardAppearancePreference = new
                    }
                    Picker(String(localized: "accent.section_title"), selection: $chromeAccent) {
                        ForEach(KeyboardChromeAccent.allCases) { a in
                            Text(LocalizedStringKey(a.localizationKey)).tag(a)
                        }
                    }
                    .onChange(of: chromeAccent) { _, new in
                        AppGroupStore.shared.keyboardChromeAccent = new
                    }
                } header: {
                    Text(String(localized: "settings.section.style"))
                }

                Section {
                    Button {
                        showReportProblem = true
                    } label: {
                        Text(IssueReportL10n.openReport)
                    }
                }

            }
            .safeAreaInset(edge: .bottom, spacing: 0) {
                LegalFooterLinks { legalWebURL = $0 }
                    .padding(.horizontal, 16)
                    .padding(.top, 12)
                    .padding(.bottom, 8)
                    .frame(maxWidth: .infinity)
                    .background(.bar)
            }
            .navigationTitle(Text("app.title", bundle: .main))
            .toolbar {
                ToolbarItem(placement: .confirmationAction) {
                    Button(String(localized: "action.done")) {
                        closeAppToBackground()
                    }
                }
            }
            .onAppear {
                AppGroupStore.shared.purgeLegacyKeyboardUIRegionIfPresent()
                AppGroupStore.shared.syncHostAppLanguageToKeyboard()
                aiPreviewBeforeApply = AppGroupStore.shared.aiPreviewBeforeApply
                appearance = AppGroupStore.shared.keyboardAppearancePreference
                chromeAccent = AppGroupStore.shared.keyboardChromeAccent
                settingsObserver = AppGroupSettingsNotifier.observe {
                    refreshFullAccessPrompt()
                }
                refreshFullAccessPrompt()
            }
            .onChange(of: scenePhase) { _, phase in
                guard phase == .active else { return }
                AppGroupStore.shared.syncHostAppLanguageToKeyboard()
                refreshFullAccessPrompt()
            }
            .task {
                await bootstrapOnLaunch()
                refreshFullAccessPrompt()
            }
            .onOpenURL { handleDeepLink($0) }
            .onReceive(NotificationCenter.default.publisher(for: .aiKeyboardOpenURL)) { note in
                if let url = note.userInfo?["url"] as? URL {
                    handleDeepLink(url)
                }
            }
            .alert(
                String(localized: "onboarding.full_access.title"),
                isPresented: $showFullAccessPrompt
            ) {
                Button(String(localized: "onboarding.full_access.allow")) {
                    openSystemSettings()
                }
                Button(String(localized: "onboarding.full_access.dont_allow"), role: .cancel) {
                    suppressFullAccessPromptForSession()
                }
            } message: {
                Text(String(localized: "onboarding.full_access.message"))
            }
            .sheet(isPresented: $showReportProblem) {
                ReportProblemSheet()
            }
            .sheet(isPresented: Binding(
                get: { legalWebURL != nil },
                set: { if !$0 { legalWebURL = nil } }
            )) {
                if let url = legalWebURL {
                    LegalDocumentSheet(url: url)
                }
            }
        }
    }

    private func handleDeepLink(_ url: URL) {
        guard url.scheme == "aikeyboard" else { return }
        switch url.host {
        case "refresh", "settings":
            Task {
                await bootstrapOnLaunch()
                refreshFullAccessPrompt()
            }
        default:
            break
        }
    }

    /// Registers the device with Supabase and refreshes session snapshot without surfacing a “Connection” UI.
    private func bootstrapOnLaunch() async {
        HostSupabaseConfigSync.pushToAppGroupIfNeeded()
        try? await SupabaseDeviceAPI.registerIfNeeded()
        await AccountSync.syncAll()
    }

    private func refreshFullAccessPrompt() {
        if KeyboardStatusService.resolve().fullAccessOn {
            showFullAccessPrompt = false
            return
        }
        let shouldShow = KeyboardStatusService.shouldPromptForFullAccess()
        if !shouldShow {
            showFullAccessPrompt = false
            return
        }
        guard !fullAccessPromptSuppressedThisSession else { return }
        showFullAccessPrompt = true
    }

    private func suppressFullAccessPromptForSession() {
        fullAccessPromptSuppressedThisSession = true
        showFullAccessPrompt = false
    }

    private func openSystemSettings() {
        guard let url = URL(string: UIApplication.openSettingsURLString) else { return }
        UIApplication.shared.open(url)
    }

    private func closeAppToBackground() {
        UIApplication.shared.perform(#selector(NSXPCConnection.suspend))
    }

}

// MARK: - Legal footer & in-app WebView
// Co-located with ContentView so XcodeGen does not drop separate files from the host target.

private struct LegalFooterLinks: View {
    let onOpen: (URL) -> Void

    private var links: [(label: String, url: URL)] {
        [
            (String(localized: "settings.legal.link.privacy"), AppConstants.legalPrivacyURL),
            (String(localized: "settings.legal.link.terms"), AppConstants.legalTermsURL),
            (String(localized: "settings.legal.link.support"), AppConstants.legalSupportURL),
        ].compactMap { label, url in
            guard let url else { return nil }
            return (label, url)
        }
    }

    var body: some View {
        if !links.isEmpty {
            HStack(spacing: 24) {
                ForEach(Array(links.enumerated()), id: \.offset) { _, link in
                    Button {
                        onOpen(link.url)
                    } label: {
                        Text(link.label)
                            .font(.footnote)
                            .foregroundStyle(.secondary)
                    }
                    .buttonStyle(.plain)
                }
            }
            .frame(maxWidth: .infinity)
        }
    }
}

private struct LegalWebView: UIViewRepresentable {
    let url: URL

    func makeUIView(context: Context) -> WKWebView {
        let webView = WKWebView(frame: .zero)
        webView.load(URLRequest(url: url))
        return webView
    }

    func updateUIView(_ webView: WKWebView, context: Context) {}
}

private struct LegalDocumentSheet: View {
    let url: URL
    @Environment(\.dismiss) private var dismiss

    var body: some View {
        NavigationStack {
            LegalWebView(url: url)
                .ignoresSafeArea(edges: .bottom)
                .navigationBarTitleDisplayMode(.inline)
                .toolbar {
                    ToolbarItem(placement: .confirmationAction) {
                        Button(String(localized: "action.done")) { dismiss() }
                    }
                }
        }
    }
}

// MARK: - Report a problem
// Shows a locked card when the local daily cap is hit (avoids a disabled TextField that blocks the keyboard).

private struct ReportProblemSheet: View {
    @Environment(\.dismiss) private var dismiss
    @FocusState private var reportFieldFocused: Bool

    @State private var bodyText = ""
    @State private var submitting = false
    @State private var inlineMessage = ""
    @State private var inlineDetail = ""
    @State private var showSuccess = false

    var body: some View {
        NavigationStack {
            Form {
                // `isIssueReportBlockedByLocalDay` ignores plist bypass so devs still see the locked UI when testing bypass off.
                let calendarBlocked = AppGroupStore.shared.isIssueReportBlockedByLocalDay()
                let devBypass = AppConfig.issueReportBypassDailyLimitForTesting
                let showLockedCard = calendarBlocked && !devBypass

                if showLockedCard {
                    Section {
                        VStack(spacing: 14) {
                            Image(systemName: "lock.fill")
                                .font(.title2)
                                .foregroundStyle(.tertiary)
                            Text(IssueReportL10n.sheetBlockedTitle)
                                .font(.title3.bold())
                                .multilineTextAlignment(.center)
                            Text(IssueReportL10n.sheetBlockedSubtitle)
                                .font(.subheadline)
                                .foregroundStyle(.secondary)
                                .multilineTextAlignment(.center)
                                .fixedSize(horizontal: false, vertical: true)
                        }
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, 28)
                        .padding(.horizontal, 8)
                    }
                    .listRowInsets(EdgeInsets(top: 10, leading: 14, bottom: 10, trailing: 14))
                    .listRowBackground(
                        RoundedRectangle(cornerRadius: 14, style: .continuous)
                            .fill(Color.primary.opacity(0.14))
                    )
                } else {
                    Section {
                        Text(IssueReportL10n.sheetFooter(canSendToday: true))
                            .font(.footnote)
                            .foregroundStyle(.secondary)
                        TextField(IssueReportL10n.reportPlaceholder, text: $bodyText, axis: .vertical)
                            .lineLimit(14)
                            .disabled(submitting)
                            .focused($reportFieldFocused)
                            .textInputAutocapitalization(.sentences)
                            .autocorrectionDisabled(false)
                    }
                }

                if !inlineMessage.isEmpty {
                    Section {
                        Text(inlineMessage)
                            .font(.subheadline.weight(.semibold))
                            .foregroundStyle(showSuccess ? Color.secondary : Color.red)
                            .frame(maxWidth: .infinity, alignment: .leading)
                        if !inlineDetail.isEmpty {
                            ScrollView {
                                Text(inlineDetail)
                                    .font(.footnote)
                                    .foregroundStyle(Color.secondary)
                                    .frame(maxWidth: .infinity, alignment: .leading)
                            }
                            .frame(maxHeight: 200)
                        }
                    }
                }
            }
            .navigationTitle(IssueReportL10n.sheetTitle)
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button(IssueReportL10n.cancel) { dismiss() }
                        .disabled(submitting)
                }
                ToolbarItem(placement: .confirmationAction) {
                    Group {
                        if submitting {
                            ProgressView()
                        } else {
                            Button(IssueReportL10n.submit) {
                                Task { await submit() }
                            }
                            .disabled(
                                !FeedbackReporter.canSubmitToday()
                                    || bodyText.trimmingCharacters(in: .whitespacesAndNewlines).count < 10
                            )
                        }
                    }
                }
            }
            .onAppear {
                guard FeedbackReporter.canSubmitToday() else { return }
                // Delay focus until the sheet detent animation finishes (keyboard reliability).
                DispatchQueue.main.asyncAfter(deadline: .now() + 0.45) {
                    reportFieldFocused = true
                }
            }
        }
        .presentationDetents([.large, .medium])
        .presentationDragIndicator(.visible)
    }

    private func submit() async {
        inlineMessage = ""
        inlineDetail = ""
        showSuccess = false
        submitting = true
        defer { submitting = false }
        do {
            try await FeedbackReporter.submitReport(body: bodyText)
            showSuccess = true
            inlineMessage = IssueReportL10n.sent
            try? await Task.sleep(nanoseconds: 600_000_000)
            dismiss()
        } catch let err as FeedbackReporter.SubmitError {
            NonFatalLog.record(err.loggableUnderlyingError(), category: "issue_report_submit")
            inlineMessage = err.errorDescription ?? err.localizedDescription
            inlineDetail = err.sheetDetail ?? ""
        } catch {
            NonFatalLog.record(error, category: "issue_report_submit")
            inlineMessage = IssueReportL10n.errorSubmitFailed
            inlineDetail = ""
        }
    }
}

#Preview {
    ContentView()
}
