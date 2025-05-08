import React, { useState } from 'react';
import Layout from '../components/layout/layout';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import CTAButton from '../components/CTAButton';
import { cn } from '@/lib/utils';
import { useUser } from '@/hooks/useUser'; 

const ELEMENTS = [
  {
    key: 'earth',
    emoji: '🌱',
    title: 'קורסי אדמה',
    description: 'פעילויות המקדמות יציבות, חיבור לאדמה ולעבודה עם חומרים טבעיים.',
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
  hidden: { opacity: 0, y: 30 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.6, ease: 'easeOut' },
  }),
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

  const handleAddProject = () => {
    if (!newProject.title) return;

    setProjectsMap((prev) => ({
      ...prev,
      [selectedElement]: [...prev[selectedElement], newProject],
    }));

    setNewProject({ title: '', location: '', date: '', image: '' });
  };

  const elementData = ELEMENTS.find((el) => el.key === selectedElement);

  return (
    <Layout>
      <div dir="rtl" className="min-h-screen pt-28 pb-20 bg-gradient-to-b from-white to-slate-50 px-4">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold text-center mb-6">{elementData.title}</h1>
          <p className="text-center text-lg text-gray-700 max-w-2xl mx-auto mb-10">{elementData.description}</p>

          {/* Tabs */}
          <div className="flex justify-center flex-wrap gap-4 mb-12">
            {ELEMENTS.map(({ key, emoji, title }) => (
              <button
                key={key}
                onClick={() => setSelectedElement(key)}
                className={cn(
                  'px-5 py-2 rounded-full font-bold transition-all border',
                  selectedElement === key
                    ? 'bg-fire text-white border-fire shadow'
                    : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-100'
                )}
              >
                <span className="text-xl ml-2">{emoji}</span> {title}
              </button>
            ))}
          </div>

          {/* Admin Add Project Form */}
          {user?.isAdmin && (
            <div className="mb-12 max-w-3xl mx-auto bg-white shadow rounded-lg p-6">
              <h3 className="text-xl font-bold mb-4">הוספת פרויקט חדש ({elementData.title})</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <input
                  type="text"
                  placeholder="כותרת"
                  className="border p-2 rounded"
                  value={newProject.title}
                  onChange={(e) => setNewProject((p) => ({ ...p, title: e.target.value }))}
                />
                <input
                  type="text"
                  placeholder="מיקום"
                  className="border p-2 rounded"
                  value={newProject.location}
                  onChange={(e) => setNewProject((p) => ({ ...p, location: e.target.value }))}
                />
                <input
                  type="text"
                  placeholder="תאריך"
                  className="border p-2 rounded"
                  value={newProject.date}
                  onChange={(e) => setNewProject((p) => ({ ...p, date: e.target.value }))}
                />
                <input
                  type="text"
                  placeholder="URL של תמונה"
                  className="border p-2 rounded"
                  value={newProject.image}
                  onChange={(e) => setNewProject((p) => ({ ...p, image: e.target.value }))}
                />
              </div>
              <CTAButton onClick={handleAddProject} variant={selectedElement} size="sm">
                הוסף פרויקט
              </CTAButton>
            </div>
          )}

          {/* Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {projectsMap[selectedElement].map((project, index) => (
              <motion.div
                key={index}
                custom={index}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.2 }}
                variants={cardVariants}
              >
                <Card className="overflow-hidden rounded-3xl bg-white shadow-md hover:shadow-xl transition-all duration-300 group">
                  <div className="h-56 relative overflow-hidden">
                    <img
                      src={project.image}
                      alt={project.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <CardContent className="p-6 text-right">
                    <div className="text-sm text-gray-600 mb-1">{project.date}</div>
                    <h3 className="text-2xl font-bold text-gray-800 mb-1 leading-snug">{project.title}</h3>
                    <p className="text-gray-600 text-base mb-6">{project.location}</p>
                    <CTAButton href="#" variant={selectedElement} size="sm" animated className="w-full">
                      לקריאה נוספת
                    </CTAButton>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ElementalProjects;
