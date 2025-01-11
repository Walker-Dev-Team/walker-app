import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Image } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';

export default function WalkList() {
    const [walks, setWalks] = useState([]);
    const navigation = useNavigation();

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
            headerTitle: 'Walk history',
            headerTintColor: 'white',
            headerShown: true,
            headerTitleAlign: 'center',
        });
    }, [navigation]);

    useEffect(() => {
        const loadWalks = async () => {
            const storedWalks = await AsyncStorage.getItem('walks');
            if (storedWalks) {
                setWalks(JSON.parse(storedWalks).sort((a, b) => new Date(b.startTime) - new Date(a.startTime)));
            }
        };
        loadWalks();
    }, []);

    const formatDateTime = (dateTime) => {
        const date = new Date(dateTime);
        const options = { month: 'long', day: 'numeric' };
        return date.toLocaleDateString('en-US', options); // Format as "January 10"
    };



    const formatDuration = (seconds) => {
        const hrs = String(Math.floor(seconds / 3600)).padStart(2, '0');
        const mins = String(Math.floor((seconds % 3600) / 60)).padStart(2, '0');
        const secs = String(seconds % 60).padStart(2, '0');
        return `${hrs}:${mins}:${secs}`;
    };

    return (
        <View style={styles.container}>
            <FlatList
                style={styles.list}
                data={walks}
                keyExtractor={(item, index) => index.toString()}
                renderItem={({ item, index }) => (
                    <TouchableOpacity
                        style={styles.item}
                        onPress={() => navigation.navigate('WalkHistory', { walk: item })}
                    >
                        <View style={styles.itemInfo}>
                            <Text style={styles.date}>{formatDateTime(item.startTime)}</Text>
                            <Text style={styles.time}>{`Time: ${formatDuration(item.time)}`}</Text>
                        </View>
                        <View style={styles.imageWrapper}>
                            <Image source={require('../assets/icons/arrowIcon.png')} />
                        </View>
                        {index !== walks.length - 1 && (
                            <View style={styles.borderBottom} />
                        )}
                    </TouchableOpacity>
                )}
                ListEmptyComponent={<Text style={styles.empty}>No walks recorded yet.</Text>}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 24,
    },
    list: {
        backgroundColor: 'white',
        borderRadius: 16,
    },
    item: {
        padding: 16,
        position: 'relative',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    borderBottom: {
        position: 'absolute',
        bottom: 0,
        left: '15%', // Center the border
        width: '80%', // Set width to 60%
        height: 1, // Border height
        backgroundColor: 'rgba(51, 51, 51, 0.1)', // Border color with opacity
    },
    time: {
        fontSize: 14,
        color: 'rgba(97, 97, 97, 0.7)',
    },
    empty: {
        textAlign: 'center',
        fontSize: 16,
        marginTop: 20,
    },
    imageWrapper: {
        backgroundColor: '#639616',
        padding: 6,
        alignSelf: 'center',
        borderRadius: 12,
    },
    itemInfo: {
        position: 'relative',
    },
    date: {
        color: '#639616',
        fontSize: 20,
        fontWeight: 'bold',
    },
});
