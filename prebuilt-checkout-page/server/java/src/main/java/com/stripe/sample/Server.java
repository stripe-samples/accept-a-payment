package com.stripe.sample;

import java.nio.file.Paths;

import java.util.HashMap;
import java.util.Map;
import java.util.List;
import java.util.Arrays;
import java.util.stream.Stream;
import java.util.stream.Collectors;

import static spark.Spark.get;
import static spark.Spark.post;
import static spark.Spark.port;
import static spark.Spark.staticFiles;

import com.google.gson.Gson;
import com.google.gson.annotations.SerializedName;

import com.stripe.Stripe;
import com.stripe.model.Event;
import com.stripe.model.checkout.Session;
import com.stripe.model.Price;
import com.stripe.exception.*;
import com.stripe.net.Webhook;
import com.stripe.param.checkout.SessionCreateParams;
import com.stripe.param.checkout.SessionCreateParams.LineItem;
import com.stripe.param.checkout.SessionCreateParams.PaymentMethodType;

import io.github.cdimascio.dotenv.Dotenv;

public class Server {
    private static Gson gson = new Gson();

    public static void main(String[] args) {
        port(4242);

        Dotenv dotenv = Dotenv.load();

        checkEnv();

        Stripe.apiKey = dotenv.get("STRIPE_SECRET_KEY");

        // For sample support and debugging, not required for production:
        Stripe.setAppInfo(
            "stripe-samples/accept-a-payment/prebuilt-checkout-page",
            "0.0.1",
            "https://github.com/stripe-samples"
        );

        staticFiles.externalLocation(
                Paths.get(Paths.get("").toAbsolutePath().toString(), dotenv.get("STATIC_DIR")).normalize().toString());

        get("/config", (request, response) -> {
            response.type("application/json");
            Price price = Price.retrieve(dotenv.get("PRICE"));

            Map<String, Object> responseData = new HashMap<>();
            responseData.put("publishableKey", dotenv.get("STRIPE_PUBLISHABLE_KEY"));
            responseData.put("unitAmount", price.getUnitAmount());
            responseData.put("currency", price.getCurrency());
            return gson.toJson(responseData);
        });

        // Fetch the Checkout Session to display the JSON result on the success page
        get("/checkout-session", (request, response) -> {
            response.type("application/json");

            String sessionId = request.queryParams("sessionId");
            Session session = Session.retrieve(sessionId);

            return gson.toJson(session);
        });

        post("/create-checkout-session", (request, response) -> {
            response.type("application/json");

            String domainUrl = dotenv.get("DOMAIN");
            String price = dotenv.get("PRICE");

            // Pull the comma separated list of payment method types from the
            // environment variables stored in `.env`.  Then map to uppercase
            // strings so that we can lookup the PaymentMethodType enum values.
            //
            // In practice, you could hard code the list of strings representing
            // the payment method types you accept.
            String[] pmTypes = dotenv.get("PAYMENT_METHOD_TYPES", "card").split(",", 0);
            List<PaymentMethodType> paymentMethodTypes = Stream
                .of(pmTypes)
                .map(String::toUpperCase)
                .map(PaymentMethodType::valueOf)
                .collect(Collectors.toList());

            // Create new Checkout Session for the payment
            // For full details see https://stripe.com/docs/api/checkout/sessions/create
            // ?session_id={CHECKOUT_SESSION_ID} means the redirect will have the session ID
            // set as a query param
            SessionCreateParams.Builder builder = new SessionCreateParams.Builder()
                .setSuccessUrl(domainUrl + "/success.html?session_id={CHECKOUT_SESSION_ID}")
                .setCancelUrl(domainUrl + "/canceled.html")
                .addAllPaymentMethodType(paymentMethodTypes)
                .setMode(SessionCreateParams.Mode.PAYMENT)
                .addLineItem(SessionCreateParams.LineItem.builder()
                        .setQuantity(1L)
                        .setPrice(price)
                        .build());

            SessionCreateParams createParams = builder.build();
            Session session = Session.create(createParams);

            Map<String, Object> responseData = new HashMap<>();
            responseData.put("sessionId", session.getId());
            return gson.toJson(responseData);
        });

        post("/webhook", (request, response) -> {
            String payload = request.body();
            String sigHeader = request.headers("Stripe-Signature");
            String endpointSecret = dotenv.get("STRIPE_WEBHOOK_SECRET");

            Event event = null;

            try {
                event = Webhook.constructEvent(payload, sigHeader, endpointSecret);
            } catch (SignatureVerificationException e) {
                // Invalid signature
                response.status(400);
                return "";
            }

            switch (event.getType()) {
                case "checkout.session.completed":
                    // Note: If you need access to the line items, for instance
                    // to automate fullfillment based on the the ID of the
                    // Price, you'll need to refetch the Checkout Session here,
                    // and expand the line items:
                    //
                    // SessionRetrieveParams params =
                    // SessionRetrieveParams.builder()
                    //     .addExpand("line_items")
                    //     .build();
                    //
                    // // Pass in the ID of the session from event.getData().getObject().getId()
                    // Session session = Session.retrieve("cs_test_...", params, null);
                    //
                    // SessionListLineItemsParams listLineItemsParams = SessionListLineItemsParams.builder().build();
                    //
                    // LineItemCollection lineItems = session.listLineItems(listLineItemsParams);
                    System.out.println("Payment succeeded!");
                    response.status(200);
                    return "";
                default:
                    response.status(200);
                    return "";
            }
        });
    }

    public static void checkEnv() {
        Dotenv dotenv = Dotenv.load();
        String price = dotenv.get("PRICE");
        if(price == "price_12345" || price == "" || price == null) {
            System.out.println("You must set a Price ID in the .env file. Please see the README.");
            System.exit(0);
        }
    }
}
