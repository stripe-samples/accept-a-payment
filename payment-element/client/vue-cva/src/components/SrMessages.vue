<script setup>
import { defineProps, computed, toRef } from 'vue';

const props = defineProps({
  messages: {
    type: Array, 
    required: true
  }  
});

const messagesRef = toRef(props, 'messages'); 

const splitMessages = computed(() => {
  return messagesRef.value.map((x) => {

  const paymentIntentRe = /(pi_(\S*)\b)/
  const paymentIntentMatch = x.match(paymentIntentRe)
    return {
      ...(paymentIntentMatch && {paymentIntent: paymentIntentMatch[0]}),
      content: x.replace(paymentIntentRe, '') || x
    }
  });
})

const addDashboardLinks = (paymentIntent) => {
  return `https://dashboard.stripe.com/test/payments/${paymentIntent}`;
};

</script>
<template>
  <div
    id="messages"
    role="alert"
  >
    <span
      v-for="message in splitMessages"
      :key="message"
    >
      > {{ message.content }}<a
        v-if="message.paymentIntent"
        :href="addDashboardLinks(message.paymentIntent)"
      >{{ message.paymentIntent }}</a>
      <br>
    </span>
  </div>
</template>