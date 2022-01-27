# Accept a payment


You can [🎥 watch a video](https://www.youtube.com/watch?v=cbsCxLDL4EY) to see how this server was implemented and [read the transcripts](./TRANSCRIPTS.md).

---

CJ Avilla (00:00):
In this episode, we cover the basic server side implementation for accepting a one-time payment with a custom form. If you're interested in a faster integration path using Stripe hosted checkout, head over to the checkout playlist in the Stripe developers channel.

CJ Avilla (00:13):
The payment flow you'll see today for collecting a one-time payment has two steps. First, creating the PaymentIntent on the server. And second, confirming the payment on the client, using the client secret for the PaymentIntent. In this episode, you'll learn how to add an end point to your server to create the PaymentIntent. Then, depending on whether you're using vanilla JS or React on the web or Stripe iOS or Stripe Android on mobile, you can watch those videos for specific front end implementations that will pair with the code we implement here.

CJ Avilla (00:43):
So rather than start from scratch, we're going to jumpstart our server implementation using the developer office hours base sample. If you want to see how we go from zero to one, check out the Python flask starter linked in the description. You might also be interested in an episode about working with the Stripe CLI, a handy tool for helping you build and test your Stripe integration.

CJ Avilla (01:04):
So from the terminal, we run "stripe samples create developer-office-hours" and we'll give this one an alias of "tutorial". We can now pick Python and that will download and scaffold a bare bones project with a simple flask server in an HTML client. In this episode, we'll spend all of our time in the server directory and in future episodes, we'll go and implement the front ends to confirm payment.

CJ Avilla (01:28):
So let's change into the server directory and open server.py. Now you'll see that server.py already contains a route route for rendering a basic HTML page and a skeleton for the web hook end point. Now at a minimum, we need to add one new server end point to create a PaymentIntent that will later confirm on the front end. So this route will accept post requests, as by convention, we're creating a new resource, a PaymentIntent. Let's stick with the same naming convention as the Stripe docs and name our route "create_Payment_Intent."

CJ Avilla (02:01):
So the logic of this route is very simple. We'll create a PaymentIntent using the stripe Python client library to make an API request directly to Stripe. And initially, we'll hard code in past just the minimum required arguments, so "amount" and "currency." Now, this amount is denoted in the smallest denomination for a given currency. So in this case, cents. And finally we need to return some "json" with only the client secret property of that newly created PaymentIntent.

CJ Avilla (02:30):
All right, let's jump into another terminal instance so we can activate the virtual environment, install dependencies and start the flask server. Let's also experiment with that end point we just created using "curl" to make a direct request to that end point. So this is going to be a post request to local host 4242 with some "application/json" in the request body. So for now we're just going to pass an empty json object. Notice the response is well-formed json and includes the client secret for the newly created PaymentIntent.

CJ Avilla (03:07):
Returning to our code, let's talk about this API call for creating a PaymentIntent. It turns out there are more than two dozen optional parameters available for tailoring the payment experience for your customers. One of those optional parameters is "payment_method_types" which takes a list of string values for the payment method options you'd like to allow your customers to pay with. So by default, this is set to an array with one element, a string with the word "card," making this PaymentIntent only confirmable with a card payment method. So in practice you could hardcode a list of string values for all the different payment method types you want to accept here.

CJ Avilla (03:44):
In this series, you'll learn how to accept a wide variety of payment method types. So let's refactor our end point to accept some arguments by deserializing the json in the request body. We're going to extract an argument for the payment method type. And furthermore, some payment methods only work with specific currency, so let's also allow that to be passed in from the front end. Cool, let's head over to the terminal, update our curl request to pass in the payment method type and the currency in the request body. Cool. That works.

CJ Avilla (04:16):
But if we then try to pass "au_becs_debit" as our payment method type, and we keep USD as the currency, notice this fails because au_becs_debit only works with Australian dollars. In this case, the server responded with an HTML page with the development error logs. So if we updated our curl request to pass AUD, the server responds with a client secret as expected.

CJ Avilla (04:38):
So in the future, we'll want to surface failures in a nice format so that our front end can consistently parse and present errors to our customer. So let's wrap that API call in a try except block and render an error response with well-formed json in a failure case. Let's just return a 400 for Stripe errors and five hundreds otherwise. The failure responses follow the structure where the json has an error property pointing at an object with a string message. This matches the shape returned directly from the Stripe API for client side calls, so it'll make implementing our error handling logic on the client's just a bit easier to reason about.

CJ Avilla (05:17):
Now when attempting to create a PaymentIntent with an invalid combination of payment method type and currency, we see a well-formed json error response. Most payment method types complete payment asynchronously. For some, payments complete nearly instantly, like cards, but for others, payments can take a few days or more to complete. So due to the asynchronous nature of the way that money just flows through networks, we highly recommend implementing web hooks to automate fulfillment. We have an episode all about how to set up your web hook handler.

CJ Avilla (05:48):
So let's update our web hook end point to simply print to the server log when the PaymentIntent events fire. It's quite common to automate things like email notifications, updating your database, pulling from inventory, printing, shipping labels, and more, as part of your web hook handler. Also worth noting is that you can use a third-party tool like Zapier or Ift as a low or no code solution for handling web hook notifications.

CJ Avilla (06:11):
So from the terminal we'll again test our new web hook logic with the Stripe cli by using the "listen" command. "Stripe listen" forms a direct connection from Stripe to this locally running server so that when events happen on the Stripe account, they're delivered to the development server without needing any tunneling software like ngrok. The "Stripe listen" command accepts a URL to which events should be forwarded. Now, if we successfully create a new PaymentIntent, let's say with the ideal payment method type and euros, we'll see in the server log that the PaymentIntent was created. And we can see in the logs for "Stripe listen" that the PaymentIntent created event fired. So when receiving event types that start with "PaymentIntent." an instance of the PaymentIntent object is available on "event.['data']['object'].

CJ Avilla (07:01):
Let's improve our logs statement to include the IDs of the event and PaymentIntent and the status of the PaymentIntent. We'll fire another test to confirm our improved log statement. And now we see the IDs of the event, the ID of the PaymentIntent and the status of the PaymentIntent. Notice that the PaymentIntent was not created with any specific payment method, so its status is "requires payment method." We'll assign a new payment method when confirming the payment on the front end, again, covered in a future episode.

CJ Avilla (07:31):
So as we add support for more payment method types, it'll be interesting to see these status messages in the server logs and align those with what the customer's experiencing with the various states for PaymentIntents. So note that depending on which payment method types you plan to support and plan to offer, and which automations you're planning to build, you likely won't need to handle every single one of these event types.

CJ Avilla (07:54):
All right. So at this point, the server is technically ready to add a front end. However, we'll add one last simple config route for fetching the publishable key so that we don't need to hard-code that on the front ends. So this simple helper is just purely for serving our publishable key when receiving a "get_request/config." This is a best practice when working with mobile clients, so that if for some reason you need to roll your API keys, the publishable key is not hard-coded into the production mobile apps shipped to users. But it requires that all users install the updated version of the app to get the new key.

CJ Avilla (08:29):
As a quick recap, we added a new end point to create PaymentIntents. The API called to create the PaymentIntents passes the amount, currency and a type of payment method we want to allow. And we also added some logging to the web hook handler for debugging and looking into the future when implementing application logic to automate fulfillment. And finally, we added a quick helper route for returning the publishable key so that we don't hard-code those in mobile clients.

CJ Avilla (08:56):
Next, we recommend heading over to one of the playlists that most closely fits your front end implementation. And you can use the links in the description or head over to the Stripe Developers channel and take a look at those playlists where you can learn all about different payment method types and confirming those on the client. Thanks for watching and we'll see you in the next one.
