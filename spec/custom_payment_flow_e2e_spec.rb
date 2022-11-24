require 'capybara_support'

RSpec.describe 'Custom payment flow', type: :system do
  before do
    visit app_url('/')
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
    click_on 'Pre-authorized debit in Canada (ACSS)'

    click_on 'Pay'

    within_frame find('iframe[name*=__privateStripeFrame]') do
      within_frame first('iframe') do
        click_on 'Agree'
        find('span', text: 'Simulate successful verification').click
        click_on 'Pay CA$59.99'
      end
    end

    expect(page).to have_content('Payment processing')
  end

  example 'BECS Direct Debit' do
    click_on 'BECS Direct Debit'

    fill_in 'name', with: 'Jenny Rosen'
    fill_in 'email', with: 'jenny.rosen@example.com'

    within_frame find('iframe[name*=__privateStripeFrame][title*="input"]') do
      fill_in 'au_bsb', with: '000-000'
      fill_in 'au_bank_account_number', with: '000123456'
    end

    click_on 'Pay'
    expect(page).to have_no_content('succeeded')
    expect(page).to have_content(/This payment method is available to Stripe accounts in AU/i)
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

    click_on 'Authorize Test Payment'
    expect(page).to have_content('Payment succeeded')
  end

  example 'FPX with US Stripe account' do
    click_on 'FPX'

    within_frame find('iframe[name*=__privateStripeFrame][title*="button"]') do
      find('#fpx_bank-list-value', text: 'Select bank').click
    end

    within_frame find('iframe[name*=__privateStripeFrame][title*="list"]') do
      find('.SelectListItem-text', text: 'Maybank2U').click
    end

    click_on 'Pay'
    expect(page).to have_no_content('succeeded')
    expect(page).to have_content('The payment method type provided: fpx is invalid') # This payment method is available to Stripe accounts in MY and your Stripe account is in US.'
  end

  example 'Giropay: happy path' do
    click_on 'giropay'

    click_on 'Pay'

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

    click_on 'Authorize Test Payment'
    expect(page).to have_content('Payment succeeded')
  end

  example 'Sofort: happy path' do
    click_on 'Sofort'

    click_on 'Pay'

    click_on 'Authorize Test Payment'
    expect(page).to have_content('Payment processing')
  end

  example 'Afterpay / Clearpay: happy path' do
    click_on 'Afterpay / Clearpay'

    click_on 'Pay'

    click_on 'Authorize Test Payment'
    expect(page).to have_content('Payment succeeded')
  end

  # TODO(cjavilla): Removing this test at the request of the boleto team until
  # we have separate keys. This was raising some alarms internally.
  # example 'Boleto' do
  #   click_on 'Boleto'
  #
  #   click_on 'Pay'
  #   expect(page).to have_no_content('succeeded')
  #   expect(page).to have_content('The payment method type "boleto" is invalid.') # Boleto is not available without an invitation yet
  # end

  example 'OXXO' do
    click_on 'OXXO'

    # NOTE: Just confirm the essential elements are displayed since the test account does not support OXXO
    # > Merchant country should be among `oxxo` supported countries: MX
    click_on 'Pay'
    expect(page).to have_selector('#messages')
  end

  example 'Alipay' do
    click_on 'Alipay'

    click_on 'Pay'

    click_on 'Authorize Test Payment'
    expect(page).to have_content('Payment succeeded')
  end

  example 'Apple Pay' do
    click_on 'Apple Pay'

    expect(page).to have_content('Before you start, you need to:')
    expect(page).to have_content('Add a payment method to your browser.')
    expect(page).to have_content('Serve your application over HTTPS.')
    expect(page).to have_content('Verify your domain with Apple Pay')
  end

  example 'Google Pay' do
    click_on 'Google Pay'

    expect(page).to have_content('Before you start, you need to:')
    expect(page).to have_content('Add a payment method to your browser.')
    expect(page).to have_content('Serve your application over HTTPS.')
  end

  example 'GrabPay' do
    click_on 'GrabPay'

    click_on 'Pay'
    expect(page).to have_no_content('succeeded')
    expect(page).to have_content('The payment method type provided: grabpay is invalid') # This payment method is available to Stripe accounts in SG and MY and your Stripe account is in US.
  end
end
