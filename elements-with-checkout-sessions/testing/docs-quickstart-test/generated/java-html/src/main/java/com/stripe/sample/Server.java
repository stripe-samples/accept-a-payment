package com.stripe.sample;

import java.nio.file.Paths;
import java.util.Map;
import java.util.HashMap;

import static spark.Spark.post;
import static spark.Spark.get;
import static spark.Spark.port;
import static spark.Spark.staticFiles;
import com.google.gson.Gson;

import com.stripe.StripeClient;
import com.stripe.model.checkout.Session;
import com.stripe.net.RequestOptions;
import com.stripe.param.checkout.SessionCreateParams;
import com.stripe.param.checkout.SessionRetrieveParams;

public class Server {

  public static void main(String[] args) {
    port(4246);

    // This test secret API key is a placeholder. Don't include personal details in requests with this key.
    // To see your test secret API key embedded in code samples, sign in to your Stripe account.
    // You can also find your test secret API key at https://dashboard.stripe.com/test/apikeys.
    // Don't put any keys in code. See https://docs.stripe.com/keys-best-practices.
    StripeClient client = new StripeClient(System.getenv("STRIPE_SECRET_KEY"));

    staticFiles.externalLocation(
        Paths.get("public").toAbsolutePath().toString());

    Gson gson = new Gson();

    post("/create-checkout-session", (request, response) -> {
        String YOUR_DOMAIN = "http://localhost:4246";
        SessionCreateParams params =
          SessionCreateParams.builder()

            .setUiMode(SessionCreateParams.UiMode.ELEMENTS)
            .setMode(SessionCreateParams.Mode.PAYMENT)
            .setReturnUrl(YOUR_DOMAIN + "/complete.html?session_id={CHECKOUT_SESSION_ID}")
            .addLineItem(
              SessionCreateParams.LineItem.builder()
                .setQuantity(1L)
                // Provide the exact Price ID (for example, price_1234) of the product you want to sell
                .setPrice(System.getenv("STRIPE_PRICE_ID"))
                .build())
            .build();

      Session session = client.v1().checkout().sessions().create(params);

      Map<String, String> map = new HashMap();
      map.put("clientSecret", session.getRawJsonObject().getAsJsonPrimitive("client_secret").getAsString());


      return map;
    }, gson::toJson);

    get("/session-status", (request, response) -> {
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
    }, gson::toJson);
  }
}
