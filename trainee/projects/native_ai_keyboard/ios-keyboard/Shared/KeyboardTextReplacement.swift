import Foundation

/// UTF-16 lengths aligned with `NSString.length` / `UITextInput` “character” offsets for keyboard proxy fallbacks.
enum KeyboardTextReplacement {
    static func utf16Length(_ string: String) -> Int {
        (string as NSString).length
    }
}
