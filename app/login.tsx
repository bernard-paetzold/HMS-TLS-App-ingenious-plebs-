import { Text, View, StyleSheet, Alert, TextInput, Button } from "react-native";
import { useState, useEffect } from 'react';
import { login, get_user, User } from './api';
import { useRouter } from 'expo-router';
import RNFS from 'react-native-fs';

export default function Login(){

    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [db_con_ip, setIP] = useState('');
    const [port, setPort] = useState('');

    const showIPField = true;

    const router = useRouter();

    const handleLogin = async () => {
        try {
            const response = await login(username, password, db_con_ip, port);
            if (response.success) {
                Alert.alert('Connection Successful', `Connected to ${db_con_ip} with port ${port}`);

                //const user = await (await get_user()).user as User;
                router.push({
                    pathname: "./home"
                });
            }
        } catch (error) {
            Alert.alert('Error', 'Failed to connect to the server. Please check your IP address and login credentials.');
            console.error('Connection error', error);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Login Screen</Text>
            <TextInput
                style={styles.input}
                placeholder="Username"
                value={username}
                onChangeText={setUsername}
            />
            <TextInput
                style={styles.input}
                placeholder="Password"
                secureTextEntry
                value={password}
                onChangeText={setPassword}
            />
            <Text style={styles.title}>For DEMO purposes only</Text>
            {showIPField && (
                <TextInput
                    style={styles.input}
                    placeholder="Hosted IP"
                    value={db_con_ip}
                    onChangeText={setIP}
                />
            )}
            {showIPField && (
                <TextInput
                    style={styles.input}
                    placeholder="Hosted port"
                    value={port}
                    onChangeText={setPort}
                />
            )}
            <Button title="Login" onPress={handleLogin} />
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        paddingHorizontal: 16,
        backgroundColor: '#f0f0f5',
    },
    title: {
        fontSize: 24,
        marginBottom: 24,
        textAlign: 'center',
        fontWeight: 'bold',
        color: 'black',
    },
    input: {
        height: 40,
        borderColor: '#ccc',
        borderWidth: 1,
        marginBottom: 16,
        paddingHorizontal: 8,
        borderRadius: 4,
        color: 'black',
    },
});
