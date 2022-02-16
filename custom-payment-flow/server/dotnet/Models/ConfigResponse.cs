using System.Text.Json.Serialization;

public class ConfigResponse
{
    [JsonPropertyName("publishableKey")]
    public string PublishableKey { get; set; }
}
