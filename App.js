import React, {useEffect} from 'react';
import { StyleSheet } from 'react-native';
import Map from './components/Map';
import {SafeAreaView, SafeAreaProvider} from "react-native-safe-area-context";
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import WalkHistory from "./components/WalkHistory";
import {registerBackgroundTasks} from "./background/BackgroundTasks";

const Stack = createStackNavigator(); // This line creates the Stack navigator

export default function App() {
    useEffect(() => {
        // Rejestracja zadań w tle przy uruchomieniu aplikacji
        registerBackgroundTasks();

        return () => {
        };
    }, []);

  return (
      <SafeAreaProvider>
      <SafeAreaView style={styles.container}>
          <NavigationContainer>
              <Stack.Navigator initialRouteName="Map">
                  <Stack.Screen name="Map" component={Map} />
                  <Stack.Screen name="WalkHistory" component={WalkHistory} />
              </Stack.Navigator>
          </NavigationContainer>
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
