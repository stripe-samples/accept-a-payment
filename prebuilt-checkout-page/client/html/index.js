// Fetch your Stripe publishable key to initialize Stripe.js
// In practice, you might just hard code the publishable API
// key here.
const {publicKey} = await fetch('/config').then((r) => r.json());
const stripe = Stripe(publicKey);

// When the form is submitted...
var submitBtn = document.querySelector('#submit');
submitBtn.addEventListener('click', async (e) => {
  var inputEl = document.getElementById('quantity-input');
  var quantity = parseInt(inputEl.value);

  // Create the checkout session on the server.
  const {error, sessionId} = await fetch('/create-checkout-session', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      quantity: quantity, // with the quantity
    }),
  }).then((r) => r.json());

  // If the server responds with an error, display that to the user.
  if (error) {
    var displayError = document.getElementById('error-message');
    displayError.textContent = result.error.message;
    return;
  }

  // If the Checkout Session was created successfully on the server,
  // redirect to the Stripe hosted Checkout page.
  const {error: stripeError} = await stripe.redirectToCheckout({
    sessionId: data.sessionId,
  });

  // If the redirect fails, display an error to the user.
  if (stripeError) {
    var displayError = document.getElementById('error-message');
    displayError.textContent = result.error.message;
  }
});

// The max and min number of photos a customer can purchase
var MIN_PHOTOS = 1;
var MAX_PHOTOS = 10;

var quantityInput = document.getElementById('quantity-input');
quantityInput.addEventListener('change', function (e) {
  // Ensure customers only buy between 1 and 10 photos
  if (quantityInput.value < MIN_PHOTOS) {
    quantityInput.value = MIN_PHOTOS;
  }
  if (quantityInput.value > MAX_PHOTOS) {
    quantityInput.value = MAX_PHOTOS;
  }
});

/* Method for changing the product quantity when a customer clicks the increment / decrement buttons */
var addBtn = document.getElementById('add');
var subtractBtn = document.getElementById('subtract');
var updateQuantity = function (evt) {
  if (evt && evt.type === 'keypress' && evt.keyCode !== 13) {
    return;
  }
  var delta = (evt && evt.target.id === 'add' && 1) || -1;

  addBtn.disabled = false;
  subtractBtn.disabled = false;

  // Update number input with new value.
  quantityInput.value = parseInt(quantityInput.value) + delta;

  // Disable the button if the customers hits the max or min
  if (quantityInput.value == MIN_PHOTOS) {
    subtractBtn.disabled = true;
  }
  if (quantityInput.value == MAX_PHOTOS) {
    addBtn.disabled = true;
  }
};

addBtn.addEventListener('click', updateQuantity);
subtractBtn.addEventListener('click', updateQuantity);
