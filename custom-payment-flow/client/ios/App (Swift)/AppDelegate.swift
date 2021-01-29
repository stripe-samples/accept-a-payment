//
//  AppDelegate.swift
//  app
//
//  Created by Ben Guo on 9/27/19.
//  Copyright © 2019 stripe-samples. All rights reserved.
//

import UIKit
import Stripe

//let BackendUrl = "http://127.0.0.1:4242/"

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
        // Configure the SDK with your Stripe publishable key so that it can make requests to the Stripe API
        // It's a best practice to fetch the publishable key from the server in case you need to roll the key for some reason.
       
        initializeStripe()
        return true
    }
    
    func initializeStripe() {
        let url = URL(string: BackendUrl + "config")!
        var request = URLRequest(url: url)
        request.httpMethod = "GET"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        let task = URLSession.shared.dataTask(with: request, completionHandler: { (data, response, error) in
            guard let response = response as? HTTPURLResponse,
                response.statusCode == 200,
                let data = data,
                let json = try? JSONSerialization.jsonObject(with: data, options: []) as? [String : Any],
                let publishableKey = json["publishableKey"] as? String else {
                print("Failed to retrieve publishableKey from /config")
                return
            }
            print("Fetched publishable key \(publishableKey)")
            StripeAPI.defaultPublishableKey = publishableKey
        })
        task.resume()
    }

}

