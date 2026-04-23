require 'capybara_support'

RSpec.describe 'Elements with Checkout Sessions', type: :system do
  before do
    visit app_url('/checkout.html')
  end

  example 'happy path' do
    # Debug: dump page title and URL
    puts "PAGE URL: #{page.current_url}"
    puts "PAGE TITLE: #{page.title}"

    # Debug: dump browser console logs
    begin
      logs = page.driver.browser.logs.get(:browser)
      logs.each { |log| puts "CONSOLE [#{log.level}]: #{log.message}" }
    rescue => e
      puts "Could not get console logs: #{e.message}"
    end

    # Debug: check if Stripe global exists
    stripe_defined = page.evaluate_script('typeof Stripe')
    puts "STRIPE DEFINED: #{stripe_defined}"

    # Debug: check page HTML size and key elements
    puts "PAGE HTML SIZE: #{page.html.length}"
    puts "HAS FORM: #{page.has_css?('form', wait: 5)}"
    puts "HAS EMAIL INPUT: #{page.has_css?('#email', wait: 5)}"
    puts "HAS PAYMENT ELEMENT DIV: #{page.has_css?('#payment-element', wait: 5)}"
    puts "HAS PAYMENT IFRAME: #{page.has_css?('#payment-element iframe', wait: 10)}"

    # Debug: list all iframes on the page
    iframes = all('iframe', visible: :all)
    puts "TOTAL IFRAMES: #{iframes.count}"
    iframes.each_with_index do |iframe, i|
      puts "IFRAME #{i}: name=#{iframe['name']} title=#{iframe['title']} src=#{iframe['src']&.slice(0, 100)}"
    end

    # Debug: check if the payment iframe has content
    if page.has_css?('#payment-element iframe', wait: 10)
      within_frame find('#payment-element iframe') do
        puts "INSIDE IFRAME HTML SIZE: #{page.html.length}"
        inputs = all('input', visible: :all)
        puts "INPUTS IN IFRAME: #{inputs.count}"
        inputs.each { |i| puts "  INPUT: name=#{i['name']} id=#{i['id']} type=#{i['type']} disabled=#{i['disabled']}" }

        # Debug: check for any error messages
        errors = all('[class*=error], [class*=Error]', visible: :all)
        puts "ERROR ELEMENTS: #{errors.count}"
        errors.each { |e| puts "  ERROR: #{e.text}" }
      end
    else
      puts "NO PAYMENT IFRAME FOUND"
      puts "PAGE HTML SNIPPET: #{page.html.slice(0, 2000)}"
    end

    # Now try the actual test
    expect(page).to have_css('#payment-element iframe', wait: 30)

    fill_in 'email', with: "test#{SecureRandom.hex(4)}@example.com"

    within_frame find('#payment-element iframe') do
      fill_in 'number', with: '4242424242424242'
      fill_in 'expiry', with: '12 / 33'
      fill_in 'cvc', with: '123'
      select 'United States', from: 'country'
      fill_in 'postalCode', with: '10000'
    end

    click_on 'Pay'

    expect(page).to have_content('Payment succeeded', wait: 30)
  end
end
