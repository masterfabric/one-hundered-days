import Foundation

/// Captured at rewrite request time so Apply after preview still deletes/inserts correctly.
struct RewriteSnapshot {
    let usesSelection: Bool
    let utf16Before: Int
    let utf16After: Int
    /// True when API text came from full `UITextInput` range; partial before/after may be incomplete — prefer full-range replace.
    let replaceWholeDocumentPreferred: Bool
}
