let checkout;
let actions;
initialize();
const emailInput = document.getElementById("email");
const emailErrors = document.getElementById("email-errors");

const validateEmail = async (email) => {
  const updateResult = await actions.updateEmail(email);
  const isValid = updateResult.type !== "error";

  return { isValid, message: !isValid ? updateResult.error.message : null };
};

document
  .querySelector("#payment-form")
  .addEventListener("submit", handleSubmit);

// Fetches a Checkout Session and captures the client secret
async function initialize() {
  const { publishableKey } = await fetch("/config").then((r) => r.json());
  const stripe = Stripe(publishableKey);

  const promise = fetch("/create-checkout-session", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
  })
    .then((r) => r.json())
    .then((r) => r.clientSecret);

  const appearance = {
  };

  checkout = stripe.initCheckoutElementsSdk({
    clientSecret: promise,
    elementsOptions: { appearance },
  });

  checkout.on('change', (session) => {
    // Handle changes to the checkout session
    document.getElementById('submit').disabled = !session.canConfirm;
  });

  const loadActionsResult = await checkout.loadActions();
  if (loadActionsResult.type === 'success') {
    actions = loadActionsResult.actions;
    const session = loadActionsResult.actions.getSession();
    document.querySelector("#button-text").textContent = `Pay ${
      session.total.total.amount
    } now`;
  } else {
    showMessage("Failed to initialize payment form. Please refresh.");
    document.querySelector("#submit").disabled = true;
    return;
  }

  emailInput.addEventListener("input", () => {
    // Clear any validation errors
    emailErrors.textContent = "";
    emailInput.classList.remove("error");
  });

  emailInput.addEventListener("blur", async () => {
    const newEmail = emailInput.value;
    if (!newEmail) {
      return;
    }

    const { isValid, message } = await validateEmail(newEmail);
    if (!isValid) {
      emailInput.classList.add("error");
      emailErrors.textContent = message;
    }
  });

  const paymentElement = checkout.createPaymentElement();
  paymentElement.mount("#payment-element");
}

async function handleSubmit(e) {
  e.preventDefault();
  setLoading(true);

  const email = document.getElementById("email").value;
  const { isValid, message } = await validateEmail(email);
  if (!isValid) {
    emailInput.classList.add("error");
    emailErrors.textContent = message;
    showMessage(message);
    setLoading(false);
    return;
  }

  const confirmResult = await actions.confirm();

  // This point will only be reached if there is an immediate error when
  // confirming the payment. Otherwise, your customer will be redirected to
  // your `return_url`. For some payment methods like iDEAL, your customer will
  // be redirected to an intermediate site first to authorize the payment, then
  // redirected to the `return_url`.
  if (confirmResult.type === 'error') {
    showMessage(confirmResult.error.message);
  }

  setLoading(false);
}

// ------- UI helpers -------

function showMessage(messageText) {
  const messageContainer = document.querySelector("#payment-message");

  messageContainer.classList.remove("hidden");
  messageContainer.textContent = messageText;

  setTimeout(function () {
    messageContainer.classList.add("hidden");
    messageContainer.textContent = "";
  }, 4000);
}

// Show a spinner on payment submission
function setLoading(isLoading) {
  if (isLoading) {
    // Disable the button and show a spinner
    document.querySelector("#submit").disabled = true;
    document.querySelector("#spinner").classList.remove("hidden");
    document.querySelector("#button-text").classList.add("hidden");
  } else {
    document.querySelector("#submit").disabled = false;
    document.querySelector("#spinner").classList.add("hidden");
    document.querySelector("#button-text").classList.remove("hidden");
  }
}
