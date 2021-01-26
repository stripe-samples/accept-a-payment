package com.example.app

import android.app.Activity
import android.content.Intent
import android.os.Bundle
import androidx.appcompat.app.AppCompatActivity
import kotlinx.android.synthetic.main.activity_launcher.*

class LauncherActivity : AppCompatActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_launcher)
        launch_checkout_kotlin.setOnClickListener {
            launchActivity(CheckoutActivityKotlin::class.java)
        }
        launch_checkout_java.setOnClickListener {
            launchActivity(CheckoutActivityJava::class.java)
        }
    }

    private fun launchActivity(activityClass: Class<out Activity>) {
        startActivity(Intent(this, activityClass))
    }
}