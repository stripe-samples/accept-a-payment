# Video tutorials

You can watch videos to see how to implement many of the payment method types included in this sample.

### HTML + JavaScript videos

- [acss](https://youtu.be/KWhynzGP5bw)
- [apple-pay](https://youtu.be/5KcdQboA7Gc)
- [alipay](https://youtu.be/0Dp0BwIOROA)
- [card](https://youtu.be/0oHjwz-WHcc)
- [google-pay](https://youtu.be/GERlC3PxKgY)
- [oxxo](https://youtu.be/8ezSzH8jnY4)

### React videos

- [acss](https://youtu.be/EwH4B3M0-bk)
- [apple-pay](https://youtu.be/bMCsJfJyQKA)
- [card](https://youtu.be/IhvtIbfDZJI)
- [oxxo](https://youtu.be/zmNMMBbYFf0)

### iOS videos

- [alipay](https://youtu.be/1BI8wB6QwQA)
- [card](https://youtu.be/8sXgvDWVsuI)


### Android videos

- [alipay](https://youtu.be/bwS5w4vD05k)
- [card](https://youtu.be/fhgqeeQczOc)


---

# HTML + JavaScript video transcripts

## Apple Pay

CJ Avilla (00:00):
In this episode, you'll learn how to implement the front end with HTML and JavaScript to accept a one-time Apple Pay payment with a custom form. So if you're interested in a faster integration path for accepting payments, head over to the checkout playlist in the Stripe developers channel as Stripe Checkout supports Apple Pay out of the box. Let's say that you already have a backend set up for creating payment intents, and you want to add support for accepting the Apple Pay payment method on the front end. Now, if you haven't already implemented a backend, you can head over and take a look at one of those server implementations in one of the officially supported server languages. Also, before we get too far, if you're using React or iOS or Android, we have videos specific to those clients linked in the description. So head over and check those out.

CJ Avilla (00:43):
So we have a backend, it's already up and running here. It has two end points. One is at slash config for fetching our publishable key and the other is at create payment intent. And that accepts a payment method type, which is card, and then a currency. So this combo of payment method type and currency allows us to create a new payment intent on the server, which is going to return just its client secret property. So we're going to use this client secret to confirm the payment intent on the client. Now note that for Apple Pay and Google Pay and wallets that are similar to this, we're going to use the payment method type "Card", and that'll allow us to confirm the card payment on the client using one of these mobile wallets.

CJ Avilla (01:22):
All right, so let's take a look at what we've already got set up here. So we have an index.html file that has some very simple HTML. Right now it's a single link to applepay.html. So let's go implement applepay.html and looking in here, we'll see that it's just a very basic HTML page. It's already importing Stripe JS from js.stripe.com and it imports a little utility function, which enables us to just log some messages into this messages div here. And then we have just a simple header and some links. So the very first thing we need to do when collecting any payment request type wallet payment like Apple Pay is to add a button to our HTML page.

CJ Avilla (02:03):
So I can do that with a simple div here that has the ID payment request button. And when we mount our payment request object or that element, it's going to be mounted into this div. All right. The next thing I want to do is just create another script here that's going to go to applepay.js and we'll go implement all of that from scratch here in applepay.js. So this is going to be the meat and potatoes for today's episode. We're going to create a wrapper so that all of our code only runs when the page finally loads. And we'll initialize an instance of Stripe with our publishable key. So next we're going to create the button element that is going to display that Apple Pay button to our customers. The very first thing that we need to do here is to create a payment request object. So we can say const payment request is equal to stripe.paymentRequest, which takes in an object with a bunch of arguments.

CJ Avilla (03:03):
So we're going to pass the currency which is USD. We're going to pass the country. It is recommended that you request the payers names. We're going to say request payer name, true, and request payer email is true. And then now we get to configure what is actually shown on the payment sheet that pops up when someone clicks on Apple Pay. So we can pass in the total here as an object that contains the label and an amount. In Safari, stripe.paymentRequest here is going to use Apple Pay. But in all other browsers, it's just going to use the underlying payment request API. This payment request object allows us to configure what the customer is going to see when they're going through that payment flow. Now we'll create a new payment request element with Stripe elements. We'll say const elements is equal to Stripe.elements.

CJ Avilla (03:58):
And then we're going to say, const PR button is equal to elements that create payment request button, which takes in reference to this payment request object. So we're going to say this payment request is what we want to use with this payment request button. So payment request objects expose a method called canMakePayment, which returns a promise that will resolve with an argument, letting us know whether or not we're allowed or able to make a payment using a mobile wallet like Apple Pay or Google Pay. So here we're going to get a result. And if there's a result, then we can display or mount the element. Otherwise, we want to hide the button.

CJ Avilla (04:56):
In the case that we're mounting the element, we can say prButton.mount, and then pass in the CSS selector that points at that div that we created earlier. So this payment request button, the div with ID payment-request-button is what we will use as our CSS selector for where to mount this PR button element that we just created. And then otherwise we want to just hide that button. So we'll say document.getElementById pass in that same string. Payment request button that style that display is none.

CJ Avilla (05:43):
This payment request object will admit several events. We can say paymentrequest.on, and then pass in payment method. All one word, all lower case. And this will emit an event when a new payment method has been added with the payment flow, like through the payment flow. So when someone successfully goes through the payment flow with Apple Pay, we would like this event to fire inside of which we will eventually create a payment intent on the server, and then confirm the payment on the client.

CJ Avilla (06:22):
For now we'll just console.log this event object. Okay. All right, let's see what we've got going on. So if we reload our... Or if we open up a browser, we open up Safari and go to local host four, two, four, two. This is our index page. And when we open up Apple Pay, we don't see any content here. And that's because the Apple Pay button is not yet available on this page. We're not seeing anything mounted. That button was hidden. So let's add a little bit of debugging here that says, if we were not able to make a payment with Apple Pay. Let's add a message that just says like Apple Pay is unavailable so that we have a little bit of logging here.

CJ Avilla (07:16):
Okay. It doesn't look like our logging is working. So let's right click and say inspect. And we see an error message here that says that there's an unhandled rejection that says the currency should be one of all of these. And we specified USD, all caps. So let's make this lower case and then refresh the page. And now we see our messages printed that says Apple Pay is unavailable. So that's good. We're making some progress here. Now, how do we actually test that Apple Pay is available? So in order to experiment with Apple Pay and test mode, a number of things need to be true. Number one, we have to be testing with HTTPS, right now this is not a secure connection. We're just using HTTP two local host four, two, four, two. Number two, we have to be testing in Safari and we have to have a saved card in Safari.

CJ Avilla (08:05):
I have some saved payment details in here, but that's a step that you'll need to think about whether or not you have card details already set up in Safari. Generally, we need to have a domain that's actually registered with Apple Pay in order for this to work. And so we can't really register a local host. So instead we're going to use a workaround ngrok. However, depending on your setup, you may have to deploy to some staging environment and then use the domain for the staging environment. But we do need a public facing domain in order to register that with Apple Pay. So let's first set up ngrok to set up a tunnel that will allow public connections into our local server. So we can use ngrok here. I've set it up with brew with homebrew. So you can head over to the documentation linked in the description for more info about how to set up ngrok, what we're going to say ngrok HDP four, two, four, which will start a ngrok tunnel to our local server.

CJ Avilla (09:02):
So notice that it will give you both HTTP and HTTPS URL's. If you'd like to load those, we're going to use HTTPS, which will check one of our boxes for the requirements for using Apple Pay. So now instead of using local host here, I'm going to just use our new ngrok domain. And that allows us to pull up the Apple Pay page here, and you can still see that Apple Pay is unavailable because we have a couple other steps that we need to take. So the next step is that we need to register our Apple Pay domain. So let's go over to the Stripe dashboard. All right, now that we're logged into the dashboard. We want to add that ngrok domain directly to this Apple Pay domain, web domain settings. So we going to say add domain and we can drop in that ngrok domain. That is the first step here.

CJ Avilla (09:50):
The second step is to download a verification file. So we'll click download verification file. That's going to end up in my downloads. And then we want to host that verification file at that domain slash dot well-known slash, and then the name of the verification file. So in our case, our front end assets are served statically from that slash client directory. So we need to create a new directory called dot well-known, and we need to copy this domain verification file that we just downloaded into that directory so that it's hosted as expected. So let's open up here and go to our client directory and add a new dot well known directory. And in the well-known directory, we're going to move them the Apple developer merchant ID domain association file into that client well-known directory. And then we're going to say add, and this will verify, this will register our Apple Pay domain and verify it so that when we come back to our browser and refresh, we see this big, beautiful Apple Pay button.

CJ Avilla (10:50):
So now we're serving over HTTPS. We have a registered and verified Apple Pay domain. We have some test card details that are entered into Safari, which is the browser that we're testing. The next step that we need to take is to actually handle the event where this payment request UI will yield a payment method ID. So let's head back over to our code and open back up Apple Pay.js and continue on with this payment request event handle here. So step one, create a payment intent on the server. So we're going to make a post request to our servers, create payment intent end point. And that will return a JSON object that has a client secret property that we want to extract. And we need to pass the payment method type as card and the currency as USD back to our backend so that when we're creating this new payment intent, we know that it is confirmable with card payment methods and that it uses the USD currency.

CJ Avilla (11:57):
Next, we need to confirm that card payment on the client so we can call Stripe confirm card payment and passing that client secret that we just got back from the server. And a second argument here is going to be a payment method. And the payment method is actually going to be an ID of a payment method that's on the event object yielded to us with the payment request API. So this E event object is going to have a payment method property that will have the data about that payment method. It'll have its ID. Next we want to say handle actions false. This is a third argument to confirm card payment. And we're saying, don't handle any next actions like presenting the modal or redirecting to maybe the bank's page that requires some one-time password. So confirm card payment is going to open modals if there's 3D Secure required, and it'll handle secure customer authentication, things like that.

CJ Avilla (12:58):
We don't want that to happen while the payment sheet is open for Apple Pay. So we want to say handle actions false for this first attempt to confirm the card payment. So we're going to say... So this confirmed card payment method returns a promise that we can await. And what if the promise will resolve with either an error or a payment intent object. Okay. So if we get an error or if we receive an error from the confirm card payment method. So if error, then we want to tell the payment sheet that there was some sort of failure. So we can say E dot complete and passing fail, and that will fail the payment flow. And it'll either keep the payment sheet open or it'll show an error. So we can say return. Otherwise, if there was a payment intent and its status was requires action, then we want to call confirm card payment again with that same client secret.

CJ Avilla (14:08):
So that if there were any modals that needed to be opened or redirects that need to happen, those can happen. So we'll say Striped dot confirm card payment again, passing in the client secret. And before we call that, we actually do want to call E dot complete success here. This will close the payment sheet until Apple Pay that the payment was successful. Let's add just a little bit of logging. So we'll say add message, client secret returned, and we'll add a message here that says payment failed. And we'll add a message down here that says payment succeeded, and we can just put in the ID of the payment intent.

CJ Avilla (15:12):
All right. So we're going to click on this big Apple Pay button. We see the sheet open, we see processing and we were prompted to pay with touch ID. So on the touch bar I'm seeing touch ID to pay demo $19,99. If I click, or if I authenticate with my fingerprint, I see processing payment. And then the payment method is yielded from that on payment method event type. And we can see that the payment succeeded. So this is awesome. We see that the payment was actually successful. And if we click on this link or copy this ID and visit that in our Stripe dashboard, we can see more details about this payment. We see that it succeeded, which payment method type it used, and a few more details here. All right. So in review, we added a little bit of HTML here to create a payment request button.

CJ Avilla (16:05):
Then we created a brand new JavaScript file called Apple Pay dot JS, where we said when the Dom is ready, initialize a new instance of Stripe, create a payment request object, and create an instance of a payment request button element that we are going to then mount onto the page. If the payment requests can make a payment. And then when a payment method is yielded from the payment request object, we're going to make a post request to the backend, passing in our card and currency in order to create a new payment intent which we're then going to confirm client side here using confirm card payment. Then if there's some sort of failure, we're going to tell the payment sheet that it failed.

CJ Avilla (16:51):
Otherwise, we're going to say that it was successful and we're going to check and see if the payment intent status requires action. Then we're going to attempt to rerun the confirmed card payment logic with that same client secret that we had from the server which will resolve any front end next steps that are required. You're now fully equipped to build a custom payment flow to accept a one-time Apple Pay payment with Stripe. You can head over and watch some other videos in this playlist to see how to accept different types of payment methods. As always, if you have any feedback, please let us know by completing that feedback form linked in the description. Thanks so much. And we'll see you next time.

## Alipay

Thorsten Schaeff (00:00):
Alipay is a popular mobile wallet payment method, used by customers in China. On the web, you can use Stripe JS to redirect your customer to an Alipay page that when they visit it on their phone will automatically open the Alipay app. And if they visit it on a desktop device, the page will show a QR code that the customer can scan with their Alipay app to approve the payment.

Thorsten Schaeff (00:27):
So, to get started, I have a simple webpage here just with a title and a little form to collect the customer's name and a pay button here.

Thorsten Schaeff (00:38):
So, this is just a simple HTML five file here. We're loading a style sheet. We're loading a Stripe JS from stripe.com. We have some utility JavaScript, and then we have our Alipay JavaScript file. And here you can see just our form with the one input field and the button here. And then lastly, we have a little div container also to display some messages.

Thorsten Schaeff (01:10):
So in our Alipay JS file, the first thing we're doing is we're fetching the Stripe publishable key from our web server. So for that to work, we will need to start up our web server here. I'm using the notes server and you can see it as now running on local host four, two, four, two.

Thorsten Schaeff (01:33):
If you want to learn how you initialize Stripe JS in an HTML page and load the publisher key from your server, you can watch the videos that are linked in the description below. So, here we're just fetching our conflict route and we will get back a publishable key. And then we're just initializing Stripe JS with our publishable key.

Thorsten Schaeff (01:58):
Next, we get a reference to our payment form and we just attach a submit event listener, but here in our case, we don't actually want to submit the page, so we say event prevent default. And so now what we actually need to do is make a call to our service backend, to create a payment intent and get the client secret to then redirect off to the Alipay payment page.

Thorsten Schaeff (02:28):
So, let's do a fetch here.

Thorsten Schaeff (02:32):
So, our route is creates payment intent, and then we will need to paste some headers. So, we need to send this as a post request to our web server. We then need some headers. Specifically, we need the content type header, and we need to set it as an application json, and then we also need to paste some data, so, we just stringify a json object here and set that as our body.

Thorsten Schaeff (03:30):
And so we need to specify our currency. I'm just running on a US Stripe account here, so I'm just going to use a USD for this. And then, we also need to paste the payment method type, so that our backend can create a payment intent for Alipay usage.

Thorsten Schaeff (03:56):
And then lastly, we need to transform our response into json. And so when this resolves, we will get some values back that we can destructure, we get a response back that we can destructure here. First of all, we get an error. Let's rename that to backend error. And then if things were successful, we get a client secret.

Thorsten Schaeff (04:35):
Great. So, now we are fetching our client secret here. And so once we have the client secret, first of all, let's actually make sure that we don't have a backend error. So, if we have a backend error, we then just add a message and that is a helper function from our util JavaScript. And we just say backenderror.message. And then also, if there was an error, we actually want to abort our function here. But otherwise we add a little message to say that we have our client secret. And now we can actually go on and redirect off to the Alipay payment page.

Thorsten Schaeff (05:42):
So let's actually first get our name from the input. So let's say, [inaudible 00:05:56] and our name input has the ID name. And then, what we now want to do is we want to confirm the payment intent, and that's what we do with our client secret. And then this will send us over to the Alipay page.

Thorsten Schaeff (06:25):
So let's go ahead and call Stripe. And we have a method on Stripe, that's called confirm Alipay payment. And here, we will need to paste in a couple of things. First of all, we need to paste in our client secret from above, and then we can paste in some options. And so we paste in here, the payment methods, billing details, so that's where we can set our name.

Thorsten Schaeff (07:08):
So here is the name and we get the name from our input above, and then we also need to provide a return URL. So confirm Alipay payment when successful will actually redirect off to the Alipay page. And so what we can do here is, let's just get our origin from the page where we are at the moment, and then we return to Alipay return.HTML, where we then check if the payment intent was successful.

Thorsten Schaeff (08:04):
And so here we get also an error. We can maybe name that the Stripe error. So if there was an error, then we want to also check this. So we say, if there was a Stripe error, then we add a message, so stripeerror.message. And otherwise we will actually be redirected off to our page. So maybe let's just say add message redirecting to Alipay.

Thorsten Schaeff (08:50):
Great.

Thorsten Schaeff (08:50):
Let's give that a save and go back to our page. And now when we hit the pay button, we get the client secret was returned, and now we're actually being redirected to Alipay.

Thorsten Schaeff (09:06):
So we're running here in test mode. So we actually see a Stripe hosted test mode page, but that's kind of all what we need for validating that our page is actually working. We see here, the payment is for $19.99 US dollar with Alipay, and then we can simulate the test payment success and failure of states. So let's authorize the payment here and we get back to our Alipay return and you can see here the payment intent ID and the client secret are upended as well as the redirect status. And so, we can quickly look into our Alipay return JS.

Thorsten Schaeff (09:54):
So here, what we're doing is just again, we're fetching the publishable key and then using the client, the payment intent client secret from our URL. We can then use Stripe JS to retrieve the payment intent with the client secret.

Thorsten Schaeff (10:11):
And that's what we're doing here, where then checking the payment intent status for the payment intent ID. And so that's exactly the message you've seen here, the payment succeeded, and then that will actually link you to your Stripe dashboard.

Thorsten Schaeff (10:26):
Great. That's it. That's all you need to start accepting Alipay payments from your customers in China. Go ahead and watch some of the other videos that we have. For example, some of the actions that you need to take after a successful payment, like listening and handling web box. Thanks for tuning in and see you soon.

## Card

CJ Avilla (00:01):
In this episode, you'll learn how to implement the front end with HTML and JavaScript to accept a one-time payment with a custom form. If you're interested in a faster integration path for accepting card payments, head over to the checkout playlist in the Stripe developers channel. Let's say you've already got a back end set up to create paymentIntents, and you want to add support for accepting the card payment method on the front end. If you haven't already implemented the back end, head over and take a look at one of the server implementations. Link those in the description. If you're using React, iOS or Android, we have videos specific to those clients linked in the description.

CJ Avilla (00:35):
So our back end is up and running. It has two endpoints that we'll interact with today. One is /config for fetching publishable keys, and one is /create-payment-intent, which takes the payment method type and a currency as arguments and it returns a clientSecret for a payment intent that we can use to confirm payment on the front end.

CJ Avilla (00:56):
Let's open index.html in the client directory and get to work. So we're going to rename the page to accept a payment. And before we write any JavaScript, the page needs a form element where customers can enter their payment details. So technically you can just collect the card details, but we'll also want to collect the customer's name and email to pass along with the billing detail. So I'm pre-populating the values here so that we don't have to fill them out every time we test out the form.

CJ Avilla (01:23):
Next, we want to create an input control where customers can enter their card details. The simplest way to do so is with a single div where we'll mount the single line card-element. Now, if you'd like, you can also separate out the card number, expiration, CVC, and postal code into individual inputs. We'll also add a simple div below our form for debugging and so that we can see some log messages without needing to open up the console.

CJ Avilla (01:52):
We're almost ready to jump into JavaScript. So let's install Stripe.js. And Stripe.js should always be loaded directly from js.stripe.com. And it is a best practice to load it on every page.

CJ Avilla (02:05):
Okay. So next, we're going to add a reference to card.js to pull in the JavaScript that we're going to write and to handle the form submission. So refreshing the browser we'll see the name and email inputs, but no card input to be seen. That's because we need to create and mount that card-element. So from card.js, let's do some setup. I'm going to drop in this little helper function for logging to that messages div. This is purely for demonstration. We grab reference the div, set it's display, and then we add some inner HTML with the string of the message. We're also going to console log here so that we have a couple of chances to see this message.

CJ Avilla (02:39):
All right, time for the meat and potatoes of today's demo. So we're going to start with a wrapper so that our code only runs when the DOM is fully loaded, then we'll initialize Stripe. This Stripe Constructor function comes from Stripe.js that we just installed earlier, and it expects the publishable key as the first argument as a string. You can find your API keys in the Stripe dashboard.

CJ Avilla (03:01):
Next we'll create the one-line card-element and mount it inside of the div we created earlier that has the ID card-element. Now at this point, when we refresh the page, we'll see that our form has loaded and our card input is waiting for some of those juicy card details. And when the form is submitted, we'll hit the back end to create a paymentIntent and then confirm it on the front end. So let's walk through that.

CJ Avilla (03:24):
We prevent the default so that the browser doesn't reload and make a full post request to the back end. Then we're going to make an AJAX call to our server to create the paymentIntent and we'll store the result here in this clientSecret variable. So there are several libraries and packages that help with making AJAX requests. You might be using jQuery or Axios or dollar HTTP from angular or similar. In this case, we're using the browser's native Fitch API to avoid any dependencies.

CJ Avilla (03:52):
Here, we specify the currency and the payment method type. Technically you could attempt to derive the currency based on the customer's location or locale or something fancy, but for now, we're just going to hard-code it. Now in this demo, we're showing how to accept card payments, but in other videos in this series, you'll see how to accept other payment method types like Alipay or SEPA Direct Debit, or Ideal or Shiro pay, and more. Also worth mentioning that you could technically hard-code a list of supported payment method types on the back end, but our server expects that we're going to pass this payment method type in currency so that we can demonstrate the widest variety of payment method type and currency combinations.

CJ Avilla (04:31):
All right, let's add a little bit of logging here. Cool. So now that we have the clientSecret for the paymentIntent, we can confirm that. So we're going to call confirmCardPayment, which expects the clientSecret from the paymentIntent earlier, and an options block with reference to a payment method. Now, if your customer has already provided a payment method, you can pass the string value for that payment method ID here instead of an object, but we're going to pass an object and we're passing reference to that card-element. Note this is the same card-element reference from the one we created above and is the one that's managing that card input control we see on the form. So in addition to the card details, we'll also pass the name and email as billing details that will be assigned to the payment method that's going to be created.

CJ Avilla (05:16):
So this confirmed card payment method does a ton of heavy lifting for us. It's going to send a client side request with the raw card details directly to the Stripe API to confirm the paymentIntent, and it will both create a payment method, also known as tokenizing and it'll attempt to confirm. So if the paymentIntent wasn't able to confirm because it requires next actions, this is the case with secure customer authentication, then Stripe.js will open a modal or redirect to handle any of those next steps for the payment.

CJ Avilla (05:47):
Finally, confirm card payment will resolve either a paymentIntent object or an error. All right, so let's take this for a spin. We're going to enter the 4242 test card and a future expiration and any CVC and any postal code and hit pay. All right. Success. So we see the payment succeeded in the ID of the paymentIntent. Let's copy that and take a look at the payment in the Stripe dashboard.

CJ Avilla (06:09):
So here we see the payment method that was used and a few more details about the payment. From the Stripe documentation we can head over and copy another test card. So this one that ends in 3178, will both open the SCA challenge modal, and it will fail the test payment for insufficient funds. So let's give it a try. We see the SCA test modal and no status message was actually printed, but that's because we don't actually have any error handling yet. So it's time, I guess, to clean this up, make this code a little bit more flexible and robust.

CJ Avilla (06:44):
So let's add some error handling to both our AJAX call for creating the paymentIntent and for the confirmation step. So the json returned from our server and the json returned from Stripe will follow the same pattern in a failure case. So a json object with the top level error key pointing at some sub hash or sub object with a message, a string message that we can display to the user. Because both APIs respond with an object called error, we'll use an alias when de-structuring the response. So we'll pull the error responses off and add some basic logging if there's a failure from either the call to confirm the payment or the call to our back end to create the paymentIntent. Now, if we try the card with insufficient funds, we'll see that the error is printed and it tells us that our card does not have enough funds to make this purchase.

CJ Avilla (07:30):
One last bit of cleanup, let's load the publishable key from the server with an AJAX call and use that to initialize Stripe. Run a real quick smoke test to confirm that we're good to go, this time with an SCA test card that will succeed after the SCA challenge and... Excellent. Again, we're seeing succeeded.

CJ Avilla (07:50):
So in review, we first created an HTML form for users to enter some billing details and card information. Next we initialized Stripe created and mounted in element. Then we added a form handler to create this paymentIntent, where we passed in the currency and the payment method type to the server. And then finally we confirmed that paymentIntent client side with Stripe.js using the clientSecret from the paymentIntent.

CJ Avilla (08:15):
You're now fully equipped to build a custom payment flow, to accept a one-time card payment with Stripe. Head over and watch the other videos in the playlist to see how to accept different types of payment methods, and as always, if you have any feedback, please let us know by completing that form linked in the description. Thanks so much and we'll see you next time.


# React video transcripts

## Apple Pay

CJ Avilla (00:00):
In this episode, you'll learn how to implement the front end with React, to accept a one-time Apple Pay payment with a custom form. If you're interested in a faster integration for accepting payments, head over to the checkout playlist in the Stripe developers channel as Stripe checkout does support Apple Pay out of the box. So let's say you've already got a backend set up and it's creating payment intents for you. And you want to add support for accepting the Apple Pay payment method on the front end. So if you haven't already implemented a backend, you want to head over to check out one of the server implementations. We have episodes in all the officially supported server-side side languages. Also, before we get too far, if you're using Vanilla JS or iOS or Android, we have videos specific to those clients. Those will also be linked in the description.

CJ Avilla (00:45):
So we've already got our backend up and running. It has two end points that we're going to interact with today. One is /config and the other is create-payment-intent. Now the create-payment-intend end point expects a payment method type, we're going to pass in card. And it also expects a currency. The card payment method type works with these mobile wallets like Google Pay and Apple Pay. And you'll notice that the response we get here is a JSON object that has a client secret property for the payment intent that we intend to confirm with a payment method returned from Apple Pay. So we're going to do that today. So we have a server, the server's already up and running in our client directory here. We can start up our client with npm start. This is going to be the React client. This is based on Create React App.

CJ Avilla (01:33):
So we have a new React client started. I'm using Safari here on the right side sides that we can see Apple Pay. And when we refresh the page here, we see that we're going to accept a payment. And we have a link here to Apple Pay, which isn't actually implemented yet. So let's jump in and take a little tour of what code we have written already. So in our source directory, we have an app.js which is just rendering some routes for components that are rendered on different pages. And then we have an index.js file here that is wrapping our app component in an elements provider. And we talk about how to go from zero to one with a React client using the React Stripe JS library in another episode. So, that's another one that you might want to check out, is going from zero to one with React Stripe JS.

CJ Avilla (02:25):
Okay. So from App.js, the first thing we want to do here is import a new Apple Pay component from ./ApplePay. And this is something we're going to go implement now. So Apple Pay, and we're going to just create a new route here for /ApplePay that will allow us to go to our Apple Pay component. So we're going to say Apple Pay. This is just going to demonstrate the Apple Pay payment method. All right. So we've, we've got a failure here saying that we don't have an ApplePay.js file. And that's correct. So, here we're going to say, this is just going to be a functional react components. We're going to import React from React.

CJ Avilla (03:07):
We're going to say, it's not going to take any props for now. Okay. We're going to use with routers so that if we want to, we can redirect from this route and that should work fine. And that with router comes from React Router DOM. Okay. And for now we'll just return a very simple HTML page here. That's going to have a header tag and we'll just say that's Apple Pay and then let's see if we can render. All right. So we've got stuff showing up on the page. We've got our Apple Pay component rendering. The next thing I wanted to do was import this status messages helper. It's a very simple div that just loops over a list of messages and displays a link or displays the status message in a helpful format. So we're going to say import status messages and use messages from ./StatusMessages. We'll drop that at the bottom here. Set up this hook.

CJ Avilla (04:33):
So this is just going to give us a way to render some messages to the page. Next let's set up an instance of a payment request object. So we can say const pr is equal to Stripe.paymentRequest and call this method, passing in an object that's going to configure what the customer sees when the Apple Pay dialogue opens, here we need to pass the currency. This is going to be all lower case currency. So USD and then a country will pass in US. We also want to say things like what we want to request from Apple Pay. When this dialogue opens, we want to say request payer email is true and request payer name is true. And then we also want to pass in a total which contains sort of the line items that will be displayed or the final line item that's going to be displayed in the payment sheet that opens up.

CJ Avilla (05:30):
So we'll give this a label, we'll just say demo payment and an amount which will be 1999. And so we've created this payment request object, but you'll see the error that we have over here is saying that Stripe is not defined. So there are a couple of hooks that are available from React Stripe JS. We're going to say import useStripe and useElements from @ Stripe/React-stripe-js. And at the top, we can say const Strip= useStripe. And we can also set up elements the same way. Now, the useStripe hook and useElements hooks work by wrapping the component, the child component in that elements provider that we'd looked at in index.js. So here recall that we looked at this elements provider, which has given a Stripe promise or an instance of Stripe. And so by wrapping our app component in this elements provider, we can use the useStripe in the useElements hooks in order to access those.

CJ Avilla (06:38):
Now, the issue that we're running into now is that when the page first renders, when this component executes and the page first renders Stripe is not actually available yet because that's going to load asynchronously. So we actually need to create our payment request inside of a useEffect hook. So we're going to say useEffect. We're going to pull that in from React and say, useEffect is going to just execute this function here. And then the dependencies that we're going to pass in is Stripe. We're also going to pass in elements and this add message helper so that if any of those change, we can rerun the use of fact hook. Okay. So now we're still seeing that null, that Stripe is null and it's not evaluating to an instance of payment requests. So, we want to say, if there's no Stripe or there's no elements, then we want to return early.

CJ Avilla (07:35):
Otherwise, we'll construct this instance of the payment request and continue forward. Okay, so our page is now rendering again, and we should be successfully creating a new instance of a payment request object. Now, each of these payment requests, objects expose a method can make payments. We can say pr.canMakePayment. Now this is a function that checks to see whether or not we're able to use the underlying payment request API or the Apple Pay API. So in Safari, this is going to use the Apple Pay API. But in other browsers, it'll just use the built-in payment request API. This returns a promise that resolves with an object that will have properties on it. Like Apple Pays true, or Google Pays true or false. So we can actually just check to see if there is an object. If we actually got an object back, then we want to show the button. If we got no back then we don't want to show the button. So in this case, we're going to say, if result, then we want to show some button on the page.

CJ Avilla (08:42):
However, because we want to render that down here inside of our JSX that's being rendered. We want to use another useState hook so that we can keep track of this payment request, object useState, and we'll say payment request, set payment request is useState, and we'll start it off with null. And if there's a result and we want to say set payment request to this instance of the payment request that we just created here. So it's a pr, so now we should be able to say, inside of our JSX down here, we can say, if there's a payment request, then render a new payment request button element, and this is available through React Stripe JS. So we're going to import that from React Stripe JS, we're going to say payment request button element, and the payment request button element. Ah, we are missing a closing curly brace there.

CJ Avilla (09:58):
Okay. So the payment request button element requires some options that we have to pass in. So we're going to pass options. And at a minimum, we need to pass the instance of the payment request object. So we're going to say payment request. So now we should be rendering the payment request button element if we can make a payment. Now, if we cannot make a payment, then we are not going to show the page because this payment request object will not be, it'll be null because we won't have set the payment request in our state for the component. Okay? So at this point, our code is ready to test and we don't see any payment requests button. We don't see the Apple Pay button here. And you might be wondering why, well, there's a couple of prerequisites that we need to ensure before we'll be able to even test this locally.

CJ Avilla (10:53):
So, number one, we have to have an Apple Pay domain registered with Stripe. It has to be set up and registered inside of Stripe. Number two, the page needs to be hosted on HTTPS. So generally when we're running stuff on local host, it's not HTTPS. And number three, we need to actually have some cards set up in our Apple Pay wallet. So in order to test this, you either need to deploy it to some staging environment, which has a public domain, or you need to use some tunneling software, like in ngrok that will provide a public domain for you. So today we're going to set up ngrok to proxy our requests, and that will give us an ngrok domain that we can register as an Apple Pay domain for testing. It will also give us a HTTPS route that we can use so that our page is being served over, over HTTPS.

CJ Avilla (11:41):
So in this second, actually, let's create another terminal tab here. Now you can install ngrok with Homebrew. You can also download ngrok directly from their website and run it. Here I can run ngrok HTTP. And then typically you just give it the port that you want to run this on. And we're running our React client on port 3000. We're running our server on port 4242. One of the things that we need to do in addition to just passing the port like this is to tell ngrok we want to rewrite the host header. So we're going to pass --host-header=rewrite, which will alternatively, you could turn off the domain checking as part of our React client. So this will fire up ngrok and create a tunnel. And now I have this publicly available domain that we can hit from the outside world.

CJ Avilla (12:35):
And that also gives us this HTTPS version of this domain. So we can paste that in to Safari here, and we can see the requests that are firing for that domain. All right. So now we see that on the ngrok domain, our page has loaded. We can click on Apple Pay. This will show us our Apple Pay page. The button is still not rendering though, because we need to register this domain with Apple Pay. So we need to register this domain as an Apple Pay domain, which we can do through the Stripe dashboard. So we're going to open up the Stripe dashboard, go to dashboard.stripe.com. On the left side if you click settings and then go to payment methods and then eligible and configure your Apple Pay payment settings, you'll notice that I don't have any web domain set up.

CJ Avilla (13:27):
So I'm going to say, add a new domain. Now there's three steps here. We need to paste in the ngrok domain, we need to download the verification file. This is going to download a file that's called Apple developer merchant ID domain Association. And we need to place that into, or serve it from a directory that starts with a .well-known. So we need to create a new directory .well-known and then add this file that we just downloaded to that directory. So we can do that now, if we want to do this before we click add so that the, the verification happens later. So we're going to go back to our code here now on the React client in the public directory, these assets are served statically, so we can create a new directory, create a new directory called .well-known.

CJ Avilla (14:13):
And in that well-known directory is where we want to copy that domain association file. So I'm going to say copy from downloads, Apple Pay developer. Okay. So then we're going to copy that into client .well-known client/public.well-known/ Okay, so at this point, we should be able to visit this URL and confirm that this has, so that downloaded the file again. So this should, this should work fine. I believe. So we're going to click add, and this will run the verification process. And so now this domain is a registered and verified Apple Pay domain. All right. Let's head back to our test here and refresh the page.

CJ Avilla (14:59):
All right. That's awesome. Okay, excellent. So now we can see this giant beautiful Apple Pay button, but we're not ready yet to necessarily click it or go through the process. So the next thing we want to do is go back to our client and we need to add a couple more things. So this payment request object will emit several different events. One example of an event that's emitted is cancel. So when someone opens the payment sheet and then clicks cancel, that'll trigger an event that... The event that we care about today is the payment method events. We're going to say pr.on payment method. And we're going to register a new handler that will fire when the payment method event happens. So we're going to use an a sync function here so we can use a sync await inside of here. And now when a new payment method is available, we want to do a couple of things. So we're going to create a payment intent on the server, and then we're going to confirm the payment intent on the client.

CJ Avilla (16:01):
Now, technically you could create the payment intent earlier in the flow if you know the price that the customer is going to pay, earlier on you can create that whenever you have enough information to create the payment intent, some folks will create the payment intent when the page loads, other times you'll want to wait until the very last second to create the payment intent based on maybe the shipping address or some configuration that's going to be available as part of Apple Pay. So we're just going to create it here. This is going to be a post request to our servers, creative payment intent endpoint. And that's going to return that JSON object that we looked at at the very beginning of the show here, and we're going to destructure the client secret out of that JSON response. And we need to make sure that we're passing into our server, the payment method type as card, and then the currency see as USD. Now in practice, you could generally hard code the list of payment method types that you want to make your payment intents confirmable with.

CJ Avilla (17:05):
You'll typically hard-code that on the server, in this demo and in this series, we're going to show you how to collect and confirm several different payment method types. And the combination of payment at the type and currency is sometimes a little bit limiting. So in order to demonstrate the widest variety of payment method types, we're passing the payment method type and currency from the client to the server, but know that in practice, you might pass things here like a cart ID or some list of item ID's that you want to then calculate the amount to collect for on the server. All right. So once we have this client secret property, we're ready to do a confirm step. So Stripe JS exposes a method called confirm card payment. And that accepts several arguments. The first is this client secret property that we just received back from the server.

CJ Avilla (17:53):
The next is an options block we're going to specify the payment method type or the payment method. And this in many examples will pass an object where you can give reference to the element. However, in this scenario, when working with Apple Pay the event that's fired when the payment method event type is triggered on the payment request object, this event will have reference to the payment method that was exposed. Or the payment method that was submitted by the customers. We can say e.paymentmethod.id that will give us the ID of the payment method that was given to us by Apple Pay. We need to pass a third argument in this case, and we want to say, handle actions is false. So handle actions will handle any next actions that are required when going through a card payment flow. So if there is a 3D Secure flow for secure customer authentication, which is required in Europe, that would prompt a modal or might redirect the page.

CJ Avilla (18:50):
We don't want to have a modal open, and we don't want to redirect because while that payment dialogue is open, there's going to be some limitations to what kind of JavaScript can run. And we don't want to be blocked by having the payment sheet open and not being able to present a modal. So we're going to explicitly say, handle actions false here, and then handle them manually in a moment. Okay. So confirm card payment is going to return a promise, which will resolve with either an error or a payment intent. So we can say, we'll destructure these and say that if there's an error, we want to tell the Apple Pay dialogue that something failed. So we can say e.complete fail. And then we want to return early. If there was not an error, then want to say e.complete success. And we do want to... In most cases, that's going to be the end of the payment flow and payment will be successful.

CJ Avilla (19:48):
However, because we specified handle actions false here. We need to check if the payment intense status is one of requires action. And if so, we want to call the confirmed card payment again, now that we have closed the payment dialogue. So this e.complete success that will close the payment dialogue for Apple Pay. And then once that's closed, we want to say Stripe.ConfirmCardPayment. Again, this time we can just pass for client secret. And that will again, check to see if there's any next actions for the payment intent, which there should be. If the payment intent is in the status of requires action, it'll present some modal, or it might redirect to the bank's page to collect a one-time password, et cetera. Okay. So at this point, we are ready to take this first bid. So let's refresh our browser here in Safari.

CJ Avilla (20:39):
I have some personal cards set up in Apple Pay. When in test mode, you will provide an actual credit card, a live credit card to Apple Pay. And then the details will be swapped out on the backend when we're in test mode. So it doesn't actually collect any payment. All right. So let's walk through that flow in the UI. So we have this big beautiful Apple Pay button. We're going to click on that. And we see that the pay dialogue is opened. We can select between several different cards that are in our wallet and change the billing address or the contact information for the payment. We also see this demo payment line here. This is from the payment request object that we configured earlier. We also see pay with touch ID and on the Mac touch bar here, I see pay with touch ID.

CJ Avilla (21:24):
So I'm going to use my fingerprint to authenticate payment. We see that it is now processing payment, and once that's completed, we see now that we have a log here that says payments succeeded with the ID of our payment intents. We can actually click on that link and go to the Stripe dashboard, which will show us a little bit of detail about the payment that just succeeded. The payment method will show the actual last four, but rest assured this is actually just a test payment, and you can see a whole bunch of other information about the payment that's available here in the Stripe dashboard. Okay, excellent. So that is how you can set up and collect an Apple Pay payment. And this shows that we actually did successfully complete that payment. Now, again, if there were some further actions that were required for 3D Secure or secure customer authentication, then modals would be open.

CJ Avilla (22:16):
It's quite tricky to simulate that as I don't have a card that requires 3D Secure, we do need an actual live card. All right. So as a quick recap, we went into App JS. We added a new route for our new Apple Pay component. We created a new Apple Pay React component here where we set up a useEffect hook to create a payment request object, where we set all of the information that the customer is going to see when they're checking out, we checked to confirm whether or not the payment request button in Apple Pay were available in the browser. And if it was available, then we set that payment request objects so that we could create this payment request button element that we see on the page. Then we added in event listener for the payment and the payment method event on the payment request object.

CJ Avilla (23:05):
And when that fired, we created a payment intent on the back end using this create payment intent function to pass in our payment method type and currency. Again, those could be hard-coded on the server. And then in the case that the request to the server failed, we are calling e.complete fail so that the payment sheet can display an error. We also edit a little bit of logging there. And then in the case that we were able to successfully create the payment intent on the server, then we're going to confirm that card payment on the client, passing in the client secret of the payment intent, and then the payment method ID that we get from Apple Pay. And again, we're passing handle actions false so that we can manually close that payment sheet before handling any next actions. This was the JSX that we use, very simple, just a header tag and the payment request button, which we're going to conditionally show.

CJ Avilla (23:56):
If the payment request is available and we can make a payment in this browser. That wraps up our demo for today and how you can accept Apple Pay payments with React in a custom form on the web. You are now fully equipped to build a custom payment flow with React to accept an Apple Pay payment with Stripe. Watch the other videos in this playlist to see how to accept different types of payment methods. And as always, if you have any feedback, please let us know in the feedback form linked in the description. Thanks so much for watching and we'll see you next.

## Card

CJ Avilla (00:00):
In this episode, you'll learn how to implement the front end with React, to accept a one-time payment with a custom form. If you're interested in a faster integration path for accepting card payments, head over to the checkout playlist in the Stripe developers channel. So let's say you already have a backend set up to create payment intense, and you want to add support for accepting the card payment method on the front end. Now, if you haven't already implemented the backend, head over and take a look at one of those server implementations in one of the officially supported server side languages.

CJ Avilla (00:30):
Also, before we get too far, if you're using Vanilla JS or some other non React web framework, or if you're using iOS or Android on mobile, we have videos specific to those clients that cover how to accept payment and those are linked in the description.

CJ Avilla (00:45):
So our backend is already set up and running. It has two end points that we'll interact with today. One is slash config for fetching publishable keys. So let's actually pull this up. So we have config. So local host 4242/config will fetch our publishable key and then create payment intent is the other end point here, and this takes in the payment method type and the currency. So the payment method type, we're passing in the payment method type in currency because not all payment method types work with all currencies. However, card supports all the currencies that Stripe supports. So this actually doesn't matter too much for card, but it will in other demonstrations when we start to accept other payment method types.

CJ Avilla (01:27):
But when we hit the create payment intent end point, we are returned a client secret property that we can then use to confirm the payment on the front end. So that's what we're going to implement today is a basic form for handling that confirmation step.

CJ Avilla (01:43):
So I'm going to fire up this client, which is the React client. And we have a video about how to go from zero to one with React. If you're curious about how we built this React client or the starter for the React client, we do have that episode live on the Stripe developers channel, so you're welcome to check that out.

CJ Avilla (02:02):
So the first thing I want to do is add a new route so that if we go to slash card, it pulls up our new card components. We'll add a new route here and the path will match on is slash card. And we want to just render some card component that we're going to define soon, and this could be the card form or a payment form or some other related form. We don't have anything implemented, so we're going to import card from ./card, and then we'll go add this card.JS file. And this is going to be a really basic React functional React component. So we'll say card, it doesn't take any props for now, and it will return export with router so that we can redirect if we need to. And we'll import with router from React router dom.

CJ Avilla (03:04):
Okay, there we go. All right. So our card component now should be rendering when we go to slash card and nothing is actually returned. So if we just return card here, that should show our card end point. Okay. So let's return a bit more HTML. So we'll create a fragment and inside of here, we'll make an H1 that just says card and we'll make a form that we can use to collect payment details. So our form is just going to have an idea of payment form for now, and we'll give it a nice big button that says pay.

CJ Avilla (03:47):
Let's see. Okay. So now we have a button there. Now, in order to collect card details, we're going to use the card element. Now, this is available from React Stripe JS, the card element. We can import the card element from at Stripe/ReactStripeJS. And again, we talked all about how we set up React Stripe JS in a previous episode. So if you want to check out the React starter, that'll get you all set up with React Stripe JS.

CJ Avilla (04:14):
So here, let's add in a label for our card input, and we're going to say HTML four, card element, then we're going to add our card element just like so. Now, if we did that, now you can see in our HTML or in the browser over here, that the card element input is rendering. It's the single line card element that accepts the card number, CVC, expiration, and postal code. But if we click on the word card right now, the label, it's not actually adding focus to our card element, and that's because we need the ID for that. So we can say ID card element. Now, when we click on card, we are focusing on the card input.

CJ Avilla (04:56):
Now, if we enter in the 4242 test card and then some test number and then click pay, nothing actually happens. In fact, it's making a full post request to the server at slash card, which there is no end point that accepts post requests there. So the next thing that we want to do is add a submit handler to the form so that we can handle the form submission. Let's say on submit, we're going to call a handle submit, and up here, we'll create the handle submit function, and that's going to be an async function. So we can do some async stuff in here, and we'll start by preventing the default. So we'd stop making full post requests to the server. And then the next thing we want to do is we want to create the payment intent on the server, and then we want to confirm the payment on the client.

CJ Avilla (05:54):
Okay. So before we do that though, I want to use two hooks that are available from React Stripe JS, so that we can interact with this card element and grab reference to those payment details. So we're going to use elements and we're going to use Stripe. Right when we're rendering this function, we can call elements is use elements and Stripe is use Stripe. When we submit the form, if either of those are not yet defined because we haven't completely set them up, we want to just make this a no ops. So for now, we'll just say, if there's no Stripe or there's no elements, then return.

CJ Avilla (06:37):
Otherwise, we do want to create the payment intent on the server, which we can do using the fetch API. So we're going to make a post request to the server and it will create a payment intent, which is going to return just that client secret property. If we scroll. No. It's going to return that client secret property, which we can destructure into this variable client secret, and the end point we're going to call is create payment intent. This is to match the docs too. This should match. If you're looking in the accept a card payment documentation, create payment intent should align with what you see there.

CJ Avilla (07:15):
Now, again, we need to pass the payment method type to our server. And in this case, it's going to be card and we also want to pass the currency. So we're going to pass euros today, and that should get us our client secret for the payment intent. Now, technically you can pass whatever you want to the backend in order to create and configure that payment intent. Perhaps you're passing some lists of product information or a card ID, or it could be the shipping information or the location, or what have you, right? Any of the information that you're collecting on this form could be passed to the backend so that when you're creating the payment intent, you can configure that based on the information that the user has input into the form here.

CJ Avilla (08:00):
So the next thing we want to do is handle the result of this payment intent by confirming it on the client. Now, before we get too far, I did want to add one more thing here. We have a little helper called status messages, which is it's a component for rendering, just like rendering some basic status messages. So we have something to look at on the screen, and it takes in an array of strings, which we can use this hook. So we can say add message. It's the add message hook, and we can say consta messages add, or this is used messages. Use messages, the use messages hook, add message is used messages. If you're curious what this looks like, the status messages file here has all of this implemented. It's really just a div that is listing out messages so that we can debug while not having to open the console essentially, and we'll have some pretty output.

CJ Avilla (09:10):
So let's see if this is working. So when the form is submitted, we will say, add message by creating payment, reading payment intent. And then if we return our return day client secret property, then we can add a message that says payment intent created and we can refresh the page. If we enter in 4242 card and hit pay, we see creating a payment intent and we see payment intent was created. That's great.

CJ Avilla (09:47):
So the next step is we want to confirm the payment intent on the client. The Stripe JS library exposes a method called confirmed card payments. We can say Stripe.Confirm card payment, and passing the first argument, being the client secret for the payment intent that we just created, and the second argument being an options block, where we can pass in information about the payment method we want to use to confirm this payment, so payment method.

CJ Avilla (10:13):
Now, this could technically be a string value with the idea of the payment method that you have already saved on file for this customer. So if you have an existing payment method, you can pass it here. If you don't have an existing payment method, we can collect this new payment method using the card element. So we can say a card is equal to elements.Getelement, and then pass in the type, card element. Okay. So this card property that we're passing in as part of the payment method is expecting reference to an element. So it's expecting reference to this card input element, which we can get using the elements object that again was returned when we did the use elements hook, when we made a call to the use elements hook initially, and that is available because this entire component is wrapped in an elements provider in the root, in the index, right?

CJ Avilla (11:10):
So the elements provider takes in either an instance of Stripe or a promise that will resolve to an instance of Stripe, and we wrap up the entire app in that elements provider. And because of that, when we use the use elements hook, the elements object allows us to interact with objects or those element components that are on the page directly by using this element.GetElements. It locates the element and allows us to pass it in here. So this will confirm the card payment.

CJ Avilla (11:39):
Now, this returns a promise, which we can await and say, give me back the payment intent. And then we can just say down here, we'll just say, add message of the payment intent, and then maybe we'll put in the idea of the payment intent and its status. So we'll say payment intent on status and payment intent to ID. Now, if we refresh the page, enter in our 4242 test card and hit pay, we can see it creating the payment intent. The payment intent was created and this payment intent succeeded.

CJ Avilla (12:21):
Now, if we follow this link over to the Stripe dashboard, we will see all of the information about the payment that just succeeded. So we can tell that it was 19.99 euros. It used the 4242 test card. It succeeded, and there's a few more details about the payment that are available directly on the Stripe dashboard.

CJ Avilla (12:42):
So the Stripe documentation has a whole host of Stripe test card numbers that you can use with Stripe integrations. The most common is this 4242 card that succeeds, but there are also several others, including international test cards and regulatory test cards. So this very first regulatory test card that ends in 3155. If we refresh our page and enter that test card, any future expiration, any CVC, and any postal code and hit pay, you'll see that this test card will open a modal.

CJ Avilla (13:15):
Now in production, this modal will be populated by the issuing banks page. So the card, whichever bank issued the card number for your customer, if they require 3D secure, or some sort of customer authentication, then that will be displayed inside of that modal. If the bank supports that version, otherwise you might redirect. So this is an example of a 3D secure card.

CJ Avilla (13:41):
Now, we also have a test card here that will fail for insufficient funds with 3DS. So if we copy this test card and refresh the page and enter that in and hit pay, we will see the modal that opens. We can click complete authentication, and then we actually crash because we're seeing ID of undefined. We're trying to log out ID of undefined. It turns out that we don't actually have any error handling. So let's go add some air handling so that our page here doesn't fail in that case.

CJ Avilla (14:13):
So for both the request that's going to the backend to the server to create the payment intent and for our call to confirm the payment using Stripe JS, both of those will optionally return an error object. So we're going to alias that to backend error in the case of our server. And we're going to say, if there's a backend error, then we want to add a message that is just backend error.Message and we'll return. So we'll just return early if our backend failed to create the payment intent. And then similarly, we're going to get an error back from confirmed card payment and this is going to be called Stripe error. We're just going to name it Stripe error and backend error to disambiguate.

CJ Avilla (15:05):
Now, if there's a Stripe error, we will add another message that says Stripe error.Message and we'll return. So now, if we refresh the page here, enter that scene card that will fail with insufficient funds, hit pay, then we are presented with the three secure test modal. We complete authentication, and rather than just failing or crashing, we see that the card has insufficient funds, and that is really all that we wanted to show today.

CJ Avilla (15:39):
As a quick recap, what we did is we added a brand new card component and we set up some really basic HTML for a form, including using this new card element that's available from React Stripe JS. We pulled in status messages just for debugging purposes. We added a handle submit for our form submission, which checked to see whether or not Stripe or elements were loaded from our use Stripe and use elements hooks. And then we created a payment intent on the server using our existing backend passing in the payment method type and the currency.

CJ Avilla (16:15):
And then next we confirmed the card payment on the client, which depending on whether or not SCA or some 3D secure authentication was required, it may open the modal or it may redirect. So all of this is handled by confirm card payment. So we added confirm card payment. And finally, we wrapped this up with a little bit of error handling. So hopefully, this was useful. You are now fully equipped to build a custom payment flow to accept a one-time payment with Stripe using React. Head over to watch the other videos in this playlist to see how to accept different types of payment methods. And as always, if you have any feedback, please let us know by completing the feedback form linked in the description. Thanks so much, and we'll see you next time.


# iOS video transcripts

## Alipay

Thorsten Schaeff (00:00):
Alipay is a popular mobile wallet payment method used by customers in China. Alipay allows for so-called app to app redirect, which is the fastest and most convenient way for your users to pay; as it opens the Alipay app on their phone for easy authentication of the payment after which they are redirected back into your app. If you haven't already, please watch the previous couple of videos where you learn how to add the Stripe SDK to your iOS project, as well as how to set up a custom U-R-L scheme for the app to app redirect. Lastly, in a previous video, you also see how we set up the backend model to communicate with our server to set up the payment intent, which we can then use to create the payment with Alipay on the client.

Thorsten Schaeff (00:53):
To quickly recap, in our big backend model, we have two methods that prepare payment intent method, which sends a post request to our server, and we have an on completion method, which then updates our payment status as well as error. And if the payments exceed it, it then resets our demo and creates a new payment intent for us. So now let's go ahead and create a new [inaudible 00:01:23] here for Alipay. So we can just say new file.

Thorsten Schaeff (01:23):
A swift you, eye view, and we call it Ali paint. Now the great thing here with swift for your eyes is we can get some previews of our views. So here it's now just a hello world view that is defined here and our approved view here.

Thorsten Schaeff (01:55):
Now in the next step, let's make sure that our backend server is running. So I have the notes over running here on local host four, two, four, two, to be able to create payment intense for us. We have explanations for the different servers and several languages in a different video playlist. So you can see that in the description below. Okay, so now let's actually go ahead and replace our view here with a simple B stack. And here we are going to put in our only pay button. But so first of all, when our V site view here, loads, we want to then create our payment intent. And so from our backend model, we then called the prepare payment intent method. So that means we need our backend model, which is an observed object. Let me just store that here in a model variable, which is our backend model. Let's get an instance to that. And then we also need a state variable. We'll just call it loading and just say that is faults for now. Okay. And so now once our V sec appears, we want to then prepare our payment intent. We have our method, which is Ali pay, and then we set the currency to use D here. I'm testing this on kind of USD Stripe account.

Thorsten Schaeff (03:46):
Okay, great.

Thorsten Schaeff (03:48):
So now if we resume our view, well, there's currently nothing in the view, so let's actually change that.

Thorsten Schaeff (03:58):
And in our view, what we actually want to do is if we have a payment intent. So once our payment intent has been prepared, we want to show our Ali pay button and otherwise we just show a loading state. And so let's say payment intent, And we get that from our payment and intent prompts on the model.

Thorsten Schaeff (04:34):
And so once we have that, we then show our button, which is say by with Ali pay.

Thorsten Schaeff (04:48):
And we'll add some logic there in a second. But so if we don't have a payment intent, we just show a loading text, Right?

Thorsten Schaeff (05:02):
Let's give that a save and let's resume our preview here, see if that all works fine. So we only see the loading state here because the preview doesn't actually run our prepare payment intent. So we actually would have to build our app. So let's quickly do that and run it on the simulator. Okay.

Thorsten Schaeff (05:28):
Here we are. Let's like Alipay. So we got our view. You can see here now in the console lock that our packet model has created the payment intent, and now we have our button that doesn't do anything yet. So let's fix that. So basically when our button is tapped, we then want to say that we're loading. And now that we're loading, we want to create our Payment intent parameters. So we say payment intent and we get the payment method params.

Thorsten Schaeff (06:18):
And so now we create a couple of objects from The Strive SDK. So we actually need to import a Stripe here so we can utilize them. And so the first for the payment methods per arms is Stripe payment methods per arms. And then we say Alipay.

Thorsten Schaeff (06:44):
So for Alipay we get these Stripe payment method, Alipay params for billing. We could add some billing details here, but we're just going to set them to no, for now, as well as metadata, we could append if we wanted to, but let's just set that to nil as well. And then we have the payment method params, and we also need the payment method options. And so these are confirm payment method options, or Stripe confirm payment method options, here.

Thorsten Schaeff (07:32):
And so now that we have our payment methods options, we can then add our Alipay options and these are Stripe confirm Alipay option. Great.

Thorsten Schaeff (08:03):
And so now, lastly, what we need to do is we need to set our return URL, and we set that to our custom URL scheme so that the Alipay app can then redirect back into our app. If you haven't set up your custom URL scheme, check out the video in the description below on how to do that. So our custom URL scheme is just accept a payment and then we need to give it the roof safe pay. So that's where Alipay is going to redirect us back to them. Great. And now we can use a handy method called payment confirmation sheet that handles a bunch of stuff in the background for us, including the redirect off to the Alipay app. So here we need to provide a two way binding to our loading state so that it's managed by the payment confirmation sheet here.

Thorsten Schaeff (09:12):
Then we need our payment parameters and we need our on completion method. And we get that from our model. But wait, just get on completion, just sent in a reference here. And then lastly, what we want to do is we want to set the button to disabled if we are in fact, in a loading state. Great.

Thorsten Schaeff (09:42):
And so now when the button is clicked, our pay specific payment method, parameters and options are being set. And then we call our payment confirmation sheet to redirect off to Alipay. So now let's actually give that a try. Let's build the app again,

Thorsten Schaeff (10:06):
Select Alipay. We can see our payment intent was created. And now we just say, buy with Alipay. The payment sheet is redirecting us to the Alipay app. Now here in test mode and on the simulator, I don't have the Ali pay app installed. So we're just getting redirected to a Stripe test page. And now if I authorize this test page where then getting redirected back into our app, but as you can see, nothing has happened here yet. So we want to kind of show some outcome here. So basically what we can do is...

Thorsten Schaeff (10:56):
Sorry, under the. So here we have our B stack. And so we're just going to add a condition here. So, once we have our payment status and the payment status, we also get from our model payment status.

Thorsten Schaeff (11:19):
Then we want to show an age stack. And here we just at a quick switch statement over the payment status. And we need a couple of cases. So the first case is succeeded.

Thorsten Schaeff (11:46):
And in that case, we just say payment complete. Now the next case would be if the payment failed. So that is the failed status. And then we just say payment failed.

Thorsten Schaeff (12:11):
And then we have one more status, which is canceled. And in that case, we just say, payment canceled.

Thorsten Schaeff (12:29):
And then in the default case, we just add an known default, we just say unknown steps. Okay, great. So now we have some feedback for our customer. And so let's just run this again.

Thorsten Schaeff (13:05):
Select Alipay, we got a payment intent, buy it with Alipay. Let's actually go ahead and fail this test payment and now we can see the payment task failed. Now we can retry it with the same payment intent when it failed and now we can just authorize that has payment; and now it was successful and a new payment of tangibles created for us to do another payment. Great. Now every everything works as expected as you can see, and now we're ready to accept Alipay payments from our customers in China. Thanks for tuning in and see you soon.

## Card

Thorsten Schaeff (00:01):
To securely collect your customer's card details, the Stripe SDK provides a payment card text field component, which we will integrate in a new SwiftUIView. Before we can do that, we will need to add the Stripe SDK to our project and create a payment intent on our server. To learn how to do this, find the corresponding videos in the description below. Now let's go ahead and create a new SwiftUIView. Here in our view folder, let's create a new SwiftUIView and call it Card and tell Swift. Here with SwiftUI, we can resume our live preview, which is pretty cool. There we are. So currently we just have a view here with hello world and a preview.

Thorsten Schaeff (01:02):
So what we want to do is actually change this to a VStack. Here within the VStack, we're going to add our card input and pay button. Once our VStack loads, we actually wanted to create a payment intent on our server. This is something we do via our backend model, which we've built in a previous video. If you haven't done that, check that out beforehand. So what we do here is onAppear. We then say our model, and we need to get a reference to our backend model. So we'll do that here as... So our backend model is an ObservedObject. Just say model and that's our BackendModel.

Thorsten Schaeff (02:29):
Then we actually want to track a couple more things. So we'll create some State variables here. First of all, we want to have a loading state, which currently is false. And then also we want a state for our payment method parameters. So that is paymentMethodParams, and this is going to be of a Stripe type. So we actually need to import the Stripe SDK here, and now we can reference the STPPaymentMethodParams, and that's optional. So now we have a reference to our model and we can call the preparePaymentIntent method. In this case, we're creating it of the payment method type card, and I'm just testing on a US Stripe account, so it's just going to set the currency to USD here. Now let's actually go ahead and implement our card input widget so we can use the STPPaymentCardTextField and for a SwiftUI, we have a representable representation of that text field that we can use here. We need to pass in a two way binding to our paymentMethodParams. So the paymentMethodParams here, and then also we can maybe add some padding.

Thorsten Schaeff (04:38):
Now let's see if we can preview our card input text field.

Thorsten Schaeff (05:00):
That's our card input, widget here. Then we'll also want our pay button, but we only want to show that button when we actually have our payment intent and we get that loaded from the model, so that's what the onAppear does down there. So we get the paymentIntentParams.

Thorsten Schaeff (05:40):
If we have them, we're going to show our "Buy" Button. So let's just say Button, give it a Buy. And then if we don't have it yet, we're just going to render a text that says Loading. Here in the preview, we'll only see the loading stage because it doesn't actually run our onAppear. So for that we'll actually need to build and then run the app in the simulator. We'll do that in a second, but now let's actually hook up the functionality for our button. So when the button is clicked, we then want to set our payment intent...paymentMethodParams to be our paymentMethodsParams from above.

Thorsten Schaeff (06:55):
Then lastly, we set our loading to "true". And now on the button, we can use a handy payment confirmation sheet that is provided by the Stripe SDK. We provide a two way binding to our loading state, so that will be updated afterwards. Then we need to pass in our payment intent and our onCompletion method, we have implemented in our central model here. So we just pass a reference to that. Then lastly, what we want to do, if the button... Disable the button while we're loading. So, let's do that. Now let's actually go ahead and build the app and run it in the simulator.

Thorsten Schaeff (08:02):
We can now see, we fetched the publisher key from our server. This will be important before you start the simulator that you make sure that your server is up and running. Here I have the node server running on port 4242, you can of course choose a different server of your choice. Now I'm going to select cards here. I'm going to use the 4242 default payment method. We can use any date in the future, any CVC and the postal code. Now that we hit "Buy", we're loading and we can see that worked fine. So our loading states terminated. So now we'll actually need to show some feedback in terms of success or error to our user. So let's go ahead and get our paymentStatus from our model.

Thorsten Schaeff (09:17):
Then we just use a simple HStack here, put a switch in there and we just switch on the payment status. So there's a couple of cases that we'll need to handle. The first one is the succeeded case. So in that case, we simply show payment complete. Then we have the case that the status has failed. Then we just say the payment failed. Lastly, we have the canceled case and then we just say payment canceled. Then let's just handle any other case, just say unknown status. Now we have some feedback here, once the payment status is changed in our model, and that happens where the onCompletion call back that we passed in here to the payment confirmation sheet. Let's build the app again and do another test payment. Our trusty 4242. Now you can see, we got the payment completed. Great. That's it. Now you can securely collect and charge, keep card details from your customers. To learn how to add more payment methods to your app, check out our other videos. Thanks for tuning in and see you soon.

# Android video transcripts

## Alipay

Thorsten Schaeff (00:01):
Alipay is a popular mobile wallet payment method used by customers in China. Alipay allows for so-called, app to app redirect, which is the fastest and most convenient way for your users to pay. As it opens the Alipay app on their phone for easy authentication of the payment, after which they are redirected back into your app. To do in app payments using Alipays app to app redirect flow. You must first integrate the Alipay SDK. You can find the download link for the Alipay SDK in the stripe docs that are linked in the description below. Go ahead and head over there and download the latest SDK. Now after downloading the archive, unzip it and locate the Alipay SDK with the version extension and dot AAR, and add that to the Lips directory of your app.

Thorsten Schaeff (01:02):
Now we need to update the built dot Gradle of our app and specify the Lips folder. Let's copy this here, navigate to our apps, build dot Gradle file. And just above the dependencies, we're going to add our projects. Next we will need to add the Alipay SDK to our dependencies.

Thorsten Schaeff (01:40):
And as the name, we specify the exact file name that is in our app LIPS folder.

Thorsten Schaeff (02:01):
And we also need to pass the extension AR. That's it now we have the Alipay SDK available within our project. Next, let's create a new activity. We'll just select an empty activity and call it, Alipay activity.

Thorsten Schaeff (02:35):
In our Alipay activity layout, we're going to add a simple linear layout with just one button, and we're going to attach a pay button ID here. Now, let's move over to our Alipay activity. We will need a couple of variables. First of all, we need our Payment Intent Client Secret, which we will get from our API client that we've built in a previous episode, so if you haven't watched this yet, you can find it in the playlist. And our Payment Intent Client Secret is going to be a string, and that is loaded from our server.

Thorsten Schaeff (03:26):
And then lastly, we also need a reference to the Stripe SDK. And so we will need to import the Stripe package here. So now in our, on create, let's initialize the Stripe variable, and that is Stripe, with this as the context. And then we can get our publishable key from the payment configuration. So in our launch activity, we've set the publishable key, and then we just need to provide the application context and then get the publishable key.

Thorsten Schaeff (04:24):
So now we can go ahead and implement our checkout, start checkout method.

Thorsten Schaeff (04:36):
Start check out. And so here now we need to create our Payment Intent... By calling the server. And so we can just use our API client here. So the API client has a Create Payment Intent method. We need to pass in the currency, which as well as the payment method type. So here our payment method type is Alipay. Our currency, we're just using a U.S. test account, so we're going to use that. And then we need a completion method. And our completion method is going to get the Payment Intent Client Secret as well as potentially an error. And then we just run.. If we have the Payment Intent Client Secret.

Thorsten Schaeff (06:07):
We then send our Payment Intent Client Secret parameter on the activity to be the client secret that we've gotten back.

Thorsten Schaeff (06:24):
And, otherwise we might have had an error. So in the case of an error, we then want to display an error and we already have a Display Alert function implemented in our launch activity. So let's just jump over there and copy our... Display alert.

Thorsten Schaeff (07:00):
And so down here, let's display the alert here, failed to load payment intent, and then we just port in the error.

Thorsten Schaeff (07:21):
Great, and so now we got our Payment Intent Client Secret. So next we can confirm our payment intent when the pay button is tapped. So let's get our pay button reference imported. So here we can import that from our layout activity, Alipay activity layout. So the pay button, and then we set on click-less now. Now we need to create our confirm params. And so these are confirm payment intent params from the Stripe SDK. And we say, create Alipay, then we pass in our Payment Intent Client Secret.

Thorsten Schaeff (08:34):
And so now we can call, confirm Alipay payment and here we need to pass in our confirm params, as well as an authenticator. And so for the authenticator, we pass in the Alipay authenticator. And here we will need to override the on authentication request. So this is imported from the Alipay.

Thorsten Schaeff (09:38):
So we return the pay task, which is coming from the Alipay SDK, that we've downloaded earlier. And then we just pass this reference to the Alipay activity, and then pay V2. We just pass in the data from our on authentication request event, and then specify True here. And then we also need a call back.

Thorsten Schaeff (10:15):
So here we need the API results call back, and that will have the payment intent results, type. And so, on success. And now let's actually write a little on success helper method to show a different success outputs. So we're just going to copy and paste a little handle results helper here.

Thorsten Schaeff (11:03):
So we will need to import the Stripe intent from the... Let's try SDK. As well as Jason here. And so in the case, we just hand in the result, which is a payment intent result. And so from the result we get the intent, and then we just have a little check here for the status. So if the status is succeeded, we then actually just show a Jason of the whole payment intent and say payments succeeded, and otherwise we say payment failed, and we get our error message from the payment intent.

Thorsten Schaeff (12:00):
Great. And so now we can say "Handle result" and we pass in our result. And now we also need to override the on error function. So in the case that the authentication request with the Alipay SDK didn't work, and this is the case, for example, in test mode. So in test mode, the Alipay SDK does not work with the app to app redirect. So we will need to fall back to a web view authentication here.

Thorsten Schaeff (12:37):
So in the case we got an error, what we can do.

Thorsten Schaeff (12:44):
So in this case error using the Alipay SDK, and now let's use a web view and stat. So here we then fall back to the UFU and that we can do by simply calling confirm payment Passing in our Alipay activity, as well as the confirm params that we created above.

Thorsten Schaeff (13:22):
So that is our Alipay confirmed params here. And so then we fall back to using the web view. Now, in the case that the web view was used, we will need to then handle the activity result. So let's say handle activity result. This is needed when the web view is used. And so we can say "Override on activity," activity result here. And so in that case, we now handle the result of Stripe confirm payment. So here we have the Stripe dot on payment results helper, and we get a request code, as well as data. And so now we need to use the API results call back, with the payment intent result.

Thorsten Schaeff (14:54):
And so again, here we override the on success method, in which case we just handle the result and pass in the payment intent result. And then in the case of an error, we just say, display alert, and we just pass in an error and the error to string. Great, so now we handle both cases; first of all, we use the native Alipay SDK for the app to app redirect if it is available, and if not we fall back to the web view usage. So now, in the last step, we need to start the checkout when our activity is launched. So let's do that.

Thorsten Schaeff (16:06):
And now let's give this a try and build it in the simulator.

Thorsten Schaeff (16:22):
And so now we select Alipay. We hit our payment button. And now here in this case, we're running in test mode. So the native app to app redirect is not available. So here we get a web view with a Stripe test page. Let's authorize the test payment here, and the payments succeeded and we get our payment intent object. Great. As you can see, everything is working as expected, and we're now ready to accept Alipay payments from our customers. Thanks for tuning in


## Card

Thorsten Schaeff (00:00):
To securely collect your customer's card details, the Stripe SDK provides a CardInputWidget drop-in component, which we will integrate in a new card activity. Before we can do that, we will need to add the Stripe SDK to our project and create a PaymentIntent on our server. To learn how to do this, find the corresponding video in the description below.

Thorsten Schaeff (00:26):
Now, let's go ahead and create a new activity. We're going to create an empty activity and call it card activity. Now in our layout, we will need a bunch of boilerplate code. So we can go and grab this from the Stripe docs that are linked in the description below. So we'll just create a simple LinearLayout with our CardInputWidget that is provided by the Stripe SDK and a simple pay button.

Thorsten Schaeff (01:05):
Let's go ahead and copy this. And so here we are. We just need to rename this. So this is our activity card. The context is our card activity, And then we got our CardInputWidget with the ID CardInputWidget and our pay button with the ID pay button. Great.

Thorsten Schaeff (01:48):
So now, let's head over to our card activity. First of all, we will need a variable to hold our PaymentIntent client secret, and that is loaded from our server. So that will be stored as a string. And then also we need a reference to our Stripe SDK. So that is of type Stripe. So here in the import, we now import the Android Stripe SDK. And so now we need to set our Stripe library. We pass in this as the context, and then we can get the payment configuration. We can get the instance. So that's what we have set up in the launcher activity earlier. And then, we can get the publishable key. Great.

Thorsten Schaeff (03:01):
So now we can use our Stripe SDK in here. So, first of all, we can now write start check out function. So in order to start our checkout, we will need to create a PaymentIntent from our server. How you set up the PaymentIntent on the server and on your API client, this is in different videos. So check those out. And so we'll need the API client and create a PaymentIntent.

Thorsten Schaeff (03:44):
We need to provide the payment method type, in this case, cards. We need to provide the currency, which is using USD here. And then, we need to provide a completion method. And in that completion method, we're getting our PaymentIntent client secret or an error. And so now let's check if we have a payment intent client's secret, then we can go ahead and assign it to our variable here. Assign it. And if we don't have that, we might have an error. So, in that case, let's go ahead and display an error. Now, we need a simple kind of display alert method. So we have one in the launch activity here. So let's just copy that.

Thorsten Schaeff (05:06):
And so what this does is just taking a title and a message and then render out a simple alert dialogue. And so in this case, we just display the alert, and we'll just say failed to load payment intent, and then we just say error.

Thorsten Schaeff (05:38):
Great.

Thorsten Schaeff (05:40):
And so now we have our PaymentIntent clients secret, and now we need to confirm that client secret when the pay button is clicked. So let's say confirm the PaymentIntent with the card widget. And so let's get our pay button, and we get that from our card activity. So the pay button here is loaded as a reference from our view, from our layout here.

Thorsten Schaeff (06:18):
And so if the pay button is clicked, set on click listener, then we want to get our CardInputWidget, which we also get from our layout view and then payment methods. Create params. So if we have those in the CardInputWidget, we can then create our confirm params, and these are confirm PaymentIntent params. And we want to say create with payment method, create params. And so these are our params that we get from the card widget, from our card widget here. So we pass in the params as well as our PaymentIntent to client secrets. And then we can say confirm payment, and we pass in our activity and the confirm params. So here the CardInputWidget then takes care of attaching the card details to the PaymentIntent. The PaymentIntent then evaluates whether we need 3D secure authentication or not, and then actually confirms the payment and returns the result.

Thorsten Schaeff (08:12):
So in order to get the result, we need to override the on activity result. And we just handle the result of Stripe confirm, confirm payment. So we can say Stripe on payment result, and we get a request code, we get some data, and we need the API result callback. And the type here is a PaymentIntent result. And so we have a couple of methods here. First of all, let's override the on success methods. So we'll get our PaymentIntent from the result. So on the result, we have the intent, and then we can check if the PaymentIntent status is succeeded. So we say Stripe intent need to import that status succeeded. And if that is the case, we then just get a simple GsonBuilder set. Yep. Let's import the GsonBuilder there and set pretty printing, and then create.

Thorsten Schaeff (09:23):
And so now we can say display alert, and we just say payment succeeded. And we just to Json the whole PaymentIntent. So we can inspect that. And then otherwise, if the PaymentIntent status is... requires payment method. So that means that the payment on the attached payment method failed. And so then we can just display an alert and say payment failed, and we can also catch from the PaymentIntent the last payment error, if it is available, we get the message, or we get empty.

Thorsten Schaeff (12:04):
And then lastly, we need to override the on error function. And so, in that case, we just display an alert saying error, and we'll just get the error to string. Okay, great. Now let's go ahead and built the app and test this out. Now, let's select card here, have our CardsInputWidget. So let's use the default test card and any future date and test this out. Okay. So now, lastly, we need to start our checkout when our activity launches. Start check out here. And so now, let's go ahead and test this out. Select card. Let's use the default test card here, any date in the future. Great. The payment exceeded. That's it. Now we can securely collect and charge card details from our customers. To learn how to add more payment methods to your app, check out our other videos. And thanks for tuning in, and see you soon.


