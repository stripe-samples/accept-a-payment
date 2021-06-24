# This utility is to help ensure the sample is configured correctly when first
# getting started.
#
# Refer to `server.rb` for integration details.
require 'stripe'
require 'toml-rb'
require 'dotenv'

class ConfigHelper
  attr_reader :vars

  REQUIRED_VARS = [
    'PRICE',
    'DOMAIN',
    'STATIC_DIR',
    'STRIPE_PUBLISHABLE_KEY',
    'STRIPE_SECRET_KEY',
    'STRIPE_WEBHOOK_SECRET',
  ]

  def self.check_env!
    helper = self.new

    # Confirms the required environment variables have
    # been configured.
    helper.dotenv_exists?
    Dotenv.load

    # Confirms API keys are set and have the expected
    # prefixes.
    helper.valid_api_keys?
    Dotenv.load

    # Once we've done basic key validation, we can set the API
    # key and make deeper assumptions.
    Stripe.api_key = ENV['STRIPE_SECRET_KEY']

    helper.valid_paths?
    Dotenv.load

    helper.valid_domain?
    Dotenv.load

    helper.valid_prices?
    Dotenv.load
  end

  def initialize(*args)
    @vars = Dotenv.parse(*args)

    # Test to see if the Stripe CLI is installed.
    begin
      @has_stripe_cli = (`which stripe` != '')
    rescue
      @has_stripe_cli = false
    end

    begin
      @cli_config = TomlRB.parse(`stripe config --list`)
    rescue => e
      @cli_config = {}
    end
  end

  def set_dotenv!(key, value)
    @vars[key] = value
    write_dotenv!
  end

  def write_dotenv!
    File.open('.env', 'w') do |f|
      REQUIRED_VARS.each do |v|
        f.puts "#{v}=#{@vars[v]}"
      end
    end
  end

  def valid_prices?
    puts "Checking that a valid price is configured..."
    _valid_price?('PRICE', 1500)
  end

  def _valid_price?(price_id, unit_amount)
    price = ENV[price_id]
    if price.nil? || price == '' || price.include?('...')
      puts <<~DOC
        Environment variable missing for #{price_id}. This should be the ID
        of a Price object in your Stripe account. You can create a product and
        related prices in the dashbaord here: https://dashboard.stripe.com/test/products.

        Would you like us to create a Price now? [Y/n]
      DOC
      c = gets.chomp
      if c.upcase == "N"
        puts "Please create a Product and Price from the dashboard, then set its ID in .env."
        exit
      else
        stripe_price = Stripe::Price.create(
          unit_amount: 1500,
          currency: 'USD',
          product_data: {
            name: 'Sample Price',
            metadata: {
              stripe_sample_id: 'accept-a-payment',
              stripe_sample_integration: 'prebuilt-checkout-page',
              stripe_sample_lang: 'ruby',
            }
          }
        )
        puts <<~DOC
          Price created!


        DOC
        set_dotenv!(price_id, stripe_price.id)
      end
    end
  end

  def valid_domain?
    puts "Checking that a valid base URL (DOMAIN) is set..."
    domain = ENV['DOMAIN']
    if domain.nil?
      puts <<~DOC
        No DOMAIN environment variable found in `.env`. This should be a
        base URL and include the scheme like `http://localhost:4242`.

        Would you like to use the default? [Y/n]
      DOC
      c = gets.chomp
      if c.upcase == "N"
        exit
      else
        set_dotenv!('DOMAIN', 'http://localhost:4242')
        return
      end
    end

    if !domain.start_with?('http')
      puts <<~DOC
        Invalid DOMAIN set: `#{domain}`. This should be a
        base URL and include the scheme like `http://localhost:4242`.

        Would you like to use the default? [Y/n]
      DOC

      c = gets.chomp
      if c.upcase == "N"
        exit
      else
        set_dotenv!('DOMAIN', 'http://localhost:4242')
        return
      end
    end
  end

  def valid_paths?
    puts "Checking that paths are valid..."
    static_dir = ENV['STATIC_DIR']
    if static_dir.nil?
      puts <<~DOC
        No STATIC_DIR environment variable found in `.env`. This should be the
        relative path to the directory where the client side HTML code is.

        Would you like to use the default STATIC_DIR=../../client/html? [Y/n]
      DOC

      c = gets.chomp
      if c.upcase == "N"
        exit
      else
        set_dotenv!('STATIC_DIR', '../../client/html')
      end
    end

    if static_dir == ''
      puts <<~DOC
        Would you like to use the default STATIC_DIR=../../client/html? [Y/n]
      DOC

      c = gets.chomp
      if c.upcase != "N"
        set_dotenv!('STATIC_DIR', '../../client/html')
      end
    end

    static_dir_path = File.join(File.dirname(__FILE__), static_dir)
    if !File.directory?(static_dir_path)
      puts <<~DOC
        The path to the STATIC_DIR is not a directory. Please check .env.
      DOC
    end

    if !File.exists?(File.join(static_dir_path, 'index.html'))
      if static_dir == ''
        puts <<~DOC
          No value set for STATIC_DIR. If this sample was installed with the
          Stripe CLI then STATIC_DIR is usually `../client`. If this sample was
          git cloned, STATIC_DIR is typically set to `../../client`.
        DOC
      else
        puts <<~DOC
          No `index.html` file found in #{static_dir_path}. Please check #{File.join(static_dir_path, 'index.html')}
        DOC
      end
    end
  end

  def valid_api_keys?
    puts "Checking that valid API keys are set..."

    sk = ENV['STRIPE_SECRET_KEY']
    if sk.nil? || sk == '' || (!sk.start_with?('sk_test_') && !sk.start_with?('rk_test_'))
      if !@has_stripe_cli
        puts <<~DOC
          Your secret API key (STRIPE_SECRET_KEY) is configured incorrectly or
          doesn't match the expected format.  You can find your API keys in the Stripe
          dashboard here: https://dashboard.stripe.com/test/apikeys. Then update
          the .env file.
        DOC
        set_dotenv!('STRIPE_SECRET_KEY', '')
        set_dotenv!('STRIPE_PUBLISHABLE_KEY', '')
        set_dotenv!('STRIPE_WEBHOOK_SECRET', '')
        exit
      else
        puts <<~DOC
          Your secret API key (STRIPE_SECRET_KEY) is configured incorrectly or doesn't match
          the expected format.

          Would you like to autoconfigure with the Stripe CLI? [Y/n]
        DOC

        c = gets.chomp
        if c.upcase == "N"
          puts <<~DOC
            Okay, you can find your API keys in the Stripe dashboard here:
            https://dashboard.stripe.com/test/apikeys. Then update the `.env` file.
          DOC
          exit
        else
          config = @cli_config.fetch("default", @cli_config[@cli_config.keys.first])
          set_dotenv!('STRIPE_SECRET_KEY', config["test_mode_api_key"])
          set_dotenv!('STRIPE_PUBLISHABLE_KEY', config["test_mode_publishable_key"])
          set_dotenv!('STRIPE_WEBHOOK_SECRET', `stripe listen --print-secret`)
          return
        end
      end
    end

    pk = ENV['STRIPE_PUBLISHABLE_KEY']
    if pk.nil? || pk == '' || !pk.start_with?('pk_test_')
      puts <<~DOC
        Your publishable API key (STRIPE_PUBLISHABLE_KEY) is configured incorrectly or
        doesn't match the expected format. You can find your API keys in the Stripe
        dashboard here: https://dashboard.stripe.com/test/apikeys. Then update
        the .env file.
      DOC
      set_dotenv!('STRIPE_PUBLISHABLE_KEY', '')
      exit
    end

    pi = nil
    begin
      pi = Stripe::PaymentIntent.list({ limit: 1 }, { api_key: sk }).data.first
    rescue => e
      puts "Failed testing an API request with your STRIPE_SECRET_KEY `#{sk}` check `.env`: \n\n#{e}"
      exit
    end

    if pi.nil?
      puts "No previous payments found. Unable to confirm if publishable and secret key pair is for the same account."
    end

    if !pi.nil? && !pi.client_secret.nil?
      begin
        pi = Stripe::PaymentIntent.retrieve({
          id: pi.id,
          client_secret: pi.client_secret,
        }, {
          api_key: pk
        })
      rescue Stripe::InvalidRequestError => e
        if e.message.start_with?("No such payment_intent")
          puts <<~DOC
            The secret key and publishable key configured in `.env`
            are misconfigured and are likely not from the same Stripe account or the same
            mode.
          DOC
          exit
        end
      end
    end

    whsec = ENV['STRIPE_WEBHOOK_SECRET']
    if whsec.nil? || !whsec.start_with?('whsec_')
      puts <<~DOC
        Your webhook signing secret (STRIPE_WEBHOOK_SECRET) is configured
        incorrectly or doesn't match the expected format. You can find your webhook
        signing secret in the Stripe dashboard here:
        https://dashboard.stripe.com/test/apikeys. or if testing with the
        Stripe CLI by running:

          stripe listen --print-secret

        Be sure to set that in the .env file.
      DOC
      exit
    end
  end

  def dotenv_exists?
    puts "Checking that `.env` exists..."
    return if File.exists?("./.env")

    env_file_path = File.join(File.dirname(__FILE__), '.env')
    if !ENV['STRIPE_SECRET_KEY'] && !File.exist?("./.env")
      puts <<~DOC
        Unable to load the `.env` file from #{env_file_path}.

        Would you like to automatically create one? [Y/n]
      DOC

      c = gets.chomp
      if c.upcase == "N"
        puts "Okay, you'll need to set the following environment variables:"
        REQUIRED_VARS.each do |v|
          puts "#{v}="
        end

        puts "After creating `.env`, please restart the server and try again."
        exit
      else
        set_dotenv!('STATIC_DIR', '../../client/html')
        puts "\n-------\n\n"
      end
    end
  end
end
