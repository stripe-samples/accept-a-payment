using Microsoft.Extensions.FileProviders;
using Microsoft.Extensions.Options;
using Stripe;
using Stripe.Checkout;

DotNetEnv.Env.Load();

var builder = WebApplication.CreateBuilder(args);

builder.Services.Configure<StripeOptions>(options =>
{
    options.PublishableKey = Environment.GetEnvironmentVariable("STRIPE_PUBLISHABLE_KEY");
    options.SecretKey = Environment.GetEnvironmentVariable("STRIPE_SECRET_KEY");
    options.WebhookSecret = Environment.GetEnvironmentVariable("STRIPE_WEBHOOK_SECRET");
    options.Price = Environment.GetEnvironmentVariable("PRICE");
    options.Domain = Environment.GetEnvironmentVariable("DOMAIN");
});
var app = builder.Build();

StripeConfiguration.ApiKey = Environment.GetEnvironmentVariable("STRIPE_SECRET_KEY");

StripeConfiguration.AppInfo = new AppInfo
{
    Name = "stripe-samples/prebuilt-checkout-page",
    Url = "https://github.com/stripe-samples",
    Version = "0.1.0",
};

StripeConfiguration.ApiKey = Environment.GetEnvironmentVariable("STRIPE_SECRET_KEY");

var price = Environment.GetEnvironmentVariable("PRICE");
if (price == "price_12345" || price == "" || price == null)
{
    app.Logger.LogError("You must set a Price ID in .env. Please see the README.");
    Environment.Exit(1);
}

if (app.Environment.IsDevelopment())
{
    app.UseDeveloperExceptionPage();
}

app.UseStaticFiles(new StaticFileOptions()
{
    FileProvider = new PhysicalFileProvider(
        Path.Combine(Directory.GetCurrentDirectory(),
        Environment.GetEnvironmentVariable("STATIC_DIR"))
    ),
    RequestPath = new PathString("")
});

app.MapGet("/", () => Results.Redirect("index.html"));

app.MapGet("checkout-session", async (string sessionId) =>
{
    var service = new SessionService();
    var session = await service.GetAsync(sessionId);
    return Results.Ok(session);
});

app.MapPost("create-checkout-session", async (IOptions<StripeOptions> options, HttpContext context) =>
{
    // Create new Checkout Session for the order
    // Other optional params include:
    //  [billing_address_collection] - to display billing address details on the page
    //  [customer] - if you have an existing Stripe Customer ID
    //  [customer_email] - lets you prefill the email input in the form
    //  [automatic_tax] - to automatically calculate sales tax, VAT and GST in the checkout page
    //  For full details see https:#stripe.com/docs/api/checkout/sessions/create

    //  ?session_id={CHECKOUT_SESSION_ID} means the redirect will have the session ID set as a query param
    var sessionOptions = new SessionCreateOptions
    {
        SuccessUrl = $"{options.Value.Domain}/success.html?session_id={{CHECKOUT_SESSION_ID}}",
        CancelUrl = $"{options.Value.Domain}/canceled.html",
        Mode = "payment",
        LineItems = new List<SessionLineItemOptions>
                {
                    new SessionLineItemOptions
                    {
                        Quantity = 1,
                        Price = options.Value.Price,
                    },
                },
        // AutomaticTax = new SessionAutomaticTaxOptions { Enabled = true },
    };

    var service = new SessionService();
    var session = await service.CreateAsync(sessionOptions);
    context.Response.Headers.Add("Location", session.Url);
    return Results.StatusCode(303);
});

app.MapPost("webhook", async (HttpRequest req, IOptions<StripeOptions> options) =>
{
    var json = await new StreamReader(req.Body).ReadToEndAsync();
    Event stripeEvent;
    try
    {
        stripeEvent = EventUtility.ConstructEvent(
            json,
            req.Headers["Stripe-Signature"],
            options.Value.WebhookSecret
        );
        app.Logger.LogInformation($"Webhook notification with type: {stripeEvent.Type} found for {stripeEvent.Id}");
    }
    catch (Exception e)
    {
        app.Logger.LogError(e, $"Something failed => {e.Message}");
        return Results.BadRequest();
    }

    if (stripeEvent.Type == Events.CheckoutSessionCompleted)
    {
        var session = stripeEvent.Data.Object as Stripe.Checkout.Session;
        app.Logger.LogInformation($"Session ID: {session.Id}");
        // Take some action based on session.
        // Note: If you need access to the line items, for instance to
        // automate fullfillment based on the the ID of the Price, you'll
        // need to refetch the Checkout Session here, and expand the line items:
        //
        //var options = new SessionGetOptions();
        // options.AddExpand("line_items");
        //
        // var service = new SessionService();
        // Session session = service.Get(session.Id, options);
        //
        // StripeList<LineItem> lineItems = session.LineItems;
        //
        // Read more about expand here: https://stripe.com/docs/expand
    }

    return Results.Ok();
});

app.Run();
