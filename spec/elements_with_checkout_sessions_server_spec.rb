require_relative './spec_helper.rb'

RSpec.describe "elements-with-checkout-sessions integration" do
  it "fetches the checkout page" do
    response = get("/")
    expect(response).not_to be_nil
  end

  it "served config as expected" do
    resp = get_json("/config")
    expect(resp).to have_key("publishableKey")
    expect(resp['publishableKey']).to start_with("pk_test")
  end

  describe '/create-checkout-session' do
    it "creates a checkout session" do
      resp, status = post_json('/create-checkout-session', {})
      expect(status).to eq(200)
      expect(resp).to have_key('clientSecret')

      session_id = resp['clientSecret'].split('_secret').first
      session = Stripe::Checkout::Session.retrieve({
        id: session_id,
        expand: ['line_items'],
      })
      expect(session.mode).to eq('payment')
      # ui_mode is sent as 'elements' but the API returns 'custom'
      expect(session.line_items.data.length).to be > 0
    end
  end

  describe '/session-status' do
    it "retrieves a session status" do
      # First create a session
      resp, status = post_json('/create-checkout-session', {})
      expect(status).to eq(200)
      session_id = resp['clientSecret'].split('_secret').first

      # Then retrieve its status
      status_resp = JSON.parse(RestClient.get("#{SERVER_URL}/session-status?session_id=#{session_id}").body)
      expect(status_resp).to have_key('status')
      expect(status_resp).to have_key('payment_status')
      expect(status_resp['status']).to eq('open')
      expect(status_resp['payment_status']).to eq('unpaid')
    end
  end
end
