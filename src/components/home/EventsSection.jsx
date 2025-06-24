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
  hidden: { opacity: 0, y: 20 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.4, ease: "easeOut" },
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
      <div className="bg-white rounded-xl max-w-md w-full p-4 relative shadow-lg">
        <button onClick={onClose} className="absolute top-3 left-3 text-gray-500 hover:text-black">
          <X size={20} />
        </button>
        <div className="mb-3">
          <img src={project.image} alt={project.title} className="w-full h-48 object-cover rounded-lg" />
        </div>
        <h3 className="text-lg font-bold mb-1 text-gray-800">{project.title}</h3>
        <p className="text-gray-600 text-xs mb-2">{project.location} • {formatDate(project.date)}</p>
        <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-line">
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
      <Card className={`overflow-hidden rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 group border ${theme.lightBg}`}>
        <div className="h-48 relative overflow-hidden">
          <img
            src={image}
            alt={title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        </div>
        <CardContent className="p-4">
          <div className={`flex items-center mb-2 ${theme.text}`}>
            <Calendar size={14} className="mr-2" />
            <span className="text-xs font-medium">{formatDate(date)}</span>
          </div>
          <h3 className="text-lg font-bold text-gray-800 mb-1 leading-snug">{title}</h3>
          <p className="text-gray-600 text-sm mb-4">{location}</p>
          <Button
            variant="outline"
            onClick={onDetails}
            className={`w-full text-sm ${theme.text} border hover:shadow-sm hover:bg-opacity-10 transition-all duration-300`}
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
    className="relative py-12 md:py-16 bg-gradient-to-tr from-green-100 to-lime-50 overflow-hidden"
     id="projects" dir="rtl">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="font-gveret-levin font-bold text-5xl md:text-5xl text-emerald-800 mb-4">פרויקטים מהשטח</h2>
          <div className="h-0.5 w-16 mx-auto bg-fire rounded-full mb-4"></div>
          <p className="text-base text-gray-700 max-w-xl mx-auto">
            הצצה לפרויקטים יצירתיים שנולדו מהתכנית – נבחרת אקראית מתוך המאגר.
          </p>
        </div>

        {loading ? (
             <ElementalLoader />
        ) : projects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
          <div className="text-center text-gray-500 text-sm">אין פרויקטים להצגה כרגע.</div>
        )}

        <div className="mt-10 text-center">
          <CTAButton
            href="/projects"
            variant="earth"
            size="md"
           className="bg-green-500 hover:bg-green-600 text-white text-base px-5 py-2 rounded-lg shadow-md transition-all duration-300"
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