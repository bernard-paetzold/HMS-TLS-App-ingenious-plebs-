import React, { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { SafeAreaView, View, Text, StyleSheet, ActivityIndicator, Image, Button, Alert } from 'react-native';
import { get_assignment, Assignment, submit_video, Submission, get_video, list_user_submissions } from '../api';
import { format } from 'date-fns';
import * as ImagePicker from 'expo-image-picker';

export default function AssignmentDetail() {
    const [assignment, setAssignment] = useState<Assignment | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();
    const [userId, setUserId] = useState<string | null>(null);
    const [video, setVideo] = useState<Submission | null>(null);
    const [submissionMessage, setSubmissionMessage] = useState<string>('No submission yet');
    
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
                    const response = await list_user_submissions(userId);
                    console.log("API Response:", response); 
    
                    if (response.success && Array.isArray(response.submissions)) {
                        const assignmentSubmission = response.submissions.find(
                            (submission) => submission.assignment === assignment.id
                        );
                        setSubmissionMessage(assignmentSubmission ? assignmentSubmission.file : 'No submission yet');
                    } else {
                        setSubmissionMessage('No submissions found.');
                    }
                } catch (error) {
                    if (!assignment || !userId) {
                        console.log("No submissions expected yet.");
                    } else {
                        console.error("Error fetching user submissions:", error);
                        setSubmissionMessage('Error fetching submissions.');
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
            const submission: Submission = {
                id: 0, 
                datetime: new Date().toISOString(), 
                file: selectedVideo.uri, 
                comment: '', 
                user: userId || '', 
                assignment: Number(assignment?.id), 
            };
    
            setVideo(submission);
        }
    };

    const handleSubmit = async() => {
        if(!video) {
            Alert.alert("Please select a video");
            return
        }
        try {
            setLoading(true);
            const response = await submit_video(video);
            if (response.success) {
                console.error("Submission successful")
            } else {
                Alert.alert('Error', 'Video submission failed');
            }

        }
        catch (error) {
            let errorMessage = 'Something went wrong.';
            if (error instanceof Error) {
                errorMessage = error.message; 
            }
            Alert.alert('Error', errorMessage || 'Something went wrong.')
        } finally {
            setLoading(false);
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
                {video && <Text>Selected video: {video.file.split('/').pop()}</Text>}
                {loading ? (
                    <ActivityIndicator size="large" color="#0000ff" />
                ) : (
                    <Button title="Submit Video" onPress={handleSubmit} />
                )}
            </View>
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
});