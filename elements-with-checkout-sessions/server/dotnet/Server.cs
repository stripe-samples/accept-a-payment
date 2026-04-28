using System;
using System.Collections.Generic;
using System.IO;
using System.Threading.Tasks;
using dotenv.net;
using Microsoft.AspNetCore;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Stripe;
using Stripe.Checkout;

namespace server.Controllers
{
    public class Program
    {
        public static void Main(string[] args)
        {
            DotEnv.Load();
            var staticDir = Environment.GetEnvironmentVariable("STATIC_DIR") ?? "../../client/html";
            var port = Environment.GetEnvironmentVariable("PORT") ?? "4242";
            WebHost.CreateDefaultBuilder(args)
              .UseUrls($"http://0.0.0.0:{port}")
              .UseWebRoot(staticDir)
              .UseStartup<Startup>()
              .Build()
              .Run();
        }
    }

    public class Startup
    {
      public void ConfigureServices(IServiceCollection services)
      {
          services.AddMvc().AddNewtonsoftJson();
          // For sample support and debugging, not required for production:
          StripeConfiguration.AppInfo = new AppInfo
          {
              Name = "stripe-samples/accept-a-payment/elements-with-checkout-sessions",
              Version = "0.0.2",
              Url = "https://github.com/stripe-samples"
          };
          // Don't put any keys in code. See https://docs.stripe.com/keys-best-practices.
          services.AddSingleton(new StripeClient(Environment.GetEnvironmentVariable("STRIPE_SECRET_KEY")));
      }

      public void Configure(IApplicationBuilder app, IWebHostEnvironment env)
      {
          if (env.IsDevelopment()) app.UseDeveloperExceptionPage();
          app.UseRouting();
          app.UseDefaultFiles();
          app.UseStaticFiles();
          app.UseEndpoints(endpoints => endpoints.MapControllers());
      }
    }

    [Route("complete")]
    [ApiController]
    public class CompleteController : Controller
    {
        private readonly IWebHostEnvironment _env;

        public CompleteController(IWebHostEnvironment env)
        {
            _env = env;
        }

        [HttpGet]
        public ActionResult Complete()
        {
            var filePath = Path.Combine(_env.WebRootPath, "complete.html");
            return PhysicalFile(filePath, "text/html");
        }
    }

    [Route("config")]
    [ApiController]
    public class ConfigController : Controller
    {
        [HttpGet]
        public ActionResult GetConfig()
        {
            return Json(new {publishableKey = Environment.GetEnvironmentVariable("STRIPE_PUBLISHABLE_KEY")});
        }
    }

    [Route("create-checkout-session")]
    [ApiController]
    public class CheckoutApiController : Controller
    {
        private readonly StripeClient _client;

        public CheckoutApiController(StripeClient client)
        {
            _client = client;
        }

        [HttpPost]
        public ActionResult Create()
        {
            try
            {
                var domain = Environment.GetEnvironmentVariable("DOMAIN") ?? $"http://localhost:{Environment.GetEnvironmentVariable("PORT") ?? "4242"}";
                var options = new SessionCreateOptions
                {
                    UiMode = "elements",
                    // You can also use an existing Price: new SessionLineItemOptions { Price = "price_xxx", Quantity = 1 }
                    LineItems = new List<SessionLineItemOptions>
                    {
                      new SessionLineItemOptions
                      {
                        PriceData = new SessionLineItemPriceDataOptions
                        {
                          ProductData = new SessionLineItemPriceDataProductDataOptions
                          {
                            Name = "T-shirt",
                          },
                          Currency = "usd",
                          UnitAmount = 2000,
                        },
                        Quantity = 1,
                      },
                    },
                    Mode = "payment",
                    ReturnUrl = domain + "/complete?session_id={CHECKOUT_SESSION_ID}",
                    AdaptivePricing = new SessionAdaptivePricingOptions { Enabled = true },
                };
                // Set customer_email when the user is already known (e.g. logged in) —
                // the payment form will display it as read-only. In production, use your
                // authenticated user's email. The +location_FR suffix is a test-mode
                // feature that simulates a customer in France for Adaptive Pricing.
                options.CustomerEmail = "test+location_FR@example.com";
                Session session = _client.V1.Checkout.Sessions.Create(options);

                return Json(new {clientSecret = session.ClientSecret});
            }
            catch (StripeException e)
            {
                return BadRequest(new {error = new {message = e.Message}});
            }
        }
    }

    [Route("session-status")]
    [ApiController]
    public class SessionStatusController : Controller
    {
        private readonly StripeClient _client;

        public SessionStatusController(StripeClient client)
        {
            _client = client;
        }

        [HttpGet]
        public ActionResult SessionStatus([FromQuery] string session_id)
        {
            try
            {
                var options = new SessionGetOptions();
                options.AddExpand("payment_intent");
                Session session = _client.V1.Checkout.Sessions.Get(session_id, options);

                var pi = session.PaymentIntent;
                return Json(new {status = session.Status, payment_status = session.PaymentStatus, payment_intent_id = pi?.Id, payment_intent_status = pi?.Status});
            }
            catch (StripeException e)
            {
                return BadRequest(new {error = new {message = e.Message}});
            }
        }
    }

    [Route("webhook")]
    [ApiController]
    public class WebhookController : Controller
    {
        [HttpPost]
        public async Task<ActionResult> Webhook()
        {
            var json = await new StreamReader(HttpContext.Request.Body).ReadToEndAsync();
            var webhookSecret = Environment.GetEnvironmentVariable("STRIPE_WEBHOOK_SECRET");

            Event stripeEvent;
            if (!string.IsNullOrEmpty(webhookSecret))
            {
                try
                {
                    stripeEvent = EventUtility.ConstructEvent(json, Request.Headers["Stripe-Signature"], webhookSecret);
                }
                catch (Exception)
                {
                    Console.WriteLine("Webhook signature verification failed.");
                    return BadRequest();
                }
            }
            else
            {
                stripeEvent = EventUtility.ParseEvent(json);
            }

            if (stripeEvent.Type == "checkout.session.completed")
            {
                Console.WriteLine("Payment received!");
            }

            return Ok();
        }
    }
}
