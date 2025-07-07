// src/pages/ArtSkillsPage.jsx
import Layout from '@/components/layout/Layout';
import React, { useEffect, useState } from "react";
import {
  Plus,
  Edit3,
  Trash2,
  Save,
  X,
  Star,
  Search,
} from "lucide-react";
import { db, auth, storage } from "../config/firbaseConfig"; // Import storage
import {
  collection,
  onSnapshot,
  addDoc,
  deleteDoc,
  updateDoc,
  doc,
  getDocs,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage"; // Import storage functions
import { onAuthStateChanged } from "firebase/auth";
import { motion } from "framer-motion";

/* ---------- icon + color helpers ---------- */

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
  const [isLoading, setIsLoading] = useState(true);
  const [imageFile, setImageFile] = useState(null); // New state for image file

  /* -------- Firestore listeners + auth -------- */
  useEffect(() => {
    // First, fetch all skills immediately
    const fetchSkills = async () => {
      try {
        const skillsSnapshot = await getDocs(collection(db, "artSkills"));
        const skillsList = skillsSnapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
        setSkills(skillsList);
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching skills:", error);
        setIsLoading(false);
      }
    };

    fetchSkills();

    // Then set up real-time listener for skills
    const unsubSkills = onSnapshot(collection(db, "artSkills"), (snap) => {
      const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setSkills(list);
    });

    // Check user role
    const unsubAuth = onAuthStateChanged(auth, (fbUser) => {
      if (fbUser) {
        // User is signed in
        onSnapshot(doc(db, "users", fbUser.uid), (snap) => {
          if (snap.exists()) {
            const userData = snap.data();
            setIsAdmin(userData.role === "admin");
          } else {
            setIsAdmin(false);
          }
        });
      } else {
        // User is signed out
        setIsAdmin(false);
      }
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
      imageUrl: "", // New: Store image URL
      imagePath: "", // New: Store image storage path for deletion
    };
  }

  /* -------- CRUD actions -------- */
  const handleAddOrUpdateSkill = async () => {
    if (!newSkill.title.trim() || !newSkill.description.trim()) {
      alert("כותרת ותיאור הם שדות חובה.");
      return;
    }

    const scheme =
      COLOR_SCHEMES.find((c) => c.color === newSkill.color) ?? COLOR_SCHEMES[0];

    let finalImageUrl = newSkill.imageUrl;
    let finalImagePath = newSkill.imagePath;

    // If a new image file is selected, upload it
    if (imageFile) {
      const storageRef = ref(storage, `skill_images/${imageFile.name}-${Date.now()}`);
      try {
        await uploadBytes(storageRef, imageFile);
        finalImageUrl = await getDownloadURL(storageRef);
        finalImagePath = storageRef.fullPath;
      } catch (error) {
        console.error("Error uploading image:", error);
        alert("נכשל בהעלאת התמונה. אנא נסה שוב.");
        return;
      }
    } else if (editingSkillId && !newSkill.imageUrl) {
        // If editing and no new image is selected and existing image is cleared, delete the old image
        if (newSkill.imagePath) {
            const oldImageRef = ref(storage, newSkill.imagePath);
            try {
                await deleteObject(oldImageRef);
                console.log("Old image deleted successfully from storage.");
            } catch (error) {
                console.error("Error deleting old image from storage:", error);
            }
        }
    }


    const payload = {
      title: newSkill.title.trim(),
      description: newSkill.description.trim(),
      color: scheme.color,
      gradient: scheme.gradient,
      accent: scheme.accent,
      imageUrl: finalImageUrl, // Save image URL
      imagePath: finalImagePath, // Save image path for potential deletion
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
      setImageFile(null); // Clear image file input
    } catch (err) {
      console.error("🔥 failed to save skill:", err);
      alert("נכשל לשמור כישור. אנא נסה שוב.");
    }
  };

  const handleDeleteSkill = async (skillId, imagePath) => {
    if (window.confirm("האם אתה בטוח שברצונך למחוק כישור זה?")) {
      try {
        // Delete image from storage if it exists
        if (imagePath) {
          const imageRef = ref(storage, imagePath);
          await deleteObject(imageRef);
          console.log("Image deleted from storage.");
        }
        await deleteDoc(doc(db, "artSkills", skillId));
      } catch (err) {
        console.error("🔥 failed to delete skill:", err);
        alert("נכשל למחוק כישור. אנא נסה שוב.");
      }
    }
  };

  const handleEditSkill = (skill) => {
    setNewSkill({
      title: skill.title,
      description: skill.description,
      color: skill.color,
      gradient: skill.gradient,
      accent: skill.accent,
      imageUrl: skill.imageUrl || "", // Set existing image URL
      imagePath: skill.imagePath || "", // Set existing image path
    });
    setEditingSkillId(skill.id);
    setShowForm(true);
    setImageFile(null); // Clear any previously selected file when editing
  };

  const handleImageChange = (e) => {
    if (e.target.files[0]) {
      setImageFile(e.target.files[0]);
      // Also update newSkill.imageUrl for preview if needed, though not directly stored in Firestore until save
      setNewSkill({ ...newSkill, imageUrl: URL.createObjectURL(e.target.files[0]) });
    }
  };

  /* -------- derived list -------- */
  const filteredSkills = skills.filter(
    (s) =>
      s.title.toLowerCase() ||
      s.description.toLowerCase()
  );

  /* -------- jsx -------- */
  return (
    <Layout>
      <div className="min-h-screen pt-16 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        {/* -------- Hero -------- */}
        <header className="px-6 py-16 text-center relative">
          <SectionHeader
            title="כישורי אמנות"
            subtitle="גלה את העולם המדהים של יצירה אמנותית וחקור כישורים יחודיים"
            className="mb-10"
          />
        </header>

        <main className="max-w-7xl mx-auto px-6 pb-24">
          {/* admin add button - only visible to admins */}
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
                  setImageFile(null); // Clear image file when adding new skill
                }}
                className="inline-flex items-center gap-2 bg-white text-orange-600 px-6 py-3 rounded-xl font-medium shadow-lg hover:bg-orange-50 transition-all duration-200 hover:scale-[1.02] active:scale-95"
              >
                <Plus className="w-5 h-5" />
                הוסף כישור חדש
              </button>
            </motion.div>
          )}

          {/* Loading state */}
          {isLoading ? (
            <div className="flex justify-center items-center py-16">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
          ) : (
            <>
              {/* skills grid - visible to all users */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredSkills.map((skill, idx) => (
                  <FlipCard
                    key={skill.id}
                    skill={skill}
                    index={idx}
                    isAdmin={isAdmin}
                    onEdit={() => handleEditSkill(skill)}
                    onDelete={() => handleDeleteSkill(skill.id, skill.imagePath)}
                  />
                ))}
              </div>

              {/* no results - visible to all users */}
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
                    נסה לחפש במילים אחרות
                    {isAdmin && " או הוסף כישור חדש"}
                  </p>
                </motion.div>
              )}
            </>
          )}
        </main>

        {/* modal form - only visible to admins */}
        {showForm && isAdmin && (
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
                    setImageFile(null); // Clear image file input on close
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

                {/* colour + image pickers */}
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

                  {/* Image Upload */}
                  <div>
                    <label className="block mb-2 font-medium text-gray-700">
                      העלה תמונה
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                    />
                    {(newSkill.imageUrl || imageFile) && (
                      <div className="mt-4 flex items-center gap-2">
                        <img
                          src={imageFile ? URL.createObjectURL(imageFile) : newSkill.imageUrl}
                          alt="תמונה מקדימה"
                          className="w-24 h-24 object-cover rounded-lg shadow-sm"
                        />
                        {newSkill.imageUrl && ( // Show clear button only if there's an existing image URL
                            <button
                                onClick={() => setNewSkill({...newSkill, imageUrl: "", imagePath: ""})}
                                className="text-red-500 hover:text-red-700 text-sm"
                            >
                                נקה תמונה
                            </button>
                        )}
                      </div>
                    )}
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
                      setImageFile(null); // Clear image file input on cancel
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
        <style>{`
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

/* ---------- Enhanced Flip Card Component ---------- */
const FlipCard = ({ skill, index, isAdmin, onEdit, onDelete }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.05 }}
      viewport={{ once: true, amount: 0.1 }}
      className="group perspective cursor-pointer h-64 md:h-72"
    >
      <div className="relative w-full h-full transform transition-transform duration-700 preserve-3d group-hover:rotate-y-180">
        {/* Front Side - visible to all users */}
        <div
          className={`absolute inset-0 flex flex-col items-center justify-center rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300 p-4 backface-hidden ${skill.color} border border-white/20`}
        >
          <div className="mb-3 backdrop-blur-sm w-40 h-40 flex items-center rounded-2xl justify-center overflow-hidden">
            {skill.imageUrl ? (
              <img
                src={skill.imageUrl}
                alt={skill.title}
                className="w-full h-full object-cover rounded-2xl"
                style={{ objectFit: 'cover' }} // Ensure image covers the circular area
              />
            ) : (
              // Fallback if no image is present (e.g., for older skills or if image is removed)
              <Star className="w-8 h-8 text-gray-800" />
            )}
          </div>
          <h4 className="text-base md:text-lg font-bold text-center leading-tight">
            {skill.title}
          </h4>
        </div>

        {/* Back Side - visible to all users */}
        <div
          className={`absolute inset-0 bg-gradient-to-br ${skill.gradient} text-white text-center flex flex-col items-center justify-center rounded-2xl p-4 backface-hidden rotate-y-180 shadow-lg`}
        >
          {skill.imageUrl ? (
            <img
              src={skill.imageUrl}
              alt={skill.title}
              className="w-40 h-40 mb-2 opacity-80 object-cover  rounded-2xl"
            />
          ) : (
            // Fallback for back side too
            <Star className="w-6 h-6 mb-2 opacity-80" />
          )}
          <p dir="rtl" className="text-xs md:text-sm leading-relaxed text-white/95">
            {skill.description}
          </p>
        </div>

        {/* Admin controls - only visible to admins */}
        {isAdmin && (
          <div className="absolute top-2 left-2 flex gap-1 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit();
              }}
              className="p-2 bg-white rounded-lg hover:bg-yellow-50 shadow-md transition-colors"
              title="ערוך"
            >
              <Edit3 className="w-4 h-4 text-yellow-600" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
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