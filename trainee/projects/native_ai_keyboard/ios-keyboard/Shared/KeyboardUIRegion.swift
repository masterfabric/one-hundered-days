import Foundation

/// Region for keyboard chrome (labels + diacritic priority). Stored in App Group.
enum KeyboardUIRegion: String, CaseIterable {
    case turkey
    case unitedStates
    case unitedKingdom
    case germany
    case france
    case spain

    var flagEmoji: String {
        switch self {
        case .turkey: return "🇹🇷"
        case .unitedStates: return "🇺🇸"
        case .unitedKingdom: return "🇬🇧"
        case .germany: return "🇩🇪"
        case .france: return "🇫🇷"
        case .spain: return "🇪🇸"
        }
    }

    /// Preferred .lproj folder for keyboard strings (fallback to en).
    var stringsLanguageCode: String {
        switch self {
        case .turkey: return "tr"
        case .unitedStates, .unitedKingdom: return "en"
        case .germany: return "de"
        case .france: return "fr"
        case .spain: return "es"
        }
    }

    var localizationKey: String {
        switch self {
        case .turkey: return "keyboard.region.turkey"
        case .unitedStates: return "keyboard.region.united_states"
        case .unitedKingdom: return "keyboard.region.united_kingdom"
        case .germany: return "keyboard.region.germany"
        case .france: return "keyboard.region.france"
        case .spain: return "keyboard.region.spain"
        }
    }

    static var defaultRawForAppGroup: String {
        let p = Locale.preferredLanguages.first ?? "en"
        if p.hasPrefix("tr") { return KeyboardUIRegion.turkey.rawValue }
        return KeyboardUIRegion.unitedStates.rawValue
    }

    static func resolved(from raw: String) -> KeyboardUIRegion {
        KeyboardUIRegion(rawValue: raw) ?? .unitedStates
    }

    /// iOS-style alternate characters for long-press (lowercase base letter).
    func alternates(forBaseLetter lower: Character) -> [String] {
        let c = lower
        var list = Self.baseAlternates[c] ?? []
        if self == .turkey {
            list = Self.prioritizeTurkish(for: c, list)
        }
        return list
    }

    private static func prioritizeTurkish(for c: Character, _ list: [String]) -> [String] {
        switch c {
        case "i":
            return ["ı", "İ", "í", "ì", "î", "ï", "ī", "į"] + list.filter { !["ı", "İ", "í", "ì", "î", "ï", "ī", "į"].contains($0) }
        case "u":
            return ["ü", "Ü", "ú", "ù", "û", "ū"] + list.filter { !["ü", "Ü", "ú", "ù", "û", "ū"].contains($0) }
        case "o":
            return ["ö", "Ö", "ó", "ò", "ô", "õ", "ō", "ø"] + list.filter { !["ö", "Ö", "ó", "ò", "ô", "õ", "ō", "ø"].contains($0) }
        case "s":
            return ["ş", "Ş", "ß", "ś", "š"] + list.filter { !["ş", "Ş", "ß", "ś", "š"].contains($0) }
        case "g":
            return ["ğ", "Ğ", "ǵ"] + list.filter { !["ğ", "Ğ", "ǵ"].contains($0) }
        case "c":
            return ["ç", "Ç", "ć", "č"] + list.filter { !["ç", "Ç", "ć", "č"].contains($0) }
        default:
            return list
        }
    }

    /// Merged Latin diacritics (Apple keyboard–style superset).
    private static let baseAlternates: [Character: [String]] = [
        "a": ["á", "à", "â", "ä", "æ", "å", "ā", "ă", "ã"],
        "b": [],
        "c": ["ç", "Ç", "ć", "č"],
        "d": ["ď", "đ"],
        "e": ["é", "è", "ê", "ë", "ē", "ė", "ę", "€"],
        "f": [],
        "g": ["ğ", "Ğ", "ǵ"],
        "h": [],
        "i": ["ı", "İ", "í", "ì", "î", "ï", "ī", "į"],
        "j": [],
        "k": [],
        "l": ["ł", "ļ"],
        "m": [],
        "n": ["ñ", "ń", "ň"],
        "o": ["ö", "Ö", "ó", "ò", "ô", "õ", "ō", "ø", "ő"],
        "p": [],
        "q": [],
        "r": ["ř", "ŕ"],
        "s": ["ş", "Ş", "ß", "ś", "š", "$"],
        "t": ["ť", "þ"],
        "u": ["ü", "Ü", "ú", "ù", "û", "ū", "ů", "ű"],
        "v": [],
        "w": [],
        "x": [],
        "y": ["ý", "ÿ"],
        "z": ["ž", "ź", "ż"],
    ]
}
