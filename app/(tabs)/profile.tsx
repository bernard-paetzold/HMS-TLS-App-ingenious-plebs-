import React, { useEffect, useState } from "react";
import { Text, View, StyleSheet, Alert, TextInput, Button, ActivityIndicator, TouchableOpacity } from "react-native";
import { get_user, User, update_user, logout } from "../api";
import { useRouter } from 'expo-router';

export default function NotFound() {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [firstName, setFirstName] = useState<string>("");
    const [lastName, setLastName] = useState<string>("");
    const [email, setEmail] = useState<string>("");
    const [password, setPassword] = useState<string>("");

    const router = useRouter();

    useEffect(() => {
        const fetchUser = async () => {
            setLoading(true);
            try {
                const response = await get_user();
                console.log("API Response:", response); // Log the entire response
                
                // Check if response and user data are present
                if (response && response.user) {
                    setUser(response.user as User); 
                    setFirstName(response.user.first_name); // Set these values directly from response
                    setLastName(response.user.last_name);
                    setEmail(response.user.email);
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

    const handleUpdateProfile = async () => {
        
        const updatedUser = {
            first_name: firstName,
            last_name: lastName,
            email: email,
            password: password,
        };

        try {
            await update_user(updatedUser);
            router.push({
                pathname: "/home"
            });
            Alert.alert("Profile updated successfully!");
        } catch (err) {
            console.error(err);
            Alert.alert("Failed to update profile.");
        }
    };
  
    if (!user) {
        return (
            <View style={styles.container}>
                <Text style={styles.title}>Loading...</Text>
            </View>
        );
    }
  
    return (
        <View style={styles.container}>
            <Text style={styles.title}>Edit Profile</Text>
            <TextInput
                style={styles.input}
                placeholder="First Name"
                value={firstName}
                onChangeText={setFirstName}
            />
            <TextInput
                style={styles.input}
                placeholder="Last Name"
                value={lastName}
                onChangeText={setLastName}
            />
            <TextInput
                style={styles.input}
                placeholder="Email"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
            />
            <TextInput
                style={styles.input}
                placeholder="Password"
                onChangeText={setPassword}
                secureTextEntry
            />
            <Button title="Update Profile" onPress={handleUpdateProfile} />
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
    title: {
        fontSize: 24,
        marginBottom: 24,
        textAlign: "center",
        fontWeight: "bold",
        color: "black",
    },
    input: {
        height: 50,
        borderColor: "gray",
        borderWidth: 1,
        marginBottom: 15,
        paddingHorizontal: 10,
        borderRadius: 5,
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
    button: {
        backgroundColor: '#FF4C4C', // Red background color
        padding: 10,
        borderRadius: 5,
        alignItems: 'center',
    },
        buttonText: {
        color: '#FFFFFF', // White text color
        fontSize: 16,
        fontWeight: 'bold',
    },
});
