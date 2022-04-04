<script setup>
import { ref, onMounted } from "vue";
import { loadStripe } from "@stripe/stripe-js";

import SrMessages from "./SrMessages.vue";

const isLoading = ref(false);
const messages = ref([]);

let stripe;
let elements;

onMounted(async () => {
  const { publishableKey } = await fetch("/api/config").then((res) => res.json());
  stripe = await loadStripe(publishableKey);

  const { clientSecret, error: backendError } = await fetch("/api/create-payment-intent").then((res) => res.json());

  if (backendError) {
    messages.value.push(backendError.message);
  }
  messages.value.push(`Client secret returned.`);

  elements = stripe.elements({clientSecret});
  const paymentElement = elements.create('payment');
  paymentElement.mount("#payment-element");
  isLoading.value = false;

});

const handleSubmit = async () => {
  if (isLoading.value) {
    return;
  }

  isLoading.value = true;

  const { error } = await stripe.confirmPayment({
    elements,
    confirmParams: {
      return_url: `${window.location.origin}/return`
    }
  });

  if (error.type === "card_error" || error.type === "validation_error") {
    messages.value.push(error.message);
  } else {
    messages.value.push("An unexpected error occured.");
  }

  isLoading.value = false;
}
</script>
<template>
  <main>
    <h1>Payment</h1>

    <p>
      Enable more payment method types
      <a
        href="https://dashboard.stripe.com/settings/payment_methods"
        target="_blank"
      >in your dashboard</a>.
    </p>

    <form
      id="payment-form"
      @submit.prevent="handleSubmit"
    >
      <div id="payment-element" />
      <button
        id="submit"
        :disabled="isLoading"
      >
        Pay now
      </button>
      <sr-messages :messages="messages" />
    </form>
  </main>
</template>
