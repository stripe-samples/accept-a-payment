using Newtonsoft.Json;

public class CreatePaymentIntentResponse
{
  [JsonProperty("clientSecret")]
  public string ClientSecret { get; set; }
}

