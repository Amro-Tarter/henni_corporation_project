import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronLeft, 
  ChevronRight, 
  Play, 
  Pause, 
  Plus, 
  Upload, 
  X, 
  Image, 
  Video, 
  Trash2, 
  Loader2, 
  Edit3,
  Save,
  Eye,
  Grid,
  Calendar,
  User
} from 'lucide-react';
import { collection, addDoc, getDocs, deleteDoc, doc, query, orderBy, updateDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject, uploadBytesResumable } from 'firebase/storage';
import { db, storage } from '../../config/firbaseConfig';
import { useUser } from '../../hooks/useUser';
import { toast } from 'sonner';

const Gallery = () => {
  // Mock data for demonstration

  const [mediaItems, setMediaItems] = useState([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [viewMode, setViewMode] = useState('carousel'); // 'carousel' or 'grid'
  const [filterType, setFilterType] = useState('all'); // 'all', 'image', 'video'
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [uploadForm, setUploadForm] = useState({
    file: null,
    caption: '',
    credit: '',
    type: 'image',
    tags: []
  });
  const [dragActive, setDragActive] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [error, setError] = useState(null);
  
  const videoRef = useRef(null);
  const fileInputRef = useRef(null);
  const { user, loading: userLoading } = useUser();

  // Check if user is admin
  useEffect(() => {
    if (user) {
      setIsAdmin(user.role === 'admin');
    } else {
      setIsAdmin(false);
    }
  }, [user]);

  // Fetch gallery items from Firestore
  useEffect(() => {
    const fetchGalleryItems = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const galleryQuery = query(
          collection(db, 'gallery'),
          orderBy('createdAt', 'desc')
        );
        
        const querySnapshot = await getDocs(galleryQuery);
        const items = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate() || new Date(0)
        }));
        
        setMediaItems(items);
      } catch (error) {
        console.error('Error fetching gallery items:', error);
        setError('שגיאה בטעינת הגלריה');
        toast.error('שגיאה בטעינת הגלריה');
      } finally {
        setIsLoading(false);
      }
    };

    fetchGalleryItems();
  }, []);

  // Filter media items based on type
  const filteredItems = mediaItems.filter(item => 
    filterType === 'all' || item.type === filterType
  );

  const handleThumbnailClick = (index) => {
    setActiveIndex(index);
    setIsVideoPlaying(false);
    // Mock view increment
    const updatedItems = [...mediaItems];
  };

  const handleVideoToggle = () => {
    if (videoRef.current) {
      if (isVideoPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsVideoPlaying(!isVideoPlaying);
    }
  };

  const nextSlide = () => {
    setActiveIndex((prev) => (prev + 1) % filteredItems.length);
    setIsVideoPlaying(false);
  };

  const prevSlide = () => {
    setActiveIndex((prev) => (prev - 1 + filteredItems.length) % filteredItems.length);
    setIsVideoPlaying(false);
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (file) => {
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      toast.error('גודל הקובץ חורג מהמגבלה (10MB)');
      return;
    }

    const fileType = file.type.startsWith('video/') ? 'video' : 'image';
    const preview = URL.createObjectURL(file);
    setPreviewUrl(preview);
    setUploadForm(prev => ({
      ...prev,
      file,
      type: fileType
    }));
  };

  const generateVideoThumbnail = (videoFile) => {
    return new Promise((resolve) => {
      const video = document.createElement('video');
      video.preload = 'metadata';
      video.src = URL.createObjectURL(videoFile);
      
      video.onloadeddata = () => {
        video.currentTime = 1; // Set to 1 second to avoid black frames
      };

      video.onseeked = () => {
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        // Convert canvas to blob
        canvas.toBlob((blob) => {
          URL.revokeObjectURL(video.src);
          resolve(blob);
        }, 'image/jpeg', 0.7);
      };
    });
  };

  const handleUploadSubmit = async () => {
    if (!uploadForm.file || !uploadForm.caption) {
      toast.error('נא למלא את כל השדות החובה');
      return;
    }

    try {
      setUploadProgress(0);
      
      // Upload file to Firebase Storage
      const timestamp = Date.now();
      const storageRef = ref(storage, `gallery/${timestamp}_${uploadForm.file.name}`);
      
      // Create upload task with progress tracking
      const uploadTask = uploadBytesResumable(storageRef, uploadForm.file);
      
      // Track upload progress
      uploadTask.on('state_changed',
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setUploadProgress(progress);
        },
        (error) => {
          console.error('Upload error:', error);
          toast.error('שגיאה בהעלאת הקובץ');
          setUploadProgress(0);
        },
        async () => {
          try {
            // Upload completed
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);

            // Generate and upload thumbnail for videos
            let thumbnailURL = downloadURL;
            if (uploadForm.type === 'video') {
              const thumbnailBlob = await generateVideoThumbnail(uploadForm.file);
              const thumbnailRef = ref(storage, `gallery/thumbnails/${timestamp}_${uploadForm.file.name}.jpg`);
              await uploadBytes(thumbnailRef, thumbnailBlob);
              thumbnailURL = await getDownloadURL(thumbnailRef);
            }

            // Add metadata to Firestore
            const galleryItem = {
              type: uploadForm.type,
              src: downloadURL,
              thumbnail: thumbnailURL,
              caption: uploadForm.caption,
              credit: uploadForm.credit || 'צוות העמותה',
              createdAt: serverTimestamp(),
              createdBy: user.uid,
              tags: uploadForm.tags
            };

            await addDoc(collection(db, 'gallery'), galleryItem);
            
            // Reset form and close modal
            setUploadForm({ file: null, caption: '', credit: '', type: 'image', tags: [] });
            setPreviewUrl(null);
            setShowUploadModal(false);
            setUploadProgress(0);
            
            toast.success('התוכן הועלה בהצלחה');
          } catch (error) {
            console.error('Error saving gallery item:', error);
            toast.error('שגיאה בשמירת התוכן');
            setUploadProgress(0);
          }
        }
      );
    } catch (error) {
      console.error('Error uploading gallery item:', error);
      toast.error('שגיאה בהעלאת התוכן');
      setUploadProgress(0);
    }
  };

  const handleEditItem = (item) => {
    setEditingItem({ ...item });
    setShowEditModal(true);
  };

  const handleUpdateItem = async () => {
    if (!editingItem || !editingItem.caption) return;

    try {
      const galleryRef = doc(db, 'gallery', editingItem.id);
      await updateDoc(galleryRef, {
        caption: editingItem.caption,
        credit: editingItem.credit,
        tags: editingItem.tags,
        updatedAt: new Date()
      });

      setMediaItems(prev => prev.map(item => 
        item.id === editingItem.id ? editingItem : item
      ));
      setShowEditModal(false);
      setEditingItem(null);
      toast.success('הפריט עודכן בהצלחה');
    } catch (error) {
      console.error('Error updating gallery item:', error);
      toast.error('שגיאה בעדכון הפריט');
    }
  };

  const handleDeleteItem = async (itemId) => {
    if (!window.confirm('האם אתה בטוח שברצונך למחוק פריט זה?')) return;

    try {
      // Delete from Firestore
      await deleteDoc(doc(db, 'gallery', itemId));

      // Delete from Storage if it's a Firebase Storage URL
      const item = mediaItems.find(item => item.id === itemId);
      if (item && item.src.includes('firebasestorage')) {
        const storageRef = ref(storage, item.src);
        await deleteObject(storageRef);
      }

      setMediaItems(prev => prev.filter(item => item.id !== itemId));
      toast.success('הפריט נמחק בהצלחה');
    } catch (error) {
      console.error('Error deleting gallery item:', error);
      toast.error('שגיאה במחיקת הפריט');
    }
  };

  const downloadMedia = (src, filename) => {
    const link = document.createElement('a');
    link.href = src;
    link.download = filename || 'media-file';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (viewMode === 'carousel' && !showUploadModal && !showEditModal) {
        if (e.key === 'ArrowRight') nextSlide();
        if (e.key === 'ArrowLeft') prevSlide();
        if (e.key === 'Escape' && isFullscreen) setIsFullscreen(false);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [viewMode, showUploadModal, showEditModal, isFullscreen]);

  // Clean up preview URL when component unmounts
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  return (
    <section id="gallery" className="py-16 bg-gradient-to-br from-slate-50 via-white to-blue-50" dir="rtl">
      <div className="container mx-auto px-6 max-w-7xl">
        
        {/* Header with Controls */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-8"
        >
          <h2 className="font-bold text-5xl md:text-5xl text-blue-700 mb-3">
            גלריית היצירות שלנו
          </h2>
          <p className="text-lg text-blue-600/80 max-w-2xl mx-auto mb-8">
            מבט אל תוך עולמות היצירה והעשייה הקהילתית
          </p>

          {/* Controls Bar */}
          <div className="flex flex-wrap items-center justify-center gap-4 mb-6">
            {/* View Mode Toggle */}
            <div className="flex bg-white rounded-lg shadow-sm border p-1">
              <button
                onClick={() => setViewMode('carousel')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                  viewMode === 'carousel' 
                    ? 'bg-blue-600 text-white shadow-sm' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Eye className="w-4 h-4 mr-2 inline" />
                תצוגת מצגת
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                  viewMode === 'grid' 
                    ? 'bg-blue-600 text-white shadow-sm' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Grid className="w-4 h-4 mr-2 inline" />
                תצוגת רשת
              </button>
            </div>

            {/* Admin Upload Button */}
            {isAdmin && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowUploadModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg shadow-lg transition-all"
              >
                <Plus className="w-4 h-4" />
                הוסף תוכן
              </motion.button>
            )}
          </div>
        </motion.div>

        {/* Main Content */}
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📸</div>
            <h3 className="text-xl font-medium text-gray-700 mb-2">{error}</h3>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📸</div>
            <h3 className="text-xl font-medium text-gray-700 mb-2">אין תוכן להצגה</h3>
            <p className="text-gray-500 mb-6">
              {filterType === 'all' ? 'הגלריה ריקה' : `אין ${filterType === 'image' ? 'תמונות' : 'סרטונים'} להצגה`}
            </p>
          </div>
        ) : viewMode === 'carousel' ? (
          /* Carousel View */
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className="grid lg:grid-cols-4 gap-0">
              {/* Main Display */}
              <div className="lg:col-span-3 relative">
                <div className="aspect-video relative overflow-hidden bg-black">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={activeIndex}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.4 }}
                      className="w-full h-full relative"
                    >
                      {filteredItems[activeIndex]?.type === 'video' ? (
                        <div className="relative w-full h-full">
                          <video
                            ref={videoRef}
                            className="w-full h-full object-cover"
                            src={filteredItems[activeIndex]?.src}
                            muted
                            playsInline
                          />
                          <div className="absolute inset-0 flex items-center justify-center">
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={handleVideoToggle}
                              className="bg-white/90 backdrop-blur-sm rounded-full p-4 shadow-lg"
                            >
                              {isVideoPlaying ? (
                                <Pause className="w-8 h-8 text-blue-700" />
                              ) : (
                                <Play className="w-8 h-8 text-blue-700 ml-1" />
                              )}
                            </motion.button>
                          </div>
                        </div>
                      ) : (
                        <img
                          src={filteredItems[activeIndex]?.src}
                          alt={filteredItems[activeIndex]?.caption}
                          className="w-full h-full object-cover cursor-pointer"
                          onClick={() => setIsFullscreen(true)}
                        />
                      )}
                    </motion.div>
                  </AnimatePresence>
                  
                  {/* Navigation & Controls */}
                  {filteredItems.length > 1 && (
                    <>
                      <button
                        onClick={prevSlide}
                        className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 backdrop-blur-sm rounded-full p-3 shadow-lg hover:bg-white transition-all"
                      >
                        <ChevronLeft className="w-5 h-5 text-gray-700" />
                      </button>
                      <button
                        onClick={nextSlide}
                        className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 backdrop-blur-sm rounded-full p-3 shadow-lg hover:bg-white transition-all"
                      >
                        <ChevronRight className="w-5 h-5 text-gray-700" />
                      </button>
                    </>
                  )}

                  {/* Progress Indicator */}
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                    {filteredItems.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => handleThumbnailClick(index)}
                        className={`w-2 h-2 rounded-full transition-all ${
                          activeIndex === index ? 'bg-white' : 'bg-white/50'
                        }`}
                      />
                    ))}
                  </div>
                </div>
                
                {/* Media Info */}
                <div className="p-6 border-t">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-purple-700 mb-2">
                        {filteredItems[activeIndex]?.caption}
                      </h3>
                      <div className="flex items-center gap-4 text-sm text-gray-500 mb-2">
                        <span className="flex items-center gap-1">
                          <User className="w-4 h-4" />
                          {filteredItems[activeIndex]?.credit}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {filteredItems[activeIndex]?.createdAt?.toLocaleDateString('he-IL')}
                        </span>

                      </div>
                      {filteredItems[activeIndex]?.tags && (
                        <div className="flex flex-wrap gap-1">
                          {filteredItems[activeIndex].tags.map((tag, index) => (
                            <span
                              key={index}
                              className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                            >
                              #{tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    
                    {/* Admin Controls */}
                    {isAdmin && (
                      <div className="flex gap-2">
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleEditItem(filteredItems[activeIndex])}
                          className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-full transition-colors"
                          title="ערוך"
                        >
                          <Edit3 className="w-5 h-5" />
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleDeleteItem(filteredItems[activeIndex].id)}
                          className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-full transition-colors"
                          title="מחק"
                        >
                          <Trash2 className="w-5 h-5" />
                        </motion.button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Thumbnail Sidebar */}
              <div className="lg:col-span-1 bg-gray-50 p-4 max-h-96 lg:max-h-full overflow-y-auto">
                <h4 className="text-sm font-semibold text-gray-700 mb-4 text-center">
                  {filteredItems.length} פריטים
                </h4>
                <div className="space-y-3">
                  {filteredItems.map((item, index) => (
                    <motion.button
                      key={item.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleThumbnailClick(index)}
                      className={`relative w-full aspect-video rounded-lg overflow-hidden border-2 transition-all ${
                        activeIndex === index
                          ? 'border-blue-500 shadow-lg ring-2 ring-blue-200'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <img
                        src={item.thumbnail}
                        alt={item.caption}
                        className="w-full h-full object-cover"
                      />
                      {item.type === 'video' && (
                        <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                          <Play className="w-6 h-6 text-white" />
                        </div>
                      )}
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2">
                        <p className="text-xs text-white font-medium truncate">
                          {item.caption}
                        </p>
                      </div>
                    </motion.button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Grid View */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredItems.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all group"
              >
                <div className="relative aspect-video overflow-hidden">
                  <img
                    src={item.thumbnail}
                    alt={item.caption}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  {item.type === 'video' && (
                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                      <Play className="w-8 h-8 text-white" />
                    </div>
                  )}
                  
                  {/* Hover Actions */}
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                    {isAdmin && (
                      <>
                        <button
                          onClick={() => handleEditItem(item)}
                          className="p-1.5 bg-white/90 rounded-full hover:bg-white transition-colors"
                          title="ערוך"
                        >
                          <Edit3 className="w-3 h-3 text-blue-600" />
                        </button>
                        <button
                          onClick={() => handleDeleteItem(item.id)}
                          className="p-1.5 bg-white/90 rounded-full hover:bg-white transition-colors"
                          title="מחק"
                        >
                          <Trash2 className="w-3 h-3 text-red-500" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
                
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2">
                    {item.caption}
                  </h3>
                  <p className="text-sm text-gray-500 mb-2">{item.credit}</p>
                  <div className="flex items-center justify-between text-xs text-gray-400">
                    <span>{item.createdAt?.toLocaleDateString('he-IL')}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Fullscreen Modal */}
        <AnimatePresence>
          {isFullscreen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black z-50 flex items-center justify-center"
              onClick={() => setIsFullscreen(false)}
            >
              <button
                onClick={() => setIsFullscreen(false)}
                className="absolute top-4 right-4 text-white hover:text-gray-300 z-10"
              >
                <X className="w-8 h-8" />
              </button>
              <img
                src={filteredItems[activeIndex]?.src}
                alt={filteredItems[activeIndex]?.caption}
                className="max-w-full max-h-full object-cover"
                onClick={(e) => e.stopPropagation()}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Upload Modal */}
        <AnimatePresence>
          {showUploadModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              onClick={(e) => e.target === e.currentTarget && setShowUploadModal(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-auto max-h-[90vh] overflow-y-auto"
                dir="rtl"
              >
                {/* Modal Header */}
                <div className="flex items-center justify-between p-6 border-b">
                  <h3 className="text-xl font-bold text-gray-900">הוספת תוכן חדש</h3>
                  <button
                    onClick={() => setShowUploadModal(false)}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <X className="w-5 h-5 text-gray-500" />
                  </button>
                </div>

                {/* Modal Content */}
                <div className="p-6 space-y-6">
                  {/* File Upload Area */}
                  <div
                    className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-all ${
                      dragActive 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*,video/*"
                      onChange={handleFileInput}
                      className="hidden"
                    />
                    
                    {uploadForm.file ? (
                      <div className="space-y-4">
                        {previewUrl && (
                          <div className="relative w-full aspect-video mb-4 rounded-lg overflow-hidden">
                            {uploadForm.type === 'video' ? (
                              <video
                                src={previewUrl}
                                className="w-full h-full object-cover"
                                controls
                              />
                            ) : (
                              <img
                                src={previewUrl}
                                alt="Preview"
                                className="w-full h-full object-cover"
                              />
                            )}
                          </div>
                        )}
                        <div className="flex items-center justify-center">
                          {uploadForm.type === 'video' ? (
                            <Video className="w-10 h-10 text-green-500" />
                          ) : (
                            <Image className="w-10 h-10 text-green-500" />
                          )}
                        </div>
                        <div>
                          <p className="text-lg font-medium text-gray-700 mb-1">
                            {uploadForm.file.name}
                          </p>
                          <p className="text-sm text-gray-500 mb-3">
                            {(uploadForm.file.size / (1024 * 1024)).toFixed(2)} MB
                          </p>
                          <button
                            type="button"
                            onClick={() => {
                              setUploadForm(prev => ({ ...prev, file: null }));
                              setPreviewUrl(null);
                            }}
                            className="text-sm text-red-500 hover:text-red-700 hover:underline"
                          >
                            הסר קובץ
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <Upload className="w-12 h-12 text-gray-400 mx-auto" />
                        <div>
                          <p className="text-lg text-gray-600 mb-2">
                            גרור קבצים לכאן או{' '}
                            <button
                              type="button"
                              onClick={() => fileInputRef.current?.click()}
                              className="text-blue-600 hover:text-blue-700 font-medium hover:underline"
                            >
                              בחר מהמכשיר
                            </button>
                          </p>
                          <p className="text-sm text-gray-400">
                            תמונות ווידאו בלבד (עד 10MB)
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Upload Progress */}
                  {uploadProgress > 0 && uploadProgress < 100 && (
                    <div className="space-y-2">
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div
                          className="bg-blue-600 h-3 rounded-full transition-all duration-300"
                          style={{ width: `${uploadProgress}%` }}
                        />
                      </div>
                      <p className="text-sm text-gray-600 text-center">
                        {Math.round(uploadProgress)}% הועלה
                      </p>
                    </div>
                  )}

                  {/* Form Fields */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        כותרת *
                      </label>
                      <input
                        type="text"
                        value={uploadForm.caption}
                        onChange={(e) => setUploadForm(prev => ({ ...prev, caption: e.target.value }))}
                        placeholder="תיאור קצר של התוכן"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        קרדיט
                      </label>
                      <input
                        type="text"
                        value={uploadForm.credit}
                        onChange={(e) => setUploadForm(prev => ({ ...prev, credit: e.target.value }))}
                        placeholder="צילום: שם הצלם"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        תגיות (הפרד בפסיקים)
                      </label>
                      <input
                        type="text"
                        value={uploadForm.tags.join(', ')}
                        onChange={(e) => setUploadForm(prev => ({ 
                          ...prev, 
                          tags: e.target.value.split(',').map(tag => tag.trim()).filter(Boolean) 
                        }))}
                        placeholder="קהילה, פעילות, אירוע"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      />
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3 pt-4">
                    <button
                      type="button"
                      onClick={() => {
                        setShowUploadModal(false);
                        setPreviewUrl(null);
                        setUploadForm({ file: null, caption: '', credit: '', type: 'image', tags: [] });
                      }}
                      className="flex-1 px-6 py-3 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors font-medium"
                    >
                      ביטול
                    </button>
                    <button
                      type="button"
                      onClick={handleUploadSubmit}
                      disabled={!uploadForm.file || !uploadForm.caption || uploadProgress > 0}
                      className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg transition-colors font-medium flex items-center justify-center"
                    >
                      {uploadProgress > 0 ? (
                        <>
                          <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                          מעלה...
                        </>
                      ) : (
                        'הוסף תוכן'
                      )}
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Edit Modal */}
        <AnimatePresence>
          {showEditModal && editingItem && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              onClick={(e) => e.target === e.currentTarget && setShowEditModal(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-auto max-h-[90vh] overflow-y-auto"
                dir="rtl"
              >
                {/* Modal Header */}
                <div className="flex items-center justify-between p-6 border-b">
                  <h3 className="text-xl font-bold text-gray-900">עריכת תוכן</h3>
                  <button
                    onClick={() => setShowEditModal(false)}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <X className="w-5 h-5 text-gray-500" />
                  </button>
                </div>

                {/* Modal Content */}
                <div className="p-6 space-y-6">
                  {/* Preview */}
                  <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-gray-100">
                    {editingItem.type === 'video' ? (
                      <video
                        src={editingItem.src}
                        className="w-full h-full object-cover"
                        controls
                      />
                    ) : (
                      <img
                        src={editingItem.src}
                        alt={editingItem.caption}
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>

                  {/* Form Fields */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        כותרת *
                      </label>
                      <input
                        type="text"
                        value={editingItem.caption}
                        onChange={(e) => setEditingItem(prev => ({ ...prev, caption: e.target.value }))}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        קרדיט
                      </label>
                      <input
                        type="text"
                        value={editingItem.credit}
                        onChange={(e) => setEditingItem(prev => ({ ...prev, credit: e.target.value }))}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        תגיות (הפרד בפסיקים)
                      </label>
                      <input
                        type="text"
                        value={editingItem.tags?.join(', ') || ''}
                        onChange={(e) => setEditingItem(prev => ({ 
                          ...prev, 
                          tags: e.target.value.split(',').map(tag => tag.trim()).filter(Boolean) 
                        }))}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      />
                    </div>

                    {/* Stats Display */}
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">סטטיסטיקות</h4>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-500">תאריך יצירה:</span>
                          <span className="font-medium mr-2">
                            {editingItem.createdAt?.toLocaleDateString('he-IL')}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setShowEditModal(false)}
                      className="flex-1 px-6 py-3 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors font-medium"
                    >
                      ביטול
                    </button>
                    <button
                      type="button"
                      onClick={handleUpdateItem}
                      disabled={!editingItem.caption}
                      className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg transition-colors font-medium flex items-center justify-center"
                    >
                      <Save className="w-5 h-5 mr-2" />
                      שמור שינויים
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
};

export default Gallery;