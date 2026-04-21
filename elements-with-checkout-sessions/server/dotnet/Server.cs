using System;
using System.Collections.Generic;
using System.IO;
using dotenv.net;
using Microsoft.AspNetCore;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Stripe;
using Stripe.Checkout;

public class StripeOptions
{
    public string option { get; set; }
}

namespace server.Controllers
{
    public class Program
    {
        public static void Main(string[] args)
        {
            DotEnv.Load();
            var port = Environment.GetEnvironmentVariable("PORT") ?? "4242";
            var staticDir = Environment.GetEnvironmentVariable("STATIC_DIR") ?? "../../client/html/public";
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
          // Don't put any keys in code. See https://docs.stripe.com/keys-best-practices.
          services.AddSingleton(new StripeClient(Environment.GetEnvironmentVariable("STRIPE_SECRET_KEY")));
      }

      public void Configure(IApplicationBuilder app, IWebHostEnvironment env)
      {
          if (env.IsDevelopment()) app.UseDeveloperExceptionPage();
          app.UseRouting();
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
            var domain = Environment.GetEnvironmentVariable("DOMAIN") ?? "http://localhost:4242";
            var options = new SessionCreateOptions
            {

                UiMode = "elements",
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
            };
            Session session = _client.V1.Checkout.Sessions.Create(options);

            return Json(new {clientSecret = session.ClientSecret});
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
            var options = new SessionGetOptions();
            options.AddExpand("payment_intent");
            Session session = _client.V1.Checkout.Sessions.Get(session_id, options);

            return Json(new {status = session.Status, payment_status = session.PaymentStatus, payment_intent_id = session.PaymentIntent.Id, payment_intent_status = session.PaymentIntent.Status});
        }
    }
}
