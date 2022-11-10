require_relative './spec_helper.rb'

RSpec.describe "prebuilt-checkout-page integration" do
  it "fetches the index route" do
    # Get the index html page
    response = get("/")
    expect(response).not_to be_nil
  end

  describe '/create-checkout-session' do
    it 'creates a checkout session' do
      response = RestClient.post(
        server_url("/create-checkout-session"),
        {quantity: 7},
        {max_redirects: 0}
      )
      # RestClient will follow the redirect, but we can get the first response
      # from the server from the `history`.
      redirect_response = response.history.first

      # Asserts the right HTTP status code for the redirect
      expect(redirect_response.code).to eq(303)

      # Pull's the Checkout session ID out of the Location header
      # to assert the right configuration on the created session.
      redirect_url = redirect_response.headers[:location]
      expect(redirect_url).to start_with("https://checkout.stripe.com/c/pay/cs_test")
      match = redirect_url.match(".*(?<session_id>cs_test.*)#.*")
      session_id = match[:session_id]
      session = Stripe::Checkout::Session.retrieve({
        id: session_id,
        expand: ['line_items'],
      })
      expect(session.payment_method_types).to include('card')
    end
  end
end
