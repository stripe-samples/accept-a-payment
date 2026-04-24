require 'capybara_support'

RSpec.describe 'Elements with Checkout Sessions', type: :system do
  before do
    visit app_url('/')
  end

  example 'happy path' do
    # Wait for the dahlia SDK to render the Payment Element iframe.
    expect(page).to have_css(
      '#payment-element iframe[title="Secure payment input frame"]', wait: 30
    )

    # Wait for the Billing Address Element iframe to render.
    expect(page).to have_css(
      '#address-element iframe[title="Secure address input frame"]', wait: 30
    )

    # Email is a plain HTML input on the merchant's page (not inside a Stripe
    # iframe). After filling it, Tab moves focus to the next field, which
    # triggers the blur handler that calls actions.updateEmail().
    email_input = find('#email')
    email_input.fill_in with: "test#{SecureRandom.hex(4)}@example.com"
    email_input.send_keys(:tab)

    # Fill billing address fields inside the Billing Address Element iframe.
    # Field names verified from iframe DOM inspection:
    #   input[name="name"]               - Full name
    #   select[name="country"]           - Country or region
    #   input[name="addressLine1"]       - Address line 1
    #   input[name="addressLine2"]       - Address line 2
    #   input[name="locality"]           - City
    #   select[name="administrativeArea"] - State
    #   input[name="postalCode"]         - ZIP code
    within_frame first('#address-element iframe[title="Secure address input frame"]') do
      fill_in 'name', with: 'Jenny Rosen'
      select 'United States', from: 'country'

      # Typing in addressLine1 triggers a Google autocomplete dropdown.
      # Escape dismisses the dropdown; Tab blurs the field which causes
      # the address element to expand individual city/state/zip fields.
      # (Verified: Escape alone leaves expanded fields hidden; Tab is
      # required to trigger the switch from autocomplete to manual mode.)
      address_field = find('[name="addressLine1"]')
      address_field.fill_in with: '123 Main St'
      address_field.send_keys(:escape)
      address_field.send_keys(:tab)

      # Wait for the expanded fields to become visible
      find('[name="locality"]', wait: 5)

      fill_in 'locality', with: 'San Francisco'
      select 'California', from: 'administrativeArea'
      fill_in 'postalCode', with: '94111'
    end

    # Fill card details inside the Payment Element iframe.
    # The Payment Element renders an accordion with multiple payment methods.
    # Click "Card" to expand the card form. When the Billing Address Element
    # is present, the Payment Element does not show country or postal code
    # fields — only card number, expiry, and CVC.
    # Field names verified from iframe DOM inspection:
    #   div[data-value="card"]  - Card accordion tab (always present)
    #   input[name="number"]    - Card number
    #   input[name="expiry"]    - Expiry date
    #   input[name="cvc"]       - CVC
    within_frame first('#payment-element iframe[title="Secure payment input frame"]') do
      find('[data-value="card"]').click

      fill_in 'number', with: '4242424242424242'
      fill_in 'expiry', with: '12 / 33'
      fill_in 'cvc', with: '123'

      # Uncheck Link "Save my information" if present.
      # Click the label to toggle the checkbox.
      # Verified from local DOM: label[for="payment-linkOptInInput"]
      if page.has_css?('label[for="payment-linkOptInInput"]', wait: 2)
        find('label[for="payment-linkOptInInput"]').click
      end
    end

    # Wait for the Pay button to become enabled. The SDK disables it until
    # canConfirm is true (all required fields filled + email registered).
    expect(page).to have_button('submit', disabled: false, wait: 10)

    find('#submit').click

    # After successful payment the SDK redirects to /complete?session_id=...
    # which fetches session status and displays the result.
    expect(page).to have_content('Payment succeeded', wait: 30)
  end
end
