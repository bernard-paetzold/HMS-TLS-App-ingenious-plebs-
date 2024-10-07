import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage'; 

export default function LoginScreen() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    checkToken();
  }, []);

  const API_URL = 'http://10.0.0.100:8000'; // Replace with your computer's ipv4 address

  const checkToken = async () => {
    const token = await AsyncStorage.getItem('token');
    if (token) {
      try {
        const response = await fetch(`${API_URL}/auth/check-token/`, {
          method: 'GET',
          headers: {
            'Authorization': `Token ${token}`,
          },
        });
        if (response.status === 200) {
          setIsLoggedIn(true);
        } else {
          await AsyncStorage.removeItem('token');
        }
      } catch (error) {
        console.error('Token validation error', error);
      }
    }
  };

  const handleLogin = async () => {
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/auth/login/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username,
          password,
        }),
      });

      const data = await response.json();

      if (response.status === 200) {
        await AsyncStorage.setItem('token', data.token);
        setIsLoggedIn(true);
        Alert.alert('Login Successful', 'Welcome!');
      } else {
        Alert.alert('Login Failed', data.detail || 'Invalid credentials');
      }
    } catch (error) {
      Alert.alert('Login Failed', 'An error occurred, please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    const token = await AsyncStorage.getItem('token');
    if (token) {
      try {
        const response = await fetch(`${API_URL}/auth/logout/`, {
          method: 'POST',
          headers: {
            'Authorization': `Token ${token}`,
          },
        });

        if (response.status === 200) {
          await AsyncStorage.removeItem('token');
          setIsLoggedIn(false);
          Alert.alert('Logout Successful', 'You have been logged out.');
        } else {
          Alert.alert('Logout Failed', 'An error occurred during logout.');
        }
      } catch (error) {
        console.error('Logout error', error);
        Alert.alert('Logout Failed', 'An error occurred, please try again.');
      }
    }
  };

  if (isLoggedIn) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Welcome, you are logged in!</Text>
        <Button title="Logout" onPress={handleLogout} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login</Text>
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
      <Button title={loading ? 'Logging in...' : 'Login'} onPress={handleLogin} disabled={loading} />
    </View>
  );
}

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
    color: 'white'
  },
  input: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    marginBottom: 16,
    paddingHorizontal: 8,
    borderRadius: 4,
    color: 'white'
  },
});
