//
//  AlipaySwiftUIView.swift
//  AcceptAPayment
//
//  Created by Thorsten Schaeff on 2/4/21.
//

import SwiftUI
import Stripe

class MyPIBackendModel : ObservableObject {
	@Published var paymentStatus: STPPaymentHandlerActionStatus?
	@Published var paymentIntentParams: STPPaymentIntentParams?
	@Published var lastPaymentError: NSError?

  func preparePaymentIntent() {
    // MARK: Fetch the PaymentIntent from the backend
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
								print(message)
								return
				}
				print("Created PaymentIntent")
				// MARK: Create the PaymentIntent
				DispatchQueue.main.async {
					self?.paymentIntentParams = STPPaymentIntentParams(clientSecret: clientSecret)
				}
		})
		task.resume()
  }
	
	func onCompletion(status: STPPaymentHandlerActionStatus, pi: STPPaymentIntent?, error: NSError?) {
		self.paymentStatus = status
		self.lastPaymentError = error

		// MARK: Demo cleanup
		if status == .succeeded {
			// A PaymentIntent can't be reused after a successful payment. Prepare a new one for the demo.
			self.paymentIntentParams = nil
			preparePaymentIntent()
		}
	}
}

struct AlipaySwiftUIView: View {
	@ObservedObject var model = MyPIBackendModel()
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
		}.onAppear { model.preparePaymentIntent() }
	}
}

struct AlipaySwiftUIView_Previews: PreviewProvider {
	static var previews: some View {
		AlipaySwiftUIView()
	}
}
