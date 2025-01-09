import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import MapView, { Polyline } from 'react-native-maps';

export default function WalkDetails({ route }) {
    const mapRef = useRef(null);
    const { walk } = route.params;

    useEffect(() => {
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
