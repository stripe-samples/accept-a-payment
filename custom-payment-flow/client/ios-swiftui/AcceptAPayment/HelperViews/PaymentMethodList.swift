//
//  PaymentMethodList.swift
//  AcceptAPayment
//
//  Created by Thorsten Schaeff on 2/1/21.
//

import SwiftUI

var paymentMethodViews: [String: AnyView] = [
    "Card": AnyView(Card()),
    "Alipay": AnyView(Alipay()),
    "ApplePay": AnyView(ApplePay())
]

struct PaymentMethodList: View {
    var body: some View {
        NavigationView {
            List(paymentMethods, id: \.id) { paymentMethod in
                NavigationLink(destination: paymentMethodViews[paymentMethod.type]) {
                    PaymentMethodRow(paymentMethod: paymentMethod)
                }
            }
        }
        .navigationTitle("Payment methods")
    }
}

struct PaymentMethodList_Previews: PreviewProvider {
    static var previews: some View {
        PaymentMethodList()
    }
}
