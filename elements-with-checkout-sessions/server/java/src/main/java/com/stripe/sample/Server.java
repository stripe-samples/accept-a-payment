package com.stripe.sample;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.Map;
import java.util.HashMap;

import static spark.Spark.post;
import static spark.Spark.get;
import static spark.Spark.port;
import static spark.Spark.staticFiles;
import com.google.gson.Gson;
import io.github.cdimascio.dotenv.Dotenv;

import com.stripe.Stripe;
import com.stripe.StripeClient;
import com.stripe.exception.StripeException;
import com.stripe.model.Event;
import com.stripe.model.checkout.Session;
import com.stripe.net.Webhook;
import com.stripe.param.checkout.SessionCreateParams;
import com.stripe.param.checkout.SessionRetrieveParams;

public class Server {

  static Dotenv dotenv = Dotenv.configure().ignoreIfMissing().load();

  static String env(String key, String defaultValue) {
    String val = dotenv.get(key);
    if (val != null) return val;
    val = System.getenv(key);
    return val != null ? val : defaultValue;
  }

  public static void main(String[] args) {
    int serverPort = Integer.parseInt(env("PORT", "4242"));
    port(serverPort);

    // For sample support and debugging, not required for production:
    Stripe.setAppInfo(
        "stripe-samples/accept-a-payment/elements-with-checkout-sessions",
        "0.0.2",
        "https://github.com/stripe-samples"
    );

    // Don't put any keys in code. See https://docs.stripe.com/keys-best-practices.
    StripeClient client = new StripeClient(env("STRIPE_SECRET_KEY", ""));

    String staticDir = env("STATIC_DIR", "../../client/html");
    staticFiles.externalLocation(
        Paths.get(staticDir).toAbsolutePath().normalize().toString());

    Gson gson = new com.google.gson.GsonBuilder().serializeNulls().create();

    get("/complete", (request, response) -> {
        response.type("text/html");
        return new String(Files.readAllBytes(Paths.get(staticDir, "complete.html")));
    });

    get("/config", (request, response) -> {
        Map<String, String> map = new HashMap();
        map.put("publishableKey", env("STRIPE_PUBLISHABLE_KEY", ""));
        return map;
    }, gson::toJson);

    post("/create-checkout-session", (request, response) -> {
      try {
        String YOUR_DOMAIN = env("DOMAIN", "http://localhost:" + serverPort);
        SessionCreateParams.Builder paramsBuilder =
          SessionCreateParams.builder()
            .setUiMode(SessionCreateParams.UiMode.ELEMENTS)
            .setMode(SessionCreateParams.Mode.PAYMENT)
            .setReturnUrl(YOUR_DOMAIN + "/complete?session_id={CHECKOUT_SESSION_ID}")
            // You can also use an existing Price: .addLineItem(LineItem.builder().setPrice("price_xxx").setQuantity(1L).build())
            .addLineItem(
              SessionCreateParams.LineItem.builder()
                .setQuantity(1L)
                .setPriceData(
                  SessionCreateParams.LineItem.PriceData.builder()
                    .setProductData(
                      SessionCreateParams.LineItem.PriceData.ProductData.builder()
                        .setName("T-shirt")
                        .build())
                    .setCurrency("usd")
                    .setUnitAmount(2000L)
                    .build())
                .build())
            .setAdaptivePricing(
              SessionCreateParams.AdaptivePricing.builder()
                .setEnabled(true)
                .build());
        String customerEmail = System.getenv("CUSTOMER_EMAIL");
        if (customerEmail != null && !customerEmail.isEmpty()) {
          paramsBuilder.setCustomerEmail(customerEmail);
        }
        SessionCreateParams params = paramsBuilder.build();

        Session session = client.v1().checkout().sessions().create(params);

        Map<String, String> map = new HashMap();
        map.put("clientSecret", session.getClientSecret());

        return map;
      } catch (StripeException e) {
        response.status(400);
        Map<String, Object> error = new HashMap();
        error.put("error", Map.of("message", e.getMessage()));
        return error;
      }
    }, gson::toJson);

    get("/session-status", (request, response) -> {
      try {
        SessionRetrieveParams params =
          SessionRetrieveParams.builder().addExpand("payment_intent").build();
        Session session = client.v1().checkout().sessions().retrieve(request.queryParams("session_id"), params);

        var pi = session.getPaymentIntentObject();
        Map<String, String> map = new HashMap();
        map.put("status", session.getStatus());
        map.put("payment_status", session.getPaymentStatus());
        map.put("payment_intent_id", pi != null ? pi.getId() : null);
        map.put("payment_intent_status", pi != null ? pi.getStatus() : null);

        return map;
      } catch (StripeException e) {
        response.status(400);
        Map<String, Object> error = new HashMap();
        error.put("error", Map.of("message", e.getMessage()));
        return error;
      }
    }, gson::toJson);

    post("/webhook", (request, response) -> {
      String payload = request.body();
      String sigHeader = request.headers("Stripe-Signature");
      String webhookSecret = env("STRIPE_WEBHOOK_SECRET", "");

      Event event;
      if (!webhookSecret.isEmpty()) {
        try {
          event = Webhook.constructEvent(payload, sigHeader, webhookSecret);
        } catch (Exception e) {
          System.out.println("Webhook signature verification failed.");
          response.status(400);
          return "";
        }
      } else {
        event = gson.fromJson(payload, Event.class);
      }

      if ("checkout.session.completed".equals(event.getType())) {
        System.out.println("Payment received!");
      }

      response.status(200);
      return "";
    });
  }
}
