import Foundation

/// Interprets App Group extension log lines for the host setup screen.
enum KeyboardExtensionDiagnosticInterpreter {
    enum Verdict: Equatable {
        case empty
        case extensionNeverStarted
        case crashDuringControllerLoad
        case crashDuringLayoutInit
        case immediateDismiss
        case healthy
        case inconclusive
    }

    struct Result: Equatable {
        let verdict: Verdict
        let summaryKey: String
    }

    static func interpret(_ log: String) -> Result {
        let trimmed = log.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !trimmed.isEmpty else {
            return Result(verdict: .empty, summaryKey: "settings.keyboard_setup.diagnostics_verdict.empty")
        }

        let text = trimmed

        if !text.contains("loadView"), !text.contains("controller.viewDidLoad") {
            return Result(verdict: .extensionNeverStarted, summaryKey: "settings.keyboard_setup.diagnostics_verdict.never_started")
        }

        if text.contains("controller.viewDidLoad.begin"), !text.contains("controller.viewDidLoad.end") {
            return Result(
                verdict: .crashDuringControllerLoad,
                summaryKey: "settings.keyboard_setup.diagnostics_verdict.crash_controller"
            )
        }

        if text.contains("KeyboardLayoutView phase1 begin"),
           !text.contains("KeyboardLayoutView phase1 done"),
           !text.contains("KeyboardMinimalView ready")
        {
            return Result(
                verdict: .crashDuringLayoutInit,
                summaryKey: "settings.keyboard_setup.diagnostics_verdict.crash_init"
            )
        }

        if text.contains("build step: deferred start"), !text.contains("build step: deferred done") {
            if text.contains("scale=0.23") || text.contains("skipped=transient") {
                return Result(
                    verdict: .crashDuringLayoutInit,
                    summaryKey: "settings.keyboard_setup.diagnostics_verdict.crash_layout_collapse"
                )
            }
            return Result(
                verdict: .crashDuringLayoutInit,
                summaryKey: "settings.keyboard_setup.diagnostics_verdict.crash_init"
            )
        }

        if text.contains("viewWillDisappear") || text.contains("deinit") {
            if text.contains("viewDidAppear") {
                let disappearIdx = text.range(of: "viewWillDisappear")?.lowerBound
                let appearIdx = text.range(of: "viewDidAppear")?.lowerBound
                if let disappearIdx, let appearIdx, disappearIdx > appearIdx {
                    return Result(verdict: .immediateDismiss, summaryKey: "settings.keyboard_setup.diagnostics_verdict.quick_dismiss")
                }
            }
        }

        let layoutReady = text.contains("KeyboardLayoutView phase1 done")
            || text.contains("KeyboardMinimalView ready")
        let deferredReady = text.contains("build step: deferred done") || text.contains("KeyboardMinimalView ready")
        if text.contains("viewDidAppear"), layoutReady, deferredReady {
            return Result(verdict: .healthy, summaryKey: "settings.keyboard_setup.diagnostics_verdict.healthy")
        }

        return Result(verdict: .inconclusive, summaryKey: "settings.keyboard_setup.diagnostics_verdict.inconclusive")
    }
}
