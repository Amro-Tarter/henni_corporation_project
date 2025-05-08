import React, { useState, useEffect } from 'react';
import Layout from '../components/layout/layout';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { useUser } from '@/hooks/useUser';
import { ChevronRight, MapPin, Calendar, Plus, X } from 'lucide-react';
import Particles from '@tsparticles/react';
import { loadFull } from 'tsparticles';
import Tilt from 'react-parallax-tilt';
import { onSnapshot } from 'firebase/firestore';
import { db } from "../config/firbaseConfig";

import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  orderBy
} from 'firebase/firestore';

const ELEMENTS = [
  {
    key: 'earth',
    emoji: '🌱',
    title: 'קורסי אדמה',
    description: 'פעילויות המקדמות יציבות, חיבור לאדמה ולעבודה עם חומרים טבעיים.',
    color: 'from-green-600 to-emerald-500',
    lightColor: 'bg-green-100',
    sound: '/sounds/earth.mp3',
  },
  {
    key: 'metal',
    emoji: '⚒️',
    title: 'קורסי מתכת',
    description: 'עיסוק בטכניקות מדויקות, פיתוח מיומנויות ועבודת ידיים.',
    color: 'from-gray-600 to-slate-500',
    lightColor: 'bg-gray-100',
    sound: '/sounds/metal.mp3',
  },
  {
    key: 'air',
    emoji: '💨',
    title: 'קורסי אוויר',
    description: 'תכנים המעודדים חשיבה יצירתית, מדיטציה ותודעה.',
    color: 'from-blue-500 to-cyan-400',
    lightColor: 'bg-blue-100',
    sound: '/sounds/air.mp3',
  },
  {
    key: 'water',
    emoji: '💧',
    title: 'קורסי מים',
    description: 'תכנים העוסקים ברגש, ביטוי אישי וזרימה פנימית.',
    color: 'from-indigo-500 to-purple-400',
    lightColor: 'bg-indigo-100',
    sound: '/sounds/water.mp3',
  },
  {
    key: 'fire',
    emoji: '🔥',
    title: 'קורסי אש',
    description: 'פעילויות עם אנרגיה גבוהה, יצירה נלהבת ומוטיבציה.',
    color: 'from-red-600 to-orange-500',
    lightColor: 'bg-red-100',
    sound: '/sounds/fire.mp3',
  },
];

