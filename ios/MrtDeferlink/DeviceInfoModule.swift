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
  func getCurrencyCode(_ resolve: @escaping RCTPromiseResolveBlock,
                       rejecter reject: @escaping RCTPromiseRejectBlock) {
    if #available(iOS 16, *) {
      resolve(Locale.current.currency?.identifier ?? "USD")
    } else {
      resolve(Locale.current.currencyCode ?? "USD")
    }
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

  @objc
  func getScreenBucket(_ resolve: @escaping RCTPromiseResolveBlock,
                       rejecter reject: @escaping RCTPromiseRejectBlock) {
    DispatchQueue.main.async {
      let width = UIScreen.main.bounds.width
      if width >= 428 {
        resolve("large")
      } else if width >= 375 {
        resolve("medium")
      } else {
        resolve("small")
      }
    }
  }

  @objc
  func getPixelRatioBucket(_ resolve: @escaping RCTPromiseResolveBlock,
                           rejecter reject: @escaping RCTPromiseRejectBlock) {
    DispatchQueue.main.async {
      let scale = UIScreen.main.scale
      if scale >= 2.5 {
        resolve("high")
      } else {
        resolve("standard")
      }
    }
  }

  @objc
  func getDynamicTypeSize(_ resolve: @escaping RCTPromiseResolveBlock,
                          rejecter reject: @escaping RCTPromiseRejectBlock) {
    DispatchQueue.main.async {
      let category = UIApplication.shared.preferredContentSizeCategory
      var scale: Double = 1.0
      switch category {
      case .extraSmall: scale = 0.82
      case .small: scale = 0.88
      case .medium: scale = 0.94
      case .large: scale = 1.0
      case .extraLarge: scale = 1.12
      case .extraExtraLarge: scale = 1.24
      case .extraExtraExtraLarge: scale = 1.35
      case .accessibilityMedium: scale = 1.65
      case .accessibilityLarge: scale = 1.94
      case .accessibilityExtraLarge: scale = 2.24
      case .accessibilityExtraExtraLarge: scale = 2.59
      case .accessibilityExtraExtraExtraLarge: scale = 3.06
      default: scale = 1.0
      }
      
      if scale >= 1.3 {
        resolve("XL")
      } else if scale >= 1.15 {
        resolve("L")
      } else if scale <= 0.9 {
        resolve("S")
      } else {
        resolve("M")
      }
    }
  }

  @objc
  func getDeviceLocale(_ resolve: @escaping RCTPromiseResolveBlock,
                       rejecter reject: @escaping RCTPromiseRejectBlock) {
    let locale = Locale.preferredLanguages.first ?? Locale.current.identifier
    resolve(locale.replacingOccurrences(of: "_", with: "-"))
  }

  @objc
  func getDeviceLanguages(_ resolve: @escaping RCTPromiseResolveBlock,
                          rejecter reject: @escaping RCTPromiseRejectBlock) {
    let languages = Locale.preferredLanguages.map { $0.replacingOccurrences(of: "_", with: "-") }
    resolve(languages)
  }

  @objc
  func getRegionCode(_ resolve: @escaping RCTPromiseResolveBlock,
                     rejecter reject: @escaping RCTPromiseRejectBlock) {
    let region: String
    if #available(iOS 16, *) {
      region = Locale.current.region?.identifier ?? ""
    } else {
      region = Locale.current.regionCode ?? ""
    }
    resolve(region.uppercased())
  }

  @objc
  func isReduceMotionEnabled(_ resolve: @escaping RCTPromiseResolveBlock,
                             rejecter reject: @escaping RCTPromiseRejectBlock) {
    DispatchQueue.main.async {
      resolve(UIAccessibility.isReduceMotionEnabled)
    }
  }

  @objc
  func getTimeZone(_ resolve: @escaping RCTPromiseResolveBlock,
                   rejecter reject: @escaping RCTPromiseRejectBlock) {
    resolve(TimeZone.current.identifier)
  }

  @objc
  func getClockSkewMs(_ apiUrl: String,
                      resolve: @escaping RCTPromiseResolveBlock,
                      rejecter reject: @escaping RCTPromiseRejectBlock) {
    guard let url = URL(string: apiUrl) else {
      resolve(0)
      return
    }

    var request = URLRequest(url: url)
    request.httpMethod = "HEAD"
    request.cachePolicy = .reloadIgnoringLocalCacheData

    let localBefore = Date().timeIntervalSince1970 * 1000.0

    let task = URLSession.shared.dataTask(with: request) { _, response, error in
      if error != nil {
        resolve(0)
        return
      }

      let localAfter = Date().timeIntervalSince1970 * 1000.0

      guard let httpResponse = response as? HTTPURLResponse,
            let serverDateStr = httpResponse.value(forHTTPHeaderField: "Date") else {
        resolve(0)
        return
      }

      let formatter = DateFormatter()
      formatter.locale = Locale(identifier: "en_US_POSIX")
      formatter.dateFormat = "EEE, dd MMM yyyy HH:mm:ss z"
      formatter.timeZone = TimeZone(secondsFromGMT: 0)

      guard let serverDate = formatter.date(from: serverDateStr) else {
        resolve(0)
        return
      }

      let serverTime = serverDate.timeIntervalSince1970 * 1000.0
      let localMidpoint = (localBefore + localAfter) / 2.0
      let diff = Int(round(localMidpoint - serverTime))

      resolve(diff)
    }
    task.resume()
  }

  @objc
  func generateUUID(_ resolve: @escaping RCTPromiseResolveBlock,
                    rejecter reject: @escaping RCTPromiseRejectBlock) {
    resolve(UUID().uuidString.lowercased())
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
