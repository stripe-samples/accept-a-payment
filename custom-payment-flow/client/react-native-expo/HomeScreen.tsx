import React from 'react';
import {StyleSheet, ScrollView, View} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {Collapse} from './components/Collapse';
import ListItem from './components/ListItem';
import {colors} from './colors';

export default function App() {
  const navigation = useNavigation();

  return (
    <ScrollView accessibilityLabel="app-root" style={styles.container}>
      <Collapse title="Cards" isExpanded={true}>
        <View style={styles.buttonContainer}>
          <ListItem
            title="Card"
            onPress={() => {
              navigation.navigate('Card');
            }}
          />
        </View>
      </Collapse>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.white,
  },
  buttonContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomColor: colors.light_gray,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
});
