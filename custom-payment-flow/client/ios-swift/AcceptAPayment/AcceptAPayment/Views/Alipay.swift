//
//  Alipay.swift
//  AcceptAPayment
//
//  Created by Thorsten Schaeff on 2/1/21.
//

import SwiftUI
import Stripe

struct Alipay: View {
	@ObservedObject var model = BackendModel()
	@State var isConfirmingPayment = false
	
	var body: some View {
		VStack {
			if let paymentIntentParams = model.paymentIntentParams {
				Button("Pay with Alipay") {
					isConfirmingPayment = true
					// Redirect your customer to Alipay.
					// If the customer has the Alipay app installed, we open it.
					// Otherwise, we open alipay.com.
					paymentIntentParams.paymentMethodParams = STPPaymentMethodParams(alipay: STPPaymentMethodAlipayParams(), billingDetails: nil, metadata: nil)
					paymentIntentParams.paymentMethodOptions = STPConfirmPaymentMethodOptions()
					paymentIntentParams.paymentMethodOptions?.alipayOptions = STPConfirmAlipayOptions()
					paymentIntentParams.returnURL = "accept-a-payment://safepay/"
				}.paymentConfirmationSheet(
						isConfirmingPayment: $isConfirmingPayment,
						paymentIntentParams: paymentIntentParams,
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
						Text("Payment failed!")
					case .canceled:
						Image(systemName: "xmark.octagon.fill").foregroundColor(.orange)
						Text("Payment canceled.")
					@unknown default:
						Text("Unknown status")
					}
				}
			}
		}.onAppear { model.preparePaymentIntent(paymentMethodType: "alipay", currency: "usd") }
	}
}

struct Alipay_Previews: PreviewProvider {
	static var previews: some View {
		Alipay()
	}
}
