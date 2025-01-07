import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import MapView, { Polyline } from 'react-native-maps';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function WalkHistory() {
    const [walks, setWalks] = useState([]);
    const mapRef = useRef(null);

    useEffect(() => {
        const loadWalks = async () => {
            const storedWalks = await AsyncStorage.getItem('walks');
            if (storedWalks) {
                setWalks(JSON.parse(storedWalks));
            }
        };
        loadWalks();
    }, []);

    const fitToMarkers = () => {
        if (mapRef.current && walks.length > 0) {
            const allCoords = walks.flatMap((walk) => walk.path);
            mapRef.current.fitToCoordinates(allCoords, {
                edgePadding: { top: 50, right: 50, bottom: 50, left: 50 },
                animated: true,
            });
        }
    };

    useEffect(() => {
        fitToMarkers();
    }, [walks]);

    return (
        <View style={styles.container}>
            {walks.length > 0 ? (
                <MapView
                    ref={mapRef}
                    style={styles.map}
                    initialRegion={{
                        latitude: walks[0]?.path[0]?.latitude || 37.78825,
                        longitude: walks[0]?.path[0]?.longitude || -122.4324,
                        latitudeDelta: 0.1,
                        longitudeDelta: 0.1,
                    }}
                >
                    {walks.map((walk, index) => (
                        <Polyline
                            key={index}
                            coordinates={walk.path}
                            strokeColor="#007bff"
                            strokeWidth={4}
                        />
                    ))}
                </MapView>
            ) : (
                <View style={styles.emptyContainer}>
                    <Text style={styles.emptyText}>No walks recorded yet.</Text>
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
        height: Dimensions.get('window').height,
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
