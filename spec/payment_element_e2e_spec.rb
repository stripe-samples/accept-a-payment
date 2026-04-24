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
      # DEBUG: find the Card selector in the Payment Element
      puts "=== CARD SELECTOR SEARCH ==="
      all('[data-testid]', wait: 5).each { |el| puts "testid=#{el['data-testid']} tag=#{el.tag_name}" }
      all('[data-value]', wait: 2).each { |el| puts "value=#{el['data-value']} tag=#{el.tag_name}" }
      all('[role="tab"]', wait: 2).each { |el| puts "tab: text=#{el.text[0..20]} aria-selected=#{el[:'aria-selected']}" }
      puts "=== END CARD SELECTOR SEARCH ==="
      raise "DIAGNOSTIC DUMP COMPLETE"

      fill_in 'number', with: '4242424242424242'
      fill_in 'expiry', with: '12 / 33'
      fill_in 'cvc', with: '123'
      select 'United States', from: 'country'
      fill_in 'postalCode', with: '10000'
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
