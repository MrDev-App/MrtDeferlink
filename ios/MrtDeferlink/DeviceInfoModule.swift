import Foundation
import Network

@objc(DeviceInfoModule)
class DeviceInfoModule: NSObject {

  @objc
  static func requiresMainQueueSetup() -> Bool {
    return false
  }

  @objc
  func getConnectionType(_ resolve: @escaping RCTPromiseResolveBlock,
                          rejecter reject: @escaping RCTPromiseRejectBlock) {
    let monitor = NWPathMonitor()
    monitor.pathUpdateHandler = { path in
      let type: String
      if path.usesInterfaceType(.wifi) {
        type = "wifi"
      } else if path.usesInterfaceType(.cellular) {
        type = "cellular"
      } else if path.status == .satisfied {
        type = "other"
      } else {
        type = "none"
      }
      resolve(type)
      monitor.cancel()
    }
    monitor.start(queue: DispatchQueue.global())
  }

  @objc
  func getDeviceModel(_ resolve: @escaping RCTPromiseResolveBlock,
                       rejecter reject: @escaping RCTPromiseRejectBlock) {
    if let simulatorModelIdentifier = ProcessInfo.processInfo.environment["SIMULATOR_MODEL_IDENTIFIER"] {
      resolve(simulatorModelIdentifier)
      return
    }

    var systemInfo = utsname()
    uname(&systemInfo)
    let machineMirror = Mirror(reflecting: systemInfo.machine)
    let identifier = machineMirror.children.reduce("") { identifier, element in
      guard let value = element.value as? Int8, value != 0 else { return identifier }
      return identifier + String(UnicodeScalar(UInt8(value)))
    }
    resolve(identifier)
  }

  @objc
  func getRegionInfo(_ resolve: @escaping RCTPromiseResolveBlock,
                      rejecter reject: @escaping RCTPromiseRejectBlock) {
    var region: String = ""

    if #available(iOS 16, *) {
      region = Locale.current.region?.identifier ?? ""
    } else {
      region = Locale.current.regionCode ?? ""
    }

    let result: [String: String] = [
      "regionCode": region,
    ]
    resolve(result)
  }

  @objc
  func uses24HourClock(_ resolve: @escaping RCTPromiseResolveBlock,
                        rejecter reject: @escaping RCTPromiseRejectBlock) {
    let formatter = DateFormatter()
    formatter.locale = Locale.current
    let dateFormat = DateFormatter.dateFormat(fromTemplate: "j", options: 0, locale: Locale.current) ?? ""
    let is24Hour = dateFormat.contains("H")
    resolve(is24Hour)
  }

  @objc
  func hasCheckedDeferredMatch(_ resolve: @escaping RCTPromiseResolveBlock,
                               rejecter reject: @escaping RCTPromiseRejectBlock) {
    let defaults = UserDefaults.standard
    let currentInstallTime = getAppInstallTimestamp()
    let storedInstallTime = defaults.double(forKey: "mrt_deferlink_stored_install_time")

    if storedInstallTime != currentInstallTime {
      resolve(false)
    } else {
      let hasChecked = defaults.bool(forKey: "mrt_deferlink_has_checked_deferred_match")
      resolve(hasChecked)
    }
  }

  @objc
  func markDeferredMatchChecked(_ resolve: @escaping RCTPromiseResolveBlock,
                                rejecter reject: @escaping RCTPromiseRejectBlock) {
    let defaults = UserDefaults.standard
    let currentInstallTime = getAppInstallTimestamp()
    defaults.set(currentInstallTime, forKey: "mrt_deferlink_stored_install_time")
    defaults.set(true, forKey: "mrt_deferlink_has_checked_deferred_match")
    resolve(true)
  }

  private func getAppInstallTimestamp() -> Double {
    if let documentsURL = FileManager.default.urls(for: .documentDirectory, in: .userDomainMask).first,
       let attributes = try? FileManager.default.attributesOfItem(atPath: documentsURL.path),
       let creationDate = attributes[.creationDate] as? Date {
      return creationDate.timeIntervalSince1970
    }
    return 0.0
  }
}
