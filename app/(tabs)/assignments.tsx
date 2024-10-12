import React, { useEffect, useState } from 'react';
import { ScrollView, View, Text, FlatList, TouchableOpacity, ActivityIndicator, Alert, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { list_assignments,  Assignment } from '../api';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function AssignmentsScreen(){
    const [assignments, setAssignments] = useState<Assignment[] | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    useEffect(() => {
        const listAssignments = async () => {
            setLoading(true);
            try {
                const response = await list_assignments();
                console.log("API Response:", response.assignment); 
                
                if (response && Array.isArray(response.assignment)) {
                    setAssignments(response.assignment as Assignment[]);
                } else if (response && response.assignment) {
                    setAssignments([response.assignment as Assignment]); 
                } else {
                    throw new Error("Response error. Assignment data not found");
                }
            } catch (err) {
                console.error(err);
                setError("Failed to fetch assignment data.");
            } finally {
                setLoading(false);
            }
        };

        listAssignments();
    }, []); 

    
    const renderAssignment = ({ item }: { item: Assignment }) => {

        const handlePress = async () => {
            try {
                await AsyncStorage.setItem('assignment_pk', item.id.toString());
                console.log('Assignment ID stored:', item.id.toString());
                router.push('./assignment_detail');
            } catch (error) {
                console.error('Failed to save the assignment ID', error);
            }
        };

        return (
            <TouchableOpacity onPress={handlePress} style={styles.box}>
                <Text style={styles.title}>{item.name}</Text>
                <Text style={styles.description}>{item.assignment_info}</Text>
            </TouchableOpacity>
        );
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#007bff" />
            </View>
        );
    }

    if (error) {
        return (
            <View style={styles.container}>
                <Text style={styles.errorText}>{error}</Text>
            </View>
        );
    }

    if (!assignments || assignments.length === 0) {
        return (
            <View style={styles.container}>
                <Text style={styles.emptyText}>No assignments available.</Text>
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <FlatList
                data={assignments}
                renderItem={renderAssignment}
                keyExtractor={item => item.id.toString()}
            />
        </SafeAreaView>
    );
}



const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f0f0f5',
    },
    title: {
        fontSize: 24,
        marginBottom: 6,
        textAlign: 'left',
        fontWeight: 'bold',
        color: 'black',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    description: {
        flex: 1,
        justifyContent: 'center',
        paddingHorizontal: 20,
    },
    errorText: {
        color: 'red',
        textAlign: 'center',
        fontSize: 18,
    },
    box: {
        backgroundColor: 'white', 
        padding: 20, 
        margin: 10, 
        borderRadius: 8, 
    },
    emptyText: {
        color: 'black',
        textAlign: 'center',
        fontSize: 18,
    },
});
