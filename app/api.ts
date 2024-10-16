import AsyncStorage from '@react-native-async-storage/async-storage';
import { TurboModuleRegistry } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import axios from 'axios';
import * as FileSystem from 'expo-file-system';

let API_URL = "";
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
    if (ip != ""){
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
      const response = await fetch(`${API_URL}/users/like/${username}`, {
        method: 'GET',
        headers: {
          'Authorization': `Token ${data.token}`,
        },});
      const responseData = await response.json();
      if (Array.isArray(responseData) && responseData.length > 0) {
        const userId = responseData[0].id;
        await AsyncStorage.setItem('userId', userId.toString());
      } else {
        console.error('Error: userId is undefined in the response', responseData);
      }
      await AsyncStorage.setItem('token', data.token);
      await AsyncStorage.setItem('username', username);
      
      console.log({ success: true, token: data[0]});
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

export const get_user = async (): Promise <{ success: boolean; user: User | null}> => {
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

export const list_assignments= async (): Promise<{ success: boolean; assignment: Assignment | null}> => {
  const token = await AsyncStorage.getItem('token');

  if (token) {
    try {
      const response = await fetch(`${API_URL}/assignment/list_allowed_student`, {
        method: 'GET',
        headers: {
          'Authorization': `Token ${token}`,
        },
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Something went wrong');
      }
  
      const data = await response.json();
      if(data.length != 0) {
        console.log({ success: true, assignment: data[0]});
        return { success: true, assignment: data[0]};
      } else {
        throw new Error('No assignments found');
      }
    } catch (error) {
      console.error('No assignments found', error);
      throw error;
    }
  }
  return { success: false, assignment: null };
}


export const get_assignment = async (): Promise<{ success: boolean; assignment: Assignment | null}> => {
  const token = await AsyncStorage.getItem('token');
  var assignment_pk = await AsyncStorage.getItem('assignment_pk');
  console.log('Fetching assignment from URL:', `${API_URL}/assignment/${assignment_pk}`);

  if (token) {
    try {
      const response = await fetch(`${API_URL}/assignment/${assignment_pk}`, {
        method: 'GET',
        headers: {
          'Authorization': `Token ${token}`,
        },
        
      });
      if (!response.ok) {
        const errorData = await response.json();
        console.error('API error data:', errorData);
        throw new Error(errorData.message || 'Assignment not found');
      }
  
      const data = await response.json();
      if(data.length != 0) {
        console.log({ success: true, assignment: data});
        return { success: true, assignment: data};
      } else {
        throw new Error('Assignment not found');
      }
    } catch (error) {
      console.error('Assignment not found', error);
      throw error;
    }
  }
  return { success: false, assignment: null };
}

export const get_feedback = async (): Promise<{ success: boolean; feedback: Feedback | null}> => {
  const token = await AsyncStorage.getItem('token');
  var submission_pk = await AsyncStorage.getItem('submission_pk')

  if (token) {
    try {
      const response = await fetch(`${API_URL}/feedback/submission_feedback/${submission_pk}`, {
        method: 'GET',
        headers: {
          'Authorization': `Token ${token}`,
        },
        
      });

      const data = await response.json();

      if (!response.ok) {
        console.log('No feedback found:', data);
        return { success: false, feedback: null };
      }
  
      if(data.length != 0) {
        console.log({ success: true, feedback: data});
        const feedback: Feedback = {
          submission: data.submission,
          id: data.id,
          created_at: data.created_at,
          lecturer: data.lecturer,
          mark: data.mark,
          comment: data.comment
          };
        return { success: true, feedback: feedback};
      } else {
        console.log('Feedback not found', data);
      }
    } catch (error) {
      console.log('Feedback not found', error);
    }
  }
  return { success: false, feedback: null };
}

export const list_user_submissions = async (userId: string): Promise<{ success: boolean; submissions: Submission[] | null }> => {
  const token = await AsyncStorage.getItem('token');

  if (token) {
    try {
      const response = await fetch(`${API_URL}/submission/list_user_submissions/${userId}/`, {
        method: 'GET',
        headers: {
          'Authorization': `Token ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch submissions');
      }

      const data = await response.json();
      return { success: true, submissions: data };
    } catch (error) {
      console.error('Error fetching user submissions', error);
      return { success: false, submissions: null };
    }
  }
  return { success: false, submissions: null };
};

export const get_video = async (): Promise<{ success: boolean; video: Submission | null}> => {
  const token = await AsyncStorage.getItem('token');
  var user_pk = await AsyncStorage.getItem('userId');
  var assignment_pk = await AsyncStorage.getItem('assignment_pk')
  console.log('Fetching video from URL:', `${API_URL}/submission/${user_pk}/${assignment_pk}`);

  if (token) {
    try {
      const response = await fetch(`${API_URL}/submission/submission/${user_pk}/${assignment_pk}`, {
        method: 'GET',
        headers: {
          'Authorization': `Token ${token}`,
        },
        
      });

      const data = await response.json();

      if (!response.ok) {
        console.log('No submission found:', data);
        return { success: false, video: null };
      }
  
      if(data.length != 0) {
        console.log({ success: true, video: data});
        const submission: Submission = {
          id: data.id,
          datetime: data.datetime,
          file: data.file,
          comment: data.comment,
          user: data.user,
          assignment: data.assignment,
          };
        return { success: true, video: submission};
      } else {
        console.log('Submission not found', data);
      }
    } catch (error) {
      console.log('Submission not found', error);
    }
  }
  return { success: false, video: null };
}

export const submit_video = async (videoFile: string, comment: string): Promise<{ success: boolean; video?: string; error?: string }> => {
  const token = await AsyncStorage.getItem('token');
  console.log('File received:', videoFile)
  if (!token) {
    return { success: false, error: 'User is not authenticated.' };
  }

  if (!videoFile) {
    return { success: false, error: 'No video file provided.' };
  }

  try {
    const assignment_fk = await AsyncStorage.getItem('assignment_pk');

    if (!assignment_fk) {
      throw new Error('Assignment ID is missing.');
    }
    
    console.log('Video:', videoFile);
    const response = await FileSystem.uploadAsync(`${API_URL}/submission/create/`, 
      videoFile, {
        fieldName: 'file',
        httpMethod: 'POST',
        uploadType: FileSystem.FileSystemUploadType.MULTIPART,
        headers: {
          'Authorization': `Token ${token}`,
        },
        parameters: {
          assignment: assignment_fk,
          comment: comment
        }
      }
    );
    console.log('Video:', videoFile);
    if (!response.status) {
      const errorText = await response.status;
      console.error('API Response Text:', errorText); 
      throw new Error('Failed to submit video.');
    }

    const data = await response.body;
    
    if (data) {
        return { success: true, video: videoFile };
    } else {
        throw new Error('Invalid response data.');
    }
  } catch (error: any) {
      console.error('Submit video error:', error.message);
      return { success: false, error: error.message };
  }
};

export const update_video = async (videoFile: string, comment: string): Promise<{ success: boolean; video?: string; error?: string }> => {
  const token = await AsyncStorage.getItem('token');
  console.log('File received:', videoFile)
  if (!token) {
    return { success: false, error: 'User is not authenticated.' };
  }

  if (!videoFile) {
    return { success: false, error: 'No video file provided.' };
  }

  try {
    const assignment_fk = await AsyncStorage.getItem('assignment_pk');
    const submission_pk = await AsyncStorage.getItem('submission_pk');

    if (!assignment_fk) {
      throw new Error('Assignment ID is missing.');
    }
    
    console.log('Video:', videoFile);
    const response = await FileSystem.uploadAsync(`${API_URL}/submission/edit/${submission_pk}`, 
      videoFile, {
        fieldName: 'file',
        httpMethod: 'PATCH',
        uploadType: FileSystem.FileSystemUploadType.MULTIPART,
        headers: {
          'Authorization': `Token ${token}`,
        },
        parameters: {
          assignment: assignment_fk,
          comment: comment
        }
      }
    );
    console.log('Video:', videoFile);
    if (!response.status) {
      const errorText = await response.status;
      console.error('API Response Text:', errorText); 
      throw new Error('Failed to submit video.');
    }

    const data = await response.body;
    
    if (data) {
        return { success: true, video: videoFile };
    } else {
        throw new Error('Invalid response data.');
    }
  } catch (error: any) {
      console.error('Submit video error:', error.message);
      return { success: false, error: error.message };
  }
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

export type Assignment = {
  id: number;
  created_at: string;
  lecturer: string;
  subject: string;
  name: string;
  due_date: string;
  marks: number;
  assignment_info: string
}

export type Submission = {
  id: number;
  datetime: string;
  file: string;
  comment: string;
  user: string;
  assignment: number;
}

export type Feedback = {
  submission: number
  id:number
  created_at: string
  lecturer: number
  mark: number
  comment: string
}