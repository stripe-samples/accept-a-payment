//
//  AcceptAPaymentApp.swift
//  AcceptAPayment
//
//  Created by Thorsten Schaeff on 2/1/21.
//

import SwiftUI
import Stripe

let BackendUrl = "http://127.0.0.1:4242/"

class AppDelegate: NSObject, UIApplicationDelegate {
    func application(_ application: UIApplication, didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey : Any]? = nil) -> Bool {
        // Configure the SDK with your Stripe publishable key so that it can make requests to the Stripe API.
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

@main
struct AcceptAPaymentApp: App {
    @UIApplicationDelegateAdaptor(AppDelegate.self) var appDelegate
    
    var body: some Scene {
        WindowGroup {
            ContentView()
                .onOpenURL { url in
                    // This method handles opening custom URL schemes (e.g., "your-app://")
                    print(url)
                    let stripeHandled = StripeAPI.handleURLCallback(with: url)
                    if (!stripeHandled) {
                        // This was not a Stripe url – handle the URL normally as you would
                    }
                }
        }
    }
}
