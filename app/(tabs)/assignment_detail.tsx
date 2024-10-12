import React, { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { SafeAreaView, View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { get_assignment, Assignment } from '../api';
import { format } from 'date-fns';

export default function AssignmentDetail() {
    const [assignment, setAssignment] = useState<Assignment | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    useEffect(() => {
        const fetchAssignment = async () => {
            setLoading(true);
            try {
                const response = await get_assignment();
                console.log("API Response (get_assignment):", response.assignment); 
                
                if (response && response.assignment) {
                    setAssignment(response.assignment as Assignment); 
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

        fetchAssignment();
    }, []); 

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#0000ff" />
                <Text>Loading...</Text>
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

    if (!assignment) {
        return (
            <View style={styles.container}>
                <Text style={styles.emptyText}>No assignments found.</Text>
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <Text style={styles.title}>Title: {assignment.name}</Text>
            <Text style={styles.description}> Due: {format(new Date(assignment.due_date), 'MMMM dd, yyyy HH:mm')}</Text>
            <Text style={styles.description}> Created by: {assignment.lecturer}</Text>
            <Text style={styles.description}> Created at: {format(new Date(assignment.created_at), 'MMMM dd, yyyy HH:mm')}</Text>
            <Text style={styles.description}> Total marks: {assignment.marks}</Text>
            <Text style={styles.info}> Additional Info: {assignment.assignment_info}</Text>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f0f0f5',
        padding: 10,
    },
    title: {
        fontSize: 24,
        marginBottom: 6,
        marginTop: 10,
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
        fontSize: 20,
    },
    errorText: {
        color: 'red',
        textAlign: 'center',
        fontSize: 18,
    },
    emptyText: {
        color: 'black',
        textAlign: 'center',
        fontSize: 18,
    },
    info: {
        color: 'black',
        textAlign: 'left',
        fontSize: 14,
        marginTop: 10
    },
});
