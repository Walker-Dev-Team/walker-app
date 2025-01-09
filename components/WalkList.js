import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';

export default function WalkList() {
    const [walks, setWalks] = useState([]);
    const navigation = useNavigation();

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
        return `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
    };

    return (
        <View style={styles.container}>
            <FlatList
                data={walks}
                keyExtractor={(item, index) => index.toString()}
                renderItem={({ item }) => (
                    <TouchableOpacity
                        style={styles.item}
                        onPress={() => navigation.navigate('WalkHistory', { walk: item })}
                    >
                        <Text style={styles.date}>{formatDateTime(item.startTime)}</Text>
                        <Text style={styles.time}>{`Duration: ${Math.floor(item.time / 60)}m ${item.time % 60}s`}</Text>
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
        padding: 20,
    },
    item: {
        padding: 15,
        marginVertical: 8,
        backgroundColor: '#f9f9f9',
        borderRadius: 8,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 4,
    },
    date: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    time: {
        fontSize: 14,
        color: '#555',
    },
    empty: {
        textAlign: 'center',
        fontSize: 16,
        color: 'gray',
        marginTop: 20,
    },
});
