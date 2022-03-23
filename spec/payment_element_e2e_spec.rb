require 'capybara_support'

RSpec.describe 'Payment elements', type: :system do
  before do
    visit app_url('/')
  end

  example 'happy path' do
    within_frame first('form iframe[title*="payment input"][src*="elements-inner-payment"]') do
      fill_in 'number', with: '4242424242424242'
      fill_in 'expiry', with: '12 / 33'
      fill_in 'cvc', with: '123'
      select 'United States', from: 'country'
      fill_in 'postalCode', with: '10000'
    end

    click_on 'Pay now'

    expect(page).to have_no_content('Pay now')
    expect(page).to have_content('Thank you!')
    expect(page).to have_content('Payment succeeded')
  end
end
