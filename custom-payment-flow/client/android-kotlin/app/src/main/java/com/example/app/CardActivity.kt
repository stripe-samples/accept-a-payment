package com.example.app

import android.content.Intent
import android.os.Bundle
import androidx.appcompat.app.AlertDialog
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.lifecycleScope
import com.google.gson.GsonBuilder
import com.stripe.android.PaymentConfiguration
import com.stripe.android.Stripe
import com.stripe.android.getPaymentIntentResult
import com.stripe.android.model.ConfirmPaymentIntentParams
import com.stripe.android.model.StripeIntent
import kotlinx.android.synthetic.main.card_activity.*
import kotlinx.coroutines.launch

class CardActivity : AppCompatActivity() {

    /**
     * This example collects card payments, implementing the guide here: https://stripe.com/docs/payments/accept-a-payment#android
     *
     * To run this app, follow the steps here: https://github.com/stripe-samples/accept-a-payment#how-to-run-locally
     */
    private lateinit var paymentIntentClientSecret: String
    private lateinit var stripe: Stripe

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.card_activity)

        stripe = Stripe(this, PaymentConfiguration.getInstance(applicationContext).publishableKey)
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
                    cardInputWidget.clear()
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
        ApiClient().createPaymentIntent("card", completion =  {
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

        // Confirm the PaymentIntent with the card widget
        payButton.setOnClickListener {
            cardInputWidget.paymentMethodCreateParams?.let { params ->
                val confirmParams = ConfirmPaymentIntentParams
                    .createWithPaymentMethodCreateParams(params, paymentIntentClientSecret)
                stripe.confirmPayment(this, confirmParams)
            }
        }
    }

    override fun onActivityResult(requestCode: Int, resultCode: Int, data: Intent?) {
        super.onActivityResult(requestCode, resultCode, data)

        // Handle the result of stripe.confirmPayment
        if (stripe.isPaymentResult(requestCode, data)) {
            lifecycleScope.launch {
                runCatching {
                    stripe.getPaymentIntentResult(requestCode, data!!)
                }.fold(
                    onSuccess = { result ->
                        val paymentIntent = result.intent
                        if (paymentIntent.status == StripeIntent.Status.Succeeded) {
                            val gson = GsonBuilder().setPrettyPrinting().create()
                            displayAlert(
                                "Payment succeeded",
                                gson.toJson(paymentIntent),
                                restartDemo = true
                            )
                        } else if (paymentIntent.status == StripeIntent.Status.RequiresPaymentMethod) {
                            displayAlert(
                                "Payment failed",
                                paymentIntent.lastPaymentError?.message.orEmpty()
                            )
                        }
                    },
                    onFailure = {
                        displayAlert(
                            "Error",
                            it.toString()
                        )
                    }
                )
            }
        }
    }
}
