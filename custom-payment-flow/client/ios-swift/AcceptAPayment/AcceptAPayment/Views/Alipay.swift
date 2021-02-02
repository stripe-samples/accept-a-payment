//
//  Alipay.swift
//  AcceptAPayment
//
//  Created by Thorsten Schaeff on 2/1/21.
//

import SwiftUI
import UIKit
import Stripe

/**
 * This example collects card payments, implementing the guide here: https://stripe.com/docs/payments/alipay/accept-a-payment
 */

final class AlipayExampleViewController: UIViewController {
    var paymentIntentClientSecret: String?
    var inProgress: Bool = false {
        didSet {
            navigationController?.navigationBar.isUserInteractionEnabled = !inProgress
            payButton.isEnabled = !inProgress
            inProgress ? activityIndicatorView.startAnimating() : activityIndicatorView.stopAnimating()
        }
    }

    // UI
    lazy var activityIndicatorView = {
       return UIActivityIndicatorView(style: .medium)
    }()
    lazy var payButton: UIButton = {
        let button = UIButton(type: .roundedRect)
        button.setTitle("Pay with Alipay", for: .normal)
        button.addTarget(self, action: #selector(didTapPayButton), for: .touchUpInside)
        return button
    }()

    override func viewDidLoad() {
        super.viewDidLoad()
        view.backgroundColor = .white
        title = "Alipay"
        [payButton, activityIndicatorView].forEach { subview in
            view.addSubview(subview)
            subview.translatesAutoresizingMaskIntoConstraints = false
        }

        let constraints = [
            payButton.centerXAnchor.constraint(equalTo: view.centerXAnchor),
            payButton.centerYAnchor.constraint(equalTo: view.centerYAnchor),

            activityIndicatorView.centerXAnchor.constraint(equalTo: view.centerXAnchor),
            activityIndicatorView.centerYAnchor.constraint(equalTo: view.centerYAnchor)
        ]
        NSLayoutConstraint.activate(constraints)
        startCheckout()
    }
    
    func displayAlert(title: String, message: String, restartDemo: Bool = false) {
        DispatchQueue.main.async {
            let alert = UIAlertController(title: title, message: message, preferredStyle: .alert)
            if restartDemo {
                alert.addAction(UIAlertAction(title: "Restart demo", style: .cancel) { _ in
                    self.inProgress = false
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
            "paymentMethodType": "alipay"
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
                let clientSecret = json["clientSecret"] as? String else {
                    let message = error?.localizedDescription ?? "Failed to decode response from server."
                    self?.displayAlert(title: "Error loading page", message: message)
                    return
            }
            print("Created PaymentIntent")
            self?.paymentIntentClientSecret = clientSecret
        })
        task.resume()
    }

    @objc func didTapPayButton() {
        inProgress = true
        pay()
    }
}

// MARK: -
extension AlipayExampleViewController {
    @objc func pay() {
        // 1. Create an Alipay PaymentIntent
        guard let paymentIntentClientSecret = paymentIntentClientSecret else {
            return;
        }
        
        // 2. Redirect your customer to Alipay.
        // If the customer has the Alipay app installed, we open it.
        // Otherwise, we open alipay.com.
        let paymentIntentParams = STPPaymentIntentParams(clientSecret: paymentIntentClientSecret)
        paymentIntentParams.paymentMethodParams = STPPaymentMethodParams(alipay: STPPaymentMethodAlipayParams(), billingDetails: nil, metadata: nil)
        paymentIntentParams.paymentMethodOptions = STPConfirmPaymentMethodOptions()
        paymentIntentParams.paymentMethodOptions?.alipayOptions = STPConfirmAlipayOptions()
        paymentIntentParams.returnURL = "accept-a-payment://safepay/"

        STPPaymentHandler.shared().confirmPayment(paymentIntentParams, with: self) { (status, paymentIntent, error) in
            switch status {
            case .failed:
                self.displayAlert(title: "Payment failed", message: error?.localizedDescription ?? "", restartDemo: true)
                break
            case .canceled:
                self.displayAlert(title: "Payment canceled", message: error?.localizedDescription ?? "", restartDemo: true)
                break
            case .succeeded:
                self.displayAlert(title: "Payment succeeded", message: paymentIntent?.description ?? "", restartDemo: true)
                break
            @unknown default:
                fatalError()
            }
        }
    }
}

extension AlipayExampleViewController: STPAuthenticationContext {
    func authenticationPresentingViewController() -> UIViewController {
        self
    }
}

extension AlipayExampleViewController: UIViewControllerRepresentable {
    public typealias UIViewControllerType = AlipayExampleViewController

    public func makeUIViewController(context: UIViewControllerRepresentableContext<AlipayExampleViewController>) -> AlipayExampleViewController {
        return AlipayExampleViewController()
    }

    public func updateUIViewController(_ uiViewController: AlipayExampleViewController, context: UIViewControllerRepresentableContext<AlipayExampleViewController>) {
        //
    }
}

struct Alipay: View {
    var body: some View {
        AlipayExampleViewController()
    }
}

struct Alipay_Previews: PreviewProvider {
    static var previews: some View {
        Alipay()
    }
}
