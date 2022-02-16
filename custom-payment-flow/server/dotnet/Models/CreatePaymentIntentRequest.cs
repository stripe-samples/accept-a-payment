using System.Text.Json.Serialization;

public class CreatePaymentIntentRequest
{
    [JsonPropertyName("paymentMethodType")]
    public string PaymentMethodType { get; set; }

    [JsonPropertyName("currency")]
    public string Currency { get; set; }
}
