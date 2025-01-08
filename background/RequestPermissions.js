import { useEffect } from 'react';
import * as Location from 'expo-location';

const RequestPermissions = () => {
    useEffect(() => {
        const requestPermissions = async () => {
            const { status: foregroundStatus } = await Location.requestForegroundPermissionsAsync();
            if (foregroundStatus !== 'granted') {
                console.error('Foreground location permission not granted');
                return;
            }

            const { status: backgroundStatus } = await Location.requestBackgroundPermissionsAsync();
            if (backgroundStatus !== 'granted') {
                console.error('Background location permission not granted');
            } else {
                console.log('Background location permission granted');
            }
        };

        requestPermissions();
    }, []);

    return null;
};

export default RequestPermissions;
