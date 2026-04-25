package main

import (
    "bytes"
    "context"
    "encoding/json"
    "io"
    "log"
    "net/http"
    "os"
    "github.com/stripe/stripe-go/v85"
)

func main() {
  // This test secret API key is a placeholder. Don't include personal details in requests with this key.
  // To see your test secret API key embedded in code samples, sign in to your Stripe account.
  // You can also find your test secret API key at https://dashboard.stripe.com/test/apikeys.
  // Don't put any keys in code. See https://docs.stripe.com/keys-best-practices.
  sc := stripe.NewClient(os.Getenv("STRIPE_SECRET_KEY"))

  http.Handle("/", http.FileServer(http.Dir("public")))
  http.HandleFunc("/create-checkout-session", func(w http.ResponseWriter, r *http.Request) { createCheckoutSession(sc, w, r) })
  http.HandleFunc("/session-status", func(w http.ResponseWriter, r *http.Request) { retrieveCheckoutSession(sc, w, r) })
  addr := "localhost:4254"
  log.Printf("Listening on %s", addr)
  log.Fatal(http.ListenAndServe(addr, nil))
}

func createCheckoutSession(sc *stripe.Client, w http.ResponseWriter, r *http.Request) {
  domain := "http://localhost:3005"
  params := &stripe.CheckoutSessionCreateParams{

    UIMode: stripe.String("elements"),
    ReturnURL: stripe.String(domain + "/complete?session_id={CHECKOUT_SESSION_ID}"),
    LineItems: []*stripe.CheckoutSessionCreateLineItemParams{
      {
        // Provide the exact Price ID (for example, price_1234) of the product you want to sell
        Price: stripe.String(os.Getenv("STRIPE_PRICE_ID")),
        Quantity: stripe.Int64(1),
      },
    },
    Mode: stripe.String("payment"),
  }

  s, err := sc.V1CheckoutSessions.Create(context.TODO(), params)

  if err != nil {
    log.Printf("sc.V1CheckoutSessions.Create: %v", err)
  }

  writeJSON(w, struct {
    ClientSecret string `json:"clientSecret"`
  }{
    ClientSecret: s.ClientSecret,
  })
}

func retrieveCheckoutSession(sc *stripe.Client, w http.ResponseWriter, r *http.Request) {
  params := &stripe.CheckoutSessionRetrieveParams{}
  params.AddExpand("payment_intent")
  s, _ := sc.V1CheckoutSessions.Retrieve(context.TODO(), r.URL.Query().Get("session_id"), params)

  writeJSON(w, struct {
    Status string `json:"status"`
    PaymentStatus string `json:"payment_status"`
    PaymentIntentId string `json:"payment_intent_id"`
    PaymentIntentStatus string `json:"payment_intent_status"`
  }{
    Status: string(s.Status),
    PaymentStatus: string(s.PaymentStatus),
    PaymentIntentId: string(s.PaymentIntent.ID),
    PaymentIntentStatus: string(s.PaymentIntent.Status),
  })
}

func writeJSON(w http.ResponseWriter, v interface{}) {
  var buf bytes.Buffer
  if err := json.NewEncoder(&buf).Encode(v); err != nil {
    http.Error(w, err.Error(), http.StatusInternalServerError)
    log.Printf("json.NewEncoder.Encode: %v", err)
    return
  }
  w.Header().Set("Content-Type", "application/json")
  if _, err := io.Copy(w, &buf); err != nil {
    log.Printf("io.Copy: %v", err)
    return
  }
}
