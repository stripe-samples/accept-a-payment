document.addEventListener('DOMContentLoaded', async () => {
    // When the form is submitted...
    const form = document.getElementById('payment-form');
    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const customerIdInput = document.querySelector('#customer-id');
      // Make a call to the server to create a new
      // payment intent and store its client_secret.
      const response = await fetch('http://localhost:4242/create-payment-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            paymentMethodType: 'customer_balance',
            currency: 'jpy',
            paymentMethodOptions: {
                customer_balance: {
                    funding_type: 'bank_transfer',
                    bank_transfer: {
                        type: 'jp_bank_transfer',
                    },
                },
            },
            customerId: customerIdInput.value,
        }),
      }).then((r) => r.json());
  
      if (response.error) {
        addMessage(response.error.message);
        return;
      }
  
      addMessage(`Bank account information returned.`);
      if (response.nextAction && response.nextAction.display_bank_transfer_instructions) {
        const displayBankTransferInstructions = response.nextAction.display_bank_transfer_instructions;
        const messageElement = document.getElementById('bank-transfer-instructions');
        messageElement.innerHTML = `<p>振込先情報</p>
        <dl>
            <dt><b>入金額</b></dt>
            <dd>
                ${displayBankTransferInstructions.amount_remaining.toLocaleString()}
                ${' '}
                ${displayBankTransferInstructions.currency.toUpperCase()}
            </dd>
            <dt><b>振込先情報</b></dt>
            <dd>
                ${displayBankTransferInstructions.financial_addresses[0].zengin.bank_name} (${displayBankTransferInstructions.financial_addresses[0].zengin.bank_code}) <br />
                ${displayBankTransferInstructions.financial_addresses[0].zengin.branch_name} (${displayBankTransferInstructions.financial_addresses[0].zengin.branch_code})${' '}
                <br />
                ${displayBankTransferInstructions.financial_addresses[0].zengin.account_type === 'futsu'
                ? '普通預金'
                : '当座預金'}: ${displayBankTransferInstructions.financial_addresses[0].zengin.account_number} <br />
                ${displayBankTransferInstructions.financial_addresses[0].zengin.account_holder_name}
            </dd>
            <dt><b>Raw data</b></dt>
            <dd>
                <pre>
                    <code>${JSON.stringify(displayBankTransferInstructions, null, 2)}</code>
                </pre>
            </dd>
        </dl>`;
      }

      addMessage(`Payment ${JSON.stringify(response)}`);
  
    });
  });