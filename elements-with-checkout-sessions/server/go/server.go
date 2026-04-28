package main

import (
    "bytes"
    "context"
    "encoding/json"
    "io"
    "log"
    "net/http"
    "os"
    "path/filepath"

    "github.com/joho/godotenv"
    stripe "github.com/stripe/stripe-go/v85"
)

func main() {
  godotenv.Load()
  // For sample support and debugging, not required for production:
  stripe.SetAppInfo(&stripe.AppInfo{
    Name:    "stripe-samples/accept-a-payment/elements-with-checkout-sessions",
    Version: "0.0.2",
    URL:     "https://github.com/stripe-samples",
  })
  // Don't put any keys in code. See https://docs.stripe.com/keys-best-practices.
  sc := stripe.NewClient(os.Getenv("STRIPE_SECRET_KEY"))

  staticDir := os.Getenv("STATIC_DIR")
  if staticDir == "" {
    staticDir = "../../client/html"
  }

  http.Handle("/", http.FileServer(http.Dir(staticDir)))
  http.HandleFunc("/complete", func(w http.ResponseWriter, r *http.Request) {
    http.ServeFile(w, r, filepath.Join(staticDir, "complete.html"))
  })
  http.HandleFunc("/config", func(w http.ResponseWriter, r *http.Request) {
    if r.Method != http.MethodGet {
      http.Error(w, http.StatusText(http.StatusMethodNotAllowed), http.StatusMethodNotAllowed)
      return
    }
    writeJSON(w, struct {
      PublishableKey string `json:"publishableKey"`
    }{
      PublishableKey: os.Getenv("STRIPE_PUBLISHABLE_KEY"),
    })
  })
  http.HandleFunc("/create-checkout-session", func(w http.ResponseWriter, r *http.Request) {
    if r.Method != http.MethodPost {
      http.Error(w, http.StatusText(http.StatusMethodNotAllowed), http.StatusMethodNotAllowed)
      return
    }
    createCheckoutSession(sc, w, r)
  })
  http.HandleFunc("/session-status", func(w http.ResponseWriter, r *http.Request) {
    if r.Method != http.MethodGet {
      http.Error(w, http.StatusText(http.StatusMethodNotAllowed), http.StatusMethodNotAllowed)
      return
    }
    retrieveCheckoutSession(sc, w, r)
  })
  http.HandleFunc("/webhook", func(w http.ResponseWriter, r *http.Request) {
    if r.Method != http.MethodPost {
      http.Error(w, http.StatusText(http.StatusMethodNotAllowed), http.StatusMethodNotAllowed)
      return
    }
    handleWebhook(w, r)
  })
  listenPort := os.Getenv("PORT")
  if listenPort == "" {
    listenPort = "4242"
  }
  addr := "0.0.0.0:" + listenPort
  log.Printf("Listening on %s", addr)
  log.Fatal(http.ListenAndServe(addr, nil))
}

func createCheckoutSession(sc *stripe.Client, w http.ResponseWriter, r *http.Request) {
  port := os.Getenv("PORT")
  if port == "" {
    port = "4242"
  }
  domain := os.Getenv("DOMAIN")
  if domain == "" {
    domain = "http://localhost:" + port
  }
  params := &stripe.CheckoutSessionCreateParams{
    UIMode: stripe.String("elements"),
    ReturnURL: stripe.String(domain + "/complete?session_id={CHECKOUT_SESSION_ID}"),
    // You can also use an existing Price: &LineItemParams{Price: stripe.String("price_xxx"), Quantity: stripe.Int64(1)}
    LineItems: []*stripe.CheckoutSessionCreateLineItemParams{
      {
        PriceData: &stripe.CheckoutSessionCreateLineItemPriceDataParams{
          ProductData: &stripe.CheckoutSessionCreateLineItemPriceDataProductDataParams{
            Name: stripe.String("T-shirt"),
          },
          Currency:   stripe.String("usd"),
          UnitAmount: stripe.Int64(2000),
        },
        Quantity: stripe.Int64(1),
      },
    },
    Mode: stripe.String("payment"),
    AdaptivePricing: &stripe.CheckoutSessionCreateAdaptivePricingParams{
      Enabled: stripe.Bool(true),
    },
  }
  // Set customer_email when the user is already known (e.g. logged in) —
  // the payment form will display it as read-only. In production, use your
  // authenticated user's email. The +location_FR suffix is a test-mode
  // feature that simulates a customer in France for Adaptive Pricing.
  params.CustomerEmail = stripe.String("test+location_FR@example.com")

  s, err := sc.V1CheckoutSessions.Create(context.TODO(), params)

  if err != nil {
    log.Printf("sc.V1CheckoutSessions.Create: %v", err)
    writeJSONError(w, err.Error(), http.StatusBadRequest)
    return
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
  s, err := sc.V1CheckoutSessions.Retrieve(context.TODO(), r.URL.Query().Get("session_id"), params)

  if err != nil {
    log.Printf("sc.V1CheckoutSessions.Retrieve: %v", err)
    writeJSONError(w, err.Error(), http.StatusBadRequest)
    return
  }

  var piID, piStatus string
  if s.PaymentIntent != nil {
    piID = string(s.PaymentIntent.ID)
    piStatus = string(s.PaymentIntent.Status)
  }

  writeJSON(w, struct {
    Status string `json:"status"`
    PaymentStatus string `json:"payment_status"`
    PaymentIntentId *string `json:"payment_intent_id"`
    PaymentIntentStatus *string `json:"payment_intent_status"`
  }{
    Status: string(s.Status),
    PaymentStatus: string(s.PaymentStatus),
    PaymentIntentId: nilIfEmpty(piID),
    PaymentIntentStatus: nilIfEmpty(piStatus),
  })
}

func handleWebhook(w http.ResponseWriter, r *http.Request) {
  payload, err := io.ReadAll(r.Body)
  if err != nil {
    http.Error(w, err.Error(), http.StatusBadRequest)
    return
  }

  webhookSecret := os.Getenv("STRIPE_WEBHOOK_SECRET")
  if webhookSecret != "" {
    _, err := stripe.ConstructEvent(payload, r.Header.Get("Stripe-Signature"), webhookSecret)
    if err != nil {
      log.Printf("Webhook signature verification failed.")
      w.WriteHeader(http.StatusBadRequest)
      return
    }
  }

  var event stripe.Event
  if err := json.Unmarshal(payload, &event); err != nil {
    w.WriteHeader(http.StatusBadRequest)
    return
  }

  if event.Type == "checkout.session.completed" {
    log.Printf("Payment received!")
  }

  w.WriteHeader(http.StatusOK)
}

func nilIfEmpty(s string) *string {
  if s == "" {
    return nil
  }
  return &s
}

func writeJSONError(w http.ResponseWriter, message string, status int) {
  w.Header().Set("Content-Type", "application/json")
  w.WriteHeader(status)
  json.NewEncoder(w).Encode(struct {
    Error struct {
      Message string `json:"message"`
    } `json:"error"`
  }{
    Error: struct {
      Message string `json:"message"`
    }{Message: message},
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
