require_relative './spec_helper.rb'

RSpec.describe "prebuilt-checkout-page integration" do
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

  describe '/create-checkout-session' do
    it 'creates a checkout session' do
      resp, status = post_json('/create-checkout-session', {})
      expect(status).to eq(200)
      expect(resp).to have_key('sessionId')
      expect(resp['sessionId']).to start_with('cs_test_')
    end
  end
end
