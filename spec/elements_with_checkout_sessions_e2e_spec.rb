require 'capybara_support'

RSpec.describe 'Elements with Checkout Sessions', type: :system do
  before do
    visit app_url('/checkout.html')
  end

  example 'happy path' do
    expect(page).to have_css('#payment-element iframe', wait: 30)

    fill_in 'email', with: "test#{SecureRandom.hex(4)}@example.com"

    within_frame find('#payment-element iframe') do
      # The Payment Element renders as an accordion — click "Card" to expand
      find('[role="button"][data-value="card"]', wait: 10).click

      # Wait for card inputs to appear after accordion expansion
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

    click_on 'Pay'

    expect(page).to have_content('Payment succeeded', wait: 30)
  end
end
