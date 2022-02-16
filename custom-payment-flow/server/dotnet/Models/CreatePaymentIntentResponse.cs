using System.Text.Json.Serialization;

public class CreatePaymentIntentResponse
{
    [JsonPropertyName("clientSecret")]
    public string ClientSecret { get; set; }
}

