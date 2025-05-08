import React, { useState, useEffect } from 'react';
import Layout from '../components/layout/layout';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import CTAButton from '../components/CTAButton';
import { cn } from '@/lib/utils';
import { useUser } from '@/hooks/useUser';
import { ChevronRight, MapPin, Calendar, Sparkles } from 'lucide-react';

const ELEMENTS = [
  {
    key: 'earth',
    emoji: '🌱',
    title: 'קורסי אדמה',
    description: 'פעילויות המקדמות יציבות, חיבור לאדמה ולעבודה עם חומרים טבעיים.',
    color: 'from-green-600 to-emerald-500',
    bgGradient: 'from-green-50 to-emerald-50',
    lightColor: 'bg-green-100',
    borderColor: 'border-green-500',
    projects: [
      {
        title: 'גינון קהילתי',
        location: 'המרכז האקולוגי, ירושלים',
        date: '15 במאי, 2025',
        image: '/images/earth1.jpg',
      },
    ],
  },
  {
    key: 'metal',
    emoji: '⚒️',
    title: 'קורסי מתכת',
    description: 'עיסוק בטכניקות מדויקות, פיתוח מיומנויות ועבודת ידיים.',
    color: 'from-gray-600 to-slate-500',
    bgGradient: 'from-gray-50 to-slate-50',
    lightColor: 'bg-gray-100',
    borderColor: 'border-gray-500',
    projects: [
      {
        title: 'מסגרות מתקדמת',
        location: 'מכללת תל חי',
        date: '17 במאי, 2025',
        image: '/images/metal1.jpg',
      },
    ],
  },
  {
    key: 'air',
    emoji: '💨',
    title: 'קורסי אוויר',
    description: 'תכנים המעודדים חשיבה יצירתית, מדיטציה ותודעה.',
    color: 'from-blue-500 to-cyan-400',
    bgGradient: 'from-blue-50 to-cyan-50',
    lightColor: 'bg-blue-100',
    borderColor: 'border-blue-500',
    projects: [
      {
        title: 'סדנת נשימה מודעת',
        location: 'מרחב רוח, מודיעין',
        date: '19 במאי, 2025',
        image: '/images/air1.jpg',
      },
    ],
  },
  {
    key: 'water',
    emoji: '💧',
    title: 'קורסי מים',
    description: 'תכנים העוסקים ברגש, ביטוי אישי וזרימה פנימית.',
    color: 'from-indigo-500 to-purple-400',
    bgGradient: 'from-indigo-50 to-purple-50',
    lightColor: 'bg-indigo-100',
    borderColor: 'border-indigo-500',
    projects: [
      {
        title: 'תרפיה באמנות',
        location: 'המרכז לאמנות, רמת גן',
        date: '24 במאי, 2025',
        image: '/images/water1.jpg',
      },
    ],
  },
  {
    key: 'fire',
    emoji: '🔥',
    title: 'קורסי אש',
    description: 'פעילויות עם אנרגיה גבוהה, יצירה נלהבת ומוטיבציה.',
    color: 'from-red-600 to-orange-500',
    bgGradient: 'from-red-50 to-orange-50',
    lightColor: 'bg-red-100',
    borderColor: 'border-red-500',
    projects: [
      {
        title: 'תיאטרון ובמה',
        location: 'מרכז חניכים, תל אביב',
        date: '29 במאי, 2025',
        image: '/images/fire1.jpg',
      },
    ],
  },
];

const cardVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.7, ease: [0.215, 0.61, 0.355, 1] },
  }),
  exit: { opacity: 0, y: -30, transition: { duration: 0.5 } }
};

const tabVariants = {
  inactive: { scale: 0.95, opacity: 0.7 },
  active: { scale: 1, opacity: 1 }
};

const ElementCircle = ({ emoji, isActive, element }) => {
  const elementData = ELEMENTS.find(el => el.key === element);
  
  return (
    <motion.div 
      className={cn(
        "flex items-center justify-center rounded-full w-12 h-12 text-2xl shadow-md",
        isActive ? `bg-gradient-to-br ${elementData.color} text-white` : "bg-white"
      )}
      variants={tabVariants}
      initial="inactive"
      animate={isActive ? "active" : "inactive"}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      {emoji}
    </motion.div>
  );
};

