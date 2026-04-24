require 'capybara_support'

RSpec.describe 'Custom payment flow', type: :system do
  before do
    visit app_url('/')
  end

  example 'happy path' do
    click_on 'Buy'

    # Wait for Stripe's hosted checkout page to fully load.
    expect(page).to have_field('email', wait: 30)
    fill_in 'email', with: 'test@example.com'

    # The hosted checkout page shows a payment method accordion. Click
    # "Card" to expand the card form before filling card fields.
    # Verified from local DOM: button[data-testid="card-accordion-item-button"]
    find('[data-testid="card-accordion-item-button"]').click

    fill_in 'cardNumber', with: '4242424242424242'
    fill_in 'cardExpiry', with: '12 / 33'
    fill_in 'CVC', with: '123'
    fill_in 'billingName', with: 'James McGill'
    select 'United States', from: 'billingCountry'
    fill_in 'billingPostalCode', with: '10000'

    # in case it checked by default
    uncheck 'enableStripePass', allow_label_click: true

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
