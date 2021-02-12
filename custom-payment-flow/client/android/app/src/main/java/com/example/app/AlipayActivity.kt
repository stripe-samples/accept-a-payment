package com.example.app

import android.app.Activity
import android.content.Intent
import android.os.Bundle
import android.widget.Button
import androidx.appcompat.app.AlertDialog
import androidx.appcompat.app.AppCompatActivity
import com.google.gson.GsonBuilder
import com.stripe.android.ApiResultCallback
import com.stripe.android.PaymentConfiguration
import com.stripe.android.PaymentIntentResult
import com.stripe.android.Stripe
import com.stripe.android.model.ConfirmPaymentIntentParams
import com.stripe.android.model.StripeIntent
import okhttp3.*
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.RequestBody.Companion.toRequestBody
import org.json.JSONObject
import java.io.IOException
import java.lang.ref.WeakReference

class AlipayActivity : AppCompatActivity() {

    /**
     * This example collects card payments, implementing the guide here: https://stripe.com/docs/payments/alipay/accept-a-payment
     * TODO what is the correct link for below
     * To run this app, follow the steps here: https://github.com/stripe-samples/accept-a-card-payment#how-to-run-locally
     */

    private val httpClient = OkHttpClient()
    private lateinit var paymentIntentClientSecret: String
    private lateinit var stripe: Stripe

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.alipay_activity)

        stripe = Stripe(this, PaymentConfiguration.getInstance(applicationContext).publishableKey)
        startCheckout()
    }

    private fun displayAlert(
        activity: Activity,
        title: String,
        message: String,
        restartDemo: Boolean = false
    ) {
        runOnUiThread {
            val builder = AlertDialog.Builder(activity)
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

    fun startCheckout() {
        val weakActivity = WeakReference<Activity>(this)

        // Create a PaymentIntent by calling the sample server's /create-payment-intent endpoint.
        val mediaType = "application/json; charset=utf-8".toMediaType()
        val requestJson = """
            {
                "currency":"usd",
                "paymentMethodType":"alipay"
            }
        """

        val body = requestJson.toRequestBody(mediaType)
        val request = Request.Builder()
            .url(BackendUrl + "create-payment-intent")
            .post(body)
            .build()

        httpClient.newCall(request)
            .enqueue(object: Callback {
                override fun onFailure(call: Call, e: IOException) {
                    weakActivity.get()?.let { activity ->
                        displayAlert(activity, "Failed to load page", "Error: $e")
                    }
                }

                override fun onResponse(call: Call, response: Response) {
                    if (!response.isSuccessful) {
                        weakActivity.get()?.let { activity ->
                            displayAlert(
                                activity,
                                "Failed to load page",
                                "Error: $response"
                            )
                        }
                    }
                    else {
                        val responseData = response.body?.string()
                        val responseJson = responseData?.let { JSONObject(it) } ?: JSONObject()

                        // The response from the server contains the PaymentIntent's client_secret
                        paymentIntentClientSecret = responseJson.getString("clientSecret")
                    }
                }
            })

        // Hook up the pay button to confirm the Alipay PaymentIntent
        val payButton: Button = findViewById(R.id.payButton)
        payButton.setOnClickListener {
            val confirmParams = ConfirmPaymentIntentParams.createAlipay(paymentIntentClientSecret)
            stripe.confirmPayment(this, confirmParams)
        }
    }

    override fun onActivityResult(requestCode: Int, resultCode: Int, data: Intent?) {
        super.onActivityResult(requestCode, resultCode, data)
        val weakActivity = WeakReference<Activity>(this)

        // Handle the result of stripe.confirmPayment
        stripe.onPaymentResult(requestCode, data, object : ApiResultCallback<PaymentIntentResult> {
            override fun onSuccess(result: PaymentIntentResult) {
                val paymentIntent = result.intent
                val status = paymentIntent.status
                if (status == StripeIntent.Status.Succeeded) {
                    val gson = GsonBuilder().setPrettyPrinting().create()
                    weakActivity.get()?.let { activity ->
                        displayAlert(
                            activity,
                            "Payment succeeded",
                            gson.toJson(paymentIntent),
                            restartDemo = true
                        )
                    }
                } else if (status == StripeIntent.Status.RequiresPaymentMethod) {
                    weakActivity.get()?.let { activity ->
                        displayAlert(
                            activity,
                            "Payment failed",
                            paymentIntent.lastPaymentError?.message.orEmpty()
                        )
                    }
                }
            }

            override fun onError(e: Exception) {
                weakActivity.get()?.let { activity ->
                    displayAlert(
                        activity,
                        "Payment failed",
                        e.toString()
                    )
                }
            }
        })
    }
}