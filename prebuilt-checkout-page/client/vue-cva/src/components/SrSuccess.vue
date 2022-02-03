<script setup>
import { reactive, computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';

let session = reactive({});

const currentRoute = computed(() => {
  return useRoute().query;
});

onMounted(async () => {
  const sessionId = currentRoute.value?.session_id;

  const response = await fetch("/api/checkout-session?sessionId=" + sessionId);
  session.value = await response.json();
});
</script>

<template>
  <div class="sr-root">
    <div class="sr-main">
      <header class="sr-header">
        <div class="sr-header__logo" />
      </header>

      <div class="sr-payment-summary completed-view">
        <h1>Your payment succeeded</h1>
        <h4>View CheckoutSession response:</h4>
      </div>
      <div class="sr-section completed-view">
        <div
          v-if="session"
          class="sr-callout"
        >
          <pre>{{ JSON.stringify(session, null, 2) }} </pre>
        </div>
        <button onclick="window.location.href = '/';">
          Restart demo
        </button>
      </div>
    </div>

    <div class="sr-content">
      <div class="pasha-image-stack">
        <img
          src="https://picsum.photos/280/320?random=1"
          width="140"
          height="160"
        >
        <img
          src="https://picsum.photos/280/320?random=2"
          width="140"
          height="160"
        >
        <img
          src="https://picsum.photos/280/320?random=3"
          width="140"
          height="160"
        >
        <img
          src="https://picsum.photos/280/320?random=4"
          width="140"
          height="160"
        >
      </div>
    </div>
  </div>
</template>

<script setup></script>
