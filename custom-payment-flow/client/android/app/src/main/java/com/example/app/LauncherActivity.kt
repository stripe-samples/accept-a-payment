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
import com.stripe.android.Stripe
import androidx.appcompat.app.AlertDialog
import okhttp3.*
import org.json.JSONObject
import java.io.IOException
import java.lang.ref.WeakReference
import android.util.Log

// 10.0.2.2 is the Android emulator's alias to localhost
val BackendUrl = "http://10.0.2.2:4242/"

class LauncherActivity : AppCompatActivity() {

    private lateinit var recyclerView: RecyclerView
    private val httpClient = OkHttpClient()
    private lateinit var publishableKey: String
    lateinit var stripe: Stripe

    override fun onCreate(savedInstanceState: Bundle??) {
        super.onCreate(savedInstanceState)

        setContentView(R.layout.activity_launcher)
        fetchPublishableKey()

        recyclerView = findViewById(R.id.recycler_view)
        recyclerView.adapter = PaymentMethodsListAdapter(this)
    }

    private fun displayAlert(
        activity: Activity,
        title: String,
        message: String
    ) {
        runOnUiThread {
            val builder = AlertDialog.Builder(activity)
                .setTitle(title)
                .setMessage(message)

            builder.setPositiveButton("Ok", null)
            builder
                .create()
                .show()
        }
    }

    private fun fetchPublishableKey() {
        val weakActivity = WeakReference<Activity>(this)

        val request = Request.Builder()
            .url(BackendUrl + "config")
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
                    } else {
                        val responseData = response.body?.string()
                        val responseJson =
                            responseData?.let { JSONObject(it) } ?: JSONObject()
                        // For added security, our sample app gets the publishable key
                        // from the server.
                        publishableKey = responseJson.getString("publishableKey")
                        Log.d("Ali publishablekey", publishableKey)

                        // Configure the SDK with your Stripe publishable key so that it can make
                        // requests to the Stripe API
                        stripe = Stripe(applicationContext, publishableKey)
                    }
                }
            })
    }

    // Adapter
    class PaymentMethodsListAdapter(private val activity: Activity)
        : RecyclerView.Adapter<PaymentMethodsListAdapter.PaymentMethodListViewHolder>() {

        private val items = listOf(
            PaymentMethodItem(activity.getString(R.string.card_item), CardActivity::class.java),
            PaymentMethodItem(activity.getString(R.string.alipay_item), CardActivity::class.java)
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