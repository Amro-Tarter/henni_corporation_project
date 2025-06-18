import { useState, useRef, useEffect } from 'react';

// Dynamically import polyfill for Safari
let MediaRecorderPolyfill;
if (typeof window !== 'undefined' && window.MediaRecorder === undefined) {
  import('audio-recorder-polyfill').then(module => {
    MediaRecorderPolyfill = module.default || module;
    // For iOS, we need to use MP4 format
    MediaRecorderPolyfill.mimeType = 'audio/mp4';
  });
}

export function useVoiceRecorder() {
  const [isRecording, setIsRecording] = useState(false);
  const [audioURL, setAudioURL] = useState(null);
  const [audioBlob, setAudioBlob] = useState(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const [isSupported, setIsSupported] = useState(true);
  const mediaRecorderRef = useRef(null);
  const streamRef = useRef(null);
  const timerRef = useRef(null);
  const chunksRef = useRef([]);

  // Check browser support
  useEffect(() => {
    const isMediaRecorderSupported = (
      typeof window !== 'undefined' && 
      (window.MediaRecorder || MediaRecorderPolyfill) &&
      navigator.mediaDevices?.getUserMedia
    );
    
    setIsSupported(!!isMediaRecorderSupported);
  }, []);

  const startRecording = async () => {
    if (!isSupported) {
      alert('דפדפן זה אינו תומך בהקלטת קול');
      return;
    }
    
    try {
      // iOS requires explicit user action - ensure this is called from a click handler
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true
        }
      });
      
      streamRef.current = stream;
      chunksRef.current = [];
      
      // Determine MediaRecorder implementation
      const MediaRecorder = window.MediaRecorder || MediaRecorderPolyfill;
      const options = { 
        mimeType: MediaRecorder === window.MediaRecorder ? 
          'audio/webm;codecs=opus' : 
          'audio/mp4'
      };
      
      const mediaRecorder = new MediaRecorder(stream, options);
      mediaRecorderRef.current = mediaRecorder;
      
      setAudioURL(null);
      setAudioBlob(null);
      setRecordingTime(0);
      setIsRecording(true);

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const mimeType = MediaRecorder === window.MediaRecorder ? 
          'audio/webm' : 
          'audio/mp4';
          
        const blob = new Blob(chunksRef.current, { type: mimeType });
        setAudioBlob(blob);
        setAudioURL(URL.createObjectURL(blob));
        setIsRecording(false);
        clearInterval(timerRef.current);
        
        // Stop all tracks in the stream
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
          streamRef.current = null;
        }
      };

      mediaRecorder.start();
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } catch (err) {
      console.error('Recording error:', err);
      alert('לא ניתן להפעיל מיקרופון: ' + err.message);
    }
  };

  const stopRecording = () => {
    const mediaRecorder = mediaRecorderRef.current;
    if (mediaRecorder && isRecording) {
      mediaRecorder.stop();
      clearInterval(timerRef.current);
    }
  };

  const resetRecording = () => {
    stopRecording();
    setAudioURL(null);
    setAudioBlob(null);
    setRecordingTime(0);
    chunksRef.current = [];
  };

  return {
    isRecording,
    audioURL,
    audioBlob,
    recordingTime,
    isSupported,
    startRecording,
    stopRecording,
    resetRecording,
  };
}