const ElementalProjects = () => {
  const { user } = useUser(); // Replace with your actual user source
  const [selectedElement, setSelectedElement] = useState('earth');
  const [projectsMap, setProjectsMap] = useState(() =>
    Object.fromEntries(ELEMENTS.map((el) => [el.key, el.projects]))
  );
  const [newProject, setNewProject] = useState({
    title: '',
    location: '',
    date: '',
    image: '',
  });
  const [isFormVisible, setIsFormVisible] = useState(false);

  const handleAddProject = () => {
    if (!newProject.title) return;

    setProjectsMap((prev) => ({
      ...prev,
      [selectedElement]: [...prev[selectedElement], newProject],
    }));

    setNewProject({ title: '', location: '', date: '', image: '' });
    setIsFormVisible(false);
  };

  const elementData = ELEMENTS.find((el) => el.key === selectedElement);

  // Scroll into view when tab changes
  useEffect(() => {
    const projectsSection = document.getElementById('projects-grid');
    if (projectsSection) {
      setTimeout(() => {
        projectsSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }, 100);
    }
  }, [selectedElement]);

  return (
    <Layout>
      <div dir="rtl" className={`min-h-screen pt-20 pb-20  px-4 transition-colors duration-700`}>
        <div className="max-w-6xl mx-auto">
          {/* Hero Section with Element Background */}
          <div className="relative mb-16 overflow-hidden rounded-3xl shadow-xl">
            <div className={`bg-gradient-to-br ${elementData.color} p-10 md:p-16 text-white relative z-10 overflow-hidden`}>
              {/* Decorative Elements */}
              <div className="absolute top-0 left-0 w-full h-full opacity-10">
                <div className="absolute top-10 left-10 w-32 h-32 rounded-full bg-white blur-3xl"></div>
                <div className="absolute bottom-10 right-10 w-40 h-40 rounded-full bg-white blur-3xl"></div>
              </div>
              
              {/* Content */}
              <div className="relative z-20">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                  className="mb-2 inline-block text-4xl"
                >
                  {elementData.emoji}
                </motion.div>
                <motion.h1 
                  className="text-5xl md:text-7xl font-bold mb-6"
                  key={elementData.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.1 }}
                >
                  {elementData.title}
                </motion.h1>
                <motion.p 
                  className="text-xl md:text-2xl max-w-2xl opacity-90"
                  key={elementData.description}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                >
                  {elementData.description}
                </motion.p>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex justify-center mb-16">
            <div className="bg-white/80 backdrop-blur-lg p-2 rounded-full shadow-lg flex gap-2">
              {ELEMENTS.map(({ key, emoji, title }) => (
                <button
                  key={key}
                  onClick={() => setSelectedElement(key)}
                  className={cn(
                    'relative flex items-center gap-2 px-5 py-3 rounded-full font-bold transition-all',
                    selectedElement === key
                      ? 'text-white shadow-lg'
                      : 'text-gray-600 hover:bg-gray-100'
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
                  <span className="relative z-10 flex items-center gap-2">
                    <ElementCircle emoji={emoji} isActive={selectedElement === key} element={key} />
                    <span className={selectedElement === key ? 'text-white' : 'text-gray-700'}>
                      {title}
                    </span>
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Admin Add Project Button */}
          {user?.isAdmin && (
            <div className="mb-8 flex justify-center">
              <button
                onClick={() => setIsFormVisible(!isFormVisible)}
                className={`flex items-center gap-2 px-6 py-3 rounded-full font-bold transition-all ${isFormVisible ? 'bg-gray-200 text-gray-700' : `bg-gradient-to-r ${elementData.color} text-white`} shadow-lg hover:shadow-xl`}
              >
                <Sparkles className="w-5 h-5" />
                {isFormVisible ? 'ביטול' : 'הוספת פרויקט חדש'}
              </button>
            </div>
          )}

          {/* Admin Add Project Form - Animated */}
          <AnimatePresence>
            {user?.isAdmin && isFormVisible && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <motion.div 
                  className={`mb-12 max-w-3xl mx-auto bg-white shadow-lg rounded-2xl p-8 border-t-4 ${elementData.borderColor}`}
                  initial={{ y: -20 }}
                  animate={{ y: 0 }}
                  transition={{ duration: 0.3, delay: 0.1 }}
                >
                  <h3 className="text-2xl font-bold mb-6 flex items-center">
                    <span className="text-2xl ml-2">{elementData.emoji}</span>
                    הוספת פרויקט חדש ({elementData.title})
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">כותרת</label>
                      <input
                        type="text"
                        placeholder="כותרת הפרויקט"
                        className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-offset-2 focus:outline-none"
                        value={newProject.title}
                        onChange={(e) => setNewProject((p) => ({ ...p, title: e.target.value }))}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">מיקום</label>
                      <input
                        type="text"
                        placeholder="היכן יתקיים?"
                        className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-offset-2 focus:outline-none"
                        value={newProject.location}
                        onChange={(e) => setNewProject((p) => ({ ...p, location: e.target.value }))}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">תאריך</label>
                      <input
                        type="text"
                        placeholder="מתי יתקיים?"
                        className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-offset-2 focus:outline-none"
                        value={newProject.date}
                        onChange={(e) => setNewProject((p) => ({ ...p, date: e.target.value }))}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">תמונה</label>
                      <input
                        type="text"
                        placeholder="URL של תמונה"
                        className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-offset-2 focus:outline-none"
                        value={newProject.image}
                        onChange={(e) => setNewProject((p) => ({ ...p, image: e.target.value }))}
                      />
                    </div>
                  </div>
                  <button
                    onClick={handleAddProject}
                    className={`flex items-center gap-2 px-6 py-3 rounded-full font-bold transition-all bg-gradient-to-r ${elementData.color} text-white shadow hover:shadow-lg`}
                  >
                    <Sparkles className="w-5 h-5" />
                    הוסף פרויקט
                  </button>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Cards with Animation */}
          <div id="projects-grid" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <AnimatePresence mode="wait">
              {projectsMap[selectedElement].map((project, index) => (
                <motion.div
                  key={`${selectedElement}-${index}`}
                  custom={index}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  variants={cardVariants}
                  className="h-full"
                  layout
                >
                  <Card className={`h-full overflow-hidden rounded-3xl bg-white shadow-lg hover:shadow-2xl transition-all duration-300 group border-0`}>
                    <div className="h-64 relative overflow-hidden">
                      <img
                        src={project.image || `/api/placeholder/600/400`}
                        alt={project.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                      />
                      <div className={`absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>
                      
                      {/* Floating Element Badge */}
                      <div className={`absolute top-4 right-4 ${elementData.lightColor} p-2 rounded-full`}>
                        <span className="text-xl">{elementData.emoji}</span>
                      </div>
                    </div>
                    
                    <CardContent className="p-6 md:p-8">
                      <div className="flex flex-col h-full">
                        <div className="space-y-4 mb-6">
                          <h3 className="text-2xl font-bold text-gray-800 leading-tight">{project.title}</h3>
                          
                          <div className="flex flex-col gap-2 text-gray-600">
                            <div className="flex items-center gap-2">
                              <MapPin className="w-4 h-4 text-gray-500" />
                              <span>{project.location}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4 text-gray-500" />
                              <span>{project.date}</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="mt-auto">
                          <button
                            className={`w-full px-6 py-3 bg-gradient-to-r ${elementData.color} text-white rounded-xl font-bold flex items-center justify-center gap-2 group-hover:shadow-lg transition-all duration-300 hover:translate-y-[-2px]`}
                          >
                            <span>לקריאה נוספת</span>
                            <ChevronRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                          </button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
          
          {/* Empty State */}
          {projectsMap[selectedElement].length === 0 && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className={`text-center p-16 rounded-xl ${elementData.lightColor} mt-8`}
            >
              <div className="text-5xl mb-4">{elementData.emoji}</div>
              <h3 className="text-2xl font-bold mb-2">אין פרויקטים זמינים כרגע</h3>
              <p className="text-gray-600 mb-6">פרויקטים חדשים יתווספו בקרוב, אנא בדקו שוב מאוחר יותר</p>
              {user?.isAdmin && (
                <button
                  onClick={() => setIsFormVisible(true)}
                  className={`inline-flex items-center gap-2 px-6 py-3 rounded-full font-bold transition-all bg-gradient-to-r ${elementData.color} text-white shadow hover:shadow-lg`}
                >
                  <Sparkles className="w-5 h-5" />
                  הוסיפו את הפרויקט הראשון
                </button>
              )}
            </motion.div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default ElementalProjects;