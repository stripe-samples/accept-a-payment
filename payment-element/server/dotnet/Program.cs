using Microsoft.Extensions.FileProviders;
using Microsoft.Extensions.Options;
using Stripe;

DotNetEnv.Env.Load();
StripeConfiguration.ApiKey = Environment.GetEnvironmentVariable("STRIPE_SECRET_KEY");

StripeConfiguration.AppInfo = new AppInfo
{
    Name = "stripe-samples/accept-a-payment/payment-element",
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

app.MapGet("/", () => Results.Redirect("index.html"));
app.MapGet("/config", (IOptions<StripeOptions> options) => new { options.Value.PublishableKey });

app.MapGet("/create-payment-intent", async () =>
{
    try
    {
        var service = new PaymentIntentService();
        var paymentIntent = await service.CreateAsync(new PaymentIntentCreateOptions
        {
            Amount = 1999,
            Currency = "EUR",
            AutomaticPaymentMethods = new PaymentIntentAutomaticPaymentMethodsOptions
            {
                Enabled = true,
            },
        });

        return Results.Ok(new { ClientSecret = paymentIntent.ClientSecret });
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
    catch (Exception e)
    {
        app.Logger.LogInformation($"Something failed {e}");
        return Results.BadRequest();
    }

    if (stripeEvent.Type == Events.PaymentIntentSucceeded)
    {
        var paymentIntent = stripeEvent.Data.Object as Stripe.PaymentIntent;
        app.Logger.LogInformation($"PaymentIntent ID: {paymentIntent.Id}");
        // Take some action based on the payment intent.
    }

    return Results.Ok();
});

app.Run();
