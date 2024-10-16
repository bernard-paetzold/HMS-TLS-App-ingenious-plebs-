import React, { useRef, useState } from 'react';


const VideoRecorder: React.FC = () => {
    const [recording, setRecording] = useState(false);
    const [videoURL, setVideoURL] = useState('');
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const streamRef = useRef<MediaStream | null>(null); 

    const startPreview = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    facingMode: 'user',
                    width: { ideal: 1920 }, 
                    height: { ideal: 1080 }, 
                },
                audio: false,
            });
            videoRef.current!.srcObject = stream;
            streamRef.current = stream; 
        } catch (error) {
            console.error('Error accessing webcam: ', error);
        }
    };

    const startRecording = () => {
        const mediaRecorder = new MediaRecorder(streamRef.current!);
        mediaRecorderRef.current = mediaRecorder;

        mediaRecorder.ondataavailable = (event) => {
            const url = URL.createObjectURL(event.data);
            setVideoURL(url);
        };

        mediaRecorder.start();
        setRecording(true);
    };

    const stopRecording = () => {
        mediaRecorderRef.current?.stop();
        setRecording(false);
        
        if (streamRef.current) {
            streamRef.current.getTracks().forEach((track) => {
                track.stop(); 
            });
        }
    };

    const downloadVideo = () => {
        const link = document.createElement('a');
        link.href = videoURL;
        link.download = 'recorded-video.mp4'; 
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link); 
    };

    const resetRecorder = () => {
        setVideoURL(''); 
        startPreview(); 
    };

    React.useEffect(() => {
        startPreview(); 
    }, []);

    return (
        <div>
            <video
                ref={videoRef}
                autoPlay
                playsInline
                style={{
                    width: '100vw', 
                    height: '100vh', 
                    objectFit: 'cover', 
                    border: 'none',
                }}
            />
            <div style={{ position: 'absolute', top: '20px', left: '20px', zIndex: 10 }}>
                {!recording ? (
                    <button onClick={startRecording} style={{ padding: '10px 20px', fontSize: '16px' }}>
                        Start Recording
                    </button>
                ) : (
                    <button onClick={stopRecording} style={{ padding: '10px 20px', fontSize: '16px' }}>
                        Stop Recording
                    </button>
                )}
            </div>
            {videoURL && (
                <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center', zIndex: 10 }}>
                    <h2>Recorded Video</h2>
                    <video width="100%" controls src={videoURL} style={{ maxHeight: '80vh' }} />
                    <div>
                        <button onClick={downloadVideo} style={{ padding: '10px 20px', fontSize: '16px', margin: '10px' }}>
                            Download Video
                        </button>
                        <button onClick={resetRecorder} style={{ padding: '10px 20px', fontSize: '16px', margin: '10px' }}>
                            Re-Record Video
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default VideoRecorder;
