RSpec.describe "full integration path" do
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
    {card: ['USD']}.each do |pm_type, currencies|
      currencies.each do |currency|
        it "Creates a payment intent for #{pm_type} with #{currency} currency" do
          resp, status = post_json('/create-payment-intent', {
            paymentMethodType: pm_type,
            currency: currency,
          })
          expect(status).to eq(200)
          expect(resp).to have_key('clientSecret')
          pi_id = resp['clientSecret'].split('_secret').first
          payment_intent = Stripe::PaymentIntent.retrieve(pi_id)
          expect(payment_intent.payment_method_types).to eq([pm_type.to_s])
          expect(payment_intent.currency.upcase).to eq(currency.upcase)
        end
      end
    end

    # it 'fails if no payment method type is passed' do
    #   resp, status = post_json('/create-payment-intent', {
    #     currency: 'usd'
    #   })
    #   expect(status).to eq(400)
    #   expect(resp).to have_key('error')
    #   expect(resp['error']).to have_key('message')
    # end
  end
end
