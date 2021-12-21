package com.example.app

import androidx.test.espresso.Espresso.onView
import androidx.test.espresso.action.ViewActions.click
import androidx.test.espresso.assertion.ViewAssertions.matches
import androidx.test.espresso.matcher.ViewMatchers.isDisplayed
import androidx.test.espresso.matcher.ViewMatchers.withText
import androidx.test.espresso.web.sugar.Web.onWebView
import androidx.test.espresso.web.webdriver.DriverAtoms.findElement
import androidx.test.espresso.web.webdriver.DriverAtoms.webClick
import androidx.test.espresso.web.webdriver.Locator
import androidx.test.ext.junit.rules.ActivityScenarioRule
import androidx.test.ext.junit.runners.AndroidJUnit4
import androidx.test.filters.LargeTest
import org.junit.Before
import org.junit.Rule
import org.junit.Test
import org.junit.runner.RunWith

@RunWith(AndroidJUnit4::class)
@LargeTest
class AlipayActivityTest {

    @get:Rule
    var activityRule: ActivityScenarioRule<LauncherActivity> = ActivityScenarioRule(LauncherActivity::class.java)

    @get:Rule
    val idlingResourceRule: IdlingResourceRule = IdlingResourceRule("AlipayActivity")

    @Before
    fun launchAlipay() {
        onView(withText("Alipay")).perform(click())
        onView(withText("Alipay Activity")).check(matches(isDisplayed()))
    }

    @Test
    fun paymentWithAlipayHappyPath() {
        onView(withText("PAY")).perform(click())
        Thread.sleep(10000)
        onWebView().withElement(findElement(Locator.XPATH, "//*[contains(text(),'Authorize Test Payment')]")).perform(webClick())
        Thread.sleep(10000)
        onView(withText("Payment succeeded")).check(matches(isDisplayed()))

        onView(withText("RESTART DEMO")).perform(click())
        onView(withText("Alipay Activity")).check(matches(isDisplayed()))
    }

    @Test
    fun paymentWithAlipayFailure() {
        onView(withText("PAY")).perform(click())
        Thread.sleep(10000)
        onWebView().withElement(findElement(Locator.XPATH, "//*[contains(text(),'Fail Test Payment')]")).perform(webClick())
        Thread.sleep(10000)
        onView(withText("Payment failed")).check(matches(isDisplayed()))

        onView(withText("OK")).perform(click())
        onView(withText("Alipay Activity")).check(matches(isDisplayed()))
    }
}
