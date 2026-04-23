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

        # Check for nested iframes
        nested_iframes = all('iframe', visible: :all)
        puts "NESTED IFRAMES: #{nested_iframes.count}"
        nested_iframes.each_with_index { |f, i| puts "  NESTED IFRAME #{i}: name=#{f['name']} title=#{f['title']} src=#{f['src']&.slice(0, 80)}" }

        # Check for shadow DOM hosts
        shadow_hosts = page.evaluate_script('document.querySelectorAll("*").length')
        puts "TOTAL DOM ELEMENTS: #{shadow_hosts}"

        # Dump first 3000 chars of iframe HTML
        puts "IFRAME HTML START: #{page.html.slice(0, 3000)}"

        inputs = all('input', visible: :all)
        puts "INPUTS IN IFRAME (visible:all): #{inputs.count}"

        # Try visible only
        visible_inputs = all('input')
        puts "INPUTS IN IFRAME (visible only): #{visible_inputs.count}"

        # Check for any elements with card-related classes
        card_elements = all('[class*=card], [class*=Card], [class*=number], [class*=Number], [data-elements-stable-field-name]', visible: :all)
        puts "CARD ELEMENTS: #{card_elements.count}"
        card_elements.each { |e| puts "  CARD EL: tag=#{e.tag_name} class=#{e['class']&.slice(0, 80)}" }
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
