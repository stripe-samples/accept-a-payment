package com.stripe.sample;

import java.nio.file.Paths;

import static spark.Spark.get;
import static spark.Spark.post;
import static spark.Spark.port;
import static spark.Spark.staticFiles;

import com.google.gson.Gson;

import com.stripe.Stripe;
import com.stripe.model.Event;
import com.stripe.model.checkout.Session;
import com.stripe.exception.*;
import com.stripe.net.Webhook;
import com.stripe.param.checkout.SessionCreateParams;

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

            // Create new Checkout Session for the payment
            // For full details see https://stripe.com/docs/api/checkout/sessions/create
            // ?session_id={CHECKOUT_SESSION_ID} means the redirect will have the session ID
            // set as a query param
            SessionCreateParams.Builder builder = new SessionCreateParams.Builder()
                .setSuccessUrl(domainUrl + "/success.html?session_id={CHECKOUT_SESSION_ID}")
                .setCancelUrl(domainUrl + "/canceled.html")
                .setMode(SessionCreateParams.Mode.PAYMENT)
                // .setAutomaticTax(SessionCreateParams.AutomaticTax.builder().setEnabled(true).build()).
                .addLineItem(SessionCreateParams.LineItem.builder()
                        .setQuantity(1L)
                        .setPrice(price)
                        .build());

            SessionCreateParams createParams = builder.build();
            Session session = Session.create(createParams);

            response.redirect(session.getUrl(), 303);
            return "";
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
