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
      # Click "Card" in the accordion if multiple payment methods are shown.
      find('[data-value="card"]').click if page.has_css?('[data-value="card"]', wait: 5)

      fill_in 'number', with: '4242424242424242'
      fill_in 'expiry', with: '12 / 33'
      fill_in 'cvc', with: '123'
      select 'United States', from: 'country'
      fill_in 'postalCode', with: '10000'

      # Dismiss Link "Save my information" if present, so canConfirm
      # becomes true without requiring phone number.
      link_checkbox = first('input[name="linkOptIn"]', visible: false, wait: 2) rescue nil
      if link_checkbox&.checked?
        page.execute_script("document.querySelector('input[name=\"linkOptIn\"]').click()")
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
