using Newtonsoft.Json;

public class ConfigResponse
{
    [JsonProperty("publishableKey")]
    public string PublishableKey { get; set; }

    [JsonProperty("unitAmount")]
    public long? UnitAmount { get; set; }

    [JsonProperty("currency")]
    public string Currency { get; set; }
}
