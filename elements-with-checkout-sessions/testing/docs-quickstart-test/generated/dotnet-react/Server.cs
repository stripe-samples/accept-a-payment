using System.Collections.Generic;
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
            WebHost.CreateDefaultBuilder(args)
              .UseUrls("http://0.0.0.0:4255")
              .UseWebRoot("public")
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
          // This test secret API key is a placeholder. Don't include personal details in requests with this key.
          // To see your test secret API key embedded in code samples, sign in to your Stripe account.
          // You can also find your test secret API key at https://dashboard.stripe.com/test/apikeys.
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
            var domain = "http://localhost:3006";
            var options = new SessionCreateOptions
            {

                UiMode = "elements",
                LineItems = new List<SessionLineItemOptions>
                {
                  new SessionLineItemOptions
                  {
                    // Provide the exact Price ID (for example, price_1234) of the product you want to sell
                    Price = Environment.GetEnvironmentVariable("STRIPE_PRICE_ID"),
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