const ElementalProjects = () => {
  const { user } = useUser();
  const isAdmin = user?.role === 'admin';

  const [selectedElement, setSelectedElement] = useState('earth');
  const [projectsMap, setProjectsMap] = useState({});
  const [newProject, setNewProject] = useState({ title: '', location: '', date: '', image: '' });
  const [isFormVisible, setIsFormVisible] = useState(false);
  const elementData = ELEMENTS.find((el) => el.key === selectedElement);

  useEffect(() => {
    const audio = new Audio(elementData.sound);
    audio.volume = 0.25;
  
    const playAudio = () => {
      audio.play().catch((e) => {
        console.warn("🔇 Autoplay blocked, waiting for user interaction.");
      });
    };
  
    document.addEventListener("click", playAudio, { once: true });
  
    return () => {
      document.removeEventListener("click", playAudio);
    };
  }, [selectedElement]);
  

  useEffect(() => {
    const q = query(
      collection(db, 'elemental_projects'),
      where('element', '==', selectedElement),
      orderBy('created_at', 'desc')
    );
  
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map((doc) => doc.data());
      console.log(`📡 Real-time: ${docs.length} projects for "${selectedElement}"`);
      setProjectsMap((prev) => ({
        ...prev,
        [selectedElement]: docs
      }));
    });
  
    return () => unsubscribe(); // ✅ Clean up listener
  }, [selectedElement]);
  

  const handleAddProject = async () => {
    if (!newProject.title) return;

    const projectData = {
      ...newProject,
      element: selectedElement,
      created_at: Timestamp.now(),
      created_by: user?.email || "anonymous"
    };

    try {
      await addDoc(collection(db, "elemental_projects"), projectData);
      setProjectsMap((prev) => ({
        ...prev,
        [selectedElement]: [...(prev[selectedElement] || []), projectData],
      }));
      setNewProject({ title: '', location: '', date: '', image: '' });
      setIsFormVisible(false);
    } catch (error) {
      console.error("❌ Error saving project:", error);
    }
  };

  return (
    <Layout>
      <div className={`min-h-screen pt-20 pb-10 px-4 bg-gradient-to-br ${elementData.color} relative`} dir="rtl">
        <Particles
          id="particles"
          init={loadFull}
          options={{
            fullScreen: false,
            background: { color: "transparent" },
            particles: {
              color: { value: "#ffffff" },
              number: { value: 20 },
              size: { value: 2 },
              move: { enable: true, speed: 0.6 },
              opacity: { value: 0.3 },
            },
          }}
          className="absolute inset-0 z-0"
        />

        <div className="max-w-6xl mx-auto relative z-10">
          <div className="p-6 text-white mb-6">
            <motion.h1 className="text-3xl md:text-5xl font-bold">{elementData.emoji} {elementData.title}</motion.h1>
            <motion.p className="text-lg md:text-xl opacity-90">{elementData.description}</motion.p>
          </div>

          {/* Tabs */}
          <div className="flex justify-center mb-6">
            <div className="bg-white/80 p-2 rounded-full shadow-lg flex gap-2">
              {ELEMENTS.map(({ key, emoji, title }) => (
                <button key={key} onClick={() => setSelectedElement(key)}
                  className={cn('px-4 py-2 rounded-full font-bold text-sm transition-all',
                    selectedElement === key ? 'text-white bg-gradient-to-br ' + ELEMENTS.find(el => el.key === key).color : 'text-gray-700 hover:bg-gray-100')}
                >
                  {emoji} {title}
                </button>
              ))}
            </div>
          </div>

          {/* Admin Form */}
          {isAdmin && isFormVisible && (
            <div className="max-w-2xl mx-auto bg-white p-6 rounded-xl shadow mb-6">
              <h2 className="text-xl font-bold mb-4">פרויקט חדש</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <input type="text" placeholder="כותרת" className="p-3 border rounded"
                  value={newProject.title} onChange={(e) => setNewProject({ ...newProject, title: e.target.value })} />
                <input type="text" placeholder="מיקום" className="p-3 border rounded"
                  value={newProject.location} onChange={(e) => setNewProject({ ...newProject, location: e.target.value })} />
                <input type="text" placeholder="תאריך" className="p-3 border rounded"
                  value={newProject.date} onChange={(e) => setNewProject({ ...newProject, date: e.target.value })} />
                <input type="text" placeholder="תמונה (URL)" className="p-3 border rounded"
                  value={newProject.image} onChange={(e) => setNewProject({ ...newProject, image: e.target.value })} />
              </div>
              <button onClick={handleAddProject} className={`bg-gradient-to-r ${elementData.color} text-white px-6 py-2 rounded font-bold`}>
                הוסף פרויקט
              </button>
            </div>
          )}

          {/* Projects Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {(projectsMap[selectedElement] || []).map((project, idx) => (
              <Card key={idx} className="rounded-xl bg-white shadow group overflow-hidden">
                <div className="h-48 relative overflow-hidden">
                  <img src={project.image} alt={project.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                  <div className={`absolute top-4 right-4 ${elementData.lightColor} p-2 rounded-full`}>
                    <span className="text-xl">{elementData.emoji}</span>
                  </div>
                </div>
                <CardContent className="p-4">
                  <h3 className="text-lg font-bold text-gray-800">{project.title}</h3>
                  <div className="mt-2 text-sm text-gray-600">
                    <div className="flex items-center gap-2"><MapPin className="w-4 h-4" />{project.location}</div>
                    <div className="flex items-center gap-2"><Calendar className="w-4 h-4" />{project.date}</div>
                  </div>
                  <button className={`mt-4 w-full bg-gradient-to-r ${elementData.color} text-white py-2 rounded font-bold`}>
                    לקריאה נוספת <ChevronRight className="inline w-4 h-4" />
                  </button>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Fallback UI */}
          {(projectsMap[selectedElement] || []).length === 0 && (
            <div className="text-center text-white mt-6 text-lg">
              לא נמצאו פרויקטים עבור האלמנט הנבחר.
            </div>
          )}
        </div>

        {/* Floating Add FAB */}
        {isAdmin && (
          <button
            onClick={() => setIsFormVisible(!isFormVisible)}
            className={`fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full shadow-xl flex items-center justify-center 
              ${isFormVisible ? 'bg-gray-300 text-gray-800' : `bg-gradient-to-br ${elementData.color} text-white`} transition-transform hover:scale-110`}
          >
            {isFormVisible ? <X className="w-6 h-6" /> : <Plus className="w-6 h-6" />}
          </button>
        )}
      </div>
    </Layout>
  );
};

export default ElementalProjects;