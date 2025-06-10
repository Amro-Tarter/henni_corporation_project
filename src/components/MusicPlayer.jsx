import React, { useState, useRef, useEffect } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../config/firbaseConfig'; // <-- Make sure path is correct
import { motion, AnimatePresence } from 'framer-motion';
import { Music, Volume2, Pause } from 'lucide-react';

const MusicPlayer = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [previousVolume, setPreviousVolume] = useState(0.5);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [audioUrl, setAudioUrl] = useState(null); // <-- The Firestore audio URL
  const audioRef = useRef(null);
  const [notes, setNotes] = useState([]);
  const [showControls, setShowControls] = useState(false);

  // Fetch audio URL from Firestore on mount
  useEffect(() => {
    // Listen for real-time changes in the music document
    const trackRef = doc(db, 'music', 'currentTrack');
    const unsubscribe = onSnapshot(trackRef, (docSnap) => {
      if (docSnap.exists() && docSnap.data().url) {
        setAudioUrl(docSnap.data().url);
        setError(null);
        setIsLoading(true); // re-trigger audio loading logic
      } else {
        setError('לא נמצא קובץ מוזיקה');
        setAudioUrl(null);
      }
    }, (err) => {
      setError('בעיה בטעינת קובץ המוזיקה');
      setAudioUrl(null);
    });
    return unsubscribe;
  }, []);

  // Initialize audio when URL is loaded
  useEffect(() => {
    if (!audioUrl) return;
    setIsLoading(true);
    setError(null);

    const audio = new Audio(audioUrl);
    audioRef.current = audio;

    const handleLoadedData = () => {
      setIsLoading(false);
      setDuration(audio.duration);
    };

    const handleError = (e) => {
      setError('Failed to load audio');
      setIsLoading(false);
      console.error('Audio loading error:', e);
    };

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };

    audio.addEventListener('loadeddata', handleLoadedData);
    audio.addEventListener('error', handleError);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);
    audio.volume = volume;
    audio.loop = true;
    audio.load();

    return () => {
      audio.pause();
      audio.removeEventListener('loadeddata', handleLoadedData);
      audio.removeEventListener('error', handleError);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
    };
    // Only run this effect when audioUrl changes
    // eslint-disable-next-line
  }, [audioUrl]);

  // Handle volume changes
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  // Handle play/pause
  useEffect(() => {
    if (!audioRef.current || isLoading) return;
    const playPromise = isPlaying ? audioRef.current.play() : audioRef.current.pause();
    if (playPromise !== undefined) {
      playPromise.catch(error => {
        console.error('Playback error:', error);
        setIsPlaying(false);
      });
    }
  }, [isPlaying, isLoading]);

  // Handle note animations
  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setNotes(prev => [
        ...prev.slice(-5),
        { 
          id: Date.now(), 
          angle: Math.random() * 360,
          scale: 0.8 + Math.random() * 0.4,
          duration: 1.5 + Math.random() * 1
        }
      ]);
    }, 500);
    return () => clearInterval(interval);
  }, [isPlaying]);

  const togglePlay = () => {
    if (isLoading || error) return;
    setIsPlaying(!isPlaying);
  };

  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (newVolume > 0) {
      setIsMuted(false);
    }
  };

  const toggleMute = () => {
    if (isMuted) {
      setVolume(previousVolume);
    } else {
      setPreviousVolume(volume);
      setVolume(0);
    }
    setIsMuted(!isMuted);
  };

  const handleSeek = (e) => {
    const seekTime = parseFloat(e.target.value);
    if (audioRef.current) {
      audioRef.current.currentTime = seekTime;
      setCurrentTime(seekTime);
    }
  };

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  if (error) {
    return (
      <div className="fixed bottom-4 left-4 z-50 p-3 bg-red-500/20 backdrop-blur-lg rounded-full text-white text-sm">
        {error}
      </div>
    );
  }

  return (
    <div 
      className="fixed bottom-4 left-4 z-50"
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => setShowControls(false)}
    >
      <div className="relative group">
        {/* Enhanced smoke effect background */}
        <AnimatePresence>
          {isPlaying && !isLoading && (
            <>
              {[...Array(5)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute inset-0 rounded-full"
                  style={{
                    background: `radial-gradient(circle, rgba(139, 92, 246, ${0.15 - i * 0.02}) 0%, transparent 70%)`,
                    filter: 'blur(8px)'
                  }}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ 
                    scale: 1.5 + i * 0.4, 
                    opacity: 0.4 - i * 0.1,
                    rotate: 360
                  }}
                  transition={{ 
                    duration: 3 + i,
                    repeat: Infinity,
                    ease: 'linear'
                  }}
                />
              ))}
            </>
          )}
        </AnimatePresence>

        {/* Enhanced floating notes */}
        <AnimatePresence>
          {notes.map(note => (
            <motion.div
              key={note.id}
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
              initial={{ 
                opacity: 1,
                x: 0,
                y: 0,
                scale: note.scale,
                rotate: 0
              }}
              animate={{
                opacity: 0,
                x: Math.cos(note.angle * (Math.PI / 180)) * 150,
                y: Math.sin(note.angle * (Math.PI / 180)) * 150,
                scale: note.scale * 1.5,
                rotate: Math.random() * 360
              }}
              transition={{
                duration: note.duration,
                ease: 'easeOut'
              }}
            >
              <Music className="w-4 h-4 text-white/80" />
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Enhanced player controls */}
        <div className="flex items-center gap-3 bg-black/30 backdrop-blur-xl rounded-full p-2 shadow-lg">
          <motion.button
            onClick={togglePlay}
            disabled={isLoading}
            className={`relative p-3 rounded-full bg-red-900 hover:from-purple-600/60 hover:to-blue-500/60 transition-all shadow-lg hover:shadow-purple-500/20 ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
            whileHover={{ scale: isLoading ? 1 : 1.1 }}
            whileTap={{ scale: isLoading ? 1 : 0.95 }}
          >
            {isLoading ? (
              <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin" />
            ) : isPlaying ? (
              <Pause className="w-6 h-6 text-white" />
            ) : (
              <Music className="w-6 h-6 text-white" />
            )}
          </motion.button>

          {/* Volume and progress controls */}
          <AnimatePresence>
            {showControls && !isLoading && (
              <motion.div 
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                className="flex items-center gap-3"
              >
                <button
                  onClick={toggleMute}
                  className="text-white/80 hover:text-white transition-colors"
                >
                  <Volume2 className="w-4 h-4" />
                </button>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={volume}
                  onChange={handleVolumeChange}
                  className="w-20 bg-red-900"
                />
                <div className="flex items-center gap-1 text-white/60 text-xs">
                  <span>{formatTime(currentTime)}</span>
                  <input
                    type="range"
                    min="0"
                    max={duration || 100}
                    value={currentTime}
                    onChange={handleSeek}
                    className="w-32 bg-red-900"
                  />
                  <span>{formatTime(duration)}</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default MusicPlayer;
