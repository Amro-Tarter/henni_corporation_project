import React, { useState, useEffect, useRef } from 'react';
import Layout from '../components/layout/Layout';
import { motion, AnimatePresence, useAnimation } from 'framer-motion';
import { ChevronLeft, MapPin, Calendar, Plus, X, Image as ImageIcon, Check, AlertCircle, Upload, Edit, Trash2 } from 'lucide-react';
import { useUser } from '@/hooks/useUser';
import { cn } from '@/lib/utils';
import Particles from '@tsparticles/react';
import { loadFull } from 'tsparticles';
import imageCompression from 'browser-image-compression';

import {
  collection,
  addDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  Timestamp,
  doc,
  deleteDoc,
  updateDoc
} from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db } from '../config/firbaseConfig';

const ELEMENTS = [
  { key: 'earth', emoji: '🌱', title: 'קורסי אדמה', description: 'פעילויות המקדמות יציבות, חיבור לאדמה ולעבודה עם חומרים טבעיים.', color: 'from-green-600 to-emerald-500', lightColor: 'bg-green-100', sound: '/sounds/earth.mp3' },
  { key: 'metal', emoji: '⚒️', title: 'קורסי מתכת', description: 'עיסוק בטכניקות מדויקות, פיתוח מיומנויות ועבודת ידיים.', color: 'from-gray-600 to-slate-500', lightColor: 'bg-gray-100', sound: '/sounds/metal.mp3' },
  { key: 'air', emoji: '💨', title: 'קורסי אוויר', description: 'תכנים המעודדים חשיבה יצירתית, מדיטציה ותודעה.', color: 'from-blue-500 to-cyan-400', lightColor: 'bg-blue-100', sound: '/sounds/air.mp3' },
  { key: 'water', emoji: '💧', title: 'קורסי מים', description: 'תכנים העוסקים ברגש, ביטוי אישי וזרימה פנימית.', color: 'from-indigo-500 to-purple-400', lightColor: 'bg-indigo-100', sound: '/sounds/water.mp3' },
  { key: 'fire', emoji: '🔥', title: 'קורסי אש', description: 'פעילויות עם אנרגיה גבוהה, יצירה נלהבת ומוטיבציה.', color: 'from-red-600 to-orange-500', lightColor: 'bg-red-100', sound: '/sounds/fire.mp3' },
];

