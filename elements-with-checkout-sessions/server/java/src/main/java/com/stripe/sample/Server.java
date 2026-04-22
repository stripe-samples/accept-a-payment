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

import com.stripe.StripeClient;
import com.stripe.exception.StripeException;
import com.stripe.model.checkout.Session;
import com.stripe.net.RequestOptions;
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
    String portEnv = env("PORT", "4242");
    port(Integer.parseInt(portEnv));

    // Don't put any keys in code. See https://docs.stripe.com/keys-best-practices.
    StripeClient client = new StripeClient(env("STRIPE_SECRET_KEY", ""));

    String staticDir = env("STATIC_DIR", "../../client/html/public");
    staticFiles.externalLocation(
        Paths.get(staticDir).toAbsolutePath().toString());

    Gson gson = new Gson();

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
        String YOUR_DOMAIN = env("DOMAIN", "http://localhost:4242");
        SessionCreateParams params =
          SessionCreateParams.builder()

            .setUiMode(SessionCreateParams.UiMode.ELEMENTS)
            .setMode(SessionCreateParams.Mode.PAYMENT)
            .setReturnUrl(YOUR_DOMAIN + "/complete?session_id={CHECKOUT_SESSION_ID}")
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
            .build();

        Session session = client.v1().checkout().sessions().create(params);

        Map<String, String> map = new HashMap();
        map.put("clientSecret", session.getRawJsonObject().getAsJsonPrimitive("client_secret").getAsString());

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
        RequestOptions options = RequestOptions.builder().build();
        SessionRetrieveParams params =
          SessionRetrieveParams.builder().addExpand("payment_intent").build();
        Session session = client.v1().checkout().sessions().retrieve(request.queryParams("session_id"), params, options);

        Map<String, String> map = new HashMap();
        map.put("status", session.getRawJsonObject().getAsJsonPrimitive("status").getAsString());
        map.put("payment_status", session.getRawJsonObject().getAsJsonPrimitive("payment_status").getAsString());
        map.put("payment_intent_id", session.getRawJsonObject().getAsJsonObject("payment_intent").getAsJsonPrimitive("id").getAsString());
        map.put("payment_intent_status", session.getRawJsonObject().getAsJsonObject("payment_intent").getAsJsonPrimitive("status").getAsString());

        return map;
      } catch (StripeException e) {
        response.status(400);
        Map<String, Object> error = new HashMap();
        error.put("error", Map.of("message", e.getMessage()));
        return error;
      }
    }, gson::toJson);
  }
}
