import React, { useState } from 'react'
import StatusMessages, {useMessages} from './StatusMessages';

const DisplayBankTransferInstructions = ({displayBankTransferInstructions}) => {
    if (!displayBankTransferInstructions) return null;
    return (
        <>
            <p>振込先情報</p>
            <dl>
                <dt><b>入金額</b></dt>
                <dd>
                    {displayBankTransferInstructions.amount_remaining.toLocaleString()}{' '}
                    {displayBankTransferInstructions.currency.toUpperCase()}
                </dd>
                {displayBankTransferInstructions.financial_addresses[0] ? (
                    <>
                        <dt><b>振込先情報</b></dt>
                        <dd>
                            {displayBankTransferInstructions.financial_addresses[0].zengin.bank_name} ({displayBankTransferInstructions.financial_addresses[0].zengin.bank_code}) <br />
                            {displayBankTransferInstructions.financial_addresses[0].zengin.branch_name} ({displayBankTransferInstructions.financial_addresses[0].zengin.branch_code}){' '}
                            <br />
                            {displayBankTransferInstructions.financial_addresses[0].zengin.account_type === 'futsu'
                            ? '普通預金'
                            : '当座預金'}: {displayBankTransferInstructions.financial_addresses[0].zengin.account_number} <br />
                            {displayBankTransferInstructions.financial_addresses[0].zengin.account_holder_name}

                        </dd>
                    </>
                ): null}
                <dt><b>Raw data</b></dt>
                <dd>
                    <pre>
                        <code>{JSON.stringify(displayBankTransferInstructions, null, 2)}</code>
                    </pre>
                </dd>
            </dl>
        </>
    )
}

export const JPBankTransfer = () =>{
    const [messages, addMessage] = useMessages();
    const [customerId, setCustomerId] = useState('');
    const [displayBankTransferInstructions, setDisplayBankTransferInstructions] = useState(null)
    return (
        <div>
            <h1>Bank Transfer (Japan | 銀行振込)</h1>
            <section>
                <b>テスト環境での、現金残高の追加方法</b>
                <ul>
                    <li>Dashboardで顧客ページを開く</li>
                    <li>[支払い方法]の[追加]ボタンから、[現金残高に資金を追加(テスト環境のみ)]を選択</li>
                    <li>金額を指定し、追加する</li>
                </ul>
                <p>
                    <a
                        href="https://stripe.com/docs/payments/bank-transfers/accept-a-payment#test-your-integration"
                        target='_blank'
                        rel='noopener noreferrer'
                    >
                        Stripe CLI / APIを利用する方法
                    </a>
                </p>
            </section>
            <form id='payment-form' onSubmit={async e => {
                e.preventDefault()
                addMessage('fetching...')
                const paymentIntent = await fetch('/create-payment-intent',{
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
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
                        customerId
                    })
                }).then(data => data.json())
                if (paymentIntent.error) {
                    addMessage(`Error: ${paymentIntent.error.message}`)
                    return
                }
                addMessage('PaymentIntent created')
                addMessage(`Bank account information; ${JSON.stringify(paymentIntent.nextAction, null, 2)}`)
                setDisplayBankTransferInstructions(paymentIntent.nextAction.display_bank_transfer_instructions)
            }}>
                <label>
                    <span>Customer ID(optional)</span>
                    <input value={customerId} onChange={e => setCustomerId(e.target.value)} type='text' />
                </label>
                <button type='submit'>Pay</button>
            </form>
            <StatusMessages messages={messages} />
            <DisplayBankTransferInstructions displayBankTransferInstructions={displayBankTransferInstructions}/>
        </div>
    )
}