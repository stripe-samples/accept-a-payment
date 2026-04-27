let checkout;
let actions;
let emailAlreadySet = false;
initialize();
const emailInput = document.getElementById("email");
const emailErrors = document.getElementById("email-errors");
const emailSection = document.getElementById("email-section");

const validateEmail = async (email) => {
  const updateResult = await actions.updateEmail(email);
  const isValid = updateResult.type !== "error";

  return { isValid, message: !isValid ? updateResult.error.message : null };
};

document
  .querySelector("#payment-form")
  .addEventListener("submit", handleSubmit);

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
    adaptivePricing: { allowed: true },
  });

  checkout.on('change', (session) => {
    document.getElementById('submit').disabled = !session.canConfirm;
  });

  const loadActionsResult = await checkout.loadActions();
  if (loadActionsResult.type === 'success') {
    actions = loadActionsResult.actions;
    const session = loadActionsResult.actions.getSession();
    document.querySelector("#button-text").textContent = `Pay ${
      session.total.total.amount
    } now`;

    // If the session already has a customer email (e.g. from customer_email
    // param on the server), show it as read-only instead of an editable input.
    if (session.email) {
      emailAlreadySet = true;
      emailInput.style.display = "none";
      const readOnly = document.getElementById("email-readonly");
      readOnly.textContent = session.email;
      readOnly.classList.remove("hidden");
    }
  } else {
    showMessage("Failed to initialize payment form. Please refresh.");
    document.querySelector("#submit").disabled = true;
    return;
  }

  emailInput.addEventListener("input", () => {
    emailErrors.textContent = "";
    emailInput.classList.remove("error");
  });

  emailInput.addEventListener("blur", async () => {
    if (emailAlreadySet) return;
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

  const addressElement = checkout.createBillingAddressElement();
  addressElement.mount("#address-element");

  const paymentElement = checkout.createPaymentElement();
  paymentElement.mount("#payment-element");

  const currencySelectorElement = checkout.createCurrencySelectorElement();
  currencySelectorElement.mount("#currency-selector");
}

async function handleSubmit(e) {
  e.preventDefault();
  setLoading(true);

  if (!emailAlreadySet) {
    const email = document.getElementById("email").value;
    const { isValid, message } = await validateEmail(email);
    if (!isValid) {
      emailInput.classList.add("error");
      emailErrors.textContent = message;
      showMessage(message);
      setLoading(false);
      return;
    }
  }

  const confirmResult = await actions.confirm();

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

function setLoading(isLoading) {
  if (isLoading) {
    document.querySelector("#submit").disabled = true;
    document.querySelector("#spinner").classList.remove("hidden");
    document.querySelector("#button-text").classList.add("hidden");
  } else {
    document.querySelector("#submit").disabled = false;
    document.querySelector("#spinner").classList.add("hidden");
    document.querySelector("#button-text").classList.remove("hidden");
  }
}
