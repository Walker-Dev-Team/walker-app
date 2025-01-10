import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Dimensions, ActivityIndicator } from 'react-native';
import MapView, { Polyline } from 'react-native-maps';

const GOOGLE_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_API_KEY;

export default function WalkDetails({ route }) {
    const mapRef = useRef(null);
    const { walk } = route.params;
    const [distance, setDistance] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const calculateDistance = async () => {
            if (walk?.path?.length > 1) {
                const origin = `${walk.path[0].latitude},${walk.path[0].longitude}`;
                const destination = `${walk.path[walk.path.length - 1].latitude},${walk.path[walk.path.length - 1].longitude}`;
                const waypoints = walk.path.slice(1, -1).map(p => `${p.latitude},${p.longitude}`).join('|');

                const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${origin}&destination=${destination}&waypoints=${waypoints}&mode=walking&key=${GOOGLE_API_KEY}`;

                try {
                    const response = await fetch(url);
                    const data = await response.json();

                    if (data.status === 'OK') {
                        const route = data.routes[0];
                        const totalDistance = route.legs.reduce((sum, leg) => sum + leg.distance.value, 0); // In meters
                        setDistance(totalDistance / 1000); // Convert to kilometers
                    } else {
                        console.error('Directions API error:', data.error_message);
                        setDistance(null);
                    }
                } catch (error) {
                    console.error('Error fetching directions:', error);
                    setDistance(null);
                } finally {
                    setLoading(false);
                }
            } else {
                setLoading(false);
            }
        };

        calculateDistance();

        if (mapRef.current && walk?.path?.length > 0) {
            mapRef.current.fitToCoordinates(walk.path, {
                edgePadding: { top: 50, right: 50, bottom: 50, left: 50 },
                animated: true,
            });
        }
    }, [walk]);

    return (
        <View style={styles.container}>
            {walk?.path?.length > 0 ? (
                <>
                    <MapView
                        ref={mapRef}
                        style={styles.map}
                        initialRegion={{
                            latitude: walk.path[0]?.latitude || 37.78825,
                            longitude: walk.path[0]?.longitude || -122.4324,
                            latitudeDelta: 0.01,
                            longitudeDelta: 0.01,
                        }}
                    >
                        <Polyline
                            coordinates={walk.path}
                            strokeColor="#007bff"
                            strokeWidth={6}
                        />
                    </MapView>
                    <View style={styles.details}>
                        {loading ? (
                            <ActivityIndicator size="large" color="#007bff" />
                        ) : distance !== null ? (
                            <Text style={styles.distance}>{`Total Distance: ${distance.toFixed(2)} km`}</Text>
                        ) : (
                            <Text style={styles.error}>Unable to calculate distance</Text>
                        )}
                    </View>
                </>
            ) : (
                <View style={styles.emptyContainer}>
                    <Text style={styles.emptyText}>No path data available for this walk.</Text>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    map: {
        width: Dimensions.get('window').width,
        height: Dimensions.get('window').height * 0.75,
    },
    details: {
        padding: 16,
        backgroundColor: '#fff',
        alignItems: 'center',
    },
    distance: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#007bff',
    },
    error: {
        fontSize: 16,
        color: 'red',
    },
    emptyContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    emptyText: {
        fontSize: 16,
        color: 'gray',
    },
});
