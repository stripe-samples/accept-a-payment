package com.example.app

import android.os.Bundle
import android.view.WindowManager
import androidx.appcompat.app.AlertDialog
import androidx.appcompat.app.AppCompatActivity
import com.stripe.android.PaymentConfiguration
import com.stripe.android.model.Address
import com.stripe.android.model.ConfirmPaymentIntentParams
import com.stripe.android.model.PaymentMethod
import com.stripe.android.model.PaymentMethodCreateParams
import com.stripe.android.payments.paymentlauncher.PaymentLauncher
import com.stripe.android.payments.paymentlauncher.PaymentResult
import kotlinx.android.synthetic.main.afterpay_clearpay_activity.*

class AfterpayClearpayActivity : AppCompatActivity() {

    /**
     * This example collects Afterpay/Clearpay payments, implementing the guide here:
     * https://stripe.com/docs/payments/afterpay-clearpay/accept-a-payment?platform=android
     *
     * To run this app, follow the steps here:
     * https://github.com/stripe-samples/accept-a-payment#how-to-run-locally
     */
    private lateinit var paymentIntentClientSecret: String
    private lateinit var paymentLauncher: PaymentLauncher

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.afterpay_clearpay_activity)
        if(BuildConfig.DEBUG){
            getWindow().addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);
        }

        val paymentConfiguration = PaymentConfiguration.getInstance(applicationContext)
        paymentLauncher = PaymentLauncher.Companion.create(
            this,
            paymentConfiguration.publishableKey,
            paymentConfiguration.stripeAccountId,
            ::onPaymentResult
        )
        startCheckout()
    }

    private fun displayAlert(
        title: String,
        message: String,
        restartDemo: Boolean = false
    ) {
        runOnUiThread {
            val builder = AlertDialog.Builder(this)
                .setTitle(title)
                .setMessage(message)
            if (restartDemo) {
                builder.setPositiveButton("Restart demo") { _, _ ->
                    startCheckout()
                }
            }
            else {
                builder.setPositiveButton("Ok", null)
            }
            builder
                .create()
                .show()
        }
    }

    private fun startCheckout() {
        // Create a PaymentIntent by calling the sample server's /create-payment-intent endpoint.
        ApiClient().createPaymentIntent("afterpay_clearpay", completion =  {
            paymentIntentClientSecret, error ->
            run {
                paymentIntentClientSecret?.let {
                    this.paymentIntentClientSecret = it
                }
                error?.let {
                    displayAlert(
                        "Failed to load page",
                        "Error: $error"
                    )
                }
            }
        })

        // Confirm the PaymentIntent when the user taps the pay button
        payButton.setOnClickListener {
            val billingDetails = PaymentMethod.BillingDetails(
                name = "Jenny Rosen",
                email = "jenny@rosen.com",
                address = Address.Builder()
                    .setLine1("1234 Market St")
                    .setCity("San Francisco")
                    .setState("CA")
                    .setCountry("US")
                    .setPostalCode("94111")
                    .build()
            )

            val shippingDetails = ConfirmPaymentIntentParams.Shipping(
                name = "Jenny Rosen",
                address = Address.Builder()
                    .setLine1("1234 Market St")
                    .setCity("San Francisco")
                    .setState("CA")
                    .setCountry("US")
                    .setPostalCode("94111")
                    .build()
            )

            val paymentMethodCreateParams = PaymentMethodCreateParams.createAfterpayClearpay(billingDetails)
            val confirmParams = ConfirmPaymentIntentParams
                .createWithPaymentMethodCreateParams(
                    paymentMethodCreateParams = paymentMethodCreateParams,
                    clientSecret = paymentIntentClientSecret,
                    shipping = shippingDetails
                )
            paymentLauncher.confirm(confirmParams)
        }
    }

    private fun onPaymentResult(paymentResult: PaymentResult) {
        val message = when (paymentResult) {
            is PaymentResult.Completed -> {
                "Completed!"
            }
            is PaymentResult.Canceled -> {
                "Canceled!"
            }
            is PaymentResult.Failed -> {
                // This string comes from the PaymentIntent's error message.
                // See here: https://stripe.com/docs/api/payment_intents/object#payment_intent_object-last_payment_error-message
                "Failed: " + paymentResult.throwable.message
            }
        }
        displayAlert(
            "Payment Result:",
            message,
            restartDemo = true
        )
    }
}
