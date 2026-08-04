

import UIKit
import React
import React_RCTAppDelegate
import ReactAppDependencyProvider

@main
class AppDelegate: UIResponder, UIApplicationDelegate {
  var window: UIWindow?
  private var reactNativeDelegate: ReactNativeDelegate?
  private var reactNativeFactory: RCTReactNativeFactory?

  func application(
    _ application: UIApplication,
    didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]? = nil
  ) -> Bool {
    // 1. Setup the delegate and dependency injection
    let delegate = ReactNativeDelegate()
    delegate.dependencyProvider = RCTAppDependencyProvider()
    
    // 2. Setup the factory
    let factory = RCTReactNativeFactory(delegate: delegate)
    
    self.reactNativeDelegate = delegate
    self.reactNativeFactory = factory
    
    // 3. Create the main UIWindow and start React Native
    self.window = UIWindow(frame: UIScreen.main.bounds)
    factory.startReactNative(
      withModuleName: "MrtDeferlink",
      in: self.window!,
      launchOptions: launchOptions
    )
    
    return true
  }

  // Handle universal links (deep linking)
  func application(_ application: UIApplication, continue userActivity: NSUserActivity, restorationHandler: @escaping ([UIUserActivityRestoring]?) -> Void) -> Bool {
    return RCTLinkingManager.application(application, continue: userActivity, restorationHandler: restorationHandler)
  }

  // Handle direct schema linking
  func application(_ app: UIApplication, open url: URL, options: [UIApplication.OpenURLOptionsKey : Any] = [:]) -> Bool {
    return RCTLinkingManager.application(app, open: url, options: options)
  }
}

// 4. Implement the factory delegate to locate your JS bundle
class ReactNativeDelegate: RCTDefaultReactNativeFactoryDelegate {
  override func sourceURL(for bridge: RCTBridge) -> URL? {
    self.bundleURL()
  }

  override func bundleURL() -> URL? {
    #if DEBUG
      return RCTBundleURLProvider.sharedSettings().jsBundleURL(forBundleRoot: "index")
    #else
      return Bundle.main.url(forResource: "main", withExtension: "jsbundle")
    #endif
  }
}
