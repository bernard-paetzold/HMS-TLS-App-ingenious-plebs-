import React, { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { SafeAreaView, View, Text, StyleSheet, ActivityIndicator, Image, Button, Alert, TextInput } from 'react-native';
import { get_assignment, Assignment, submit_video, Submission, get_video, update_video } from '../api';
import { format } from 'date-fns';
import * as ImagePicker from 'expo-image-picker';
//import { Video } from 'react-native-compressor';

export default function AssignmentDetail() {
    const [assignment, setAssignment] = useState<Assignment | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();
    const [userId, setUserId] = useState<string | null>(null);
    const [video, setVideo] = useState<ImagePicker.ImagePickerAsset | null>(null);
    const [submissionMessage, setSubmissionMessage] = useState<string>('No submission yet');
    const [comment, setComment] = useState<string>('')
    
    useEffect(() => {
        const fetchAssignment = async () => {
            setLoading(true);
            try {
                const response = await get_assignment();
                console.log("API Response (get_assignment):", response.assignment); 
                
                if (response && response.assignment) {
                    setAssignment(response.assignment as Assignment); 
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

        const fetchUserId = async () => {
            const userId = await AsyncStorage.getItem('userId');
            setUserId(userId);
        }

        fetchAssignment();
        fetchUserId();
    }, []); 

    useEffect(() => {
        const fetchUserSubmissions = async () => {
            if (userId && assignment) {
                try {
                    const response = await get_video();
                    console.log("API Response:", response); 
    
                    if (response.success && Array.isArray(response.video)) {
                        const assignmentSubmission = response.video.find(
                            (submission) => submission.assignment === assignment.id
                        );
                        setSubmissionMessage(assignmentSubmission ? assignmentSubmission.file : 'No submission yet');
                        AsyncStorage.setItem('submission_pk', assignmentSubmission.id);
                    } else {
                        setSubmissionMessage('No submissions found.');
                        AsyncStorage.setItem('submission_pk', 'null');
                    }
                } catch (error) {
                    if (!assignment || !userId) {
                        console.log("No submissions expected yet.");
                        AsyncStorage.setItem('submission_pk', 'null');
                    } else {
                        console.log("No submission present", error);
                        setSubmissionMessage('No submission found');
                        AsyncStorage.setItem('submission_pk', 'null');
                    }
                }
            }
        };
    
        fetchUserSubmissions();
      }, [userId, assignment]);

      

    const pickVideo = async () => {
        const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (permission.granted === false) {
            Alert.alert('Permission to access camera roll is required!');
            return;
        }
        
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Videos,
        });

        if(!result.canceled && result.assets && result.assets.length > 0) {
            const selectedVideo = result.assets[0];
            // const compressedVideo = await Video.compress(
            //     selectedVideo.uri,
            //     {},
            //     (progress) => {
            //       console.log('Compression Progress: ', progress);
            //     }
            //   );
            // if (compressedVideo) {
            //     AsyncStorage.setItem('compressVid_uri', compressedVideo);
            // } else {
            //     AsyncStorage.setItem('compressVid_uri', ''); 
            // }
    
            setVideo(selectedVideo);
        }
    };

    const handleSubmit = async() => {
        if(!video) {
            Alert.alert("Please select a video");
            return
        }
        try {
            setLoading(true);
            const log = async(response: any) => {
                if (response && response.success) {
                    console.log("Submission successful")
                } else {
                    Alert.alert('Error', video.uri || 'Video submission failed');
                }
            }
            const videoFile = await AsyncStorage.getItem('compressVid_uri');
            const subId = await AsyncStorage.getItem('submission_pk').toString();
            if(video) {
                if(subId == 'null'){
                    const response = await submit_video(video.uri, comment);
                    log(response);
                    Alert.alert('Success', video.uri || 'Video successfully uploaded');
                } else {
                    const response = await update_video(video.uri, comment);
                    log(response);
                    Alert.alert('Success', video.uri || 'Submission successfully updated');
                }
            } else {
                Alert.alert('No compressed video found');
                console.error('No compressed video found');
            }
            

        }
        catch (error) {
            let errorMessage = 'Something went wrong.';
            if (error instanceof Error) {
                errorMessage = error.message; 
            }
            Alert.alert('Error', errorMessage || 'Something went wrong.')
            console.error("Error", errorMessage)
        } finally {
            setLoading(false);
            if (userId && assignment) {
                try {
                    const response = await get_video();
                    console.log("API Response:", response); 
    
                    if (response.success && Array.isArray(response.video)) {
                        const assignmentSubmission = response.video.find(
                            (submission) => submission.assignment === assignment.id
                        );
                        setSubmissionMessage(assignmentSubmission ? assignmentSubmission.file : 'No submission yet');
                        AsyncStorage.setItem('submission_pk', assignmentSubmission.id);
                    } else {
                        setSubmissionMessage('No submissions found.');
                        AsyncStorage.setItem('submission_pk', 'null');
                    }
                } catch (error) {
                    if (!assignment || !userId) {
                        console.log("No submissions expected yet.");
                        AsyncStorage.setItem('submission_pk', 'null');
                    } else {
                        console.log("No submission present", error);
                        setSubmissionMessage('No submission found');
                        AsyncStorage.setItem('submission_pk', 'null');
                    }
                }
            
        };
        }
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#0000ff" />
                <Text>Loading...</Text>
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

    if (!assignment) {
        return (
            <View style={styles.container}>
                <Text style={styles.emptyText}>No assignments found.</Text>
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <Text style={styles.title}>Title: {assignment.name}</Text>
            <Text style={styles.description}> Due: {format(new Date(assignment.due_date), 'MMMM dd, yyyy HH:mm')}</Text>
            <Text style={styles.description}> Created by: {assignment.lecturer}</Text>
            <Text style={styles.description}> Created at: {format(new Date(assignment.created_at), 'MMMM dd, yyyy HH:mm')}</Text>
            <Text style={styles.description}> Total marks: {assignment.marks}</Text>
            <Text style={styles.info}> Additional Info: {assignment.assignment_info}</Text>

            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <Text>{submissionMessage}</Text>
                <Button title="Pick a Video" onPress={pickVideo} />
                {video && <Text>Selected video: {video.uri.split('/').pop()}</Text>}
                {loading ? (
                    <ActivityIndicator size="large" color="#0000ff" />
                ) : (
                    <Button title="Submit Video" onPress={handleSubmit} />
                )}
            </View>

            <TextInput
                style={styles.comment}
                placeholder="Enter your comment"
                value={comment}
                onChangeText={setComment}  
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f0f0f5',
        padding: 10,
    },
    title: {
        fontSize: 24,
        marginBottom: 6,
        marginTop: 10,
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
        fontSize: 20,
    },
    errorText: {
        color: 'red',
        textAlign: 'center',
        fontSize: 18,
    },
    emptyText: {
        color: 'black',
        textAlign: 'center',
        fontSize: 18,
    },
    info: {
        color: 'black',
        textAlign: 'left',
        fontSize: 14,
        marginTop: 10
    },
    preview: {
        width: 200,
        height: 200,
        marginTop: 10,
    },
    videoPickerContainer: {
        marginTop: 20,
        alignItems: 'center', 
    },
    comment: {
        height: 40,
        borderColor: 'gray',
        borderWidth: 1,
        // marginBottom: 10,
        // paddingHorizontal: 10,
        fontSize: 16,
    },
});