import { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import { Stack, useNavigation } from 'expo-router';
import { StackNavigationProp } from '@react-navigation/stack';
import { login } from './api'

type RootStackParamList = {
    HomeScreen: undefined;
    LoginScreen: undefined;
};


  
type LoginScreenNavigationProp = StackNavigationProp<RootStackParamList, 'LoginScreen'>;

const LoginScreen = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [db_con_ip, setIP] = useState('');
    const [port, setPort] = useState('');


    const showIPField = true


    const navigation = useNavigation();

    useEffect(() => {
    navigation.setOptions({ headerShown: false });
    }, [navigation]);

    const handleLogin = async () => {
        try {
            const response = await login(username, password, db_con_ip, port);
            if (response.success) {
                console.log("asd")
                Alert.alert('Connection Successful', `Connected to ${db_con_ip} with port ${port}`);
                navigation.navigate('HomeScreen'); 
            }
        } catch (error) {
            Alert.alert('Error', 'Failed to connect to the server. Please check your IP address and login credentials.');
            console.error('Connection error', error);
        }
    };
    
    return (
        <View style={styles.container}>
            <Text style={styles.title}>Login Screen</Text>
            {showIPField && ( // Conditionally render the IP input
                <TextInput
                    style={styles.input}
                    placeholder="Hosted IP"
                    value={db_con_ip}
                    onChangeText={setIP}
                />
                
            )}
            {showIPField && ( // Conditionally render the IP input
                <TextInput
                style={styles.input}
                placeholder="Hosted port"
                value={port}
                onChangeText={setPort}
            />               
            )}
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
            <Button title="Login" onPress={handleLogin} />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        paddingHorizontal: 16,
        backgroundColor: 'purple',
    },
    title: {
        fontSize: 24,
        marginBottom: 24,
        textAlign: 'center',
        fontWeight: 'bold',
        color: 'white',
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

export default LoginScreen;
