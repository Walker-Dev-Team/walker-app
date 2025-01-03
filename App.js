import React from 'react';
import { StyleSheet } from 'react-native';
import Map from './components/Map';
import {SafeAreaView, SafeAreaProvider} from "react-native-safe-area-context";

export default function App() {
  return (
      <SafeAreaProvider>
      <SafeAreaView style={styles.container}>
        <Map />
      </SafeAreaView>
      </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});
