import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import React, { useEffect, useState } from 'react';

const HomeScreen = ({ route }: { route: any }) => {

    const { first_name, last_name } = route.params;

    console.log(first_name);
    console.log(last_name);

    const handleProfilePress = () => {
        // navigation.navigate('ProfileScreen');
        console.log('Profile Button Pressed');
    };

    const handleAssignmentsPress = () => {
        //navigation.navigate('AssignmentScreen');
    };

    return (
        <View style={styles.container}>
            {/* Profile Button in Top Right */}
            <TouchableOpacity onPress={handleProfilePress} style={styles.profileButton}>
                <Text style={styles.profileButtonText}>Profile</Text>
            </TouchableOpacity>

            {/* Main Content */}
            <View style={styles.content}>
                <Text style={styles.welcomeText}>Welcome, !</Text>
                <Text style={styles.profileText}>Full Stack Developer</Text>

                <View style={styles.navigationContainer}>
                    <TouchableOpacity onPress={handleAssignmentsPress} style={styles.navButton}>
                        <Text style={styles.navButtonText}>Go to Assignments</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f0f0f5',
    },
    profileButton: {
        position: 'absolute',
        top: 40,
        right: 20,
        backgroundColor: '#007bff',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 20,
    },
    profileButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 20,
    },
    welcomeText: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 10,
        color: '#333',
    },
    profileText: {
        fontSize: 18,
        marginBottom: 15,
        color: '#666',
    },
    navigationContainer: {
        width: '90%',
        marginTop: 20,
    },
    navButton: {
        backgroundColor: '#28a745',
        paddingVertical: 15,
        borderRadius: 5,
    },
    navButtonText: {
        color: '#fff',
        fontSize: 18,
        textAlign: 'center',
    },
});

export default HomeScreen;
