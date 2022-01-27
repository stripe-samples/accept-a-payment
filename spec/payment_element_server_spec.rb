require_relative './spec_helper.rb'

RSpec.describe "payment-element integration" do
  it "fetches the index route" do
    # Get the index html page
    response = get("/")
    expect(response).not_to be_nil
  end

  it "served config as expected" do
    resp = get_json("/config")
    expect(resp).to have_key("publishableKey")
    expect(resp['publishableKey']).to start_with("pk_test")
  end

  describe '/create-payment-intent' do
    it "Creates a payment intent" do
      resp = get_json('/create-payment-intent')
      expect(resp).to have_key('clientSecret')
      pi_id = resp['clientSecret'].split('_secret').first
      payment_intent = Stripe::PaymentIntent.retrieve(pi_id)
      expect(payment_intent.payment_method_types.length).to be > 0
    end
  end
end
