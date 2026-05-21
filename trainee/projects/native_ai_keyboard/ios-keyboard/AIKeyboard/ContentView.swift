import SwiftUI

struct ContentView: View {
    @State private var style: ConversationStyle = AppGroupStore.shared.conversationStyle
    @State private var appearance: KeyboardAppearancePreference = AppGroupStore.shared.keyboardAppearancePreference
    @State private var chromeAccent: KeyboardChromeAccent = AppGroupStore.shared.keyboardChromeAccent
    @State private var aiPreviewBeforeApply: Bool = AppGroupStore.shared.aiPreviewBeforeApply
    @State private var status: String = ""
    @State private var isSyncing = false
    @State private var showReportProblem = false
    @State private var aiWritingTag: String = AppGroupStore.shared.aiWritingLocaleIfSet ?? "auto"

    var body: some View {
        NavigationStack {
            Form {
                Section {
                    VStack(alignment: .leading, spacing: 10) {
                        Text(String(localized: "help.keyboard.intro"))
                            .font(.subheadline)
                            .foregroundStyle(.secondary)
                        Text(String(localized: "help.keyboard.step1"))
                        Text(String(localized: "help.keyboard.step2"))
                        Text(String(localized: "help.keyboard.step3"))
                        Text(String(localized: "help.keyboard.step4"))
                    }
                    .padding(.vertical, 4)
                } header: {
                    Text(String(localized: "help.section.keyboard"))
                }

                Section {
                    VStack(alignment: .leading, spacing: 10) {
                        Text(String(localized: "help.ai.intro"))
                            .font(.subheadline)
                            .foregroundStyle(.secondary)
                        Text(String(localized: "help.ai.step1"))
                        Text(String(localized: "help.ai.step2"))
                        Text(String(localized: "help.ai.step3"))
                    }
                    .padding(.vertical, 4)
                } header: {
                    Text(String(localized: "help.section.ai"))
                }

                Section {
                    Picker(String(localized: "settings.conversation_style"), selection: $style) {
                        ForEach(ConversationStyle.allCases) { s in
                            Text(LocalizedStringKey(s.localizationKey)).tag(s)
                        }
                    }
                    .onChange(of: style) { _, new in
                        AppGroupStore.shared.conversationStyle = new
                    }
                    Picker("AI yazım dili", selection: $aiWritingTag) {
                        Text("Klavye bölgesi (otomatik)").tag("auto")
                        Text("Türkçe (tr)").tag("tr")
                        Text("English (en)").tag("en")
                        Text("Deutsch (de)").tag("de")
                        Text("Français (fr)").tag("fr")
                        Text("Español (es)").tag("es")
                    }
                    .onChange(of: aiWritingTag) { _, new in
                        if new == "auto" {
                            AppGroupStore.shared.aiWritingLocaleIfSet = nil
                        } else {
                            AppGroupStore.shared.aiWritingLocaleIfSet = new
                        }
                    }

                    Toggle(String(localized: "settings.ai_preview_toggle"), isOn: $aiPreviewBeforeApply)
                        .onChange(of: aiPreviewBeforeApply) { _, new in
                            AppGroupStore.shared.aiPreviewBeforeApply = new
                        }
                    Text(String(localized: "settings.ai_preview_footer"))
                        .font(.footnote)
                        .foregroundStyle(.secondary)
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
                } footer: {
                    Text(String(localized: "appearance.section_footer"))
                }

                Section {
                    Button(String(localized: "settings.sync_account")) {
                        Task { await refresh() }
                    }
                    .disabled(isSyncing)

                    if !status.isEmpty {
                        Text(status)
                            .font(.footnote)
                            .foregroundStyle(.secondary)
                    }
                } header: {
                    Text(String(localized: "settings.section.account"))
                }

                Section {
                    Link(String(localized: "settings.open_keyboard_settings"), destination: URL(string: UIApplication.openSettingsURLString)!)
                    Button {
                        showReportProblem = true
                    } label: {
                        Text(String(localized: "feedback.open_report"))
                    }
                }
            }
            .navigationTitle(Text("app.title", bundle: .main))
            .onAppear {
                aiPreviewBeforeApply = AppGroupStore.shared.aiPreviewBeforeApply
                appearance = AppGroupStore.shared.keyboardAppearancePreference
                chromeAccent = AppGroupStore.shared.keyboardChromeAccent
                aiWritingTag = AppGroupStore.shared.aiWritingLocaleIfSet ?? "auto"
            }
            .task {
                await refresh()
            }
            .onOpenURL { handleDeepLink($0) }
            .onReceive(NotificationCenter.default.publisher(for: .aiKeyboardOpenURL)) { note in
                if let url = note.userInfo?["url"] as? URL {
                    handleDeepLink(url)
                }
            }
            .sheet(isPresented: $showReportProblem) {
                ReportProblemSheet()
            }
        }
    }

    private func handleDeepLink(_ url: URL) {
        guard url.scheme == "aikeyboard" else { return }
        switch url.host {
        case "refresh", "settings":
            Task { await refresh() }
        default:
            break
        }
    }

    private func refresh() async {
        isSyncing = true
        defer { isSyncing = false }
        HostSupabaseConfigSync.pushToAppGroupIfNeeded()
        try? await SupabaseDeviceAPI.registerIfNeeded()
        await AccountSync.syncAll()
        if AppGroupStore.shared.isSessionValid() {
            status = String(localized: "settings.status.session_ok")
        } else {
            status = String(localized: "settings.status.session_fail")
        }
    }
}

// MARK: - Report a problem (same module as ContentView so the target always compiles without Xcode file-list drift)

private struct ReportProblemSheet: View {
    @Environment(\.dismiss) private var dismiss

    @State private var bodyText = ""
    @State private var submitting = false
    @State private var inlineMessage = ""
    @State private var inlineDetail = ""
    @State private var showSuccess = false

    var body: some View {
        NavigationStack {
            Form {
                Section {
                    Text(String(localized: "feedback.sheet.footer"))
                        .font(.footnote)
                        .foregroundStyle(.secondary)
                    TextEditor(text: $bodyText)
                        .frame(minHeight: 140)
                        .disabled(submitting || !FeedbackReporter.canSubmitToday())
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
            .navigationTitle(Text("feedback.sheet.title"))
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button(String(localized: "action.cancel")) { dismiss() }
                        .disabled(submitting)
                }
                ToolbarItem(placement: .confirmationAction) {
                    Group {
                        if submitting {
                            ProgressView()
                        } else {
                            Button(String(localized: "feedback.submit")) {
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
        }
        .presentationDetents([.medium, .large])
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
            inlineMessage = String(localized: "feedback.sent")
            try? await Task.sleep(nanoseconds: 600_000_000)
            dismiss()
        } catch let err as FeedbackReporter.SubmitError {
            NonFatalLog.record(err, category: "issue_report_submit")
            inlineMessage = err.errorDescription ?? err.localizedDescription
            inlineDetail = err.sheetDetail ?? ""
        } catch {
            NonFatalLog.record(error, category: "issue_report_submit")
            inlineMessage = error.localizedDescription
            inlineDetail = ""
        }
    }
}

#Preview {
    ContentView()
}
