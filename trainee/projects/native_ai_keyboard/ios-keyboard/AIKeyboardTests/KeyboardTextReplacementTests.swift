import XCTest
@testable import AIKeyboard

final class KeyboardTextReplacementTests: XCTestCase {
    func test_utf16Length_ascii() {
        XCTAssertEqual(KeyboardTextReplacement.utf16Length("abc"), 3)
    }

    func test_utf16Length_empty() {
        XCTAssertEqual(KeyboardTextReplacement.utf16Length(""), 0)
    }

    func test_utf16Length_surrogatePairEmoji() {
        XCTAssertEqual(KeyboardTextReplacement.utf16Length("😀"), 2)
        XCTAssertEqual(KeyboardTextReplacement.utf16Length("a😀b"), 4)
    }
}
