import * as Location from 'expo-location';
import * as TaskManager from 'expo-task-manager';

const LOCATION_TASK_NAME = 'background-location-task';

// Define the task
TaskManager.defineTask(LOCATION_TASK_NAME, ({ data, error }) => {
    if (error) {
        console.error('Error in background location task:', error);
        return;
    }

    if (data) {
        const { locations } = data;
        if (locations?.length) {
            const { latitude, longitude } = locations[0].coords;
            console.log('Background location update:', latitude, longitude);
            // Add logic to save or process the location
        }
    }
});
// Register the background task
export const registerBackgroundTasks = async () => {
    const hasStarted = await Location.hasStartedLocationUpdatesAsync(LOCATION_TASK_NAME);
    if (!hasStarted) {
        await Location.startLocationUpdatesAsync(LOCATION_TASK_NAME, {
            accuracy: Location.Accuracy.High,
            distanceInterval: 10, // Minimum distance in meters to trigger an update
            deferredUpdatesInterval: 1000, // Minimum time in ms for batching updates
            showsBackgroundLocationIndicator: true,
        });
    }
};
