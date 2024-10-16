import React, { useEffect, useState } from 'react';
import { ScrollView, View, Text, FlatList, TouchableOpacity, ActivityIndicator, Alert, StyleSheet } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { list_assignments,  Assignment } from '../api';
import { SafeAreaView } from 'react-native-safe-area-context';
import { format } from 'date-fns';

export default function AssignmentsScreen(){
    const [assignments, setAssignments] = useState<Assignment[] | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [sortField, setSortField] = useState('title');
    const [sortOrder, setSortOrder] = useState('asc');
    const [refreshing, setRefreshing] = useState(false);
    const router = useRouter();

    useEffect(() => {
        listAssignments();
    }, []); 

    const listAssignments = async () => {
        setLoading(true);
        setRefreshing(false);
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

    const sortAssignments = (assignments: Assignment[], field: string, order: string) => {
        return assignments.sort((a, b) => {
            let comparison = 0;
            if (field === 'title') {
                comparison = a.name.localeCompare(b.name);
            } else if (field === 'created_at' || field === 'due_date') {
                comparison = new Date(a[field]).getTime() - new Date(b[field]).getTime();
            }

            return order === 'asc' ? comparison : -comparison;
        });
    };

    const handleSortFieldChange = (itemValue: string) => {
        setSortField(itemValue);
        setAssignments(prevAssignments => (prevAssignments ? sortAssignments([...prevAssignments], itemValue, sortOrder) : null));
    };

    const handleSortOrderChange = (itemValue: string) => {
        setSortOrder(itemValue);
        setAssignments(prevAssignments => (prevAssignments ? sortAssignments([...prevAssignments], sortField, itemValue) : null));
    };

    
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

        const dueDate = new Date(item.due_date);
        const now = new Date();

        const isPastDue = dueDate < now;

        return (
            <TouchableOpacity onPress={handlePress} style={styles.box}>
                <Text style={[styles.title, isPastDue && styles.crossedOut]}>{item.name}</Text>
                <Text style={styles.description}>Created:   {format(new Date(item.created_at), 'MMMM dd, yyyy HH:mm')}</Text>
                <Text style={styles.description}>Due:         {format(new Date(item.due_date), 'MMMM dd, yyyy HH:mm')}</Text>
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

    const sortedAssignments = sortAssignments(assignments, sortField, sortOrder)

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.sortContainer}>
                <Text style={styles.sortText}>Sort By:</Text>
                <Picker
                    selectedValue={sortField}
                    style={styles.picker}
                    onValueChange={handleSortFieldChange}
                >
                    <Picker.Item label="Title" value="title" />
                    <Picker.Item label="Due Date" value="due_date" />
                    <Picker.Item label="Created At" value="created_at" />
                </Picker>

                <Picker
                    selectedValue={sortOrder}
                    style={styles.picker}
                    onValueChange={handleSortOrderChange}
                >
                    <Picker.Item label="Ascending" value="asc" />
                    <Picker.Item label="Descending" value="desc" />
                </Picker>
            </View>
            <FlatList
                data={sortedAssignments}
                renderItem={renderAssignment}
                keyExtractor={item => item.id.toString()}
                onRefresh={async () => {
                    setRefreshing(true);
                    await listAssignments(); 
                    setRefreshing(false);
                }}
                refreshing={refreshing}
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
    crossedOut: {
        textDecorationLine: 'line-through',  // Cross out text style
        color: 'gray',
    },

    picker: {
        height: 50,
        width: 150,
    },
    sortContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        marginVertical: 10,
    },
    sortText: {
        fontSize: 18,
        fontWeight: 'bold',
    },
});
