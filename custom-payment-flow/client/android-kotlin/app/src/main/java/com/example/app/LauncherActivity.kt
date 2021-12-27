package com.example.app

import android.app.Activity
import android.content.Intent
import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.TextView
import androidx.appcompat.app.AppCompatActivity
import androidx.recyclerview.widget.RecyclerView
import androidx.appcompat.app.AlertDialog
import okhttp3.*
import org.json.JSONObject
import java.io.IOException
import com.stripe.android.PaymentConfiguration

// 10.0.2.2 is the Android emulator's alias to localhost
val BackendUrl = BuildConfig.BACKEND_URL

class LauncherActivity : AppCompatActivity() {

    private lateinit var recyclerView: RecyclerView
    private val httpClient = OkHttpClient()
    private lateinit var publishableKey: String

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        setContentView(R.layout.activity_launcher)
        fetchPublishableKey()

        recyclerView = findViewById(R.id.recycler_view)
        recyclerView.adapter = PaymentMethodsListAdapter(this)
    }

    private fun displayAlert(
        title: String,
        message: String
    ) {
        runOnUiThread {
            val builder = AlertDialog.Builder(this)
                .setTitle(title)
                .setMessage(message)

            builder.setPositiveButton("Ok", null)
            builder
                .create()
                .show()
        }
    }

    private fun fetchPublishableKey() {
        val request = Request.Builder()
            .url(BackendUrl + "config")
            .build()

        httpClient.newCall(request)
            .enqueue(object: Callback {
                override fun onFailure(call: Call, e: IOException) {
                    displayAlert("Failed to load page", "Error: $e")
                }

                override fun onResponse(call: Call, response: Response) {
                    if (!response.isSuccessful) {
                        displayAlert(
                            "Failed to load page",
                            "Error: $response"
                        )
                    } else {
                        val responseData = response.body?.string()
                        val responseJson =
                            responseData?.let { JSONObject(it) } ?: JSONObject()
                        // For added security, our sample app gets the publishable key
                        // from the server.
                        publishableKey = responseJson.getString("publishableKey")

                        // Set up PaymentConfiguration with your Stripe publishable key
                        PaymentConfiguration.init(applicationContext, publishableKey)
                    }
                }
            })
    }

    // Adapter
    class PaymentMethodsListAdapter(private val activity: Activity)
        : RecyclerView.Adapter<PaymentMethodsListAdapter.PaymentMethodListViewHolder>() {

        private val items = listOf(
            PaymentMethodItem(activity.getString(R.string.card_item), CardActivity::class.java),
            PaymentMethodItem(activity.getString(R.string.alipay_item), AlipayActivity::class.java),
            PaymentMethodItem(activity.getString(R.string.afterpay_clearpay_item), AfterpayClearpayActivity::class.java),
            PaymentMethodItem(activity.getString(R.string.klarna_item), KlarnaActivity::class.java)
        )

        private data class PaymentMethodItem constructor(val text: String, val activityClass: Class<*>)

        // Viewholder
        class PaymentMethodListViewHolder(itemView: View) : RecyclerView.ViewHolder(itemView) {
            private val labelView : TextView = itemView.findViewById(R.id.payment_method_type_label)

            fun bind(text: String) {
                labelView.text = text
            }
        }

        override fun onCreateViewHolder(
            parent: ViewGroup,
            viewType: Int
        ): PaymentMethodListViewHolder {
            val view = LayoutInflater.from(parent.context)
                .inflate(R.layout.payment_method_item, parent, false)

            return PaymentMethodListViewHolder(view)
        }

        override fun getItemCount(): Int {
            return items.size
        }

        override fun onBindViewHolder(holder: PaymentMethodListViewHolder, position: Int) {
            val paymentMethodItem = items[position]
            holder.bind(paymentMethodItem.text)

            holder.itemView.setOnClickListener {
                activity.startActivity(Intent(activity, paymentMethodItem.activityClass))
            }
        }

    }

}
