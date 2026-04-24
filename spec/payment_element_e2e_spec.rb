require 'capybara_support'

RSpec.describe 'Payment elements', type: :system do
  before do
    visit app_url('/')
  end

  example 'happy path' do
    expect(page).to have_css(
      'form iframe[title*="payment input"][src*="elements-inner-payment"]', wait: 30
    )

    within_frame first('form iframe[title*="payment input"][src*="elements-inner-payment"]') do
      # Click "Card" to ensure the card form is visible. The Payment
      # Element renders differently depending on client:
      #   HTML:      button[data-testid="card"] with role="tab"
      #   react-cra: div[data-value="card"] (no role, no data-testid)
      # Both verified from local DOM inspection.
      find('[data-testid="card"], [data-value="card"]', wait: 10).click

      fill_in 'number', with: '4242424242424242'
      fill_in 'expiry', with: '12 / 33'
      fill_in 'cvc', with: '123'
      select 'United States', from: 'country'
      fill_in 'postalCode', with: '10000'

      # Uncheck Link "Save my information" if present.
      # Click the label to toggle the checkbox.
      # Verified from local DOM: label[for="payment-linkOptInInput"]
      if page.has_css?('label[for="payment-linkOptInInput"]', wait: 2)
        find('label[for="payment-linkOptInInput"]').click
      end
    end

    within_frame first('form iframe[title*="Secure email input frame"]') do
      fill_in 'email', with: "test#{SecureRandom.hex(4)}@example.com"
    end

    click_on 'Pay now'

    expect(page).to have_no_content('Pay now')
    expect(page).to have_content('Thank you!')
    expect(page).to have_content('Payment succeeded')
  end
end
