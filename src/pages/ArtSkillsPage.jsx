// src/pages/ArtSkillsPage.jsx
import Layout from '@/components/layout/Layout';
import React, { useEffect, useState } from "react";
import {
  Palette,
  Music,
  PenTool,
  Users,
  // Clapperboard, // Keeping Clapperboard for consistency if it's available. If not, fallback to FontAwesome.
  Plus,
  Edit3,
  Trash2,
  Save,
  X,
  Star,
  Search,
} from "lucide-react";
import { db, auth } from "../config/firbaseConfig";
import {
  collection,
  onSnapshot,
  addDoc,
  deleteDoc,
  updateDoc,
  doc,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { motion } from "framer-motion";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faMasksTheater, // Already used for Theater
  faCameraRetro, // New: for Photography
  faHammer,      // New: for Sculpture/Crafts
  faFilm         // New: for Filmmaking
} from '@fortawesome/free-solid-svg-icons';

/* ---------- icon + colour helpers ---------- */
const ICONS = {
  Paintbrush: Palette,
  Music: Music,
  Theater: (props) => <FontAwesomeIcon icon={faMasksTheater} {...props} />,
  Dance: Users,
  Writing: PenTool,
  Photography: (props) => <FontAwesomeIcon icon={faCameraRetro} {...props} />, // Added Photography
  Sculpture: (props) => <FontAwesomeIcon icon={faHammer} {...props} />,       // Added Sculpture
  Filmmaking: (props) => <FontAwesomeIcon icon={faFilm} {...props} />,         // Added Filmmaking
};

const COLOR_SCHEMES = [
  {
    name: "כחול",
    color: "bg-blue-100 text-blue-800",
    gradient: "from-blue-400 to-indigo-500",
    accent: "bg-blue-500",
  },
  {
    name: "ירוק",
    color: "bg-green-100 text-green-800",
    gradient: "from-green-400 to-emerald-500",
    accent: "bg-green-500",
  },
  {
    name: "סגול",
    color: "bg-purple-100 text-purple-800",
    gradient: "from-purple-400 to-pink-500",
    accent: "bg-purple-500",
  },
  {
    name: "כתום",
    color: "bg-orange-100 text-orange-800",
    gradient: "from-orange-400 to-red-500",
    accent: "bg-orange-500",
  },
  {
    name: "ורוד",
    color: "bg-pink-100 text-pink-800",
    gradient: "from-rose-400 to-fuchsia-500",
    accent: "bg-pink-500",
  },
  {
    name: "שמיים",
    color: "bg-sky-100 text-sky-800",
    gradient: "from-sky-400 to-cyan-500",
    accent: "bg-sky-500",
  },
];

/* ---------- Reusable Section Header Component ---------- */
const SectionHeader = ({ title, subtitle, className = "" }) => (
  <div className={`text-center ${className}`} dir="rtl">
    <motion.h2
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      viewport={{ once: true }}
      className="text-2xl md:text-3xl lg:text-4xl font-bold text-red-800 mb-3 leading-tight"
    >
      {title}
    </motion.h2>
    <motion.div
      initial={{ width: 0 }}
      whileInView={{ width: "4rem" }}
      transition={{ duration: 0.8, delay: 0.2 }}
      viewport={{ once: true }}
      className="h-1 bg-gradient-to-l from-red-600 to-red-500 mx-auto rounded-full mb-3"
    />
    {subtitle && (
      <motion.p
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        viewport={{ once: true }}
        className="text-sm md:text-base text-gray-700 max-w-2xl mx-auto leading-relaxed"
      >
        {subtitle}
      </motion.p>
    )}
  </div>
);

