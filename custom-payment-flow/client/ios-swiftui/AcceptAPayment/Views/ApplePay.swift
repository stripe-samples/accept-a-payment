//
//  ApplePay.swift
//  AcceptAPayment
//
//  Created by Thorsten Schaeff on 6/25/21.
//

import SwiftUI
import Stripe
import PassKit

let applePayButtonVCInstance = ApplePayButtonViewController()
var backendModel: BackendModel?
var clientSecret: String?
var status: STPPaymentStatus?

struct ApplePay: View {
    @ObservedObject var model = BackendModel()
    @State var isConfirmingPayment = false
    
    var body: some View {
        VStack {
            HStack {
                switch model.paymentStatus {
                case .succeeded:
                    Image(systemName: "checkmark.circle.fill").foregroundColor(.green)
                    Text("Payment complete!")
                case .failed:
                    Image(systemName: "xmark.octagon.fill").foregroundColor(.red)
                    Text("Payment failed!")
                case .canceled:
                    Image(systemName: "xmark.octagon.fill").foregroundColor(.orange)
                    Text("Payment canceled.")
                case .none:
                    Text("")
                @unknown default:
                    Text("Unknown status")
                }
            }
            if let paymentIntentParams = model.paymentIntentParams {
                ApplePayButtonViewControllerRepresentable()
                ApplePayButton()
                    .frame(minWidth: 100, maxWidth: 400)
                    .frame(height: 60)
                    .frame(maxWidth: .infinity)
                    .onAppear {
                        backendModel = model
                        clientSecret = paymentIntentParams.clientSecret
                    }
            } else {
                Text("Loading...")
            }
        }.onAppear {
            if (!StripeAPI.deviceSupportsApplePay()) {
                print("Either Apple Pay is not set up on this device or your configuration is incomplete.")
            } else {
                model.preparePaymentIntent(paymentMethodType: "card", currency: "usd")
            }
        }
    }
}

struct ApplePay_Previews: PreviewProvider {
    static var previews: some View {
        ApplePay()
    }
}

@objcMembers final class ApplePayButtonViewController: UIViewController, STPApplePayContextDelegate {
    func applePayContext(_ context: STPApplePayContext, didCreatePaymentMethod paymentMethod: STPPaymentMethod, paymentInformation: PKPayment, completion: @escaping STPIntentClientSecretCompletionBlock) {
        // Call the completion block with the client secret or an error
        completion(backendModel?.paymentIntentParams?.clientSecret, nil);
    }
    
    func applePayContext(_ context: STPApplePayContext, didCompleteWith status: STPPaymentStatus, error: Error?) {
        switch status {
        case .success:
            // Payment succeeded, show a receipt view
            backendModel?.paymentStatus = STPPaymentHandlerActionStatus.succeeded
            backendModel?.paymentIntentParams = nil
            backendModel?.preparePaymentIntent(paymentMethodType: "card", currency: "usd")
            print("Payment succeeded")
            break
        case .error:
            // Payment failed, show the error
            backendModel?.paymentStatus = STPPaymentHandlerActionStatus.failed
            print("Payment failed")
            break
        case .userCancellation:
            // User cancelled the payment
            backendModel?.paymentStatus = STPPaymentHandlerActionStatus.canceled
            print("Payment canceled")
            break
        @unknown default:
            fatalError()
        }
    }
    
    func handleApplePayButtonTapped() {
        let merchantIdentifier = "merchant.com.stripe-samples.accept-a-payment"
        let paymentRequest = StripeAPI.paymentRequest(withMerchantIdentifier: merchantIdentifier, country: "US", currency: "USD")
        
        // Configure the line items on the payment request
        paymentRequest.paymentSummaryItems = [
            // The final line should represent your company;
            // it'll be prepended with the word "Pay" (i.e. "Pay iHats, Inc $50")
            PKPaymentSummaryItem(label: "iHats, Inc", amount: 50.00),
        ]
        
        // Initialize an STPApplePayContext instance
        if let applePayContext = STPApplePayContext(paymentRequest: paymentRequest, delegate: self) {
            // Present Apple Pay payment sheet
            applePayContext.presentApplePay(on: self)
        } else {
            // There is a problem with your Apple Pay configuration
        }
    }
    
    let applePayButton: PKPaymentButton = PKPaymentButton(paymentButtonType: .plain, paymentButtonStyle: .black)
    
    public func getButton() -> PKPaymentButton {
        return applePayButton
    }

    override func viewDidLoad() {
        super.viewDidLoad()
        applePayButton.addTarget(self, action: #selector(handleApplePayButtonTapped), for: .touchUpInside)
    }
}

struct ApplePayButtonViewControllerRepresentable: UIViewControllerRepresentable {
    typealias UIViewControllerType = ApplePayButtonViewController
    
    func makeUIViewController(context: UIViewControllerRepresentableContext<ApplePayButtonViewControllerRepresentable>) -> ApplePayButtonViewController {
        return applePayButtonVCInstance
    }
    
    func updateUIViewController(_ uiViewController: ApplePayButtonViewController, context: UIViewControllerRepresentableContext<ApplePayButtonViewControllerRepresentable>) {
        //
    }
}

struct ApplePayButton: UIViewRepresentable {
    func makeUIView(context: Context) -> PKPaymentButton {
        return applePayButtonVCInstance.getButton()
    }
    func updateUIView(_ uiView: PKPaymentButton, context: Context) { }
}
