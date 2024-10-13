import AsyncStorage from '@react-native-async-storage/async-storage';
import { TurboModuleRegistry } from 'react-native';

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
      await AsyncStorage.setItem('username', username);
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
  var token = await AsyncStorage.getItem('token');

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

export const get_user = async (): Promise<{ success: boolean; user: User | null}> => {
  const token = await AsyncStorage.getItem('token');
  var username = await AsyncStorage.getItem('username');

  if (token) {
    try {
      const response = await fetch(`${API_URL}/users/like/${username}`, {
        method: 'GET',
        headers: {
          'Authorization': `Token ${token}`,
        },
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'No user found');
      }
  
      const data = await response.json();
      if(data.length != 0) {
        console.log({ success: true, user: data[0]});
        return { success: true, user: data[0]};
      } else {
        throw new Error('User not found');
      }
    } catch (error) {
      console.error('No user found error', error);
      throw error;
    }
  }
  return { success: false, user: null };
};

export const update_user = async (userData: {
    first_name: string;
    last_name: string;
    email: string;
    password: string;
  }): Promise<{ success: boolean}> => {
  const token = await AsyncStorage.getItem('token');
  var username = await AsyncStorage.getItem('username');

  if (token) {
    try {

      //const currentUserData = (await get_user()).user

      const updatingInfo = {
        "username": username,
        "first_name": userData.first_name,
        "last_name": userData.last_name,
        "email": userData.email,
        "password": userData.password,
        "is_active": true,
      }

      console.log(JSON.stringify(updatingInfo));

      const response = await fetch(`${API_URL}/users/edit/`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json', 
        },
        body: JSON.stringify(updatingInfo),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'No user found');
      }
  
      const data = await response.json();
      console.log(data);
      if(data.length != 0) {
        console.log({ success: true});
        return { success: true};
      } else {
        throw new Error('User not found');
      }
    } catch (error) {
      console.error('No user found error', error);
      throw error;
    }
  }
  return { success: false};
};

export type User = {
  username: string;
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  groups: Array<string>;
  is_active: boolean;
  role: string;
};