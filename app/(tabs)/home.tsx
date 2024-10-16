import React, { useEffect, useState } from "react";
import { Text, View, StyleSheet, Pressable, ActivityIndicator, TouchableOpacity } from "react-native";
import { User, get_user, logout } from "../api"; 
import { useRouter } from 'expo-router';

export default function Homescreen() {

    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>();

    const router = useRouter();

    useEffect(() => {
        const fetchUser = async () => {
            setLoading(true);
            try {
                const response = await get_user();
                console.log("API Response:", response); 
                
                if (response && response.user) {
                    setUser(response.user);
                } else {
                    throw new Error("User data not found in response");
                }
            } catch (err) {
                console.error(err);
                setError("Failed to fetch user data.");
            } finally {
                setLoading(false);
            }
        };

        fetchUser();
    }, []); 

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

    const onLogout = async () => {
        await logout()
        router.push({
            pathname: "/login"
        });
    }

    return (
        <View style={styles.container}>
            <View style={styles.content}>
                <Text style={styles.welcomeText}>
                    Welcome, {user?.first_name} {user?.last_name}!
                </Text>
                <Text style={styles.profileText}>{user?.role}</Text>
            </View>
            <TouchableOpacity style={styles.button} onPress={onLogout}>
                <Text style={styles.buttonText}>Logout</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f0f0f5',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    errorText: {
        color: 'red',
        textAlign: 'center',
        fontSize: 18,
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
    navButton: {
        backgroundColor: '#28a745',
        paddingVertical: 15,
        borderRadius: 5,
        marginVertical: 10,
    },
    navButtonText: {
        color: '#fff',
        fontSize: 18,
        textAlign: 'center',
    },
    button: {
        backgroundColor: '#FF4C4C', 
        padding: 10,
        borderRadius: 5,
        alignItems: 'center',
    },
        buttonText: {
        color: '#FFFFFF', 
        fontSize: 16,
        fontWeight: 'bold',
    },
});