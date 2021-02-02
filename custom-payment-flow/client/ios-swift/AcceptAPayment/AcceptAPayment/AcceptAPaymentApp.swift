//
//  AcceptAPaymentApp.swift
//  AcceptAPayment
//
//  Created by Thorsten Schaeff on 2/1/21.
//

import SwiftUI
import Stripe

let BackendUrl = "http://127.0.0.1:4242/"

@main
struct AcceptAPaymentApp: App {
    init() {
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
