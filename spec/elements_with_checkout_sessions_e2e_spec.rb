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

    # Wait for the Currency Selector Element to render. The server sets
    # customer_email with +location_FR to simulate a French customer,
    # which triggers EUR/USD currency options.
    expect(page).to have_css(
      '#currency-selector iframe[title="Secure currency selector"]', wait: 30
    )

    # Email is pre-set via customer_email on the session, so the email
    # input should be hidden. No need to fill it.

    # Fill billing address fields inside the Billing Address Element iframe.
    # Field names verified from iframe DOM inspection.
    within_frame first('#address-element iframe[title="Secure address input frame"]') do
      fill_in 'name', with: 'Jenny Rosen'
      select 'United States', from: 'country'

      # Typing in addressLine1 triggers Google autocomplete.
      # Escape dismisses it; Tab expands city/state/zip fields.
      address_field = find('[name="addressLine1"]')
      address_field.fill_in with: '123 Main St'
      address_field.send_keys(:escape)
      address_field.send_keys(:tab)

      find('[name="locality"]', wait: 5)

      fill_in 'locality', with: 'San Francisco'
      select 'California', from: 'administrativeArea'
      fill_in 'postalCode', with: '94111'
    end

    # Fill card details inside the Payment Element iframe.
    # Field names verified from iframe DOM inspection.
    within_frame first('#payment-element iframe[title="Secure payment input frame"]') do
      find('[data-value="card"]').click

      fill_in 'number', with: '4242424242424242'
      fill_in 'expiry', with: '12 / 33'
      fill_in 'cvc', with: '123'

      # Uncheck Link "Save my information" if present
      if page.has_css?('label[for="payment-linkOptInInput"]', wait: 2)
        find('label[for="payment-linkOptInInput"]').click
      end
    end

    expect(page).to have_button('submit', disabled: false, wait: 10)

    find('#submit').click

    expect(page).to have_content('Payment succeeded', wait: 30)
  end
end
