import React, { useState, useRef } from 'react';
import { Button, StyleSheet, Text, TouchableOpacity, View, Alert } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useNavigation } from '@react-navigation/native';

interface VideoType {
    uri: string;
}

export default function CameraScreen() {
  const [facing, setFacing] = useState('back');
  const [isRecording, setIsRecording] = useState(false);
  const [permission, requestPermission] = useCameraPermissions();
  const navigation = useNavigation();
  const cameraRef = useRef<CameraView>(null);

  if (!permission) {
    return <View />;
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={{ textAlign: 'center' }}>We need your permission to show the camera</Text>
        <Button onPress={requestPermission} title="Grant Permission" />
      </View>
    );
  }

  function toggleCameraFacing() {
    setFacing(current => (current === 'back' ? 'front' : 'back'));
  }

  const startRecording = async () => {
    console.log("1",cameraRef)

    
    if (cameraRef) {
      console.log("2",cameraRef.current)

      setIsRecording(true);
      try {
        const video = await cameraRef.current?.recordAsync();
        console.log("Recording stopped, URI:", video);
        setIsRecording(false);
        //handleVideoRecorded(video?.uri); 
      } catch (error) {
        console.error("Recording failed:1", error);
        setIsRecording(false);
      }
    }
  };

  const stopRecording = async () => {
    console.log("3",cameraRef)

    if (cameraRef) {
      console.log("4")

      await cameraRef.current?.stopRecording();
      setIsRecording(false);

    }
  };

  const handleVideoRecorded = (uri : string) => {
    console.log(uri);
    Alert.alert(
      'Preview Video',
      'Do you want to preview the video?',
      [
        { text: 'Cancel', style: 'cancel' },
      ],
      { cancelable: false }
    );
  };

  return (
    <View style={styles.container}>
      <CameraView mode="video" style={styles.camera} ref={cameraRef} >
        <View style={styles.buttonContainer}>
          {isRecording ? (
            <TouchableOpacity style={styles.button} onPress={stopRecording}>
              <Text style={styles.text}>Stop Recording</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.button} onPress={startRecording}>
              <Text style={styles.text}>Start Recording</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity style={styles.button} onPress={toggleCameraFacing}>
            <Text style={styles.text}>Flip Camera</Text>
          </TouchableOpacity>
        </View>
      </CameraView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  camera: {
    width: '100%',
    height: '100%',
  },
  buttonContainer: {
    backgroundColor: 'transparent',
    position: 'absolute',
    bottom: 50,
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  button: {
    backgroundColor: 'white',
    padding: 10,
    borderRadius: 5,
  },
  text: {
    color: 'black',
  },
});