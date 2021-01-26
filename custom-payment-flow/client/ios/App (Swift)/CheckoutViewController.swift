//
//  CheckoutViewController.swift
//  app
//
//  Created by Yuki Tokuhiro on 9/25/19.
//  Copyright © 2019 stripe-samples. All rights reserved.
//

import UIKit
import Stripe

/**
 * This example collects card payments, implementing the guide here: https://stripe.com/docs/payments/accept-a-payment#ios
 * To run this app, follow the steps here https://github.com/stripe-samples/accept-a-card-payment#how-to-run-locally
 */
let BackendUrl = "http://127.0.0.1:4242/"

class CheckoutViewController: UIViewController {
    var paymentIntentClientSecret: String?

    lazy var cardTextField: STPPaymentCardTextField = {
        let cardTextField = STPPaymentCardTextField()
        return cardTextField
    }()
    lazy var payButton: UIButton = {
        let button = UIButton(type: .custom)
        button.layer.cornerRadius = 5
        button.backgroundColor = .systemBlue
        button.titleLabel?.font = UIFont.systemFont(ofSize: 22)
        button.setTitle("Pay", for: .normal)
        button.addTarget(self, action: #selector(pay), for: .touchUpInside)
        return button
    }()

    override func viewDidLoad() {
        super.viewDidLoad()
        view.backgroundColor = .white
        let stackView = UIStackView(arrangedSubviews: [cardTextField, payButton])
        stackView.axis = .vertical
        stackView.spacing = 20
        stackView.translatesAutoresizingMaskIntoConstraints = false
        view.addSubview(stackView)
        NSLayoutConstraint.activate([
            stackView.leftAnchor.constraint(equalToSystemSpacingAfter: view.leftAnchor, multiplier: 2),
            view.rightAnchor.constraint(equalToSystemSpacingAfter: stackView.rightAnchor, multiplier: 2),
            stackView.topAnchor.constraint(equalToSystemSpacingBelow: view.topAnchor, multiplier: 2),
        ])
        startCheckout()
    }

    func displayAlert(title: String, message: String, restartDemo: Bool = false) {
        DispatchQueue.main.async {
            let alert = UIAlertController(title: title, message: message, preferredStyle: .alert)
            if restartDemo {
                alert.addAction(UIAlertAction(title: "Restart demo", style: .cancel) { _ in
                    self.cardTextField.clear()
                    self.startCheckout()
                })
            }
            else {
                alert.addAction(UIAlertAction(title: "OK", style: .cancel))
            }
            self.present(alert, animated: true, completion: nil)
        }
    }

    func startCheckout() {
        // Create a PaymentIntent by calling the sample server's /create-payment-intent endpoint.
        let url = URL(string: BackendUrl + "create-payment-intent")!
        let json: [String: Any] = [
            "currency": "usd",
            "items": [
                ["id": "photo_subscription"]
            ]
        ]
        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        request.httpBody = try? JSONSerialization.data(withJSONObject: json)
        let task = URLSession.shared.dataTask(with: request, completionHandler: { [weak self] (data, response, error) in
            guard let response = response as? HTTPURLResponse,
                response.statusCode == 200,
                let data = data,
                let json = try? JSONSerialization.jsonObject(with: data, options: []) as? [String : Any],
                let clientSecret = json["clientSecret"] as? String,
                let publishableKey = json["publishableKey"] as? String else {
                    let message = error?.localizedDescription ?? "Failed to decode response from server."
                    self?.displayAlert(title: "Error loading page", message: message)
                    return
            }
            print("Created PaymentIntent")
            self?.paymentIntentClientSecret = clientSecret
            // Configure the SDK with your Stripe publishable key so that it can make requests to the Stripe API
            // For added security, our sample app gets the publishable key from the server
            StripeAPI.defaultPublishableKey = publishableKey
        })
        task.resume()
    }

    @objc
    func pay() {
        guard let paymentIntentClientSecret = paymentIntentClientSecret else {
            return;
        }
        // Collect card details
        let cardParams = cardTextField.cardParams
        let paymentMethodParams = STPPaymentMethodParams(card: cardParams, billingDetails: nil, metadata: nil)
        let paymentIntentParams = STPPaymentIntentParams(clientSecret: paymentIntentClientSecret)
        paymentIntentParams.paymentMethodParams = paymentMethodParams

        // Submit the payment
        let paymentHandler = STPPaymentHandler.shared()
        paymentHandler.confirmPayment(paymentIntentParams, with: self) { (status, paymentIntent, error) in
            switch (status) {
            case .failed:
                self.displayAlert(title: "Payment failed", message: error?.localizedDescription ?? "")
                break
            case .canceled:
                self.displayAlert(title: "Payment canceled", message: error?.localizedDescription ?? "")
                break
            case .succeeded:
                self.displayAlert(title: "Payment succeeded", message: paymentIntent?.description ?? "", restartDemo: true)
                break
            @unknown default:
                fatalError()
                break
            }
        }
    }
}

extension CheckoutViewController: STPAuthenticationContext {
    func authenticationPresentingViewController() -> UIViewController {
        return self
    }
}

// docs_window_spec {"setup-ui-swift": [[21, 51], [52, 53], ["// ..."], [131, 132]]}
