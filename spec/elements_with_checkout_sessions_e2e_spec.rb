require 'capybara_support'

RSpec.describe 'Elements with Checkout Sessions', type: :system do
  before do
    visit app_url('/checkout.html')
  end

  example 'happy path' do
    # Wait for the dahlia SDK to render the payment element iframe
    expect(page).to have_css('#payment-element iframe', wait: 30)

    # Email is a plain HTML input on the page (not inside a Stripe iframe)
    fill_in 'email', with: "test#{SecureRandom.hex(4)}@example.com"

    # Use first() to avoid "Ambiguous match" when multiple iframes exist.
    # The checkout.createPaymentElement() renders the same Payment Element as
    # standard Elements but may show an accordion of payment methods.
    within_frame first('#payment-element iframe') do
      # If the Payment Element renders as an accordion with multiple payment
      # methods, click "Card" to expand the card form.
      card_tab = first('[role="button"][data-value="card"]', wait: 5)
      card_tab.click if card_tab

      fill_in 'number', with: '4242424242424242'
      fill_in 'expiry', with: '12 / 33'
      fill_in 'cvc', with: '123'

      if page.has_select?('country', wait: 3)
        select 'United States', from: 'country'
      end

      if page.has_field?('postalCode', wait: 3)
        fill_in 'postalCode', with: '10000'
      end
    end

    # Button text changes from "Pay now" to "Pay $20.00 now" after SDK loads,
    # so target the button by id.
    find('#submit').click

    # After successful payment, the SDK redirects to /complete?session_id=...
    # which fetches session status and displays the result.
    expect(page).to have_content('Payment succeeded', wait: 30)
  end
end