/* ---------- main page ---------- */
const ArtSkillsPage = () => {
  const [skills, setSkills] = useState([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [editingSkillId, setEditingSkillId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [newSkill, setNewSkill] = useState(initialSkill());

  /* -------- Firestore listeners + auth -------- */
  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, (fbUser) => {
      if (!fbUser) return;

      // quick role check (no claims, just the users collection)
      onSnapshot(doc(db, "users", fbUser.uid), (snap) => {
        setIsAdmin(snap.exists() && snap.data().role === "admin");
      });
    });

    // real-time skills
    const unsubSkills = onSnapshot(collection(db, "artSkills"), (snap) => {
      const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setSkills(list);
    });

    return () => {
      unsubAuth();
      unsubSkills();
    };
  }, []);

  /* -------- helpers -------- */
  function initialSkill() {
    const def = COLOR_SCHEMES[0];
    return {
      title: "",
      description: "",
      color: def.color,
      gradient: def.gradient,
      accent: def.accent,
      icon: "Paintbrush", // Default icon name
    };
  }

  /* -------- CRUD actions -------- */
  const handleAddOrUpdateSkill = async () => {
    const scheme =
      COLOR_SCHEMES.find((c) => c.color === newSkill.color) ?? COLOR_SCHEMES[0];
    const payload = {
      title: newSkill.title.trim(),
      description: newSkill.description.trim(),
      color: scheme.color,
      gradient: scheme.gradient,
      accent: scheme.accent,
      iconName: newSkill.icon, // Store icon name
    };

    try {
      if (editingSkillId) {
        await updateDoc(doc(db, "artSkills", editingSkillId), payload);
      } else {
        await addDoc(collection(db, "artSkills"), payload);
      }
      // clear form
      setNewSkill(initialSkill());
      setEditingSkillId(null);
      setShowForm(false);
    } catch (err) {
      console.error("🔥 failed to save skill:", err);
    }
  };

  const handleDeleteSkill = async (id) => {
    try {
      await deleteDoc(doc(db, "artSkills", id));
    } catch (err) {
      console.error("🔥 failed to delete skill:", err);
    }
  };

  const handleEditSkill = (skill) => {
    setNewSkill({
      title: skill.title,
      description: skill.description,
      color: skill.color,
      gradient: skill.gradient,
      accent: skill.accent,
      icon: skill.iconName, // Set icon name for editing
    });
    setEditingSkillId(skill.id);
    setShowForm(true);
  };

  /* -------- derived list -------- */
  const filteredSkills = skills.filter(
    (s) =>
      s.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  /* -------- jsx -------- */
return (
    <Layout>
    <div className="min-h-screen pt-16 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 ">
        {/* -------- Hero -------- */}
        <header className="px-6 py-16 text-center relative">
            <SectionHeader
                title="כישורי אמנות"
                subtitle="גלה את העולם המדהים של יצירה אמנותית וחקור כישורים יחודיים"
                className="mb-10"
            />

            {/* search */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                viewport={{ once: true }}
                className="mt-8 max-w-md mx-auto relative"
            >
                <input
                    dir="rtl"
                    type="text"
                    placeholder="חפש כישור..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-4 py-3 pr-12 rounded-full border border-gray-300 text-gray-900 placeholder-gray-500 shadow-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:outline-none transition-all duration-200"
                />
                <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            </motion.div>
        </header>

        <main className="max-w-7xl mx-auto px-6 pb-24">
            {/* admin add button */}
            {isAdmin && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.6 }}
                    viewport={{ once: true }}
                    className="flex justify-end mb-8"
                >
                    <button
                        onClick={() => {
                            setShowForm(true);
                            setEditingSkillId(null);
                            setNewSkill(initialSkill());
                        }}
                        className="inline-flex items-center gap-2 bg-white text-orange-600 px-6 py-3 rounded-xl font-medium shadow-lg hover:bg-orange-50 transition-all duration-200 hover:scale-[1.02] active:scale-95"
                    >
                        <Plus className="w-5 h-5" />
                        הוסף כישור חדש
                    </button>
                </motion.div>
            )}

            {/* skills grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredSkills.map((skill, idx) => (
                    <FlipCard
                        key={skill.id}
                        skill={skill}
                        index={idx}
                        isAdmin={isAdmin}
                        onEdit={() => handleEditSkill(skill)}
                        onDelete={() => handleDeleteSkill(skill.id)}
                    />
                ))}
            </div>

            {/* no results */}
            {filteredSkills.length === 0 && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    viewport={{ once: true }}
                    className="text-center py-16"
                >
                    <div className="w-24 h-24 mx-auto flex items-center justify-center bg-gray-100 rounded-full mb-4">
                        <Star className="w-12 h-12 text-gray-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                        לא נמצאו כישורים
                    </h3>
                    <p className="text-gray-600">
                        נסה לחפש במילים אחרות או הוסף כישור חדש
                    </p>
                </motion.div>
            )}
        </main>

        {/* modal form */}
        {showForm && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.3 }}
                    className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
                >
                    {/* header */}
                    <div className="p-6 border-b flex items-center justify-between">
                        <h2 className="text-2xl font-bold">
                            {editingSkillId ? "עריכת כישור" : "הוסף כישור חדש"}
                        </h2>
                        <button
                            onClick={() => {
                                setShowForm(false);
                                setEditingSkillId(null);
                                setNewSkill(initialSkill());
                            }}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            <X className="w-5 h-5 text-gray-600" />
                        </button>
                    </div>

                    {/* body */}
                    <div className="p-6 space-y-6">
                        {/* title */}
                        <div>
                            <label className="block mb-2 font-medium text-gray-700">
                                כותרת
                            </label>
                            <input
                                dir="rtl"
                                type="text"
                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
                                value={newSkill.title}
                                onChange={(e) =>
                                    setNewSkill({ ...newSkill, title: e.target.value })
                                }
                            />
                        </div>

                        {/* description */}
                        <div>
                            <label className="block mb-2 font-medium text-gray-700">
                                תיאור
                            </label>
                            <textarea
                                dir="rtl"
                                rows="4"
                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none transition-all duration-200"
                                value={newSkill.description}
                                onChange={(e) =>
                                    setNewSkill({ ...newSkill, description: e.target.value })
                                }
                            />
                        </div>

                        {/* colour + icon pickers */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* colours */}
                            <div>
                                <label className="block mb-2 font-medium text-gray-700">
                                    צבע
                                </label>
                                <div className="space-y-2">
                                    {COLOR_SCHEMES.map((scheme) => (
                                        <label
                                            key={scheme.name}
                                            className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                                        >
                                            <input
                                                type="radio"
                                                name="color"
                                                value={scheme.color}
                                                checked={newSkill.color === scheme.color}
                                                onChange={() =>
                                                    setNewSkill({
                                                        ...newSkill,
                                                        color: scheme.color,
                                                        gradient: scheme.gradient,
                                                        accent: scheme.accent,
                                                    })
                                                }
                                                className="w-4 h-4 text-indigo-600 focus:ring-indigo-500"
                                            />
                                            <span
                                                className={`w-6 h-6 rounded-full ${scheme.accent}`}
                                            ></span>
                                            {scheme.name}
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* icons */}
                            <div>
                                <label className="block mb-2 font-medium text-gray-700">
                                    איקון
                                </label>
                                <div className="space-y-2">
                                    {Object.entries(ICONS).map(([key, IconCmp]) => (
                                        <label
                                            key={key}
                                            className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                                        >
                                            <input
                                                type="radio"
                                                name="icon"
                                                value={key}
                                                checked={newSkill.icon === key}
                                                onChange={() => setNewSkill({ ...newSkill, icon: key })}
                                                className="w-4 h-4 text-indigo-600 focus:ring-indigo-500"
                                            />
                                            {/* Render FontAwesomeIcon for specific keys, otherwise Lucide icon */}
                                            {['Theater', 'Photography', 'Sculpture', 'Filmmaking'].includes(key) ? (
                                                <FontAwesomeIcon icon={
                                                    key === 'Theater' ? faMasksTheater :
                                                    key === 'Photography' ? faCameraRetro :
                                                    key === 'Sculpture' ? faHammer :
                                                    faFilm // Default to faFilm if something unexpected
                                                } className="w-5 h-5 text-gray-700" />
                                            ) : (
                                                <IconCmp className="w-5 h-5 text-gray-700" />
                                            )}
                                            {key}
                                        </label>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* buttons */}
                        <div className="flex gap-4 pt-4">
                            <button
                                onClick={handleAddOrUpdateSkill}
                                className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-xl flex items-center justify-center gap-2 hover:shadow-lg transition-all duration-200 hover:scale-[1.02] active:scale-95"
                            >
                                <Save className="w-5 h-5" />
                                {editingSkillId ? "שמור שינויים" : "הוסף כישור"}
                            </button>
                            <button
                                onClick={() => {
                                    setShowForm(false);
                                    setEditingSkillId(null);
                                    setNewSkill(initialSkill());
                                }}
                                className="px-6 py-3 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors hover:shadow-sm"
                            >
                                ביטול
                            </button>
                        </div>
                    </div>
                </motion.div>
            </div>
        )}

        {/* Styles for flip card animation */}
        <style jsx>{`
            .perspective {
                perspective: 1000px;
            }
            .preserve-3d {
                transform-style: preserve-3d;
            }
            .backface-hidden {
                backface-visibility: hidden;
            }
            .rotate-y-180 {
                transform: rotateY(180deg);
            }
        `}</style>
    </div>
    </Layout>
);
};

