//
//  PaymentMethods.swift
//  AcceptAPayment
//
//  Created by Thorsten Schaeff on 2/1/21.
//

import Foundation

struct PaymentMethod: Hashable, Codable {
    var title: String
    var type: String
}
