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

const cardVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.7 },
  }),
  exit: { opacity: 0, y: -30, transition: { duration: 0.5 } },
};

const tabVariants = {
  inactive: { scale: 0.95, opacity: 0.7 },
  active: { scale: 1, opacity: 1 },
};

const particlesInit = async (main) => {
  await loadFull(main);
};

const ElementCircle = ({ emoji, isActive, element }) => {
  const elementData = ELEMENTS.find((el) => el.key === element);
  return (
    <motion.div
      className={cn(
        "flex items-center justify-center rounded-full w-10 h-10 text-xl shadow-md",
        isActive ? `bg-gradient-to-br ${elementData.color} text-white` : "bg-white"
      )}
      variants={tabVariants}
      initial="inactive"
      animate={isActive ? "active" : "inactive"}
    >
      {emoji}
    </motion.div>
  );
};

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
    audio.play();
  }, [selectedElement]);

  useEffect(() => {
    const fetchProjects = async () => {
      const q = query(
        collection(db, 'elemental_projects'),
        where('element', '==', selectedElement),
        orderBy('created_at', 'desc')
      );
      const snapshot = await getDocs(q);
      const docs = snapshot.docs.map(doc => doc.data());

      setProjectsMap((prev) => ({
        ...prev,
        [selectedElement]: docs,
      }));
    };

    fetchProjects();
  }, [selectedElement]);

  const handleAddProject = async () => {
    if (!newProject.title) return;

    try {
      await addDoc(collection(db, "elemental_projects"), {
        ...newProject,
        element: selectedElement,
        created_at: new Date().toISOString(),
        created_by: user?.email || "anonymous",
      });

      setProjectsMap((prev) => ({
        ...prev,
        [selectedElement]: [...(prev[selectedElement] || []), newProject],
      }));
      setNewProject({ title: '', location: '', date: '', image: '' });
      setIsFormVisible(false);
    } catch (error) {
      console.error("Error saving project:", error);
      alert("שגיאה בעת שמירת הפרויקט");
    }
  };

  return (
    <Layout>
      <div
        dir="rtl"
        className={cn(
          "min-h-screen pt-20 pb-10 px-4 transition-colors duration-700 relative overflow-hidden",
          "bg-gradient-to-br", elementData.color
        )}
      >
        <Particles
          id="particles"
          init={particlesInit}
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
            <motion.h1 className="text-3xl md:text-5xl font-bold font-[Assistant] mb-2">
              {elementData.emoji} {elementData.title}
            </motion.h1>
            <motion.p className="text-lg md:text-xl max-w-2xl opacity-90">
              {elementData.description}
            </motion.p>
          </div>

          <div className="flex justify-center mb-6">
            <div className="bg-white/80 backdrop-blur-lg p-2 rounded-full shadow-lg flex gap-2">
              {ELEMENTS.map(({ key, emoji, title }) => (
                <button
                  key={key}
                  onClick={() => setSelectedElement(key)}
                  className={cn(
                    'relative flex items-center gap-2 px-4 py-2 rounded-full font-bold text-sm md:text-base transition-all',
                    selectedElement === key ? 'text-white shadow-md' : 'text-gray-700 hover:bg-gray-100'
                  )}
                >
                  {selectedElement === key && (
                    <motion.div
                      className={`absolute inset-0 rounded-full bg-gradient-to-br ${ELEMENTS.find(el => el.key === key).color}`}
                      layoutId="activeTabBackground"
                      initial={false}
                      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    />
                  )}
                  <span className="relative z-10 flex items-center gap-1">
                    <ElementCircle emoji={emoji} isActive={selectedElement === key} element={key} />
                    <span>{title}</span>
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Admin Project Form */}
          {isAdmin && isFormVisible && (
            <div className="max-w-2xl mx-auto mt-4 bg-white p-6 rounded-xl shadow-md border mb-8">
              <h2 className="text-xl font-bold mb-4">פרויקט חדש ({elementData.title})</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <input
                  type="text"
                  placeholder="כותרת"
                  className="p-3 border rounded"
                  value={newProject.title}
                  onChange={(e) => setNewProject({ ...newProject, title: e.target.value })}
                />
                <input
                  type="text"
                  placeholder="מיקום"
                  className="p-3 border rounded"
                  value={newProject.location}
                  onChange={(e) => setNewProject({ ...newProject, location: e.target.value })}
                />
                <input
                  type="text"
                  placeholder="תאריך"
                  className="p-3 border rounded"
                  value={newProject.date}
                  onChange={(e) => setNewProject({ ...newProject, date: e.target.value })}
                />
                <input
                  type="text"
                  placeholder="קישור לתמונה"
                  className="p-3 border rounded"
                  value={newProject.image}
                  onChange={(e) => setNewProject({ ...newProject, image: e.target.value })}
                />
              </div>
              <button
                onClick={handleAddProject}
                className={`mt-2 px-6 py-2 bg-gradient-to-r ${elementData.color} text-white rounded font-bold`}
              >
                הוסף פרויקט
              </button>
            </div>
          )}

          {/* Projects Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence mode="wait">
              {(projectsMap[selectedElement] || []).map((project, index) => (
                <motion.div
                  key={index}
                  custom={index}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  variants={cardVariants}
                  layout
                >
                  <Tilt glareEnable={true} scale={1.02} glareMaxOpacity={0.1}>
                    <Card className="h-full overflow-hidden rounded-2xl bg-white shadow-md hover:shadow-xl transition-all duration-300 group border-0">
                      <div className="h-48 relative overflow-hidden">
                        <img src={project.image} alt={project.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out" />
                        <div className={`absolute top-4 right-4 ${elementData.lightColor} p-2 rounded-full`}>
                          <span className="text-xl">{elementData.emoji}</span>
                        </div>
                      </div>
                      <CardContent className="p-5">
                        <h3 className="text-xl font-bold text-gray-800">{project.title}</h3>
                        <div className="mt-2 text-gray-600 space-y-1 text-sm">
                          <div className="flex items-center gap-2"><MapPin className="w-4 h-4 text-gray-500" />{project.location}</div>
                          <div className="flex items-center gap-2"><Calendar className="w-4 h-4 text-gray-500" />{project.date}</div>
                        </div>
                        <div className="mt-4">
                          <button className={`w-full px-4 py-2 text-sm bg-gradient-to-r ${elementData.color} text-white rounded-xl font-bold flex items-center justify-center gap-2 group-hover:shadow-lg transition-all duration-300 hover:translate-y-[-2px]`}>
                            <span>לקריאה נוספת</span>
                            <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                          </button>
                        </div>
                      </CardContent>
                    </Card>
                  </Tilt>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>

        {/* Floating Add FAB */}
        {isAdmin && (
          <button
            onClick={() => setIsFormVisible(!isFormVisible)}
            className={cn(
              'fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full shadow-xl transition-all duration-300',
              isFormVisible
                ? 'bg-gray-300 text-gray-800 hover:bg-gray-400'
                : `bg-gradient-to-br ${elementData.color} text-white hover:scale-110`
            )}
            aria-label="Add Project"
          >
            {isFormVisible ? <X className="w-6 h-6 mx-auto" /> : <Plus className="w-6 h-6 mx-auto" />}
          </button>
        )}
      </div>
    </Layout>
  );
};

export default ElementalProjects;
