require 'capybara_support'

RSpec.describe 'Elements with Checkout Sessions', type: :system do
  before do
    visit app_url('/checkout.html')
  end

  # Pending: The dahlia Stripe.js CDN (https://js.stripe.com/dahlia/stripe.js)
  # does not load in the CI Docker/Selenium headless Chrome environment.
  # The iframe renders but the Payment Element fields are empty.
  # This test will work once dahlia is available on the standard v3 path.
  pending 'happy path' do
    expect(page).to have_css('#payment-element iframe', wait: 30)

    fill_in 'email', with: "test#{SecureRandom.hex(4)}@example.com"

    within_frame find('#payment-element iframe') do
      fill_in 'number', with: '4242424242424242'
      fill_in 'expiry', with: '12 / 33'
      fill_in 'cvc', with: '123'
      select 'United States', from: 'country'
      fill_in 'postalCode', with: '10000'
    end

    click_on 'Pay'

    expect(page).to have_content('Payment succeeded', wait: 30)
  end
end
