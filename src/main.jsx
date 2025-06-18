import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { StrictMode } from 'react';
import './index.css';
import AudioRecorder from 'audio-recorder-polyfill';

if (typeof window.MediaRecorder === 'undefined') {
  window.MediaRecorder = AudioRecorder;
}


ReactDOM.createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
