//
//  Card.swift
//  AcceptAPayment
//
//  Created by Thorsten Schaeff on 2/1/21.
//

import SwiftUI
import Stripe

/**
 * This example collects card payments, implementing the guide here: https://stripe.com/docs/payments/accept-a-payment#ios
 */

struct Card: View {
		@ObservedObject var model = BackendModel()
		@State var isConfirmingPayment = false
		@State var paymentMethodParams: STPPaymentMethodParams?
			
		var body: some View {
				VStack {
					STPPaymentCardTextField.Representable(paymentMethodParams: $paymentMethodParams)
						.padding()
					if let paymentIntent = model.paymentIntentParams {
						Button("Buy") {
							paymentIntent.paymentMethodParams = paymentMethodParams
							isConfirmingPayment = true
						}.paymentConfirmationSheet(isConfirmingPayment: $isConfirmingPayment,
																			 paymentIntentParams: paymentIntent,
																			 onCompletion: model.onCompletion)
						.disabled(isConfirmingPayment)
					} else {
						Text("Loading...")
					}
					if let paymentStatus = model.paymentStatus {
						HStack {
							switch paymentStatus {
							case .succeeded:
								Image(systemName: "checkmark.circle.fill").foregroundColor(.green)
								Text("Payment complete!")
							case .failed:
								Image(systemName: "xmark.octagon.fill").foregroundColor(.red)
								Text("Payment failed! \(model.lastPaymentError ?? NSError())")
							case .canceled:
								Image(systemName: "xmark.octagon.fill").foregroundColor(.orange)
								Text("Payment canceled.")
							@unknown default:
								Text("Unknown status")
							}
						}
					}
				}.onAppear { model.preparePaymentIntent(paymentMethodType: "card", currency: "usd") }
			}
}

struct Card_Previews: PreviewProvider {
    static var previews: some View {
        Card()
    }
}
