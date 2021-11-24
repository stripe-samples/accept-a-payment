package com.example.app

import android.content.Intent
import android.os.Bundle
import androidx.appcompat.app.AlertDialog
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.lifecycleScope
import com.alipay.sdk.app.PayTask
import com.google.gson.GsonBuilder
import com.stripe.android.*
import com.stripe.android.model.ConfirmPaymentIntentParams
import com.stripe.android.model.StripeIntent
import kotlinx.android.synthetic.main.alipay_activity.*
import kotlinx.coroutines.launch

class AlipayActivity : AppCompatActivity() {

    /**
     * This example collects Alipay payments, implementing the guide here: https://stripe.com/docs/payments/alipay/accept-a-payment
     */

    private lateinit var paymentIntentClientSecret: String
    private lateinit var stripe: Stripe

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.alipay_activity)

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

    private fun handleResult(result: PaymentIntentResult) {
        val paymentIntent = result.intent
        when (paymentIntent.status) {
            StripeIntent.Status.Succeeded -> {
                // Payment succeeded
                val gson = GsonBuilder().setPrettyPrinting().create()
                displayAlert(
                    "Payment succeeded",
                    gson.toJson(paymentIntent),
                    restartDemo = true
                )
            }
            StripeIntent.Status.RequiresAction -> {
                stripe.handleNextActionForPayment(this@AlipayActivity, paymentIntentClientSecret)
            }
            else -> {
                // Payment failed/cancelled
                displayAlert(
                    "Payment failed",
                    paymentIntent.lastPaymentError?.message.orEmpty()
                )

            }
        }
    }

    private fun startCheckout() {
        // Create a PaymentIntent by calling the sample server's /create-payment-intent endpoint.
        ApiClient().createPaymentIntent("alipay", completion =  {
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
            val confirmParams = ConfirmPaymentIntentParams.createAlipay(paymentIntentClientSecret)
            lifecycleScope.launch {
                runCatching {
                    stripe.confirmAlipayPayment(
                        confirmParams,
                        authenticator = { data -> PayTask(this@AlipayActivity).payV2(data, true) })
                }.fold(
                    onSuccess = { result ->
                        handleResult(result)
                    },
                    onFailure = {
                        // Error using the Alipay SDK, let's use a webview instead
                        stripe.confirmPayment(this@AlipayActivity, confirmParams)
                    }
                )
            }
        }
    }

    // Handle activity result. This is needed when the webview is used
    override fun onActivityResult(requestCode: Int, resultCode: Int, data: Intent?) {
        super.onActivityResult(requestCode, resultCode, data)

        // Handle the result of stripe.confirmPayment
        if (stripe.isPaymentResult(requestCode, data)) {
            lifecycleScope.launch {
                runCatching {
                    stripe.getPaymentIntentResult(requestCode, data!!)
                }.fold(
                    onSuccess = { result ->
                        handleResult(result)
                    },
                    onFailure = {
                        // Error
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
