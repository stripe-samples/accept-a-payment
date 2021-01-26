package com.stripe.sample;

import java.nio.file.Paths;

import static spark.Spark.get;
import static spark.Spark.post;
import static spark.Spark.staticFiles;
import static spark.Spark.port;

import com.google.gson.Gson;
import com.google.gson.annotations.SerializedName;

import com.stripe.Stripe;
import com.stripe.net.ApiResource;
import com.stripe.model.Event;
import com.stripe.model.EventDataObjectDeserializer;
import com.stripe.model.PaymentIntent;
import com.stripe.exception.*;
import com.stripe.net.Webhook;
import com.stripe.param.PaymentIntentCreateParams;

import io.github.cdimascio.dotenv.Dotenv;

public class Server {
    private static Gson gson = new Gson();

    static class CreatePaymentBody {
        @SerializedName("items")
        Object[] items;

        @SerializedName("currency")
        String currency;

        public Object[] getItems() {
            return items;
        }

        public String getCurrency() {
            return currency;
        }
    }

    static class CreatePaymentResponse {
        private String publishableKey;
        private String clientSecret;

        public CreatePaymentResponse(String publishableKey, String clientSecret) {
            this.publishableKey = publishableKey;
            this.clientSecret = clientSecret;
        }
    }

    static int calculateOrderAmount(Object[] items) {
        // Replace this constant with a calculation of the order's amount
        // Calculate the order total on the server to prevent
        // users from directly manipulating the amount on the client
        return 1400;
    }

    public static void main(String[] args) {
        port(4242);
        Dotenv dotenv = Dotenv.load();

        Stripe.apiKey = dotenv.get("STRIPE_SECRET_KEY");

        staticFiles.externalLocation(
                Paths.get(Paths.get("").toAbsolutePath().toString(), dotenv.get("STATIC_DIR")).normalize().toString());

        post("/create-payment-intent", (request, response) -> {
            response.type("application/json");

            CreatePaymentBody postBody = gson.fromJson(request.body(), CreatePaymentBody.class);
            PaymentIntentCreateParams createParams = new PaymentIntentCreateParams.Builder()
                    .setCurrency(postBody.getCurrency()).setAmount(new Long(calculateOrderAmount(postBody.getItems())))
                    .build();
            // Create a PaymentIntent with the order amount and currency
            PaymentIntent intent = PaymentIntent.create(createParams);
            // Send publishable key and PaymentIntent details to client
            return gson.toJson(new CreatePaymentResponse(dotenv.get("STRIPE_PUBLISHABLE_KEY"), intent.getClientSecret()));
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
            case "payment_intent.succeeded":
                // Fulfill any orders, e-mail receipts, etc
                // To cancel the payment you will need to issue a Refund
                // (https://stripe.com/docs/api/refunds)
                System.out.println("💰Payment received!");
                break;
            case "payment_intent.payment_failed":
                System.out.println("❌ Payment failed.");
                break;
            default:
                // Unexpected event type
                response.status(400);
                return "";
            }

            response.status(200);
            return "";
        });
    }
}