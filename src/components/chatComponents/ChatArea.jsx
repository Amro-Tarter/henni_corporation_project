// Process all messages to get audio durations
import { useRef, useEffect, useState } from "react";

export default function ChatArea({
selectedConversation,
currentUser,
messages,
newMessage,
setNewMessage,
sendMessage,
isSending,
isLoadingMessages,
setShowNewChatDialog,
getChatPartner,
file,
preview,
isUploading,
uploadProgress,
handleFileChange,
removeFile,
isRecording,
startRecording,
stopRecording,
audioURL,
removeAudio,
elementColors
}) {
const messagesEndRef = useRef(null);
const messagesContainerRef = useRef(null);
const resizeObserverRef = useRef(null);
const [recordingTime, setRecordingTime] = useState(0);
const recordingIntervalRef = useRef(null);
const [soundLevels, setSoundLevels] = useState([]);
const analyserRef = useRef(null);
const mediaStreamRef = useRef(null);
const animationFrameRef = useRef(null);
const [audioDuration, setAudioDuration] = useState(null);
const [isAudioPlaying, setIsAudioPlaying] = useState({});

useEffect(() => {
  // Skip if no messages or still loading
  if (isLoadingMessages || messages.length === 0) return;
  
  // Find all messages with audio
  const audioMessages = messages.filter(msg => msg.audioURL);
  
  // Process each audio message to get duration
  audioMessages.forEach(msg => {
    // Skip if already processed
    const existingDurationEl = document.querySelector(`#audio-${msg.id}`);
    if (existingDurationEl && existingDurationEl.getAttribute('data-duration')) return;
    
    // Create temporary audio element to get duration
    const tempAudio = new Audio(msg.audioURL);
    tempAudio.preload = 'metadata';
    
    const getDuration = () => {
      if (!isFinite(tempAudio.duration)) return;
      
      // If audio element exists in DOM, update it
      const audioEl = document.getElementById(`audio-${msg.id}`);
      if (audioEl) {
        audioEl.setAttribute('data-duration', tempAudio.duration);
        const totalTimeDisplay = audioEl.parentElement.querySelector('.audio-total-time');
        if (totalTimeDisplay) {
          totalTimeDisplay.textContent = formatTime(tempAudio.duration);
        }
      }
      
      // Clean up listeners
      tempAudio.removeEventListener('loadedmetadata', getDuration);
      tempAudio.removeEventListener('durationchange', getDuration);
    };
    
    tempAudio.addEventListener('loadedmetadata', getDuration);
    tempAudio.addEventListener('durationchange', getDuration);
    
    // Force load
    tempAudio.load();
  });
}, [messages, isLoadingMessages]);

// Scroll logic
const scrollToBottom = (behavior = "auto") => {
  messagesEndRef.current?.scrollIntoView({ behavior });
};

const scrollToLatestMessages = () => {
  if (messagesContainerRef.current) {
    const container = messagesContainerRef.current;
    container.scrollTop = container.scrollHeight - container.clientHeight - 20;
  }
};

useEffect(() => {
  if (!messagesContainerRef.current) return;

  if (messages.length > 0) {
    setTimeout(() => {
      scrollToLatestMessages();
    }, 50);
  }

  const container = messagesContainerRef.current;
  resizeObserverRef.current = new ResizeObserver(() => {
    const isNearBottom = container.scrollHeight - container.scrollTop <= container.clientHeight + 50;
    if (isNearBottom) {
      scrollToBottom("auto");
    }
  });

  resizeObserverRef.current.observe(container);

  return () => {
    resizeObserverRef.current?.disconnect();
  };
}, [messages, selectedConversation?.id]);

const handleMediaLoad = () => {
  const container = messagesContainerRef.current;
  if (container) {
    const isNearBottom = container.scrollHeight - container.scrollTop <= container.clientHeight + 50;
    if (isNearBottom) scrollToBottom("smooth");
  }
};

const handleSendMessage = () => {
  sendMessage();
  setTimeout(() => scrollToBottom("smooth"), 100);
};

// Audio visualization during recording
useEffect(() => {
  if (isRecording) {
    // Set up audio analyzer for visualizing recording
    const setupAudioAnalyzer = async () => {
      try {
        if (!mediaStreamRef.current) {
          mediaStreamRef.current = await navigator.mediaDevices.getUserMedia({ audio: true });
        }
        
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const analyser = audioContext.createAnalyser();
        const microphone = audioContext.createMediaStreamSource(mediaStreamRef.current);
        
        microphone.connect(analyser);
        analyser.fftSize = 256;
        
        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        
        analyserRef.current = { analyser, dataArray, bufferLength };
        
        const updateWaveform = () => {
          if (!analyserRef.current || !isRecording) return;
          
          analyserRef.current.analyser.getByteFrequencyData(analyserRef.current.dataArray);
          
          // Calculate average volume level (simplified)
          let sum = 0;
          for (let i = 0; i < analyserRef.current.bufferLength; i++) {
            sum += analyserRef.current.dataArray[i];
          }
          const average = sum / analyserRef.current.bufferLength;
          
          // Keep only the most recent levels for visualization
          setSoundLevels(prev => {
            const newLevels = [...prev, average / 255];
            if (newLevels.length > 30) {
              return newLevels.slice(newLevels.length - 30);
            }
            return newLevels;
          });
          
          animationFrameRef.current = requestAnimationFrame(updateWaveform);
        };
        
        updateWaveform();
      } catch (err) {
        console.error("Error accessing microphone:", err);
      }
    };
    
    setupAudioAnalyzer();
  } else {
    // Clean up audio analyzer
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    
    setSoundLevels([]);
    
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
      mediaStreamRef.current = null;
    }
  }
  
  return () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    
    if (mediaStreamRef.current && !isRecording) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
      mediaStreamRef.current = null;
    }
  };
}, [isRecording]);

