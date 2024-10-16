import React, { useEffect, useState, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { SafeAreaView, ScrollView, View, Text, StyleSheet, ActivityIndicator, Image, Button, Alert, TextInput, RefreshControl } from 'react-native';
import { get_assignment, Assignment, submit_video, Submission, get_video, update_video, Feedback, get_feedback } from '../api';
import { format, isAfter } from 'date-fns';
import * as ImagePicker from 'expo-image-picker';
//import { Video } from 'react-native-compressor';

export default function AssignmentDetail() {
    const [assignment, setAssignment] = useState<Assignment | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [userId, setUserId] = useState<string | null>(null);
    const [video, setVideo] = useState<ImagePicker.ImagePickerAsset | null>(null);
    const [submissionMessage, setSubmissionMessage] = useState<string>('No submission yet');
    const [comment, setComment] = useState<string>('');
    const [feedback, setFeedback] = useState<Feedback | null>(null);
    const [feedbackLoading, setFeedbackLoading] = useState<boolean>(false);
    const [feedbackError, setFeedbackError] = useState<string | null>(null);
    const [refreshing, setRefreshing] = useState(false); 

    const fetchAssignment = async () => {
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
        }
    };

    const fetchUserId = async () => {
        try {
            const storedUserId = await AsyncStorage.getItem('userId');
            setUserId(storedUserId);
        } catch (err) {
            console.error("Failed to fetch user ID:", err);
        }
    };

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
                    await AsyncStorage.setItem('submission_pk', assignmentSubmission ? assignmentSubmission.id : 'null');
                } else {
                    setSubmissionMessage('No submissions found.');
                    await AsyncStorage.setItem('submission_pk', 'null');
                }
                await fetchFeedback();
            } catch (error) {
                if (!assignment || !userId) {
                    console.log("No submissions expected yet.");
                    await AsyncStorage.setItem('submission_pk', 'null');
                } else {
                    console.log("No submission present", error);
                    setSubmissionMessage('No submission found');
                    await AsyncStorage.setItem('submission_pk', 'null');
                }
            }
        }
    };

    const fetchFeedback = async () => {
        setFeedbackLoading(true);
        setFeedbackError(null);
        try {
            const response = await get_feedback();
            if (response.success && response.feedback) {
                setFeedback(response.feedback);
            } else {
                setFeedback(null); // No feedback available
            }
        } catch (error) {
            console.error("Failed to fetch feedback:", error);
            setFeedbackError("Failed to fetch feedback.");
            setFeedback(null);
        } finally {
            setFeedbackLoading(false);
        }
    };

    const loadData = async () => {
        setLoading(true);
        await fetchAssignment();
        await fetchUserId();
        setLoading(false);
    };

    useEffect(() => {
        loadData();
    }, []);

    useEffect(() => {
        fetchUserSubmissions();
    }, [userId, assignment]);

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await loadData();
        await fetchUserSubmissions();
        setRefreshing(false);
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
            const subId = await AsyncStorage.getItem('submission_pk')?.toString() || 'null';
            if(video) {
                if(subId === 'null'){
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
                        await AsyncStorage.setItem('submission_pk', assignmentSubmission ? assignmentSubmission.id : 'null');
                    } else {
                        setSubmissionMessage('No submissions found.');
                        await AsyncStorage.setItem('submission_pk', 'null');
                    }
                } catch (error) {
                    if (!assignment || !userId) {
                        console.log("No submissions expected yet.");
                        await AsyncStorage.setItem('submission_pk', 'null');
                    } else {
                        console.log("No submission present", error);
                        setSubmissionMessage('No submission found');
                        await AsyncStorage.setItem('submission_pk', 'null');
                    }
                }
            
        };
        }
    };

    if (loading && !refreshing) { 
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
                <Button title="Retry" onPress={onRefresh} />
            </View>
        );
    }

    if (!assignment) {
        return (
            <View style={styles.container}>
                <Text style={styles.emptyText}>No assignments found.</Text>
                <Button title="Retry" onPress={onRefresh} />
            </View>
        );
    }

    const isDue = isAfter(new Date(), new Date(assignment.due_date));

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView
                contentContainerStyle={{ flexGrow: 1 }}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
            >
                <Text style={styles.title}>Title: {assignment.name}</Text>
                <Text style={styles.description}> Due: {format(new Date(assignment.due_date), 'MMMM dd, yyyy HH:mm')}</Text>
                <Text style={styles.description}> Subject: {assignment.subject}</Text>
                <Text style={styles.description}> Created at: {format(new Date(assignment.created_at), 'MMMM dd, yyyy HH:mm')}</Text>
                <Text style={styles.description}> Total marks: {assignment.marks}</Text>
                <Text style={styles.info}> Additional Info: {assignment.assignment_info}</Text>

                <View style={styles.contentContainer}>
                    <Text style={styles.submissionText}>{submissionMessage}</Text>
                    <Button title="Pick a Video" onPress={pickVideo} disabled={isDue}/>
                    {video && <Text style={styles.selectedVideo}>Selected video: {video.uri.split('/').pop()}</Text>}
                    <TextInput
                        style={styles.comment}
                        placeholder="Comment"
                        value={comment}
                        onChangeText={setComment}  
                        editable={isDue}
                    />
                    {loading ? (
                        <ActivityIndicator size="large" color="#0000ff" />
                    ) : (
                        <Button title="Submit Video" onPress={handleSubmit} disabled={isDue}/>
                    )}
                </View>
                <View style={styles.feedbackContainer}>
                    <Text style={styles.feedbackTitle}>Feedback</Text>
                    {feedbackLoading ? (
                        <ActivityIndicator size="small" color="#0000ff" />
                    ) : feedbackError ? (
                        <Text style={styles.errorText}>{feedbackError}</Text>
                    ) : feedback ? (
                        <View style={styles.feedbackContent}>
                            <Text style={styles.feedbackText}><Text style={styles.feedbackLabel}>Mark:</Text> {feedback.mark}</Text>
                            <Text style={styles.feedbackText}><Text style={styles.feedbackLabel}>Comment:</Text> {feedback.comment}</Text>
                            <Text style={styles.feedbackText}><Text style={styles.feedbackLabel}>Created At:</Text> {format(new Date(feedback.created_at), 'MMMM dd, yyyy HH:mm')}</Text>
                        </View>
                    ) : (
                        <Text style={styles.noFeedbackText}>No feedback available.</Text>
                    )}
                </View>
            </ScrollView>
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
        marginTop: 30,
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
        marginVertical: 2,
    },
    errorText: {
        color: 'red',
        textAlign: 'center',
        fontSize: 18,
        marginBottom: 10,
    },
    emptyText: {
        color: 'black',
        textAlign: 'center',
        fontSize: 18,
        marginBottom: 10,
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
        height: 80,
        width: '100%',
        borderColor: 'gray',
        borderWidth: 1,
        alignContent: 'center',
        marginBottom: 20,
        marginTop: 20,
        paddingHorizontal: 10,
        fontSize: 16,
        borderRadius: 5,
    },
    contentContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 20,
    },
    submissionText: {
        fontSize: 18,
        marginBottom: 10,
    },
    selectedVideo: {
        fontSize: 16,
        marginTop: 10,
        marginBottom: 10,
    },
    feedbackContainer: {
        marginTop: 30,
        padding: 15,
        backgroundColor: '#fff',
        borderRadius: 10,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 3,
    },
    feedbackTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 10,
        color: '#333',
    },
    feedbackContent: {
        marginTop: 10,
    },
    feedbackText: {
        fontSize: 16,
        marginBottom: 5,
        color: '#555',
    },
    feedbackLabel: {
        fontWeight: 'bold',
        color: '#333',
    },
    noFeedbackText: {
        fontSize: 16,
        color: '#555',
        textAlign: 'center',
        marginTop: 10,
    },
});
