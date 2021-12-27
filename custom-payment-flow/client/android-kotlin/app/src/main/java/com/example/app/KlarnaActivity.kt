package com.example.app

import android.os.Bundle
import android.view.WindowManager
import androidx.appcompat.app.AlertDialog
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.lifecycleScope
import com.stripe.android.PaymentConfiguration
import com.stripe.android.model.Address
import com.stripe.android.model.ConfirmPaymentIntentParams
import com.stripe.android.model.PaymentMethod
import com.stripe.android.model.PaymentMethodCreateParams
import com.stripe.android.payments.paymentlauncher.PaymentLauncher
import com.stripe.android.payments.paymentlauncher.PaymentResult
import kotlinx.android.synthetic.main.klarna_activity.*

class KlarnaActivity : AppCompatActivity() {

    /**
     * This example collects Klarna payments, implementing the guide here:
     * https://stripe.com/docs/payments/klarna/accept-a-payment?platform=android
     *
     * To run this app, follow the steps here:
     * https://github.com/stripe-samples/accept-a-payment#how-to-run-locally
     */
    private lateinit var paymentIntentClientSecret: String
    private lateinit var paymentLauncher: PaymentLauncher

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.klarna_activity)
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
        ApiClient().createPaymentIntent("klarna", completion =  {
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
                email = "jenny@rosen.com",
                address = Address.Builder()
                    .setCountry("US")
                    .build()
            )
            val paymentMethodCreateParams = PaymentMethodCreateParams.createKlarna(billingDetails)
            val confirmParams = ConfirmPaymentIntentParams
                .createWithPaymentMethodCreateParams(
                    paymentMethodCreateParams = paymentMethodCreateParams,
                    clientSecret = paymentIntentClientSecret,
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
