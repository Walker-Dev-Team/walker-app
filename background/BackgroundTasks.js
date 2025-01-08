import * as BackgroundFetch from 'expo-background-fetch';
import * as TaskManager from 'expo-task-manager';

const LOCATION_TASK_NAME = 'background-location-task';

TaskManager.defineTask(LOCATION_TASK_NAME, ({ data, error }) => {
    if (error) {
        console.error(error);
        return;
    }
    if (data) {
        const { locations } = data;
        const { latitude, longitude } = locations[0].coords;
        console.log('Location in background:', latitude, longitude);
    }
});

export const registerBackgroundTasks = async () => {
    await BackgroundFetch.registerTaskAsync(LOCATION_TASK_NAME, {
        minimumInterval: 10, // Background fetch will run every 10 minutes
        stopOnTerminate: false,
        startOnBoot: true,
    });
};
