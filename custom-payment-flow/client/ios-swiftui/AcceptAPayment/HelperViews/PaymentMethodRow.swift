//
//  PaymentMethodRow.swift
//  AcceptAPayment
//
//  Created by Thorsten Schaeff on 2/1/21.
//

import SwiftUI

struct PaymentMethodRow: View {
    var paymentMethod: PaymentMethod
    
    var body: some View {
        HStack {
            Text(paymentMethod.title)
        }
    }
}

struct PaymentMethodRow_Previews: PreviewProvider {
    static var previews: some View {
        PaymentMethodRow(paymentMethod: paymentMethods[0])
    }
}
