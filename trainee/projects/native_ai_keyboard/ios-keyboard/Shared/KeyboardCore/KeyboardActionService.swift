import UIKit

/// Text input + rewrite apply helpers (extracted from the keyboard controller).
struct KeyboardActionService {
    let proxy: UITextDocumentProxy

    func insertString(_ s: String) {
        proxy.insertText(s)
    }

    func deleteBackward() {
        proxy.deleteBackward()
    }

    func rewriteContext() -> (text: String, snapshot: RewriteSnapshot) {
        if let sel = proxy.selectedText, !sel.isEmpty {
            return (
                sel,
                RewriteSnapshot(usesSelection: true, utf16Before: 0, utf16After: 0, replaceWholeDocumentPreferred: false)
            )
        }

        let before = proxy.documentContextBeforeInput ?? ""
        let after = proxy.documentContextAfterInput ?? ""
        let split = before + after
        let uBefore = KeyboardTextReplacement.utf16Length(before)
        let uAfter = KeyboardTextReplacement.utf16Length(after)

        if let input = proxy as? UITextInput {
            let start = input.beginningOfDocument
            let end = input.endOfDocument
            if let range = input.textRange(from: start, to: end), let whole = input.text(in: range) {
                let text: String
                let useFullReplace: Bool
                if !whole.isEmpty {
                    text = whole
                    useFullReplace = true
                } else if !split.isEmpty {
                    text = split
                    useFullReplace = false
                } else {
                    text = ""
                    useFullReplace = false
                }
                return (
                    text,
                    RewriteSnapshot(
                        usesSelection: false,
                        utf16Before: uBefore,
                        utf16After: uAfter,
                        replaceWholeDocumentPreferred: useFullReplace
                    )
                )
            }
        }

        return (
            split,
            RewriteSnapshot(usesSelection: false, utf16Before: uBefore, utf16After: uAfter, replaceWholeDocumentPreferred: false)
        )
    }

    func applyRewrite(result: String, snapshot: RewriteSnapshot) {
        if snapshot.usesSelection {
            if let input = proxy as? UITextInput,
               let selected = input.selectedTextRange,
               input.offset(from: selected.start, to: selected.end) != 0
            {
                input.replace(selected, withText: result)
                return
            }
        } else if let input = proxy as? UITextInput {
            let start = input.beginningOfDocument
            let end = input.endOfDocument
            if let range = input.textRange(from: start, to: end) {
                input.replace(range, withText: result)
                return
            }
        }

        if snapshot.usesSelection {
            let len = KeyboardTextReplacement.utf16Length(proxy.selectedText ?? "")
            if len > 0 {
                for _ in 0 ..< len { proxy.deleteBackward() }
                proxy.insertText(result)
            } else {
                proxy.insertText(result)
            }
            return
        }

        for _ in 0 ..< snapshot.utf16Before { proxy.deleteBackward() }
        if snapshot.utf16After > 0 {
            proxy.adjustTextPosition(byCharacterOffset: snapshot.utf16After)
            for _ in 0 ..< snapshot.utf16After { proxy.deleteBackward() }
        }
        proxy.insertText(result)
    }
}
