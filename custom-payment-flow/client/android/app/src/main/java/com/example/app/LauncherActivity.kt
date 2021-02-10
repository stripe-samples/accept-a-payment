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

class LauncherActivity : AppCompatActivity() {

    private lateinit var recyclerView: RecyclerView

    override fun onCreate(savedInstanceState: Bundle??) {
        super.onCreate(savedInstanceState)

        setContentView(R.layout.activity_launcher)

        recyclerView = findViewById(R.id.recycler_view)
        recyclerView.adapter = PaymentMethodsListAdapter(this)
    }

    private fun launchActivity(activityClass: Class<out Activity>) {
        startActivity(Intent(this, activityClass))
    }

    // Adapter
    class PaymentMethodsListAdapter(private val activity: Activity)
        : RecyclerView.Adapter<PaymentMethodsListAdapter.PaymentMethodListViewHolder>() {

        private val items = listOf(
            PaymentMethodItem(activity.getString(R.string.card_item), CheckoutActivityKotlin::class.java),
            PaymentMethodItem(activity.getString(R.string.alipay_item), CheckoutActivityKotlin::class.java)
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