// Timer for recording
useEffect(() => {
  if (isRecording) {
    setRecordingTime(0);
    recordingIntervalRef.current = setInterval(() => {
      setRecordingTime(prev => prev + 1);
    }, 1000);
  } else {
    clearInterval(recordingIntervalRef.current);
  }

  return () => clearInterval(recordingIntervalRef.current);
}, [isRecording]);

// Calculate audio duration when audio URL changes
useEffect(() => {
  if (audioURL) {
    const audio = new Audio(audioURL);
    
    const handleDurationChange = () => {
      if (isFinite(audio.duration)) {
        setAudioDuration(Math.ceil(audio.duration));
      }
    };
    
    // Multiple event listeners to catch duration whenever it becomes available
    audio.addEventListener('loadedmetadata', handleDurationChange);
    audio.addEventListener('durationchange', handleDurationChange);
    audio.addEventListener('canplay', handleDurationChange);
    
    // Force load metadata
    audio.preload = 'metadata';
    
    // Fallback for when events don't fire properly
    setTimeout(() => {
      if (isFinite(audio.duration)) {
        setAudioDuration(Math.ceil(audio.duration));
      } else {
        // Last resort - try to briefly play to get duration
        const originalVolume = audio.volume;
        audio.volume = 0; // Mute it
        audio.play().then(() => {
          audio.pause();
          audio.currentTime = 0;
          audio.volume = originalVolume;
          if (isFinite(audio.duration)) {
            setAudioDuration(Math.ceil(audio.duration));
          }
        }).catch(() => {
          // If play fails (e.g., user hasn't interacted with page)
          console.log("Couldn't determine audio duration");
        });
      }
    }, 500);
    
    return () => {
      audio.removeEventListener('loadedmetadata', handleDurationChange);
      audio.removeEventListener('durationchange', handleDurationChange);
      audio.removeEventListener('canplay', handleDurationChange);
    };
  } else {
    setAudioDuration(null);
  }
}, [audioURL]);

// Track which audio messages are playing
const handleAudioPlayStateChange = (messageId, isPlaying) => {
  setIsAudioPlaying(prev => ({
    ...prev,
    [messageId]: isPlaying
  }));
};

