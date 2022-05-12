require 'capybara_support'

RSpec.describe 'Custom payment flow', type: :system do
  before do
    visit app_url('/')
  end

  example 'happy path' do
    click_on 'Buy'

    fill_in 'email', with: 'test@example.com'
    fill_in 'cardNumber', with: '4242424242424242'
    fill_in 'cardExpiry', with: '12 / 33'
    fill_in 'CVC', with: '123'
    fill_in 'billingName', with: 'James McGill'
    select 'United States', from: 'billingCountry'
    fill_in 'billingPostalCode', with: '10000'

    click_on 'Pay'

    expect(page).to have_content 'Your payment succeeded'
    expect(page).to have_content '"amount_total": 1000'
  end

  example 'Cancel a payment' do
    visit app_url('/')

    click_on 'Buy'
    find('a[href$="/canceled.html"]').click

    expect(page).to have_content 'Your payment was canceled'
  end
end
