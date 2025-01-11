import React, { useState, useEffect, useRef } from 'react';
import MapView, { Marker, Polyline } from 'react-native-maps';
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {StyleSheet, View, Dimensions, Text, TouchableOpacity, Image} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { AnimatePresence, MotiView } from 'moti';
import { useNavigation } from '@react-navigation/native';
import { AppState } from 'react-native';
import { differenceInSeconds } from 'date-fns';

export default function Map() {
    const navigation = useNavigation();
    const [location, setLocation] = useState(null);
    const [errorMsg, setErrorMsg] = useState(null);
    const [isRecording, setIsRecording] = useState(false);
    const [route, setRoute] = useState([]);
    const [timer, setTimer] = useState(0);
    const [walks, setWalks] = useState([]);
    const mapRef = useRef(null);
    const timerRef = useRef(null);
    const locationSubscription = useRef(null);
    const appState = useRef(AppState.currentState);

    useEffect(() => {
        // Setting custom header options
        navigation.setOptions({
            headerStyle: {
                backgroundColor: '#639616',
                borderBottomLeftRadius: 16,
                borderBottomRightRadius: 16,
            },
            headerTitleStyle: {
                fontSize: 28,
                fontWeight: 500,
                color: 'white',
            },
            headerTitle: 'Map',
            headerTintColor: 'white',
            headerShown: true,
            headerTitleAlign: 'center',
        });
    }, [navigation]);

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

        const handleAppStateChange = async (nextAppState) => {
            if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
                const elapsed = await getElapsedTime();
                setTimer(elapsed);
            }
            appState.current = nextAppState;
        };

        const subscription = AppState.addEventListener('change', handleAppStateChange);

        return () => {
            // Cleanup event listener using the remove method
            subscription.remove();
        };
    }, []);


    const getElapsedTime = async () => {
        try {
            const startTime = await AsyncStorage.getItem('@start_time');
            const now = new Date();
            return startTime ? differenceInSeconds(now, new Date(startTime)) : 0;
        } catch (err) {
            console.error(err);
        }
    };
    const recordStartTime = async () => {
        try {
            const now = new Date();
            await AsyncStorage.setItem('@start_time', now.toISOString());
        } catch (err) {
            console.warn(err);
        }
    };
    const startRecording = async () => {
        setIsRecording(true);
        setRoute([]);
        setTimer(0);
        recordStartTime(); // Store the start time in AsyncStorage
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
            const startTime = await AsyncStorage.getItem('@start_time');
            const walk = {
                path: route,
                time: timer,
                startTime: startTime || new Date().toISOString(),
            };
            const updatedWalks = [...walks, walk];
            setWalks(updatedWalks);
            await AsyncStorage.setItem('walks', JSON.stringify(updatedWalks));
        }
    };


    // const recenterMap = async () => {
    //     if (location && mapRef.current) {
    //         let currentLocation = await Location.getCurrentPositionAsync({});
    //         setLocation(currentLocation.coords);
    //         mapRef.current.animateToRegion({
    //             latitude: currentLocation.coords.latitude,
    //             longitude: currentLocation.coords.longitude,
    //             latitudeDelta: 0.01,
    //             longitudeDelta: 0.01,
    //         });
    //     }
    // };

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
                    latitudeDelta: 0.01,
                    longitudeDelta: 0.01,
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
                    <Polyline coordinates={route} strokeColor="#639616" strokeWidth={6} />
                )}
            </MapView>

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
                        <View>
                        <Text style={[styles.buttonText, {fontSize: 14}]}>Walking time</Text>
                            <Text style={styles.timer}>
                                {`${String(Math.floor(timer / 3600)).padStart(2, '0')}:${String(
                                    Math.floor((timer % 3600) / 60)
                                ).padStart(2, '0')}:${String(timer % 60).padStart(2, '0')}`}
                            </Text>
                        </View>
                        <TouchableOpacity style={styles.stopButton} onPress={stopRecording}>
                            <Image source={require('../assets/icons/stopIcon.png')} />
                        </TouchableOpacity>
                    </MotiView>
                ) : (
                    <View style={styles.startRecordingBtnWrapper}>
                    <TouchableOpacity style={styles.startButton} onPress={startRecording}>
                        <View style={styles.imageWrapper}>
                            <Image source={require('../assets/icons/playIcon.png')} />
                        </View>
                        <Text style={styles.buttonText}>Start walk</Text>
                    </TouchableOpacity>
                    </View>
                )}
            </AnimatePresence>
            {!isRecording ? (
            <View style={styles.walkBtnWrapper}>
            <TouchableOpacity
                style={[styles.startButton]}
                onPress={() => navigation.navigate('WalkList')}
            >
                <View style={styles.imageWrapper}>
                    <Image source={require('../assets/icons/walkHistoryIcon.png')} />
                </View>
                <Text style={styles.buttonText}>View walk history</Text>
            </TouchableOpacity>
            </View>
            ) : null}
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
    // recenterButton: {
    //     position: 'absolute',
    //     bottom: 20,
    //     right: 20,
    //     backgroundColor: '#007bff',
    //     borderRadius: 25,
    //     width: 50,
    //     height: 50,
    //     justifyContent: 'center',
    //     alignItems: 'center',
    //     shadowColor: '#000',
    //     shadowOpacity: 0.3,
    //     shadowRadius: 3,
    //     shadowOffset: { width: 0, height: 2 },
    //     elevation: 5,
    // },
    startButton: {
        left: 0,
        backgroundColor: 'white',
        padding: 10,
        borderRadius: 16,
        width: '100%',
        height: 68,
        elevation: 1,
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16
    },
    recordingContainer: {
        position: 'absolute',
        bottom: 24,
        left: 0,
        right: 0,
        marginRight: 24,
        marginLeft: 24,
        backgroundColor: 'white',
        borderRadius: 16,
        padding: 16,
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'space-between',
elevation: 2
    },
    timer: {
        color: '#639616',
        fontSize: 24,
        fontWeight: 600
    },
    stopButton: {
        backgroundColor: '#639616',
        padding: 6,
        borderRadius: 12,
        alignItems: 'center',
    },
    buttonText: {
        color: '#333',
        fontWeight: 400,
        opacity: 0.7,
        fontSize: 18
    },
    walkBtnWrapper: {
        position: 'absolute',
        bottom: 24,
        width: '100%',
        paddingRight: 24,
       paddingLeft: 24,
    },
    imageWrapper: {
        backgroundColor: '#639616',
        padding: 6,
        alignSelf: 'center',
        borderRadius: 12
    },
    startRecordingBtnWrapper: {
        position: 'absolute',
        bottom: 104,
        width: '100%',
        paddingRight: 24,
        paddingLeft: 24,
    }
});
