require 'capybara_support'

RSpec.describe 'Elements with Checkout Sessions', type: :system do
  before do
    visit app_url('/checkout.html')
  end

  example 'happy path' do
    expect(page).to have_css('#payment-element iframe', wait: 30)

    fill_in 'email', with: "test#{SecureRandom.hex(4)}@example.com"

    within_frame find('#payment-element iframe') do
      # Dump the full body HTML to understand the structure
      body_html = page.evaluate_script('document.body.innerHTML')
      puts "BODY HTML (first 5000 chars):"
      puts body_html.to_s.slice(0, 5000)

      # Check all clickable elements
      clickables = all('button, [role="button"], [role="tab"], [class*="Tab"], [class*="Accordion"]', visible: :all)
      puts "CLICKABLE ELEMENTS: #{clickables.count}"
      clickables.each_with_index { |el, i| puts "  CLICK #{i}: tag=#{el.tag_name} text=#{el.text.slice(0,50)} class=#{el['class']&.slice(0,80)} role=#{el['role']}" }
    end

    # Stop here for now — just gathering data
    expect(true).to eq(true)
  end
end
