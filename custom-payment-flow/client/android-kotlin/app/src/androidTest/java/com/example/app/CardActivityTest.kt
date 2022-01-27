package com.example.app

import androidx.test.espresso.Espresso.onView
import androidx.test.espresso.action.ViewActions.click
import androidx.test.espresso.action.ViewActions.typeText
import androidx.test.espresso.assertion.ViewAssertions.matches
import androidx.test.espresso.matcher.ViewMatchers.isDisplayed
import androidx.test.espresso.matcher.ViewMatchers.withId
import androidx.test.espresso.matcher.ViewMatchers.withSubstring
import androidx.test.espresso.matcher.ViewMatchers.withText
import androidx.test.ext.junit.rules.ActivityScenarioRule
import androidx.test.ext.junit.runners.AndroidJUnit4
import androidx.test.filters.LargeTest
import org.junit.Before
import org.junit.Rule
import org.junit.Test
import org.junit.runner.RunWith

@RunWith(AndroidJUnit4::class)
@LargeTest
class CardActivityTest {

    @get:Rule
    var activityRule: ActivityScenarioRule<LauncherActivity> = ActivityScenarioRule(LauncherActivity::class.java)

    @get:Rule
    val idlingResourceRule: IdlingResourceRule = IdlingResourceRule("CardActivity")

    @Before
    fun launchCard() {
        onView(withText("Card")).perform(click())
        onView(withText("Card Activity")).check(matches(isDisplayed()))
    }

    @Test
    fun paymentWithCardHappyPath() {
        onView(withId(R.id.card_number_edit_text)).perform(typeText("4242424242424242"))
        onView(withId(R.id.expiry_date_edit_text)).perform(typeText("11/29"))
        onView(withId(R.id.cvc_edit_text)).perform(typeText("123"))
        onView(withId(R.id.postal_code_edit_text)).perform(typeText("10000"))

        onView(withText("PAY")).perform(click())
        onView(withText("Completed!")).check(matches(isDisplayed()))

        onView(withText("RESTART DEMO")).perform(click())
        onView(withText("Card Activity")).check(matches(isDisplayed()))
    }

    @Test
    fun paymentWithCardFailure() {
        onView(withId(R.id.card_number_edit_text)).perform(typeText("4000000000000002"))
        onView(withId(R.id.expiry_date_edit_text)).perform(typeText("11/29"))
        onView(withId(R.id.cvc_edit_text)).perform(typeText("123"))
        onView(withId(R.id.postal_code_edit_text)).perform(typeText("10000"))

        onView(withText("PAY")).perform(click())
        onView(withSubstring("Failed:")).check(matches(isDisplayed()))

        onView(withText("RESTART DEMO")).perform(click())
        onView(withText("Card Activity")).check(matches(isDisplayed()))
    }
}
