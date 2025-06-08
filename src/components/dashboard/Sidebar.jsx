import React, { useState, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { 
  BarChart3, 
  Users, 
  Handshake, 
  FileText, 
  Heart, 
  ClipboardList, 
  GraduationCap,
  ChevronLeft,
  Home,
  Upload,
  Music,
  Check,
  X,
  Volume2,
  Pause,
  Play
} from "lucide-react";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { doc, setDoc } from "firebase/firestore";
import { db } from '../../config/firbaseConfig';

function AdminAudioUpload({ onClose }) {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const fileInputRef = useRef(null);
  const audioRef = useRef(null);

  const handleFileSelect = (selectedFile) => {
    if (selectedFile && selectedFile.type.startsWith('audio/')) {
      setFile(selectedFile);
      setError('');
      // Create preview URL for audio
      if (audioRef.current) {
        audioRef.current.src = URL.createObjectURL(selectedFile);
      }
    } else {
      setError('אנא בחר קובץ אודיו תקין');
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    handleFileSelect(droppedFile);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const togglePreview = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDuration = (duration) => {
    const minutes = Math.floor(duration / 60);
    const seconds = Math.floor(duration % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    setError('');
    setSuccess('');
    
    // Simulate progress for better UX
    const progressInterval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return prev;
        }
        return prev + Math.random() * 15;
      });
    }, 200);

    try {
      const storage = getStorage();
      const fileRef = ref(storage, `audio/${Date.now()}_${file.name}`);
      await uploadBytes(fileRef, file);
      const url = await getDownloadURL(fileRef);
      await setDoc(doc(db, 'music', 'currentTrack'), {
        url,
        name: file.name,
        size: file.size,
        uploadedAt: new Date()
      });
      
      setUploadProgress(100);
      setSuccess('העלאה הצליחה בהצלחה!');
      
      setTimeout(() => {
        setFile(null);
        setUploadProgress(0);
        setSuccess('');
        onClose();
      }, 2000);
    } catch (e) {
      setError('אירעה שגיאה בהעלאה - נסה שוב');
      console.error(e);
      setUploadProgress(0);
    }
    
    clearInterval(progressInterval);
    setUploading(false);
  };

  const removeFile = () => {
    setFile(null);
    setError('');
    setIsPlaying(false);
    if (audioRef.current) {
      audioRef.current.src = '';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with icon */}
      <div className="text-center">
        <div className="mx-auto w-16 h-16 bg-gradient-to-br from-orange-500 to-red-600 rounded-full flex items-center justify-center mb-4 shadow-lg">
          <Music className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">העלה קובץ מוזיקה</h2>
        <p className="text-gray-600 dark:text-gray-300 text-sm">בחר או גרור קובץ MP3 כדי להעלות</p>
      </div>

      {/* File Upload Area */}
      <div
        className={`relative border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-300 cursor-pointer ${
          isDragging 
            ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20 scale-105' 
            : file 
              ? 'border-green-400 bg-green-50 dark:bg-green-900/20' 
              : 'border-gray-300 dark:border-gray-600 hover:border-orange-400 hover:bg-orange-50/50 dark:hover:bg-orange-900/10'
        }`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => !file && fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="audio/*"
          onChange={(e) => handleFileSelect(e.target.files[0])}
          className="hidden"
        />

        {!file ? (
          <div className="space-y-4">
            <div className={`mx-auto w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${
              isDragging ? 'bg-orange-500 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-500'
            }`}>
              <Upload className="w-6 h-6" />
            </div>
            <div>
              <p className="text-lg font-medium text-gray-700 dark:text-gray-200">
                {isDragging ? 'שחרר כדי להעלות' : 'גרור קובץ או לחץ לבחירה'}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                נתמכים: MP3, WAV, M4A (עד 50MB)
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* File Info Card */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3 rtl:space-x-reverse">
                  <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg flex items-center justify-center">
                    <Music className="w-5 h-5 text-white" />
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-800 dark:text-gray-200 truncate max-w-48">
                      {file.name}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {formatFileSize(file.size)}
                    </p>
                  </div>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFile();
                  }}
                  className="p-2 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors group"
                >
                  <X className="w-4 h-4 text-gray-400 group-hover:text-red-500" />
                </button>
              </div>

              {/* Audio Preview */}
              <div className="flex items-center space-x-3 rtl:space-x-reverse">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    togglePreview();
                  }}
                  className="p-2 bg-orange-500 hover:bg-orange-600 rounded-lg text-white transition-colors"
                >
                  {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                </button>
                <div className="flex-1">
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div className="bg-orange-500 h-2 rounded-full w-0 transition-all duration-300"></div>
                  </div>
                </div>
                <Volume2 className="w-4 h-4 text-gray-400" />
              </div>
            </div>
          </div>
        )}

        <audio
          ref={audioRef}
          onEnded={() => setIsPlaying(false)}
          onLoadedMetadata={(e) => {
            // You can add duration display here if needed
          }}
        />
      </div>

      {/* Upload Progress */}
      {uploading && (
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">מעלה...</span>
            <span className="text-sm text-gray-500">{Math.round(uploadProgress)}%</span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
            <div 
              className="bg-gradient-to-r from-orange-500 to-red-600 h-3 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${uploadProgress}%` }}
            >
              <div className="w-full h-full bg-white/20 animate-pulse"></div>
            </div>
          </div>
        </div>
      )}

      {/* Messages */}
      {error && (
        <div className="flex items-center space-x-2 rtl:space-x-reverse p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
          <X className="w-5 h-5 text-red-500 flex-shrink-0" />
          <p className="text-red-700 dark:text-red-400 text-sm font-medium">{error}</p>
        </div>
      )}

      {success && (
        <div className="flex items-center space-x-2 rtl:space-x-reverse p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl">
          <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
          <p className="text-green-700 dark:text-green-400 text-sm font-medium">{success}</p>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex space-x-3 rtl:space-x-reverse">
        <button
          onClick={handleUpload}
          disabled={uploading || !file || success}
          className={`flex-1 py-3 px-6 rounded-xl font-semibold transition-all duration-200 transform ${
            file && !uploading && !success
              ? 'bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white shadow-lg hover:shadow-xl hover:scale-105'
              : 'bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed'
          }`}
        >
          {uploading ? (
            <div className="flex items-center justify-center space-x-2 rtl:space-x-reverse">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>מעלה...</span>
            </div>
          ) : success ? (
            <div className="flex items-center justify-center space-x-2 rtl:space-x-reverse">
              <Check className="w-5 h-5" />
              <span>הועלה בהצלחה!</span>
            </div>
          ) : (
            <div className="flex items-center justify-center space-x-2 rtl:space-x-reverse">
              <Upload className="w-5 h-5" />
              <span>העלה קובץ</span>
            </div>
          )}
        </button>
      </div>
    </div>
  );
}

