require 'capybara_support'

RSpec.describe 'Elements with Checkout Sessions', type: :system do
  before do
    visit app_url('/checkout.html')
  end

  example 'happy path' do
    # Wait for the payment iframe to appear
    expect(page).to have_css('#payment-element iframe', wait: 30)

    fill_in 'email', with: "test#{SecureRandom.hex(4)}@example.com"

    within_frame find('#payment-element iframe') do
      # Debug: dump all visible inputs to see what's available
      all('input').each { |i| puts "INPUT: name=#{i['name']} id=#{i['id']} type=#{i['type']}" }

      # Try different field name patterns
      page.find('input[name="number"], input[name="cardNumber"], input[name="cardnumber"], input[id*="number"]', wait: 10).set('4242424242424242')
      page.find('input[name="expiry"], input[name="exp-date"], input[id*="expiry"]', wait: 10).set('12 / 33')
      page.find('input[name="cvc"], input[id*="cvc"]', wait: 10).set('123')

      if page.has_select?('country', wait: 2)
        select 'United States', from: 'country'
      end

      if page.has_field?('postalCode', wait: 2)
        fill_in 'postalCode', with: '10000'
      elsif page.has_field?('postal', wait: 2)
        fill_in 'postal', with: '10000'
      end
    end

    click_on 'Pay'

    expect(page).to have_content('Payment succeeded', wait: 30)
  end
end
