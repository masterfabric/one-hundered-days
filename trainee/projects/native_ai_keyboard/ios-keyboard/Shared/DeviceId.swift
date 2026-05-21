import UIKit

enum DeviceId {
    static var idfv: String {
        UIDevice.current.identifierForVendor?.uuidString ?? "unknown-vendor"
    }
}
