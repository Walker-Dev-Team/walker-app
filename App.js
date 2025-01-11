import React, { useState, useEffect } from 'react';
import { StyleSheet } from 'react-native';
import Map from './components/Map';
import WalkHistory from "./components/WalkHistory";
import { SafeAreaView, SafeAreaProvider } from "react-native-safe-area-context";
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { registerBackgroundTasks } from "./background/BackgroundTasks";
import RequestPermissions from "./background/RequestPermissions";
import BackgroundLocations from "./background/BackgroundLocations";
import WalkList from "./components/WalkList";
import SplashScreen from "./components/SplashScreen";

const Stack = createStackNavigator();

export default function App() {
    const [isSplashVisible, setSplashVisible] = useState(true);

    useEffect(() => {
        // Register background tasks when the app starts
        registerBackgroundTasks();
    }, []);

    const handleSplashFinish = () => {
        setSplashVisible(false); // Hide splash screen after 2 seconds
    };

    return (
        <SafeAreaProvider>
            <SafeAreaView style={styles.container}>
                {/* Request permissions for location */}
                <RequestPermissions />

                {isSplashVisible ? (
                    <SplashScreen onFinish={handleSplashFinish} />
                ) : (
                    // Navigation setup
                    <NavigationContainer>
                        <Stack.Navigator initialRouteName="Map">
                            <Stack.Screen name="Map" component={Map} />
                            <Stack.Screen name="WalkList" component={WalkList} options={{ title: 'Walk List' }} />
                            <Stack.Screen name="WalkHistory" component={WalkHistory} />
                            <Stack.Screen name="BackgroundLocation" component={BackgroundLocations} />
                        </Stack.Navigator>
                    </NavigationContainer>
                )}
            </SafeAreaView>
        </SafeAreaProvider>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        fontFamily: 'Inter'
    },
});
