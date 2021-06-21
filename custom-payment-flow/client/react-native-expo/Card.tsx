import React, {useCallback, useEffect} from 'react';
import {ScrollView, StyleSheet, Text} from 'react-native';
import {colors} from './colors';

export default function Card() {
  return (
    <ScrollView style={styles.container}>
      <Text>Card here</Text>
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
