//
//  AcceptAPaymentApp.swift
//  AcceptAPayment
//
//  Created by Thorsten Schaeff on 2/1/21.
//

import SwiftUI
import Stripe

class AppDelegate: UIResponder, UIApplicationDelegate {

    func application(_ application: UIApplication, didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?) -> Bool {
        StripeAPI.defaultPublishableKey = "pk_test_51IEr85JDet89c9Db2UPqXVrCQy2enE9wc3KP6xfYjJcpGJjhK8oglRccsUqfchAdpmr3AYmX7jYD3PcgMBlB1MYF005pkgQDv7"
        // do any other necessary launch configuration
        return true
    }
}

@main
struct AcceptAPaymentApp: App {
    var body: some Scene {
        WindowGroup {
            ContentView()
        }
    }
}
