package com.example.app

internal object BackgroundTaskTracker {
    internal var onStart: () -> Unit = {}
    internal var onStop: () -> Unit = {}

    internal fun reset() {
        onStart = {}
        onStop = {}
    }
}