const ElementalProjects = () => {
  const { user } = useUser();
  const isAdmin = user?.role === 'admin';
  const formRef = useRef(null);
  const fileInputRef = useRef(null);
  const storage = getStorage();

  const [selectedElement, setSelectedElement] = useState('earth');
  const [projectsMap, setProjectsMap] = useState({});
  const [newProject, setNewProject] = useState({ title: '', location: '', date: '', image: '', description: '' });
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState(null);
  const [notification, setNotification] = useState({ show: false, message: '', type: 'success' });
  const [formErrors, setFormErrors] = useState({});
  const [imagePreview, setImagePreview] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);

  const controls = useAnimation();
  const elementData = ELEMENTS.find((el) => el.key === selectedElement);

  // Play sound on element change
  useEffect(() => {
    const audio = new Audio(elementData.sound);
    audio.volume = 0.25;

    const playAudio = () => {
      audio.play().catch(() => console.warn("🔇 Autoplay blocked"));
    };

    playAudio();
  }, [selectedElement]);

  // Load projects for the selected element
  useEffect(() => {
    setLoading(true);
    const q = query(
      collection(db, 'elemental_projects'),
      where('element', '==', selectedElement),
      orderBy('created_at', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({...doc.data(), id: doc.id}));
      setProjectsMap((prev) => ({ ...prev, [selectedElement]: docs }));
      setLoading(false);
    });

    return () => unsubscribe();
  }, [selectedElement]);

  // Handle outside click to close form
  useEffect(() => {
    if (!isFormVisible) return;

    const handleClickOutside = (event) => {
      if (formRef.current && !formRef.current.contains(event.target)) {
        setIsFormVisible(false);
        resetForm();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isFormVisible]);

  // Animate particles when element changes
  useEffect(() => {
    controls.start({
      scale: [1, 1.05, 1],
      transition: { duration: 0.5 }
    });
  }, [selectedElement, controls]);

  const resetForm = () => {
    setNewProject({ title: '', location: '', date: '', image: '', description: '' });
    setImagePreview('');
    setFormErrors({});
    setIsEditMode(false);
  };

  const validateForm = () => {
    const errors = {};
    if (!newProject.title) errors.title = 'נדרשת כותרת';
    if (!newProject.location) errors.location = 'נדרש מיקום';
    if (!newProject.date) errors.date = 'נדרש תאריך';
    if (!newProject.description) errors.description = 'נדרש תיאור';
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmitProject = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);

    const projectData = {
      ...newProject,
      element: selectedElement,
      updated_at: Timestamp.now(),
    };

    // If not in edit mode, add creation metadata
    if (!isEditMode) {
      projectData.created_at = Timestamp.now();
      projectData.created_by = user?.email || 'anonymous';
    }

    try {
      if (isEditMode && newProject.id) {
        // Remove id from projectData (not needed for update)
        const { id, ...dataToUpdate } = projectData;
        await updateProject(id, dataToUpdate);
      } else {
        await addDoc(collection(db, 'elemental_projects'), projectData);
      }
      
      resetForm();
      setIsFormVisible(false);
      setNotification({
        show: true,
        message: isEditMode ? 'הפרויקט עודכן בהצלחה!' : 'הפרויקט נוסף בהצלחה!',
        type: 'success'
      });
      
      setTimeout(() => setNotification({ show: false, message: '', type: 'success' }), 3000);
    } catch (error) {
      console.error(`❌ Error ${isEditMode ? 'updating' : 'adding'} project:`, error);
      setNotification({
        show: true,
        message: isEditMode ? 'שגיאה בעדכון הפרויקט' : 'שגיאה בהוספת הפרויקט',
        type: 'error'
      });
      setTimeout(() => setNotification({ show: false, message: '', type: 'error' }), 3000);
    } finally {
      setIsSubmitting(false);
    }
  };

  const deleteProject = async (id) => {
    if (!id) return;
    if (!confirm('האם אתה בטוח שברצונך למחוק את הפרויקט?')) return;

    try {
      await deleteDoc(doc(db, 'elemental_projects', id));
      setNotification({
        show: true,
        message: 'הפרויקט נמחק בהצלחה',
        type: 'success'
      });
      
      // If the deleted project is currently selected, close the modal
      if (selectedProject && selectedProject.id === id) {
        setSelectedProject(null);
      }
      
      setTimeout(() => setNotification({ show: false, message: '', type: 'success' }), 3000);
    } catch (error) {
      console.error('Error deleting project:', error);
      setNotification({
        show: true,
        message: 'שגיאה במחיקת הפרויקט',
        type: 'error'
      });
      setTimeout(() => setNotification({ show: false, message: '', type: 'error' }), 3000);
    }
  };

  const updateProject = async (id, updatedFields) => {
    if (!id || !updatedFields) return;

    try {
      const projectRef = doc(db, 'elemental_projects', id);
      await updateDoc(projectRef, updatedFields);
      return true;
    } catch (error) {
      console.error('Error updating project:', error);
      throw error;
    }
  };

  const handleEditProject = (project) => {
    setNewProject({...project});
    setImagePreview(project.image || '');
    setIsEditMode(true);
    setIsFormVisible(true);
    
    // If the element of the project differs from the current selected element, 
    // switch to that element
    if (project.element !== selectedElement) {
      setSelectedElement(project.element);
    }
  };

  const handleImageChange = (e) => {
    const url = e.target.value;
    setNewProject({ ...newProject, image: url });
    setImagePreview(url);
  };
  
  const handleFileSelect = () => {
    fileInputRef.current.click();
  };
  

const handleFileUpload = async (e) => {
  const file = e.target.files[0];
  if (!file) return;

  // Check file type
  if (!file.type.startsWith('image/')) {
    setNotification({
      show: true,
      message: 'יש לבחור קובץ תמונה בלבד',
      type: 'error'
    });
    setTimeout(() => setNotification({ show: false, message: '', type: 'error' }), 3000);
    return;
  }

  // Check raw file size (limit to 5MB)
  if (file.size > 5 * 1024 * 1024) {
    setNotification({
      show: true,
      message: 'גודל התמונה חייב להיות עד 5MB',
      type: 'error'
    });
    setTimeout(() => setNotification({ show: false, message: '', type: 'error' }), 3000);
    return;
  }

  try {
    setIsUploading(true);
    setUploadProgress(0);

    // Compress + resize
    const compressed = await imageCompression(file, {
      maxWidthOrHeight: 1200,
      maxSizeMB: 1,
      useWebWorker: true
    });

    // Local preview (use compressed blob)
    const localPreview = URL.createObjectURL(compressed);
    setImagePreview(localPreview);

    // Create storage reference
    const timestamp = Date.now();
    const storageRef = ref(storage, `project_images/${user.uid}_${timestamp}_${file.name}`);

    // Simulated upload progress
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 90) {
          clearInterval(interval);
          return 90;
        }
        return prev + 10;
      });
    }, 300);

    // Upload
    await uploadBytes(storageRef, compressed);
    clearInterval(interval);
    setUploadProgress(100);

    // Get URL
    const downloadURL = await getDownloadURL(storageRef);
    setNewProject({ ...newProject, image: downloadURL });

    // Toast
    setNotification({
      show: true,
      message: 'התמונה הועלתה בהצלחה',
      type: 'success'
    });
    setTimeout(() => setNotification({ show: false, message: '', type: 'success' }), 3000);

  } catch (error) {
    console.error('Error uploading image:', error);
    setNotification({
      show: true,
      message: 'שגיאה בהעלאת התמונה',
      type: 'error'
    });
    setTimeout(() => setNotification({ show: false, message: '', type: 'error' }), 3000);
  } finally {
    setIsUploading(false);
  }
};


  const formatDate = (date) => {
    try {
      return typeof date === 'string'
        ? new Date(date).toLocaleDateString('he-IL')
        : date?.toDate?.().toLocaleDateString('he-IL') || '';
    } catch {
      return '';
    }
  };

  return (
    <Layout>
      <div className={`min-h-screen pt-20 pb-10 px-4 bg-gradient-to-br ${elementData.color} relative overflow-hidden`} dir="rtl">
        <Particles
          id="particles"
          init={loadFull}
          options={{
            fullScreen: false,
            background: { color: "transparent" },
            particles: {
              color: { value: "#ffffff" },
              number: { value: 30 },
              size: { value: { min: 1, max: 3 } },
              move: { 
                enable: true, 
                speed: 0.8,
                direction: "none",
                random: true,
                straight: false,
                outMode: "out"
              },
              opacity: { value: 0.4 },
            },
            interactivity: {
              events: {
                onHover: {
                  enable: true,
                  mode: "repulse"
                }
              }
            }
          }}
          className="absolute inset-0 z-0"
        />

        <motion.div 
          className="max-w-6xl mx-auto relative z-10"
          animate={controls}
        >
          <motion.div 
            className="p-6 text-white mb-6"
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <motion.h1 
              className="text-3xl md:text-5xl font-bold flex items-center gap-3"
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              <span className="text-5xl md:text-6xl">{elementData.emoji}</span> 
              {elementData.title}
            </motion.h1>
            <motion.p 
              className="text-lg md:text-xl opacity-90 mt-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.9 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              {elementData.description}
            </motion.p>
          </motion.div>

          {/* Tabs */}
          <div className="flex justify-center mb-10">
            <motion.div 
              className="bg-white/80 p-2 rounded-full shadow-lg flex gap-2 backdrop-blur-md"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              {ELEMENTS.map(({ key, emoji, title }) => (
                <motion.button 
                  key={key} 
                  onClick={() => setSelectedElement(key)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={cn('px-4 py-3 rounded-full font-bold text-sm transition-all',
                    selectedElement === key
                      ? 'text-white bg-gradient-to-br shadow-md ' + ELEMENTS.find(el => el.key === key).color
                      : 'text-gray-700 hover:bg-gray-100')}
                >
                  <span className="text-lg mr-1">{emoji}</span> {title}
                </motion.button>
              ))}
            </motion.div>
          </div>

          {/* Notification */}
          <AnimatePresence>
            {notification.show && (
              <motion.div 
                className={`fixed top-6 left-1/2 transform -translate-x-1/2 z-50 py-3 px-6 rounded-full shadow-lg flex items-center gap-2 ${
                  notification.type === 'success' ? 'bg-green-500' : 'bg-red-500'
                } text-white`}
                initial={{ y: -50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -50, opacity: 0 }}
              >
                {notification.type === 'success' ? (
                  <Check className="w-5 h-5" />
                ) : (
                  <AlertCircle className="w-5 h-5" />
                )}
                {notification.message}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Admin Form */}
          <AnimatePresence>
            {isAdmin && isFormVisible && (
              <motion.div 
                className="max-w-2xl mx-auto mb-12"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
              >
                <div 
                  ref={formRef}
                  className="bg-white p-6 rounded-xl shadow-lg border border-white/20 backdrop-blur-md"
                >
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-800">
                      {isEditMode ? 'ערוך פרויקט' : 'הוסף פרויקט'} {elementData.emoji}
                    </h2>
                    <button 
                      onClick={() => {
                        setIsFormVisible(false);
                        resetForm();
                      }}
                      className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      <X className="w-6 h-6" />
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">כותרת</label>
                        <input 
                          type="text" 
                          placeholder="שם הפרויקט" 
                          className={`p-3 border rounded-lg w-full focus:ring-2 focus:outline-none ${
                            formErrors.title ? 'border-red-500 focus:ring-red-200' : `border-gray-300 focus:ring-${selectedElement}-200`
                          }`}
                          value={newProject.title} 
                          onChange={(e) => {
                            setNewProject({ ...newProject, title: e.target.value });
                            if (formErrors.title) setFormErrors({...formErrors, title: null});
                          }} 
                        />
                        {formErrors.title && <p className="mt-1 text-sm text-red-500">{formErrors.title}</p>}
                      </div>

                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">מיקום</label>
                        <input 
                          type="text" 
                          placeholder="היכן מתקיים" 
                          className={`p-3 border rounded-lg w-full focus:ring-2 focus:outline-none ${
                            formErrors.location ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 focus:ring-blue-200'
                          }`}
                          value={newProject.location} 
                          onChange={(e) => {
                            setNewProject({ ...newProject, location: e.target.value });
                            if (formErrors.location) setFormErrors({...formErrors, location: null});
                          }} 
                        />
                        {formErrors.location && <p className="mt-1 text-sm text-red-500">{formErrors.location}</p>}
                      </div>

                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">תאריך</label>
                        <input 
                          type="date" 
                          className={`p-3 border rounded-lg w-full focus:ring-2 focus:outline-none ${
                            formErrors.date ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 focus:ring-blue-200'
                          }`}
                          value={newProject.date} 
                          onChange={(e) => {
                            setNewProject({ ...newProject, date: e.target.value });
                            if (formErrors.date) setFormErrors({...formErrors, date: null});
                          }} 
                        />
                        {formErrors.date && <p className="mt-1 text-sm text-red-500">{formErrors.date}</p>}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">תמונה</label>
                        <div className="flex gap-2">
                          <div className="relative flex-1">
                            <input 
                              type="text" 
                              placeholder="קישור לתמונה" 
                              className="p-3 pl-10 border rounded-lg w-full focus:ring-2 focus:ring-blue-200 focus:outline-none border-gray-300"
                              value={newProject.image} 
                              onChange={handleImageChange} 
                            />
                            <ImageIcon className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                          </div>
                          <button
                            type="button"
                            onClick={handleFileSelect}
                            className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg flex items-center gap-2 border border-gray-300"
                          >
                            <Upload className="w-5 h-5" /> העלה
                          </button>
                          <input 
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleFileUpload}
                          />
                        </div>
                        
                        {/* Upload Progress */}
                        {isUploading && (
                          <div className="mt-3">
                            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                              <div 
                                className={`h-full bg-gradient-to-r ${elementData.color}`}
                                style={{ width: `${uploadProgress}%` }}
                              ></div>
                            </div>
                            <p className="text-sm text-gray-600 mt-1 text-center">{uploadProgress}% מועלה...</p>
                          </div>
                        )}
                      </div>
                    </div>

                    <div>
                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">תיאור מלא</label>
                        <textarea 
                          placeholder="פרטים על הפרויקט" 
                          className={`p-3 border rounded-lg w-full h-40 resize-none focus:ring-2 focus:outline-none ${
                            formErrors.description ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 focus:ring-blue-200'
                          }`}
                          value={newProject.description} 
                          onChange={(e) => {
                            setNewProject({ ...newProject, description: e.target.value });
                            if (formErrors.description) setFormErrors({...formErrors, description: null});
                          }} 
                        />
                        {formErrors.description && <p className="mt-1 text-sm text-red-500">{formErrors.description}</p>}
                      </div>

                      {(imagePreview || newProject.image) && (
                        <div className="mt-2 border rounded-lg overflow-hidden relative aspect-video">
                          <img 
                            src={imagePreview || newProject.image} 
                            alt="תצוגה מקדימה" 
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = '/placeholder-image.jpg';
                            }}
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex justify-end gap-3">
                    <button 
                      onClick={() => {
                        setIsFormVisible(false);
                        resetForm();
                      }} 
                      className="px-6 py-2 rounded-lg font-medium text-gray-600 hover:bg-gray-100"
                    >
                      ביטול
                    </button>
                    <button 
                      onClick={handleSubmitProject} 
                      disabled={isSubmitting}
                      className={`bg-gradient-to-r ${elementData.color} text-white px-8 py-2 rounded-lg font-bold flex items-center gap-2 hover:opacity-90 transition-opacity ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
                    >
                      {isSubmitting ? (
                        <>
                          <span className="inline-block w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                          {isEditMode ? 'מעדכן...' : 'מוסיף...'}
                        </>
                      ) : (
                        <>
                          {isEditMode ? <Check className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                          {isEditMode ? 'עדכן פרויקט' : 'הוסף פרויקט'}
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        {/* Project Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {isAdmin && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.4 }}
              >
                <button
                  onClick={() => setIsFormVisible(true)}
                  className={`bg-white/90 rounded-xl p-5 text-center flex flex-col items-center justify-center h-full w-full border-2 border-dashed ${elementData.lightColor} hover:bg-white transition-all duration-300 min-h-[200px]`}
                >
                  <Plus className={`w-12 h-12 mb-3 text-${selectedElement === 'metal' ? 'gray' : selectedElement}-500`} />
                  <span className="font-bold text-gray-800 text-lg">הוסף פרויקט חדש</span>
                </button>
              </motion.div>
            )}

            {loading ? (
              // Loading skeletons
              Array(3).fill(0).map((_, index) => (
                <motion.div
                  key={`skeleton-${index}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.1 * index }}
                  className="bg-white/30 rounded-xl p-6 animate-pulse h-[200px]"
                />
              ))
            ) : (
              // Actual projects
              (projectsMap[selectedElement] || []).map((project, index) => (
                <motion.div
                  key={project.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * index, duration: 0.4 }}
                  whileHover={{ y: -5, transition: { duration: 0.2 } }}
                  className="bg-white/90 rounded-xl overflow-hidden shadow-lg flex flex-col transition-all duration-300 hover:shadow-xl"
                  onClick={() => setSelectedProject(project)}
                >
                  <div className="w-full h-[255px] flex items-center justify-center bg-green-100">
                    {project.image ? (
                      <img
                        src={project.image}
                        alt={project.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = '/placeholder-image.jpg';
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-green-100">
                        <span className="text-6xl">{elementData.emoji}</span>
                      </div>
                    )}
                  </div>

                  <div className="p-5 flex-1 flex flex-col">
                    <h3 className="font-bold text-xl text-gray-800 mb-2">{project.title}</h3>
                    <div className="flex items-center text-gray-600 mb-1">
                      <MapPin className="w-4 h-4 ml-1 flex-shrink-0" />
                      <span className="text-sm truncate">{project.location}</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <Calendar className="w-4 h-4 ml-1 flex-shrink-0" />
                      <span className="text-sm">{formatDate(project.date)}</span>
                    </div>
                    <p className="mt-3 text-gray-600 line-clamp-3 text-sm flex-1">
                      {project.description}
                    </p>
                    
                    {isAdmin && (
                      <div className="flex justify-end mt-4 gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditProject(project);
                          }}
                          className="p-2 rounded-full hover:bg-gray-100 text-gray-600"
                        >
                          <Edit className="w-5 h-5" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteProject(project.id);
                          }}
                          className="p-2 rounded-full hover:bg-red-100 text-red-600"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))
            )}
          </div>

          {/* Project Details Modal */}
          <AnimatePresence>
            {selectedProject && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/60 z-50 flex justify-center items-center p-4"
                onClick={() => setSelectedProject(null)}
              >
                <motion.div
                  initial={{ y: 50, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: 50, opacity: 0 }}
                  transition={{ type: "spring", damping: 25 }}
                  className="bg-white rounded-xl max-w-3xl w-full max-h-[90vh] overflow-hidden shadow-xl"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="relative aspect-video">
                    {selectedProject.image ? (
                      <img 
                        src={selectedProject.image} 
                        alt={selectedProject.title} 
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = '/placeholder-image.jpg';
                        }}
                      />
                    ) : (
                      <div className={`w-full h-full flex items-center justify-center ${elementData.lightColor}`}>
                        <span className="text-6xl">{elementData.emoji}</span>
                      </div>
                    )}
                    <button
                      onClick={() => setSelectedProject(null)}
                      className="absolute top-4 right-4 bg-black/40 text-white rounded-full p-2 hover:bg-black/60 transition-colors"
                    >
                      <X className="w-6 h-6" />
                    </button>
                  </div>
                  <div className="p-6 max-h-[calc(90vh-35vh)] overflow-y-auto">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-3xl">{ELEMENTS.find(el => el.key === selectedProject.element)?.emoji}</span>
                      <h2 className="text-2xl font-bold text-gray-800">{selectedProject.title}</h2>
                    </div>
                    <div className="flex flex-wrap gap-4 mb-5">
                      <div className="flex items-center text-gray-600">
                        <MapPin className="w-5 h-5 ml-1" />
                        <span>{selectedProject.location}</span>
                      </div>
                      <div className="flex items-center text-gray-600">
                        <Calendar className="w-5 h-5 ml-1" />
                        <span>{formatDate(selectedProject.date)}</span>
                      </div>
                    </div>
                    <div className="prose max-w-none">
                      <p className="whitespace-pre-line">{selectedProject.description}</p>
                    </div>
                    
                    {isAdmin && (
                      <div className="mt-6 flex justify-end gap-3">
                        <button
                          onClick={() => {
                            handleEditProject(selectedProject);
                            setSelectedProject(null);
                          }}
                          className="flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                        >
                          <Edit className="w-5 h-5" /> ערוך
                        </button>
                        <button
                          onClick={() => {
                            deleteProject(selectedProject.id);
                            setSelectedProject(null);
                          }}
                          className="flex items-center gap-2 px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                        >
                          <Trash2 className="w-5 h-5" /> מחק
                        </button>
                      </div>
                    )}
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </Layout>
  );
};

export default ElementalProjects;