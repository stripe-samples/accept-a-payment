//
//  WeChatPay.swift
//  AcceptAPayment
//
//  Created by Thorsten Schaeff on 6/24/21.
//

import SwiftUI
import Stripe

struct WeChatPay: View {
    @ObservedObject var model = BackendModel()
    @State var isConfirmingPayment = false
    
    var body: some View {
        VStack {
            if let paymentIntentParams = model.paymentIntentParams {
                Button("Pay with WeChat Pay") {
                    // Check if WeChat app is installed
                    if (!UIApplication.shared.canOpenURL(URL(string: "weixin://")!)) {
                        print("Can't open WeChat App. Please install from the App Store and try again.")
                        return
                    }
                    isConfirmingPayment = true
                    // TODO remove once GA
                    STPAPIClient.shared.betas = [.weChatPayBetaV1]
                    // Set the PaymentMethodParams
                    paymentIntentParams.paymentMethodParams = STPPaymentMethodParams(weChatPay: STPPaymentMethodWeChatPayParams(), billingDetails: nil, metadata: nil)
                    // Set the PaymentMethodOptions
                    let pmOptions = STPConfirmPaymentMethodOptions()
                    pmOptions.weChatPayOptions = STPConfirmWeChatPayOptions(appId: "wx65907d6307c3827d")
                    paymentIntentParams.paymentMethodOptions = pmOptions
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
        }.onAppear { model.preparePaymentIntent(paymentMethodType: "wechat_pay", currency: "usd") }
    }
}

struct WeChatPay_Previews: PreviewProvider {
    static var previews: some View {
        WeChatPay()
    }
}
