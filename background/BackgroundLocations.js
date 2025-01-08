import React from 'react';
import { Button, View, Text } from 'react-native';
import * as Location from 'expo-location';

const LOCATION_TASK_NAME = 'background-location-task';

const BackgroundLocation = () => {
    const startLocationUpdates = async () => {
        const hasStarted = await Location.hasStartedLocationUpdatesAsync(LOCATION_TASK_NAME);
        if (!hasStarted) {
            await Location.startLocationUpdatesAsync(LOCATION_TASK_NAME, {
                accuracy: Location.Accuracy.High,
                timeInterval: 10000, // 10 seconds
                distanceInterval: 5, // 5 meters
                showsBackgroundLocationIndicator: true,
            });
            console.log('Background location updates started');
        } else {
            console.log('Background location updates already running');
        }
    };

    const stopLocationUpdates = async () => {
        const hasStarted = await Location.hasStartedLocationUpdatesAsync(LOCATION_TASK_NAME);
        if (hasStarted) {
            await Location.stopLocationUpdatesAsync(LOCATION_TASK_NAME);
            console.log('Background location updates stopped');
        } else {
            console.log('No background location updates to stop');
        }
    };

    return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <Text>Background Location Tracking</Text>
            <Button title="Start Location Updates" onPress={startLocationUpdates} />
            <Button title="Stop Location Updates" onPress={stopLocationUpdates} />
        </View>
    );
};

export default BackgroundLocation;
