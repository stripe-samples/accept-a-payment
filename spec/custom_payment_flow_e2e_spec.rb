require 'capybara_support'

RSpec.describe 'Custom payment flow', type: :system do
  before do
    visit server_url('/')
  end

  example 'Card: happy path' do
    click_on 'Card'

    within_frame find('iframe[name*=__privateStripeFrame]') do
      fill_in 'cardnumber', with: '4242424242424242'
      fill_in 'exp-date', with: '12 / 33'
      fill_in 'cvc', with: '123'
      fill_in 'postal', with: '10000'
    end

    click_on 'Pay'

    expect(page).to have_content('Payment succeeded')
  end

  example 'ACSS Debit: happy path' do
    pending "'Payment succeeded:' does not appear"

    click_on 'Pre-authorized debit in Canada (ACSS)'

    click_on 'Pay'

    within_frame find('iframe[name*=__privateStripeFrame]') do
      within_frame first('iframe') do
        click_on 'Agree'
        find('span', text: 'Simulate successful verification').click
        click_on 'Pay CA$19.99'
      end
    end

    expect(page).to have_content('Payment processing')
    expect(page).to have_content('Payment succeeded')
  end

  # > For 'au_becs_debit' payments, we currently require your account to have a bank account in one of the following currencies: aud
  xexample 'BECS Direct Debit' do
  end

  example 'SEPA Direct Debit: happy path' do
    click_on 'SEPA Direct Debit'

    within_frame find('iframe[name*=__privateStripeFrame][title*="input"]') do
      fill_in 'iban', with: 'DE89370400440532013000'
    end

    click_on 'Pay'
    expect(page).to have_content('Payment processing')
    expect(page).to have_content(/Payment \(pi_\w+\): succeeded/)
  end

  example 'Bancontact: happy path' do
    click_on 'Bancontact'

    click_on 'Pay'
    expect(page).to have_content('Bancontact test payment page')

    click_on 'Authorize Test Payment'
    expect(page).to have_content('Payment succeeded')
  end

  example 'EPS: happy path' do
    click_on 'EPS'

    within_frame find('iframe[name*=__privateStripeFrame][title*="button"]') do
      find('#bank-list-value', text: 'Select bank').click
    end

    within_frame find('iframe[name*=__privateStripeFrame][title*="list"]') do
      find('.SelectListItem-text', text: 'Bank Austria').click
    end

    click_on 'Pay'
    expect(page).to have_content('EPS test payment page')

    click_on 'Authorize Test Payment'
    expect(page).to have_content('Payment succeeded')
  end

  # > This payment method is available to Stripe accounts in MY and your Stripe account is in US.
  xexample 'FPX: happy path' do
  end

  example 'Giropay: happy path' do
    click_on 'giropay'

    click_on 'Pay'
    expect(page).to have_content('giropay test payment page')

    click_on 'Authorize Test Payment'
    expect(page).to have_content('Payment succeeded')
  end

  example 'iDEAL: happy path' do
    click_on 'iDEAL'

    within_frame find('iframe[name*=__privateStripeFrame][title*="button"]') do
      find('#bank-list-value', text: 'Select bank').click
    end

    within_frame find('iframe[name*=__privateStripeFrame][title*="list"]') do
      find('.SelectListItem-text', text: 'ING Bank').click
    end

    click_on 'Pay'
    expect(page).to have_content('iDEAL test payment page')

    click_on 'Authorize Test Payment'
    expect(page).to have_content('Payment succeeded')
  end

  example 'Przelewy24(P24): happy path' do
    click_on 'Przelewy24 (P24)'

    within_frame find('iframe[name*=__privateStripeFrame][title*="button"]') do
      find('#bank-list-value', text: 'Select bank').click
    end

    within_frame find('iframe[name*=__privateStripeFrame][title*="list"]') do
      find('.SelectListItem-text', text: 'Bank Millenium').click
    end

    click_on 'Pay'
    expect(page).to have_content('P24 test payment page')

    click_on 'Authorize Test Payment'
    expect(page).to have_content('Payment succeeded')
  end

  example 'Sofort: happy path' do
    pending "'Payment succeeded:' does not appear"

    click_on 'Sofort'

    click_on 'Pay'
    expect(page).to have_content('Sofort test payment page')

    click_on 'Authorize Test Payment'
    expect(page).to have_content('Payment processing')
    expect(page).to have_content('Payment succeeded')
  end

  example 'Afterpay / Clearpay: happy path' do
    click_on 'Afterpay / Clearpay'

    click_on 'Pay'
    expect(page).to have_content('Afterpay Clearpay test payment page')

    click_on 'Authorize Test Payment'
    expect(page).to have_content('Payment succeeded')
  end

  # > The payment method type "boleto" is invalid. Please ensure the provided type is activated in your dashboard (https://dashboard.stripe.com/account/payments/settings) and your account is enabled for any preview features that you are trying to use.
  xexample 'Boleto: happy path' do
  end

  # > This payment method is available to Stripe accounts in MX and your Stripe account is in US.
  xexample 'OXXO: happy path' do
  end

  example 'Alipay' do
    click_on 'Alipay'

    click_on 'Pay'
    expect(page).to have_content('Alipay test payment page')

    click_on 'Authorize Test Payment'
    expect(page).to have_content('Payment succeeded')
  end

  xexample 'ApplePay: happy path' do
  end

  xexample 'Google Pay: happy path' do
  end

  # > This payment method is available to Stripe accounts in SG and MY and your Stripe account is in US.
  xexample 'Grabpay: happy path' do
  end
end