const formatTime = (seconds) => {
  if (!seconds || !isFinite(seconds)) return "00:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

return (
  <div className="flex-1 flex flex-col" dir="rtl">
    {selectedConversation ? (
      <>
        {/* Chat Header */}
        <div className="p-4 border-b mt-16 border-gray-200 text-right">
          <h3 className="font-bold text-lg text-gray-900">
            {getChatPartner(selectedConversation.participants, selectedConversation.type, selectedConversation.element)}
          </h3>
        </div>

        {/* Message List */}
        <div className="flex-1 overflow-y-auto p-4 bg-white" ref={messagesContainerRef}>
          {isLoadingMessages ? (
            <div className="text-center text-gray-500 py-8">טוען הודעות...</div>
          ) : messages.length === 0 ? (
            <div className="text-center text-gray-500 py-8">אין הודעות עדיין. התחל את השיחה!</div>
          ) : (
            messages.map((msg) => (
              <div key={msg.id} className={`mb-4 ${msg.sender === currentUser.uid ? "text-right" : "text-left"}`}>
                {msg.type === 'system' ? (
                  <div className="text-sm text-gray-500 italic text-center">{msg.text}</div>
                ) : (
                  <>
                    {msg.sender !== currentUser.uid && (
                      <div className="text-sm font-medium text-gray-700 mb-1">
                        {selectedConversation.type === "community"
                          ? msg.senderName
                          : getChatPartner(selectedConversation.participants)}
                      </div>
                    )}
                    <div
                      className={`inline-block p-3 rounded-lg max-w-[70%] ${
                        msg.sender === currentUser.uid ? "text-white" : "text-gray-800"
                      }`}
                      style={{
                        backgroundColor: msg.sender === currentUser.uid
                          ? elementColors.primary
                          : elementColors.light
                      }}
                    >
                      {msg.mediaURL && msg.mediaType === 'image' && (
                        <img
                          src={msg.mediaURL}
                          alt="תמונה"
                          className="max-h-60 mb-2 rounded"
                          onLoad={handleMediaLoad}
                        />
                      )}
                      {msg.audioURL && (
                        <div className="audio-message mb-2">
                          <div className="flex items-center gap-2">
                            <button 
                              className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-all"
                              style={{ 
                                backgroundColor: isAudioPlaying[msg.id] 
                                  ? (msg.sender === currentUser.uid ? 'rgba(255,255,255,0.3)' : elementColors.primary) 
                                  : (msg.sender === currentUser.uid ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.05)')
                              }}
                              onClick={() => {
                                const audioElement = document.getElementById(`audio-${msg.id}`);
                                if (audioElement) {
                                  if (audioElement.paused) {
                                    // Pre-load the duration before playing if possible
                                    if (audioElement.duration && isFinite(audioElement.duration)) {
                                      const totalTimeDisplay = audioElement.parentElement.querySelector('.audio-total-time');
                                      if (totalTimeDisplay && totalTimeDisplay.textContent === "00:00") {
                                        totalTimeDisplay.textContent = formatTime(audioElement.duration);
                                      }
                                    }
                                    audioElement.play();
                                  } else {
                                    audioElement.pause();
                                  }
                                }
                              }}
                            >
                              {isAudioPlaying[msg.id] ? (
                                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" 
                                     stroke={msg.sender === currentUser.uid ? "white" : "white"} 
                                     strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <rect x="6" y="4" width="4" height="16"></rect>
                                  <rect x="14" y="4" width="4" height="16"></rect>
                                </svg>
                              ) : (
                                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" 
                                     stroke={msg.sender === currentUser.uid ? "white" : elementColors.primary} 
                                     strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <polygon points="5 3 19 12 5 21 5 3"></polygon>
                                </svg>
                              )}
                            </button>
                            
                            <div className="flex-1">
                              <div className="w-full h-4 bg-opacity-20 rounded overflow-hidden"
                                   style={{ backgroundColor: msg.sender === currentUser.uid ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.05)' }}>
                                <div 
                                  className="h-full transition-all duration-100 audio-progress" 
                                  style={{ 
                                    width: `${isAudioPlaying[msg.id] ? 'var(--progress, 0%)' : '0%'}`,
                                    backgroundColor: msg.sender === currentUser.uid ? 'white' : elementColors.primary,
                                  }}>
                                </div>
                              </div>
                            </div>

                            <div className="text-xs mx-1" style={{ color: msg.sender === currentUser.uid ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.6)' }}>
                              <span className="audio-current-time">00:00</span>/<span className="audio-total-time" data-message-id={msg.id}>00:00</span>
                            </div>
                          </div>
                          
                          <audio 
                            id={`audio-${msg.id}`}
                            className="hidden"
                            src={msg.audioURL}
                            preload="metadata"
                            onPlay={() => {
                              handleAudioPlayStateChange(msg.id, true);
                              
                              // Additional attempt to update duration on play
                              const audio = document.getElementById(`audio-${msg.id}`);
                              if (audio && isFinite(audio.duration)) {
                                const totalTimeDisplay = audio.parentElement.querySelector('.audio-total-time');
                                if (totalTimeDisplay) {
                                  totalTimeDisplay.textContent = formatTime(audio.duration);
                                }
                              }
                            }}
                            onPause={() => handleAudioPlayStateChange(msg.id, false)}
                            onEnded={() => handleAudioPlayStateChange(msg.id, false)}
                            onLoadedData={(e) => {
                              const audio = e.target;
                              const totalTimeDisplay = audio.parentElement.querySelector('.audio-total-time');
                              if (totalTimeDisplay && isFinite(audio.duration)) {
                                totalTimeDisplay.textContent = formatTime(audio.duration);
                              }
                              
                              // Store duration in a data attribute for reliable access
                              if (isFinite(audio.duration)) {
                                audio.setAttribute('data-duration', audio.duration);
                              }
                            }}
                            onDurationChange={(e) => {
                              const audio = e.target;
                              const totalTimeDisplay = audio.parentElement.querySelector('.audio-total-time');
                              if (totalTimeDisplay && isFinite(audio.duration)) {
                                totalTimeDisplay.textContent = formatTime(audio.duration);
                                audio.setAttribute('data-duration', audio.duration);
                              }
                            }}
                            onTimeUpdate={(e) => {
                              const audio = e.target;
                              const progress = (audio.currentTime / audio.duration) * 100;
                              const audioElement = document.getElementById(`audio-${msg.id}`);
                              if (audioElement) {
                                // Update progress bar
                                const progressBar = audioElement.parentElement.querySelector('.audio-progress');
                                if (progressBar) {
                                  progressBar.style.setProperty('--progress', `${progress}%`);
                                }
                                
                                // Update current time
                                const currentTimeDisplay = audioElement.parentElement.querySelector('.audio-current-time');
                                if (currentTimeDisplay) {
                                  currentTimeDisplay.textContent = formatTime(audio.currentTime);
                                }
                                
                                // Update total time if not already set correctly
                                const totalTimeDisplay = audioElement.parentElement.querySelector('.audio-total-time');
                                if (totalTimeDisplay && isFinite(audio.duration) && totalTimeDisplay.textContent === "00:00") {
                                  totalTimeDisplay.textContent = formatTime(audio.duration);
                                  audioElement.setAttribute('data-duration', audio.duration);
                                }
                              }
                            }}
                            onLoadedMetadata={(e) => {
                              const audio = e.target;
                              const currentTimeDisplay = audio.parentElement.querySelector('.audio-current-time');
                              const totalTimeDisplay = audio.parentElement.querySelector('.audio-total-time');
                              
                              if (currentTimeDisplay) {
                                currentTimeDisplay.textContent = formatTime(0);
                              }
                              
                              // Handle duration safely
                              if (totalTimeDisplay) {
                                // Sometimes duration is not immediately available or is NaN
                                // We'll use a timeout to try to get it after it's fully loaded
                                setTimeout(() => {
                                  if (isFinite(audio.duration)) {
                                    totalTimeDisplay.textContent = formatTime(audio.duration);
                                  } else {
                                    // Fallback to calculating duration another way if needed
                                    audio.currentTime = 0;
                                    audio.play().then(() => {
                                      audio.pause();
                                      totalTimeDisplay.textContent = formatTime(audio.duration);
                                    }).catch(() => {
                                      totalTimeDisplay.textContent = "00:00";
                                    });
                                  }
                                }, 300);
                              }
                            }}
                          />
                        </div>
                      )}
                      {msg.text}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {msg.createdAt?.toLocaleTimeString('he-IL') || "עכשיו"}
                    </div>
                  </>
                )}
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 border-t border-gray-200 bg-white">
          {/* Image Preview */}
          {preview && (
            <div className="relative mb-3 border rounded p-2 bg-gray-50">
              <img src={preview.url} alt="תצוגה מקדימה" className="max-h-40 rounded" />
              <div className="text-sm text-gray-600 mt-1">{file.name} ({(file.size / 1024).toFixed(1)} KB)</div>
              <button
                onClick={removeFile}
                className="absolute top-2 right-2 bg-black text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600"
              >
                ×
              </button>
            </div>
          )}

          {/* Audio Preview */}
          {audioURL && (
            <div className="relative mb-3 border rounded p-3 bg-gray-50">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    const audio = document.getElementById("preview-audio");
                    if (audio) {
                      if (audio.paused) {
                        audio.play();
                      } else {
                        audio.pause();
                      }
                    }
                  }}
                  className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white"
                >
                  <svg id="preview-play-icon" className="w-5 h-5" viewBox="0 0 24 24" fill="none" 
                       stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="5 3 19 12 5 21 5 3"></polygon>
                  </svg>
                  <svg id="preview-pause-icon" className="w-5 h-5 hidden" viewBox="0 0 24 24" fill="none" 
                       stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="6" y="4" width="4" height="16"></rect>
                    <rect x="14" y="4" width="4" height="16"></rect>
                  </svg>
                </button>
                
                <div className="flex-1">
                  <div className="text-sm font-medium text-gray-700 mb-1 flex justify-between">
                    <span>הקלטת אודיו</span>
                    <span id="preview-time">
                      {formatTime(audioDuration || 0)}
                    </span>
                  </div>
                  <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      id="preview-progress" 
                      className="h-full bg-blue-500 transition-all duration-100"
                      style={{ width: '0%' }}>
                    </div>
                  </div>
                </div>
                
                <button
                  onClick={removeAudio}
                  className="flex-shrink-0 bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-red-600"
                >
                  ×
                </button>
              </div>
              
              <audio 
                id="preview-audio" 
                className="hidden"
                src={audioURL}
                onPlay={() => {
                  document.getElementById("preview-play-icon").classList.add("hidden");
                  document.getElementById("preview-pause-icon").classList.remove("hidden");
                }}
                onPause={() => {
                  document.getElementById("preview-play-icon").classList.remove("hidden");
                  document.getElementById("preview-pause-icon").classList.add("hidden");
                }}
                onEnded={() => {
                  document.getElementById("preview-play-icon").classList.remove("hidden");
                  document.getElementById("preview-pause-icon").classList.add("hidden");
                }}
                onTimeUpdate={(e) => {
                  const audio = e.target;
                  const progress = (audio.currentTime / audio.duration) * 100;
                  document.getElementById("preview-progress").style.width = `${progress}%`;
                  document.getElementById("preview-time").textContent = 
                    `${formatTime(audio.currentTime)} / ${formatTime(audio.duration)}`;
                }}
              />
            </div>
          )}

          {/* Recording UI */}
          {isRecording && (
            <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-red-500 flex items-center justify-center mr-3 relative">
                  <div className="absolute inset-0 bg-red-500 rounded-full animate-ping opacity-75"></div>
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 14a3 3 0 0 0 3-3V5a3 3 0 0 0-6 0v6a3 3 0 0 0 3 3z" />
                    <path d="M19 11a7 7 0 0 1-14 0h2a5 5 0 0 0 10 0h2z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <div className="text-red-800 font-medium">מקליט...</div>
                  <div className="text-red-600 text-sm">{formatTime(recordingTime)}</div>
                </div>
                <button
                  onClick={stopRecording}
                  className="ml-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                >
                  סיים הקלטה
                </button>
              </div>
              
              {/* Waveform visualization */}
              <div className="mt-3 h-12 flex items-center gap-0.5">
                {soundLevels.map((level, index) => (
                  <div 
                    key={index} 
                    className="flex-1 bg-red-400 rounded-sm"
                    style={{ 
                      height: `${Math.max(5, level * 100)}%`,
                      opacity: 0.7 + (index / soundLevels.length) * 0.3
                    }}
                  ></div>
                ))}
                {/* Fill with empty bars if not enough levels */}
                {[...Array(Math.max(0, 30 - soundLevels.length))].map((_, index) => (
                  <div 
                    key={`empty-${index}`} 
                    className="flex-1 bg-red-300 rounded-sm"
                    style={{ height: '5%' }}
                  ></div>
                ))}
              </div>
            </div>
          )}

          {/* Input Row */}
          <div className="flex items-center gap-2">
            {/* File Upload */}
            <label className="cursor-pointer text-gray-500 hover:text-blue-500">
              <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
              </svg>
            </label>

            {/* Record Button */}
            <button
              onClick={isRecording ? stopRecording : startRecording}
              className={`p-2 rounded-full flex items-center justify-center transition-all duration-200 ${
                isRecording ? "bg-red-500 text-white shadow-md" : "text-gray-500 hover:text-red-500"
              }`}
              title={isRecording ? "עצור הקלטה" : "התחל הקלטה"}
            >
              {isRecording ? (
                <svg className="h-5 w-5" fill="white" viewBox="0 0 24 24">
                  <rect x="6" y="6" width="12" height="12" rx="2" />
                </svg>
              ) : (
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 14a3 3 0 0 0 3-3V5a3 3 0 0 0-6 0v6a3 3 0 0 0 3 3zm5-3a5 5 0 0 1-10 0H5a7 7 0 0 0 14 0h-2zm-5 7a7 7 0 0 0 7-7h-2a5 5 0 0 1-10 0H5a7 7 0 0 0 7 7zm-1 2h2v2h-2v-2z" />
                </svg>
              )}
            </button>

            {/* Text Input */}
            <input
              type="text"
              className="flex-1 p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring"
              style={{ borderColor: 'rgb(209, 213, 219)' }}
              placeholder={isRecording ? "מקליט..." : file ? "הוסף כיתוב (אופציונלי)" : audioURL ? "הוסף כיתוב להקלטה (אופציונלי)" : "הקלד הודעה..."}
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !isRecording && handleSendMessage()}
              disabled={isRecording}
            />

            {/* Send Button */}
            <button
              className="text-white px-4 py-2 rounded-lg transition duration-200 disabled:opacity-50"
              style={{ backgroundColor: elementColors.primary }}
              onClick={handleSendMessage}
              disabled={(!newMessage.trim() && !file && !audioURL) || isSending || isUploading || isRecording}
            >
              {isUploading ? (
                <span className="animate-pulse">מעלה... {Math.round(uploadProgress)}%</span>
              ) : isSending ? "שולח..." : "שלח"}
            </button>
          </div>
        </div>
      </>
    ) : (
      <div className="flex-1 flex items-center justify-center bg-white text-right">
        <div className="text-center text-gray-500">
          <p className="text-lg">בחר צ'אט או צור חדש כדי להתחיל</p>
          <button
            onClick={() => setShowNewChatDialog(true)}
            className="mt-4 text-white px-4 py-2 rounded-lg"
            style={{ backgroundColor: elementColors.primary }}
          >
            צ'אט חדש
          </button>
        </div>
      </div>
    )}
  </div>
);
}