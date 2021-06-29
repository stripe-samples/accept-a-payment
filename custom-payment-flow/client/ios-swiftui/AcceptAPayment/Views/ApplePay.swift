//
//  ApplePay.swift
//  AcceptAPayment
//
//  Created by Thorsten Schaeff on 6/25/21.
//

import SwiftUI
import Stripe

struct ApplePay: View {
    @ObservedObject var backendModel = BackendModel()
    @StateObject var applePayModel = ApplePayModel()
    
    var body: some View {
        VStack {
            if backendModel.paymentIntentParams != nil {
                PaymentButton() {
                    applePayModel.pay(clientSecret: backendModel.paymentIntentParams?.clientSecret)
                }
                .padding()
            } else {
                Text("Loading...")
            }
            if let paymentStatus = applePayModel.paymentStatus {
                HStack {
                    switch paymentStatus {
                    case .success:
                        Image(systemName: "checkmark.circle.fill").foregroundColor(.green)
                        Text("Payment complete!")
                    case .error:
                        Image(systemName: "xmark.octagon.fill").foregroundColor(.red)
                        Text("Payment failed!")
                    case .userCancellation:
                        Image(systemName: "xmark.octagon.fill").foregroundColor(.orange)
                        Text("Payment canceled.")
                    @unknown default:
                        Text("Unknown status")
                    }
                }
            }
        }.onAppear {
            if (!StripeAPI.deviceSupportsApplePay()) {
                print("Apple Pay is not supported on this device.")
            } else {
                backendModel.preparePaymentIntent(paymentMethodType: "card", currency: "usd")
            }
        }
    }
}

struct ApplePay_Previews: PreviewProvider {
    static var previews: some View {
        ApplePay()
    }
}
