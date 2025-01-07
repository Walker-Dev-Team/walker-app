import React, { useState, useEffect, useRef } from 'react';
import MapView, { Marker, Polyline } from 'react-native-maps';
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StyleSheet, View, Dimensions, Text, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { AnimatePresence, MotiView } from 'moti'; // Animation library

export default function Map() {
    const [location, setLocation] = useState(null);
    const [errorMsg, setErrorMsg] = useState(null);
    const [isRecording, setIsRecording] = useState(false);
    const [isPaused, setIsPaused] = useState(false); // Track if recording is paused
    const [route, setRoute] = useState([]);
    const [timer, setTimer] = useState(0);
    const [walks, setWalks] = useState([]);
    const mapRef = useRef(null);
    const timerRef = useRef(null);
    const locationSubscription = useRef(null); // UseRef for location subscription

    useEffect(() => {
        (async () => {
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                setErrorMsg('Permission to access location was denied');
                return;
            }
            let currentLocation = await Location.getCurrentPositionAsync({});
            setLocation(currentLocation.coords);
        })();
    }, []);

    const startRecording = async () => {
        setIsRecording(true);
        setIsPaused(false);
        setRoute([]);
        setTimer(0);
        timerRef.current = setInterval(() => setTimer((prev) => prev + 1), 1000);

        locationSubscription.current = await Location.watchPositionAsync(
            {
                accuracy: Location.Accuracy.High,
                distanceInterval: 5,
            },
            (newLocation) => {
                const { latitude, longitude } = newLocation.coords;
                setRoute((prev) => [...prev, { latitude, longitude }]);
            }
        );
    };

    const stopRecording = async () => {
        clearInterval(timerRef.current);
        setIsRecording(false);
        if (locationSubscription.current) {
            locationSubscription.current.remove();
            locationSubscription.current = null;
        }
        if (route.length > 0) {
            const walk = {
                path: route,
                time: timer,
                date: new Date().toISOString(),
            };
            const updatedWalks = [...walks, walk];
            setWalks(updatedWalks);
            await AsyncStorage.setItem('walks', JSON.stringify(updatedWalks));
        }
    };

    const togglePause = async () => {
        if (isPaused) {
            // Unpause logic
            timerRef.current = setInterval(() => setTimer((prev) => prev + 1), 1000);
            locationSubscription.current = await Location.watchPositionAsync(
                {
                    accuracy: Location.Accuracy.High,
                    distanceInterval: 5,
                },
                (newLocation) => {
                    const { latitude, longitude } = newLocation.coords;
                    setRoute((prev) => [...prev, { latitude, longitude }]);
                }
            );
        } else {
            // Pause logic
            clearInterval(timerRef.current);
            if (locationSubscription.current) {
                locationSubscription.current.remove();
                locationSubscription.current = null;
            }
        }
        setIsPaused(!isPaused);
    };

    const recenterMap = async () => {
        if (location && mapRef.current) {
            let currentLocation = await Location.getCurrentPositionAsync({});
            setLocation(currentLocation.coords);
            mapRef.current.animateToRegion({
                latitude: currentLocation.coords.latitude,
                longitude: currentLocation.coords.longitude,
                latitudeDelta: 0.0922,
                longitudeDelta: 0.0421,
            });
        }
    };

    if (!location) {
        return (
            <View style={styles.container}>
                <Text>{errorMsg ? errorMsg : 'Fetching location...'}</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <MapView
                ref={mapRef}
                style={styles.map}
                initialRegion={{
                    latitude: location.latitude,
                    longitude: location.longitude,
                    latitudeDelta: 0.0922,
                    longitudeDelta: 0.0421,
                }}
            >
                <Marker
                    coordinate={{
                        latitude: location.latitude,
                        longitude: location.longitude,
                    }}
                    title="My Location"
                    description="You are here"
                />
                {route.length > 1 && (
                    <Polyline coordinates={route} strokeColor="#007bff" strokeWidth={4} />
                )}
            </MapView>

            {/* Recenter Button */}
            <TouchableOpacity style={styles.recenterButton} onPress={recenterMap}>
                <MaterialIcons name="my-location" size={24} color="white" />
            </TouchableOpacity>

            {/* Animated Walk Controls */}
            <AnimatePresence>
                {isRecording ? (
                    <MotiView
                        style={styles.recordingContainer}
                        from={{ translateY: 200 }}
                        animate={{ translateY: 0 }}
                        exit={{ translateY: 200 }}
                        transition={{ type: 'timing', duration: 300 }}
                    >
                        <Text style={styles.timer}>{`Time: ${Math.floor(timer / 60)}:${String(
                            timer % 60
                        ).padStart(2, '0')}`}</Text>
                        <TouchableOpacity
                            style={styles.pauseButton}
                            onPress={togglePause}
                        >
                            <Text style={styles.buttonText}>
                                {isPaused ? 'Unpause' : 'Pause'}
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.stopButton} onPress={stopRecording}>
                            <Text style={styles.buttonText}>Stop</Text>
                        </TouchableOpacity>
                    </MotiView>
                ) : (
                    <TouchableOpacity style={styles.startButton} onPress={startRecording}>
                        <Text style={styles.buttonText}>Start Walk</Text>
                    </TouchableOpacity>
                )}
            </AnimatePresence>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    map: {
        width: Dimensions.get('window').width,
        height: Dimensions.get('window').height,
    },
    recenterButton: {
        position: 'absolute',
        bottom: 20,
        right: 20,
        backgroundColor: '#007bff',
        borderRadius: 25,
        width: 50,
        height: 50,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOpacity: 0.3,
        shadowRadius: 3,
        shadowOffset: { width: 0, height: 2 },
        elevation: 5,
    },
    startButton: {
        position: 'absolute',
        bottom: 20,
        left: 20,
        backgroundColor: '#28a745',
        padding: 10,
        borderRadius: 5,
    },
    recordingContainer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'white',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        padding: 20,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOpacity: 0.2,
        shadowRadius: 5,
        shadowOffset: { width: 0, height: -2 },
    },
    timer: {
        color: 'black',
        fontSize: 18,
        marginBottom: 10,
    },
    pauseButton: {
        backgroundColor: '#ffc107',
        padding: 10,
        borderRadius: 5,
        marginBottom: 10,
        width: '80%',
        alignItems: 'center',
    },
    stopButton: {
        backgroundColor: '#dc3545',
        padding: 10,
        borderRadius: 5,
        width: '80%',
        alignItems: 'center',
    },
    buttonText: {
        color: 'white',
        fontWeight: 'bold',
    },
});