const Sidebar = ({ isCollapsed, onToggle }) => {
  const location = useLocation();
  const [showUploadModal, setShowUploadModal] = useState(false);

  const menuItems = [
    { 
      path: "/admin", 
      label: "לוח מחוונים", 
      icon: BarChart3,
      exact: true
    },
    { 
      path: "/admin/users", 
      label: "משתמשים", 
      icon: Users 
    },
     { 
      path: "/admin/Mentorship", 
      label: "מנטורים", 
      icon: GraduationCap 
    },
    { 
      path: "/admin/staff", 
      label: "צוות", 
      icon: Users 
    },
    { 
      path: "/admin/Partners", 
      label: "שותפים שלנו", 
      icon: Handshake 
    },
    { 
      path: "/admin/reports", 
      label: "דוחות", 
      icon: FileText 
    },
    { 
      path: "/admin/donations", 
      label: "תרומות", 
      icon: Heart 
    },
    { 
      path: "/admin/forms", 
      label: "טפסים", 
      icon: ClipboardList 
    }
  ];

  const isActiveLink = (path, exact = false) => {
    if (exact) {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div 
      className={`h-full bg-red-900 text-white transition-all duration-300 ease-in-out shadow-xl ${
        isCollapsed ? 'w-16' : 'w-64'
      }`}
      dir="rtl"
    >
      {/* Header */}
      <div className="p-4 border-b border-white/10">
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <div className="flex flex-col">
              <h2 className="text-xl font-bold text-white">לוח מנהל</h2>
              <span className="text-orange-100 text-sm">ניהול המערכת</span>
            </div>
          )}
          
          <button
            onClick={onToggle}
            className="p-2 rounded-lg hover:bg-white/10 transition-colors duration-200"
            aria-label={isCollapsed ? "הרחב תפריט" : "כווץ תפריט"}
          >
            <ChevronLeft 
              size={20} 
              className={`transform transition-transform duration-200 ${
                isCollapsed ? 'rotate-180' : ''
              }`} 
            />
          </button>
        </div>
      </div>

      {/* Navigation */}
      <nav className="p-4 space-y-2">
        {/* Back to main site */}
        <Link
          to="/"
          className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 hover:bg-white/10 group ${
            isCollapsed ? 'justify-center' : ''
          }`}
          title={isCollapsed ? "חזור לאתר הראשי" : ""}
        >
          <Home size={20} className="flex-shrink-0" />
          {!isCollapsed && (
            <span className="group-hover:translate-x-1 transition-transform duration-200">
              חזור לאתר הראשי
            </span>
          )}
        </Link>

        {/* Divider */}
        <div className="h-px bg-white/10 my-4"></div>

        {/* Menu Items */}
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = isActiveLink(item.path, item.exact);
          
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group relative ${
                isActive 
                  ? 'bg-white/20 text-white shadow-md' 
                  : 'hover:bg-white/10 hover:text-white'
              } ${isCollapsed ? 'justify-center' : ''}`}
              title={isCollapsed ? item.label : ""}
            >
              {/* Active indicator */}
              {isActive && (
                <div className="absolute right-0 top-0 bottom-0 w-1 bg-orange-400 rounded-l"></div>
              )}
              
              <Icon 
                size={20} 
                className={`flex-shrink-0 transition-transform duration-200 ${
                  isActive ? 'text-orange-200' : 'group-hover:scale-110'
                }`} 
              />
              
              {!isCollapsed && (
                <span className={`group-hover:translate-x-1 transition-transform duration-200 ${
                  isActive ? 'font-semibold' : ''
                }`}>
                  {item.label}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Enhanced Upload Button */}
      <div className="px-4">
        <button
          onClick={() => setShowUploadModal(true)}
          className={`group relative overflow-hidden flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 w-full ${
            isCollapsed ? 'justify-center' : ''
          }`}
          title="העלה מוזיקה"
        >
          <div className="absolute inset-0 bg-white/20 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
          <Music className="w-5 h-5 flex-shrink-0 relative z-10" />
          {!isCollapsed && <span className="relative z-10">העלה קובץ מוזיקה</span>}
        </button>
      </div>

      {/* Footer */}
      {!isCollapsed && (
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-white/10">
          <div className="text-center">
            <p className="text-xs text-orange-100/70">
              עמותת לגלות את האור
            </p>
            <p className="text-xs text-white/50 mt-1">
              © 2025 כל הזכויות שמורות
            </p>
          </div>
        </div>
      )}

      {/* Collapsed tooltip helper */}
      {isCollapsed && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
          <div className="w-8 h-1 bg-white/20 rounded-full"></div>
        </div>
      )}

      {/* Enhanced Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div
            className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto transform transition-all duration-300 scale-100"
            onClick={e => e.stopPropagation()}
            dir="rtl"
          >
            <div className="sticky top-0 bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 rounded-t-3xl">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-800 dark:text-white">העלאת מוזיקה</h2>
                <button 
                  onClick={() => setShowUploadModal(false)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
            </div>
            
            <div className="p-6">
              <AdminAudioUpload onClose={() => setShowUploadModal(false)} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Sidebar;