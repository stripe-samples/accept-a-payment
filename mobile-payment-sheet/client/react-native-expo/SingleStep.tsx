import React, {useState, useEffect} from 'react';
import {Alert, ScrollView, Text, Button, StyleSheet} from 'react-native';
import {useStripe} from '@stripe/stripe-react-native';
import {colors} from './colors';
import {API_URL} from './Config';

export default function PaymentSheetSingleStep() {
  const {initPaymentSheet, presentPaymentSheet} = useStripe();
  const [loading, setLoading] = useState(false);

  const fetchPaymentSheetParams = async () => {
    const response = await fetch(`${API_URL}/payment-sheet`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    const {paymentIntentClientSecret, customerEphemeralKeySecret, customer} =
      await response.json();
    return {
      paymentIntentClientSecret,
      customerEphemeralKeySecret,
      customer,
    };
  };

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      const {paymentIntentClientSecret, customerEphemeralKeySecret, customer} =
        await fetchPaymentSheetParams();

      const {error: initError} = await initPaymentSheet({
        customerId: customer,
        customerEphemeralKeySecret,
        paymentIntentClientSecret,
        customFlow: false,
        merchantDisplayName: 'Example Inc.',
        applePay: true,
        merchantCountryCode: 'US',
        style: 'alwaysDark',
        googlePay: true,
        testEnv: true,
      });
      setLoading(false);
      if (initError) {
        console.log(initError);
      }
    };
    init();
  }, []);

  const startCheckout = async () => {
    setLoading(true);
    const {error} = await presentPaymentSheet();
    if (error) {
      Alert.alert(`Error code: ${error.code}`, error.message);
      setLoading(false);
    } else {
      Alert.alert('Success', 'The payment was confirmed successfully');
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text>Try a test card:</Text>
      <Text>4242424242424242 (Visa)</Text>
      <Text>5555555555554444 (Mastercard)</Text>
      <Text>4000002500003155 (Requires 3DSecure)</Text>
      <Text>
        Use any future expiration, any 3 digit CVC, and any postal code.
      </Text>
      <Button
        disabled={loading}
        title={loading ? 'Loading...' : 'Checkout'}
        onPress={startCheckout}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
    paddingTop: 20,
    paddingHorizontal: 16,
  },
});
