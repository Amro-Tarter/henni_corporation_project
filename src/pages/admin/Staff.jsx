import React, { useEffect, useState, useMemo  } from "react";
import { collection, getDocs, doc, updateDoc, addDoc, deleteDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "../../config/firbaseConfig";
import DashboardLayout from "../../components/dashboard/DashboardLayout";
import CleanElementalOrbitLoader from '../../theme/ElementalLoader'
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "@/components/ui/sonner"; 
import { 
  User as UserIcon, 
  Edit3, 
  Save, 
  X, 
  Plus, 
  Upload, 
  Trash2,
  Camera,
  Shield,
  Eye,
  FileText,
  Briefcase,
  Mail,
  Phone
} from "lucide-react";
import { useUser } from "../../hooks/useUser";

const STAFF_CARD_GRADIENT = "from-blue-600 via-cyan-500 to-purple-500";

function Staff() {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [uploadingPhoto, setUploadingPhoto] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newStaff, setNewStaff] = useState({ username: "", in_role: "", bio: "", photoURL: "", email: "", phone: "" });
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [showModal, setShowModal] = useState(false);
  
  // Edit modal states
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingStaff, setEditingStaff] = useState(null);
  const [editForm, setEditForm] = useState({ username: "", in_role: "", bio: "", email: "", phone: "" });
  const [editingPhoto, setEditingPhoto] = useState(false);
  

  const { user: currentUser } = useUser();
  // Memoized computed values
  const isAdmin = useMemo(() => 
    currentUser?.isAdmin || currentUser?.role === 'admin', 
    [currentUser]
  );

  useEffect(() => {
    fetchStaff();
  }, []);

  async function fetchStaff() {
    setLoading(true);
    try {
      const q = collection(db, "staff");
      const docs = await getDocs(q);
      const staffList = docs.docs.map((doc) => {
        const d = doc.data();
        return {
          id: doc.id,
          username: d.username || "",
          photoURL: d.photoURL || "",
          in_role: d.in_role || "",
          bio: d.bio || "",
          email: d.email || "",
          phone: d.phone || "",
        };
      });
      setStaff(staffList);
    } catch (error) {
      console.error("Error fetching staff:", error);
    }
    setLoading(false);
  }

  const openStaffModal = (staffMember) => {
    setSelectedStaff(staffMember);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedStaff(null);
  };

  const openEditModal = (staffMember) => {
    setEditingStaff(staffMember);
    setEditForm({ 
      username: staffMember.username, 
      in_role: staffMember.in_role,
      bio: staffMember.bio || "",
      email: staffMember.email || "",
      phone: staffMember.phone || ""
    });
    setShowEditModal(true);
  };

  const closeEditModal = () => {
    setShowEditModal(false);
    setEditingStaff(null);
    setEditForm({ username: "", in_role: "", bio: "", email: "", phone: "" });
    setEditingPhoto(false);
  };

  const saveEdit = async () => {
    if (!editingStaff || !editForm.username.trim()) {
      toast.error("נא להזין שם");
      return;
    }

    try {
      await updateDoc(doc(db, "staff", editingStaff.id), {
        username: editForm.username,
        in_role: editForm.in_role,
        bio: editForm.bio,
        email: editForm.email,
        phone: editForm.phone
      });
      
      setStaff(staff.map(s => 
        s.id === editingStaff.id 
          ? { ...s, ...editForm }
          : s
      ));
      
      closeEditModal();
      toast.success("הנתונים עודכנו בהצלחה");
    } catch (error) {
      console.error("Error updating staff:", error);
      toast.error("שגיאה בעדכון הנתונים");
    }
  };

  const handlePhotoUploadInEdit = async (file) => {
    if (!file || !editingStaff) return;
    
    setEditingPhoto(true);
    try {
      const storageRef = ref(storage, `staff-photos/${editingStaff.id}-${Date.now()}`);
      const snapshot = await uploadBytes(storageRef, file);
      const photoURL = await getDownloadURL(snapshot.ref);
      
      await updateDoc(doc(db, "staff", editingStaff.id), { photoURL });
      
      setStaff(staff.map(s => 
        s.id === editingStaff.id ? { ...s, photoURL } : s
      ));
      
      setEditingStaff(prev => ({ ...prev, photoURL }));
      
    } catch (error) {
      console.error("Error uploading photo:", error);
      toast.error("שגיאה בהעלאת התמונה");
    }
    setEditingPhoto(false);
  };

  const handlePhotoUpload = async (file, staffId) => {
    if (!file) return;
    
    setUploadingPhoto(staffId);
    try {
      const storageRef = ref(storage, `staff-photos/${staffId}-${Date.now()}`);
      const snapshot = await uploadBytes(storageRef, file);
      const photoURL = await getDownloadURL(snapshot.ref);
      
      await updateDoc(doc(db, "staff", staffId), { photoURL });
      
      setStaff(staff.map(s => 
        s.id === staffId ? { ...s, photoURL } : s
      ));
    } catch (error) {
      console.error("Error uploading photo:", error);
      toast.error("שגיאה בהעלאת התמונה");
    }
    setUploadingPhoto(null);
  };

  const addNewStaff = async () => {
    if (!newStaff.username.trim()) {
      toast.error("נא להזין שם");
      return;
    }
    
    try {
      const docRef = await addDoc(collection(db, "staff"), {
        username: newStaff.username,
        in_role: newStaff.in_role,
        bio: newStaff.bio,
        photoURL: newStaff.photoURL,
        email: newStaff.email,
        phone: newStaff.phone
      });
      
      setStaff([...staff, { 
        id: docRef.id, 
        ...newStaff
      }]);
      
      setNewStaff({ username: "", in_role: "", bio: "", photoURL: "", email: "", phone: "" });
      setShowAddForm(false);
    } catch (error) {
      console.error("Error adding staff:", error);
      toast.error("שגיאה בהוספת חבר צוות");
    }
  };

  const deleteStaff = async (id) => {
    if (!confirm("האם אתה בטוח שברצונך למחוק חבר צוות זה?")) return;
    
    try {
      await deleteDoc(doc(db, "staff", id));
      setStaff(staff.filter(s => s.id !== id));
    } catch (error) {
      console.error("Error deleting staff:", error);
      toast.error("שגיאה במחיקת חבר הצוות");
    }
  };

  const filtered = staff.filter(
    (s) =>
      s.username.toLowerCase().includes(search.toLowerCase()) ||
      s.in_role.toLowerCase().includes(search.toLowerCase()) ||
      (s.bio && s.bio.toLowerCase().includes(search.toLowerCase()))
  );
  if (loading) return <CleanElementalOrbitLoader/>;

  return (
    <DashboardLayout>
      <div className="min-h-screen py-10" dir="rtl">
        <div className="max-w-6xl mx-auto p-6 space-y-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <div className="flex items-center justify-center gap-3 mb-2">
              <h1 className="text-4xl font-bold bg-black bg-clip-text text-transparent leading-[1.5]">
                נהל צוות העמותה
              </h1>
            </div>
          </motion.div>

          {/* Search and Add Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col sm:flex-row gap-4 items-center justify-between"
          >
            <input
              type="text"
              placeholder="חפש שם, תפקיד או ביוגרפיה..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full sm:max-w-md px-5 py-3 border-2 border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white/90 text-lg"
            />
            
            {isAdmin && (
              <button
                onClick={() => setShowAddForm(true)}
                className="flex items-center gap-2 px-6 py-3 relative inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 shadow-md transition-colors transition-all duration-200 shadow-lg hover:shadow-xl font-medium whitespace-nowrap"
              >
                <Plus size={20} />
                הוסף חבר צוות
              </button>
            )}
          </motion.div>

          {/* Add New Staff Form */}
          <AnimatePresence>
            {showAddForm && isAdmin && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-lg border border-white/20 p-6"
              >
                <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                  <Plus className="text-green-500" size={24} />
                  הוסף חבר צוות חדש
                </h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <input
                      type="text"
                      placeholder="שם מלא *"
                      value={newStaff.username}
                      onChange={(e) => setNewStaff({...newStaff, username: e.target.value})}
                      className="px-4 py-3 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    />
                    <input
                      type="text"
                      placeholder="תפקיד"
                      value={newStaff.in_role}
                      onChange={(e) => setNewStaff({...newStaff, in_role: e.target.value})}
                      className="px-4 py-3 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    />
                    <input
                      type="email"
                      placeholder="אימייל"
                      value={newStaff.email}
                      onChange={(e) => setNewStaff({...newStaff, email: e.target.value})}
                      className="px-4 py-3 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    />
                    <input
                      type="tel"
                      placeholder="טלפון"
                      value={newStaff.phone}
                      onChange={(e) => setNewStaff({...newStaff, phone: e.target.value})}
                      className="px-4 py-3 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    />
                  </div>
                  <textarea
                    placeholder="ביוגרפיה - ספר על הרקע המקצועי, ההשכלה והניסיון..."
                    value={newStaff.bio}
                    onChange={(e) => setNewStaff({...newStaff, bio: e.target.value})}
                    rows={4}
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none"
                  />
                </div>
                <div className="flex gap-3 mt-6">
                  <button
                    onClick={addNewStaff}
                    className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl hover:from-green-600 hover:to-emerald-600 transition-all duration-200 font-medium"
                  >
                    <Save size={18} />
                    שמור
                  </button>
                  <button
                    onClick={() => {
                      setShowAddForm(false);
                      setNewStaff({ username: "", in_role: "", bio: "", photoURL: "", email: "", phone: "" });
                    }}
                    className="flex items-center gap-2 px-6 py-2 bg-slate-200 text-slate-700 rounded-xl hover:bg-slate-300 transition-all duration-200 font-medium"
                  >
                    <X size={18} />
                    ביטול
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Loading state */}
          {loading ? (
                    <h3 className="text-s"></h3>
          ) : (
            <>
              {/* Empty state */}
              {filtered.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-16 bg-white/80 backdrop-blur-sm rounded-3xl shadow-lg border border-white/20"
                >
                  <div className="flex flex-col items-center">
                    <UserIcon size={64} className="text-slate-400 mb-4" />
                    <h3 className="text-2xl font-bold text-slate-800 mb-2">לא נמצאו חברי צוות</h3>
                    <p className="text-slate-600 mb-4">נסה לשנות את החיפוש או הסינון</p>
                    <button
                      onClick={() => setSearch("")}
                      className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl font-medium"
                    >
                      אפס חיפוש
                    </button>
                  </div>
                </motion.div>
              ) : (
                // Cards grid
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                >
                  <AnimatePresence>
                    {filtered.map((staffMember, i) => (
                      <motion.div
                        key={staffMember.id}
                        initial={{ opacity: 0, y: 40 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                        transition={{ delay: i * 0.06 }}
                        className="relative bg-white/95 backdrop-blur-sm rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 border border-white/30 overflow-hidden cursor-pointer group"
                        onClick={() => openStaffModal(staffMember)}
                      >
                        {/* View Indicator */}
                        <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-all duration-200 z-10">
                          <div className="p-2 bg-indigo-500 text-white rounded-full shadow-lg">
                            <Eye size={16} />
                          </div>
                        </div>

                        {/* Admin Controls */}
                        {isAdmin && (
                          <div className="absolute top-4 left-3 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0 flex flex-col gap-2 z-20">
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={(e) => {
                                e.stopPropagation();
                                openEditModal(staffMember);
                              }}
                              className="p-2.5 bg-emerald-600 text-white rounded-xl shadow-lg hover:bg-emerald-700 transition-colors backdrop-blur-sm"
                              title="עריכה"
                            >
                              <Edit3 size={16} />
                            </motion.button>
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteStaff(staffMember.id);
                              }}
                              className="p-2.5 bg-red-600 text-white rounded-xl shadow-lg hover:bg-red-700 transition-colors backdrop-blur-sm"
                              title="מחיקה"
                            >
                              <Trash2 size={16} />
                            </motion.button>
                          </div>
                        )}

                        <div className="p-6 flex flex-col items-center">
                          {/* Photo Section */}
                          <div className="relative mb-4">
                            <div className={`w-24 h-24 rounded-full overflow-hidden border-4 bg-gradient-to-r ${STAFF_CARD_GRADIENT} p-1 shadow-lg`}>
                              <img
                                src={staffMember.photoURL }
                                alt={staffMember.username}
                                className="w-full h-full object-cover rounded-full bg-white"
                              />
                            </div>
                            
                            {/* Photo Upload Button for Admin */}
                            {isAdmin && (
                              <div className="absolute -bottom-2 -right-2">
                                <label className="cursor-pointer">
                                  <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => {
                                      e.stopPropagation();
                                      handlePhotoUpload(e.target.files[0], staffMember.id);
                                    }}
                                    className="hidden"
                                  />
                                  <div className="p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors shadow-lg">
                                    {uploadingPhoto === staffMember.id ? (
                                      <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                                    ) : (
                                      <Camera size={16} />
                                    )}
                                  </div>
                                </label>
                              </div>
                            )}
                          </div>

                          {/* Staff Info */}
                          <div className="text-center space-y-3 w-full">
                            <h3 className="text-lg font-bold text-slate-800 leading-tight">
                              {staffMember.username}
                            </h3>
                            <div className="px-3 py-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-sm text-sm font-medium inline-block max-w-full">
                              <span className="block truncate">
                                {staffMember.in_role || "לא צויין תפקיד"}
                              </span>
                            </div>
                            {staffMember.bio && (
                              <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                                {staffMember.bio}
                              </p>
                            )}
                            <div className="flex items-center justify-center gap-1 text-xs text-indigo-600 font-medium mt-2">
                              <Eye size={12} />
                              <span>לחץ לצפייה מלאה</span>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </motion.div>
              )}
            </>
          )}
        </div>

        {/* Staff Details Modal */}
        <AnimatePresence>
          {showModal && selectedStaff && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50"
              onClick={closeModal}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="relative">
                  {/* Close Button */}
                  <button
                    onClick={closeModal}
                    className="absolute top-4 left-4 p-2 bg-slate-100 hover:bg-slate-200 rounded-full transition-colors z-10"
                  >
                    <X size={20} className="text-slate-600" />
                  </button>

                  {/* Header with Photo */}
                  <div className="bg-gradient-to-r from-blue-600 via-cyan-500 to-purple-500 p-8 text-white text-center">
                    <div className="w-32 h-32 mx-auto mb-4 rounded-full overflow-hidden border-4 border-white shadow-lg">
                      <img
                        src={selectedStaff.photoURL }
                        alt={selectedStaff.username}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <h2 className="text-3xl font-bold mb-2">{selectedStaff.username}</h2>
                    <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
                      <Briefcase size={18} />
                      <span className="font-medium">{selectedStaff.in_role || "לא צויין תפקיד"}</span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-8 space-y-6" dir="rtl">
                    {/* Biography */}
                    {selectedStaff.bio && (
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 text-slate-700">
                          <FileText className="text-blue-600" size={20} />
                          <h3 className="text-xl font-bold">אודות</h3>
                        </div>
                        <div className="bg-slate-50 rounded-2xl p-6">
                          <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">
                            {selectedStaff.bio}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Contact Information */}
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-slate-700">
                        <Mail className="text-blue-600" size={20} />
                        <h3 className="text-xl font-bold">פרטי קשר</h3>
                      </div>
                      <div className="bg-slate-50 rounded-2xl p-6 space-y-4">
                        {selectedStaff.email ? (
                          <div className="flex items-center gap-3">
                            <Mail className="text-slate-500" size={18} />
                            <span className="text-slate-700">{selectedStaff.email}</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-3 text-slate-500">
                            <Mail size={18} />
                            <span>לא צויין אימייל</span>
                          </div>
                        )}
                        
                        {selectedStaff.phone ? (
                          <div className="flex items-center gap-3">
                            <Phone className="text-slate-500" size={18} />
                            <span className="text-slate-700">{selectedStaff.phone}</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-3 text-slate-500">
                            <Phone size={18} />
                            <span>לא צויין טלפון</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Empty biography message */}
                    {!selectedStaff.bio && (
                      <div className="text-center py-8 bg-slate-50 rounded-2xl">
                        <FileText className="mx-auto text-slate-400 mb-3" size={48} />
                        <p className="text-slate-600">טרם הוספה ביוגרפיה עבור חבר צוות זה</p>
                        {isAdmin && (
                          <p className="text-sm text-blue-600 mt-2">לחץ על כפתור העריכה כדי להוסיף ביוגרפיה</p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Edit Staff Modal */}
        <AnimatePresence>
          {showEditModal && editingStaff && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50"
              onClick={closeEditModal}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="relative">
                  {/* Close Button */}
                  <button
                    onClick={closeEditModal}
                    className="absolute top-4 left-4 p-2 bg-slate-100 hover:bg-slate-200 rounded-full transition-colors z-10"
                  >
                    <X size={20} className="text-slate-600" />
                  </button>

                  {/* Header */}
                  <div className="bg-gradient-to-r from-emerald-600 to-blue-600 p-8 text-white text-center">
                    <div className="relative w-24 h-24 mx-auto mb-4">
                      <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white shadow-lg">
                        <img
                          src={editingStaff.photoURL }
                          alt={editForm.username}
                          className="w-full h-full object-cover"
                        />
                      </div>
                     {/* Photo Upload in Edit Modal */}
                      <div className="absolute -bottom-1 -right-1">
                        <label className="cursor-pointer">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handlePhotoUploadInEdit(e.target.files[0])}
                            className="hidden"
                          />
                          <div className="p-2 bg-white/20 backdrop-blur-sm text-white rounded-full hover:bg-white/30 transition-colors shadow-lg">
                            {editingPhoto ? (
                              <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                            ) : (
                              <Camera size={16} />
                            )}
                          </div>
                        </label>
                      </div>
                    </div>
                    <h2 className="text-2xl font-bold mb-2">עריכת פרטי {editForm.username || 'חבר צוות'}</h2>
                    <div className="flex items-center justify-center gap-2">
                      <Edit3 size={18} />
                      <span>עדכון פרטים</span>
                    </div>
                  </div>

                  {/* Edit Form */}
                  <div className="p-8 space-y-6" dir="rtl">
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-2">
                            שם מלא *
                          </label>
                          <input
                            type="text"
                            value={editForm.username}
                            onChange={(e) => setEditForm({...editForm, username: e.target.value})}
                            className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                            placeholder="הזן שם מלא"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-2">
                            תפקיד
                          </label>
                          <input
                            type="text"
                            value={editForm.in_role}
                            onChange={(e) => setEditForm({...editForm, in_role: e.target.value})}
                            className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                            placeholder="הזן תפקיד"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-2">
                            אימייל
                          </label>
                          <input
                            type="email"
                            value={editForm.email}
                            onChange={(e) => setEditForm({...editForm, email: e.target.value})}
                            className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                            placeholder="הזן אימייל"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-2">
                            טלפון
                          </label>
                          <input
                            type="tel"
                            value={editForm.phone}
                            onChange={(e) => setEditForm({...editForm, phone: e.target.value})}
                            className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                            placeholder="הזן מספר טלפון"
                          />
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          ביוגרפיה
                        </label>
                        <textarea
                          value={editForm.bio}
                          onChange={(e) => setEditForm({...editForm, bio: e.target.value})}
                          rows={6}
                          className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none"
                          placeholder="ספר על הרקע המקצועי, ההשכלה והניסיון..."
                        />
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3 pt-4 border-t border-slate-200">
                      <button
                        onClick={saveEdit}
                        className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-green-500 text-white rounded-xl hover:from-emerald-600 hover:to-green-600 transition-all duration-200 font-medium shadow-lg hover:shadow-xl"
                      >
                        <Save size={18} />
                        שמור שינויים
                      </button>
                      <button
                        onClick={closeEditModal}
                        className="flex items-center gap-2 px-6 py-3 bg-slate-200 text-slate-700 rounded-xl hover:bg-slate-300 transition-all duration-200 font-medium"
                      >
                        <X size={18} />
                        ביטול
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </DashboardLayout>
  );
}

export default Staff;






































 