import AsyncStorage from '@react-native-async-storage/async-storage';

let API_URL = ""; // Replace with your computer's ipv4 address
export const setAPIUrl = (ip: string, port: string) => {
  API_URL = `http://${ip}:${port}`
}

export const checkToken = async () => {
  const token = await AsyncStorage.getItem('token');
  if (token) {
    try {
      const response = await fetch(`${API_URL}/auth/check-token/`, {
        method: 'GET',
        headers: {
          'Authorization': `Token ${token}`,
        },
      });
      return response.status === 200;
    } catch (error) {
      console.error('Token validation error', error);
      return false;
    }
  }
  return false;
};

export const login = async (username: string, password: string, ip: string = "", port: string) => {
  try {
    if (API_URL == "" && ip != ""){
      setAPIUrl(ip, port);
    }
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

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Login failed');
    }

    const data = await response.json();

    if(data.token) {
      await AsyncStorage.setItem('token', data.token);
      return { success: true, token: data.token,  };
    } else {
      throw new Error('Token not found');
    }
  } catch (error) {
    console.error('Login error', error);
    throw error;
  }
};

export const logout = async () => {
  const token = await AsyncStorage.getItem('token');
  if (token) {
    try {
      const response = await fetch(`${API_URL}/auth/logout/`, {
        method: 'POST',
        headers: {
          'Authorization': `Token ${token}`,
        },
      });
      return response.status === 200;
    } catch (error) {
      console.error('Logout error', error);
      throw error;
    }
  }
};
