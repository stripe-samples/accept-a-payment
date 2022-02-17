using Microsoft.Extensions.FileProviders;
using Microsoft.Extensions.Options;
using Stripe;

DotNetEnv.Env.Load();

StripeConfiguration.AppInfo = new AppInfo
{
    Name = "stripe-samples/accept-a-payment/custom-payment-flow",
    Url = "https://github.com/stripe-samples",
    Version = "0.1.0",
};

StripeConfiguration.ApiKey = Environment.GetEnvironmentVariable("STRIPE_SECRET_KEY");

var builder = WebApplication.CreateBuilder(args);
builder.Services.Configure<StripeOptions>(options =>
{
    options.PublishableKey = Environment.GetEnvironmentVariable("STRIPE_PUBLISHABLE_KEY");
    options.SecretKey = Environment.GetEnvironmentVariable("STRIPE_SECRET_KEY");
    options.WebhookSecret = Environment.GetEnvironmentVariable("STRIPE_WEBHOOK_SECRET");
});

var app = builder.Build();

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

app.MapGet("/config", (IOptions<StripeOptions> options) => new { options.Value.PublishableKey });

app.MapPost("/create-payment-intent", async (CreatePaymentIntentRequest req) =>
{
    var options = new PaymentIntentCreateOptions
    {
        Amount = 1999,
        Currency = req.Currency,
        PaymentMethodTypes = new List<string> { req.PaymentMethodType }
    };

    // If this is for an ACSS payment, we add payment_method_options to create
    // the Mandate.
    if (req.PaymentMethodType == "acss_debit")
    {
        options.PaymentMethodOptions = new PaymentIntentPaymentMethodOptionsOptions
        {
            AcssDebit = new PaymentIntentPaymentMethodOptionsAcssDebitOptions
            {
                MandateOptions = new PaymentIntentPaymentMethodOptionsAcssDebitMandateOptionsOptions
                {
                    PaymentSchedule = "sporadic",
                    TransactionType = "personal",
                },
            }
        };
    }

    var service = new PaymentIntentService();

    try
    {
        var paymentIntent = await service.CreateAsync(options);

        return Results.Ok(new
        {
            ClientSecret = paymentIntent.ClientSecret,
        });
    }
    catch (StripeException e)
    {
        return Results.BadRequest(new { error = new { message = e.StripeError.Message } });
    }
});

app.MapPost("/webhook", async (HttpRequest request, IOptions<StripeOptions> options) =>
{
    var json = await new StreamReader(request.Body).ReadToEndAsync();
    Event stripeEvent;
    try
    {
        stripeEvent = EventUtility.ConstructEvent(
            json,
            request.Headers["Stripe-Signature"],
            options.Value.WebhookSecret
        );
        app.Logger.LogInformation($"Webhook notification with type: {stripeEvent.Type} found for {stripeEvent.Id}");
    }
    catch (Exception ex)
    {
        app.Logger.LogError(ex, "Something failed");
        return Results.BadRequest();
    }

    if (stripeEvent.Type == "checkout.session.completed")
    {
        var session = stripeEvent.Data.Object as Stripe.Checkout.Session;
        app.Logger.LogInformation($"Session ID: {session.Id}");
        // Take some action based on session.
    }

    return Results.Ok();
});

app.Run();

