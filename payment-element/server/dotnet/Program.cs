using Microsoft.Extensions.FileProviders;
using Microsoft.Extensions.Options;
using Stripe;
using Stripe.Tax;

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
        long orderAmount = 1400;
        var taxCalculation = CalculateTax(orderAmount, "usd");

        var service = new PaymentIntentService();
        var paymentIntent = await service.CreateAsync(new PaymentIntentCreateOptions
        {
            Amount = orderAmount + taxCalculation.TaxAmountExclusive,
            Currency = "USD",
            AutomaticPaymentMethods = new PaymentIntentAutomaticPaymentMethodsOptions
            {
                Enabled = true,
            },
            Metadata = new Dictionary<string, string>
        {
          { "tax_calculation", taxCalculation.Id },
        }
        });
        Console.WriteLine(paymentIntent.Amount);
        return Results.Ok(new { ClientSecret = paymentIntent.ClientSecret });
    }
    catch (StripeException e)
    {
        return Results.BadRequest(new { error = new { message = e.StripeError.Message } });
    }
});

static Calculation CalculateTax(long orderAmount, string currency)
{

    var calculationCreateOptions = new CalculationCreateOptions
    {
        Currency = currency,
        CustomerDetails = new CalculationCustomerDetailsOptions
        {
            Address = new AddressOptions
            {
                Line1 = "920 5th Ave",
                City = "Seattle",
                State = "WA",
                PostalCode = "98104",
                Country = "US",
            },
            AddressSource = "shipping",
        },
        LineItems = new List<CalculationLineItemOptions> {
                 new() {
                    Amount = orderAmount,
                    Reference = "ProductRef",
                    TaxBehavior ="exclusive",
                    TaxCode = "txcd_30011000"
                }
            }
    };

    var calculationService = new CalculationService();
    var calculation = calculationService.Create(calculationCreateOptions);

    return calculation;
}

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
