package com.example.app

import okhttp3.*
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.RequestBody.Companion.toRequestBody
import org.json.JSONObject
import java.io.IOException

class ApiClient {
    private val httpClient = OkHttpClient()

    fun createPaymentIntent(
            paymentMethodType: String,
            completion: (paymentIntentClientSecret: String?, error: String?) -> Unit) {

        val mediaType = "application/json; charset=utf-8".toMediaType()
        val requestJson = """
            {
                "currency":"usd",
                "paymentMethodType":"$paymentMethodType"
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
                        completion(null, "$e")
                    }

                    override fun onResponse(call: Call, response: Response) {
                        if (!response.isSuccessful) {
                            completion(null, "$response")
                        } else {
                            val responseData = response.body?.string()
                            val responseJson =
                                    responseData?.let { JSONObject(it) } ?: JSONObject()

                            // The response from the server contains the PaymentIntent's client_secret
                            var paymentIntentClientSecret : String = responseJson.getString("clientSecret")
                            completion(paymentIntentClientSecret, null)
                        }
                    }
                })
    }
}