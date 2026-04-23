require 'capybara_support'

RSpec.describe 'Elements with Checkout Sessions', type: :system do
  before do
    visit app_url('/')
  end

  example 'happy path' do
    # Wait for the dahlia SDK to render the Payment Element iframe.
    # The iframe title is "Secure payment input frame" and its src contains
    # "elements-inner-payment"; filter by title so we don't match the hidden
    # controller or metrics iframes that Stripe.js also injects.
    expect(page).to have_css(
      '#payment-element iframe[title="Secure payment input frame"]', wait: 30
    )

    # Email is a plain HTML input on the merchant's page (not inside a Stripe
    # iframe). After filling it we must trigger a blur so the SDK's
    # `updateEmail` callback fires before we move into the iframe.
    email_input = find('#email')
    email_input.fill_in with: "test#{SecureRandom.hex(4)}@example.com"
    # Move focus away from the email input to trigger the blur handler that
    # calls actions.updateEmail().  Clicking the heading is the simplest way
    # to lose focus without side-effects.
    find('h4', text: 'Payment').click

    within_frame first('#payment-element iframe[title="Secure payment input frame"]') do
      # The Payment Element may render as an accordion of payment methods.
      # If so, click "Card" to expand the card form.  The accordion uses
      # radio-style buttons; the selector targets the Card row.
      card_tab = first('[data-testid="card-tab"], [role="tab"][data-value="card"], [role="button"][data-value="card"]', wait: 5)
      card_tab.click if card_tab

      fill_in 'number', with: '4242424242424242'
      fill_in 'expiry', with: '12 / 33'
      fill_in 'cvc', with: '123'

      if page.has_select?('country', wait: 1)
        select 'United States', from: 'country'
      end

      if page.has_field?('postalCode', wait: 1)
        fill_in 'postalCode', with: '10000'
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
