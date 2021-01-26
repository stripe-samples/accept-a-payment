//
//  AppDelegate.swift
//  app
//
//  Created by Ben Guo on 9/27/19.
//  Copyright © 2019 stripe-samples. All rights reserved.
//

import UIKit

@UIApplicationMain
class AppDelegate: UIResponder, UIApplicationDelegate {
    var window: UIWindow?

    func application(_ application: UIApplication, didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?) -> Bool {

        let window = UIWindow(frame: UIScreen.main.bounds)
        let checkoutViewController = CheckoutViewController();
        let rootViewController = UINavigationController(rootViewController: checkoutViewController)
        rootViewController.navigationBar.isTranslucent = false
        window.rootViewController = rootViewController
        window.makeKeyAndVisible()
        self.window = window

        return true
    }

}

