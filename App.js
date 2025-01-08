import React, { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import Map from './components/Map';
import WalkHistory from "./components/WalkHistory";
import { SafeAreaView, SafeAreaProvider } from "react-native-safe-area-context";
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { registerBackgroundTasks } from "./background/BackgroundTasks";
import RequestPermissions from "./background/RequestPermissions";
import BackgroundLocations from "./background/BackgroundLocations";

const Stack = createStackNavigator(); // This line creates the Stack navigator

export default function App() {
    useEffect(() => {
        // Register background tasks when the app starts
        registerBackgroundTasks();

        return () => {
            // Cleanup tasks if needed when the app unmounts
        };
    }, []);

    return (
        <SafeAreaProvider>
            <SafeAreaView style={styles.container}>
                {/* Request permissions for location */}
                <RequestPermissions />

                {/* Navigation setup */}
                <NavigationContainer>
                    <Stack.Navigator initialRouteName="Map">
                        <Stack.Screen name="Map" component={Map} />
                        <Stack.Screen name="WalkHistory" component={WalkHistory} />
                        {/* Add the BackgroundLocation screen for demonstration purposes */}
                        <Stack.Screen name="BackgroundLocation" component={BackgroundLocations} />
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