/* ---------- Enhanced Flip Card Component (based on ProgramSection's FlipCard) ---------- */
const FlipCard = ({ skill, index, isAdmin, onEdit, onDelete }) => {
  const IconCmp = ICONS[skill.iconName] || Palette; // Get the component using the stored name

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.05 }}
      viewport={{ once: true, amount: 0.1 }}
      className="group perspective cursor-pointer h-64 md:h-72"
    >
      <div className="relative w-full h-full transform transition-transform duration-700 preserve-3d group-hover:rotate-y-180">
        {/* Front Side */}
        <div
          className={`absolute inset-0 flex flex-col items-center justify-center rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300 p-4 backface-hidden ${skill.color} border border-white/20`}
        >
          <div className="mb-3 p-3 rounded-full bg-white/20 backdrop-blur-sm">
            {/* Render FontAwesomeIcon for specific keys, otherwise Lucide icon */}
            {['Theater', 'Photography', 'Sculpture', 'Filmmaking'].includes(skill.iconName) ? (
              <FontAwesomeIcon icon={
                skill.iconName === 'Theater' ? faMasksTheater :
                skill.iconName === 'Photography' ? faCameraRetro :
                skill.iconName === 'Sculpture' ? faHammer :
                faFilm
              } className="w-8 h-8 text-gray-800" />
            ) : (
              <IconCmp className="w-8 h-8 text-gray-800" />
            )}
          </div>
          <h4 className="text-base md:text-lg font-bold text-center leading-tight">
            {skill.title}
          </h4>
        </div>

        {/* Back Side */}
        <div
          className={`absolute inset-0 bg-gradient-to-br ${skill.gradient} text-white text-center flex flex-col items-center justify-center rounded-2xl p-4 backface-hidden rotate-y-180 shadow-lg`}
        >
            {/* Render FontAwesomeIcon for specific keys on back as well */}
            {['Theater', 'Photography', 'Sculpture', 'Filmmaking'].includes(skill.iconName) ? (
              <FontAwesomeIcon icon={
                skill.iconName === 'Theater' ? faMasksTheater :
                skill.iconName === 'Photography' ? faCameraRetro :
                skill.iconName === 'Sculpture' ? faHammer :
                faFilm
              } className="w-6 h-6 mb-2 opacity-80" />
            ) : (
              <IconCmp className="w-6 h-6 mb-2 opacity-80" />
            )}
          <p dir="rtl" className="text-xs md:text-sm leading-relaxed text-white/95">
            {skill.description}
          </p>
        </div>

        {/* Admin controls (positioned to be visible on front initially, but not interfere with flip) */}
        {isAdmin && (
          <div className="absolute top-2 left-2 flex gap-1 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <button
              onClick={(e) => {
                e.stopPropagation(); // Prevent card flip on button click
                onEdit();
              }}
              className="p-2 bg-white rounded-lg hover:bg-yellow-50 shadow-md transition-colors"
              title="ערוך"
            >
              <Edit3 className="w-4 h-4 text-yellow-600" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation(); // Prevent card flip on button click
                onDelete();
              }}
              className="p-2 bg-white rounded-lg hover:bg-red-50 shadow-md transition-colors"
              title="מחק"
            >
              <Trash2 className="w-4 h-4 text-red-600" />
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default ArtSkillsPage;