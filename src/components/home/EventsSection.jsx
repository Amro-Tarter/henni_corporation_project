import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, X } from "lucide-react";
import CTAButton from "@/components/CTAButton";
import { db } from "@/config/firbaseConfig";
import { collection, getDocs } from "firebase/firestore";
import ElementalLoader from "@/theme/ElementalLoader";

// Theme per element
const elementStyles = {
  earth: { color: "from-green-600 to-emerald-500", text: "text-green-700", lightBg: "bg-green-50" },
  fire: { color: "from-red-600 to-orange-500", text: "text-red-700", lightBg: "bg-red-50" },
  water: { color: "from-indigo-500 to-purple-400", text: "text-indigo-700", lightBg: "bg-indigo-50" },
  air: { color: "from-blue-500 to-cyan-400", text: "text-blue-700", lightBg: "bg-blue-50" },
  metal: { color: "from-gray-600 to-slate-500", text: "text-gray-700", lightBg: "bg-gray-50" },
};

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.15, duration: 0.6, ease: "easeOut" },
  }),
};

const formatDate = (date) => {
  if (!date) return "";
  try {
    const d = typeof date === "string" ? new Date(date) : date.toDate();
    return d.toLocaleDateString("he-IL", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return "";
  }
};

const ProjectModal = ({ project, onClose }) => {
  const theme = elementStyles[project.element] || elementStyles.earth;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="bg-white rounded-2xl max-w-xl w-full p-6 relative shadow-xl">
        <button onClick={onClose} className="absolute top-4 left-4 text-gray-500 hover:text-black">
          <X size={24} />
        </button>
        <div className="mb-4">
          <img src={project.image} alt={project.title} className="w-full h-64 object-cover rounded-xl" />
        </div>
        <h3 className="text-2xl font-bold mb-2 text-gray-800">{project.title}</h3>
        <p className="text-gray-600 text-sm mb-2">{project.location} • {formatDate(project.date)}</p>
        <p className="text-gray-700 text-base leading-relaxed whitespace-pre-line">
          {project.description || "אין תיאור זמין לפרויקט זה."}
        </p>
      </div>
    </div>
  );
};

const ProjectCard = ({ title, date, location, image, element, index, onDetails }) => {
  const theme = elementStyles[element] || elementStyles.earth;
  return (
    <motion.div
      custom={index}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
      variants={cardVariants}
    >
      <Card className={`overflow-hidden rounded-3xl shadow-md hover:shadow-xl transition-all duration-300 group border ${theme.lightBg}`}>
        <div className="h-64 relative overflow-hidden">
          <img
            src={image}
            alt={title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        </div>
        <CardContent className="p-6">
          <div className={`flex items-center mb-2 ${theme.text}`}>
            <Calendar size={18} className="mr-2" />
            <span className="text-sm font-medium">{formatDate(date)}</span>
          </div>
          <h3 className="text-2xl font-bold text-gray-800 mb-1 leading-snug">{title}</h3>
          <p className="text-gray-600 text-base mb-6">{location}</p>
          <Button
            variant="outline"
            onClick={onDetails}
            className={`w-full ${theme.text} border hover:shadow-md hover:bg-opacity-10 transition-all duration-300`}
          >
            פרטים נוספים
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
};

const EventsSection = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState(null);

  const getRandomSubset = (array, count) => {
    const shuffled = [...array].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  };

  const fetchProjects = async () => {
    try {
      const snapshot = await getDocs(collection(db, "elemental_projects"));
      const allDocs = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      const randomProjects = getRandomSubset(allDocs, 3);
      setProjects(randomProjects);
    } catch (error) {
      console.error("❌ Error fetching projects:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  return (
    <section 
    className="relative py-20 md:py-28 bg-gradient-to-tr from-cyan-100 to-blue-200 overflow-hidden"
     id="projects" dir="rtl">
      <div className="container mx-auto px-4">
        <div className="text-center mb-20">
          <h2 className="font-gveret-levin text-4xl md:text-5xl text-fire-dark mb-6">פרויקטים מהשטח</h2>
          <div className="h-1 w-24 mx-auto bg-fire rounded-full mb-6"></div>
          <p className="text-lg text-gray-700 max-w-2xl mx-auto">
            הצצה לפרויקטים יצירתיים שנולדו מהתכנית – נבחרת אקראית מתוך המאגר.
          </p>
        </div>

        {loading ? (
             <ElementalLoader />
        ) : projects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {projects.map((project, index) => (
              <ProjectCard
                key={project.id}
                index={index}
                {...project}
                onDetails={() => setSelectedProject(project)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center text-gray-500">אין פרויקטים להצגה כרגע.</div>
        )}

        <div className="mt-16 text-center">
          <CTAButton
            href="/projects"
            variant="fire"
            size="lg"
           className="bg-orange-500 hover:bg-orange-600 text-white text-lg px-6 py-3 rounded-xl shadow-lg transition-all duration-300"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="צפו בכל הפרויקטים שלנו – ייפתח בכרטיסייה חדשה"
          >
            צפו בכל הפרויקטים שלנו
          </CTAButton>
        </div>

        {/* Project Details Modal */}
        <AnimatePresence>
          {selectedProject && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center"
            >
              <ProjectModal project={selectedProject} onClose={() => setSelectedProject(null)} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
};

export default EventsSection;
