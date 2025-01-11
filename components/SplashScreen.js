import React, { useEffect } from 'react';
import {View, Text, StyleSheet, ActivityIndicator} from 'react-native';

const SplashScreen = ({ onFinish }) => {
    useEffect(() => {
        const timer = setTimeout(() => {
            onFinish();
        }, 2000); // Show splash screen for 2 seconds

        return () => clearTimeout(timer); // Cleanup timer on unmount
    }, [onFinish]);

    return (
        <View style={styles.container}>
            <ActivityIndicator size="large" color="#639616" style={styles.spinner} />
            <Text style={styles.text}>Walker</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
    },
    spinner: {
        height: 100,
        width: 100,
        transform: [{ scale: 2.5 }], // Adjust scale if needed to get the exact size
    },
    text: {
        fontSize: 36,
        fontWeight: 500,
        color: '#639616',
        position: 'absolute',
        bottom: 48,
    },
});

export default SplashScreen;
