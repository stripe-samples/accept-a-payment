<script setup>
import { ref, onMounted } from "vue";
import { loadStripe } from "@stripe/stripe-js";

const isLoading = ref(true);
const message = ref(null);

let stripe;
let elements; 

onMounted(async () => {
  const { publishableKey } = await fetch("/api/config").then((res) => res.json());   
  stripe = await loadStripe(publishableKey);

  const { clientSecret } = await fetch("/api/create-payment-intent").then((res) => res.json());

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
      return_url: `http://localhost:3000/`
    }
  }); 

  if (error.type === "card_error" || error.type === "validation_error") {
    message.value = error.message;
  } else {
    message.value = "An unexpected error occured.";
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
        <span id="button-text">
          <div
            v-if="isLoading"
            id="spinner"
            className="spinner"
          />
          <span v-else>"Pay now"</span>
        </span>
      </button>
      <!--Show any error or success messages -->
      <div
        v-if="message"
        id="payment-message"
      >
        {{ message }}
      </div>
    </form>

    <div
      id="messages"
      role="alert"
      style="display: none"
    />
  </main>
</template>
