import React, { useState, useEffect, useCallback } from "react";
import { collection, onSnapshot, doc, setDoc, updateDoc, deleteDoc, serverTimestamp } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage"; // Import storage functions
import { db, auth, storage } from "../../config/firbaseConfig"; // Import storage
import { onAuthStateChanged } from "firebase/auth";
import { toast } from 'sonner';
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../../components/dashboard/DashboardLayout";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faBuilding, faUser, faEnvelope, faPhone, faMapMarkerAlt, faCalendarAlt,
  faHandshake, faTag, faGlobe, faImage, faInfoCircle, faPlus, faTimes,
  faEdit, faTrash, faCloudUploadAlt
} from '@fortawesome/free-solid-svg-icons';
import ElementalLoader from '../../theme/ElementalLoader';

// Reusable Modal Component
const Modal = ({ children, onClose, title }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm"
        onClick={onClose}
      ></div>

      <div className="relative bg-white rounded-xl shadow-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto transform transition-all duration-300 scale-100 opacity-100">
        <button
          onClick={onClose}
          className="absolute top-4 left-4 text-gray-500 hover:text-gray-700 text-2xl font-bold"
        >
          <FontAwesomeIcon icon={faTimes} />
        </button>
        {title && <h3 className="text-2xl font-bold text-gray-800 mb-6 text-center">{title}</h3>}
        {children}
      </div>
    </div>
  );
};

// Delete Confirmation Modal Component
const DeleteConfirmationModal = ({ onClose, onConfirm, partnerName }) => {
  return (
    <Modal onClose={onClose} title="אישור מחיקת שותף">
      <div className="text-center p-4">
        <p className="mb-4 text-lg text-gray-700">
          האם אתה בטוח שברצונך למחוק את השותף <span className="font-bold">"{partnerName}"</span>?
          פעולה זו בלתי הפיכה.
        </p>
        <div className="flex justify-center gap-4 mt-6">
          <button
            onClick={onConfirm}
            className="px-6 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition duration-200"
          >
            מחק
          </button>
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 transition duration-200"
          >
            ביטול
          </button>
        </div>
      </div>
    </Modal>
  );
};

function Partners() {
  const navigate = useNavigate();
  const [selectedLogoFile, setSelectedLogoFile] = useState(null);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [loading, setLoading] = useState(true);
  const [partnersList, setPartnersList] = useState([]);
  const [showAddPartnerForm, setShowAddPartnerForm] = useState(false);
  const [showEditPartnerForm, setShowEditPartnerForm] = useState(false);
  const [editingPartner, setEditingPartner] = useState(null);

  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
  const [partnerToDelete, setPartnerToDelete] = useState(null);

  // Form states - simplified to only the requested fields
  const [name, setName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [logoUrl, setLogoUrl] = useState(""); // Renamed from 'logo' to 'logoUrl' for clarity

  // Tailwind CSS input/textarea style for consistency
  const inputStyle = "appearance-none rounded-md w-full px-4 py-3 border border-gray-300 placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-right shadow-sm pr-10";

  const handleLogoFileChange = (e) => {
    if (e.target.files[0]) {
      setSelectedLogoFile(e.target.files[0]);
    } else {
      setSelectedLogoFile(null);
    }
  };

  // Helper to reset form fields
  const resetFormFields = useCallback(() => {
    setName("");
    setContactEmail("");
    setContactPhone("");
    setSelectedLogoFile(null); // Reset file input
    setLogoUrl(""); // Reset stored logo URL
  }, []);

  // Authentication Listener and Data Fetching
  useEffect(() => {
    if (auth) {
      const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
        if (user) {
          setCurrentUserId(user.uid);
          setIsAuthReady(true);

          const partnersCollectionRef = collection(db, "partners");
          const unsubscribePartners = onSnapshot(partnersCollectionRef, (snapshot) => {
            const fetchedPartners = snapshot.docs.map(doc => ({
              id: doc.id,
              ...doc.data(),
            }));
            setPartnersList(fetchedPartners);
            setLoading(false);
          }, (error) => {
            console.error("Error fetching partners:", error);
            toast.error("אירעה שגיאה בטעינת נתוני השותפים.");
            setLoading(false);
          });

          return () => unsubscribePartners();
        } else {
          console.warn("No user authenticated. Partners page might require authentication.");
          setIsAuthReady(true);
          setLoading(false);
        }
      });
      return () => unsubscribeAuth();
    } else {
      console.error("Firebase Auth instance not available. Check ../../config/firbaseConfig.js");
      toast.error("Firebase authentication not configured correctly.");
      setIsAuthReady(true);
      setLoading(false);
    }
  }, []);

  // Upload file to Firebase Storage
  const uploadLogo = async (file) => {
    if (!file) return null;

    const storageRef = ref(storage, `partner_logos/${file.name}_${Date.now()}`);
    await uploadBytes(storageRef, file);
    return await getDownloadURL(storageRef);
  };

  // Handles the submission of the Add Partner form
  const handleAddPartner = async (e) => {
    e.preventDefault();

    if (!db || !currentUserId) {
      toast.error("Firebase database not available or user not authenticated. Please try again.");
      return;
    }

    if (!name || !contactEmail || !contactPhone) { // Only require name, email, phone
      toast.error("אנא מלא את כל השדות החובה (שם השותף, אימייל, טלפון).");
      return;
    }

    try {
      let uploadedLogoUrl = "";
      if (selectedLogoFile) {
        uploadedLogoUrl = await uploadLogo(selectedLogoFile);
      }

      const partnerData = {
        name,
        contact_email: contactEmail,
        contact_phone: contactPhone,
        logo: uploadedLogoUrl, // Save the uploaded logo URL
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      await setDoc(doc(db, "partners", crypto.randomUUID()), partnerData);
      toast.success("השותף נוסף בהצלחה!");

      resetFormFields();
      setShowAddPartnerForm(false);
    } catch (err) {
      console.error("Error adding partner:", err);
      toast.error("אירעה שגיאה בהוספת השותף. אנא נסה שנית.");
    }
  };

  // Handles clicking the edit icon
  const handleEditClick = (partner) => {
    setEditingPartner(partner);
    setName(partner.name || "");
    setContactEmail(partner.contact_email || "");
    setContactPhone(partner.contact_phone || "");
    setLogoUrl(partner.logo || ""); // Set the existing logo URL
    setSelectedLogoFile(null); // Clear selected file for edit
    setShowEditPartnerForm(true);
  };

  // Handles the submission of the Edit Partner form
  const handleUpdatePartner = async (e) => {
    e.preventDefault();

    if (!db || !currentUserId || !editingPartner?.id) {
      toast.error("Firebase database not available, user not authenticated, or partner ID is missing. Please try again.");
      return;
    }

    if (!name || !contactEmail || !contactPhone) { // Only require name, email, phone
      toast.error("אנא מלא את כל השדות החובה (שם השותף, אימייל, טלפון).");
      return;
    }

    try {
      let updatedLogoUrl = logoUrl; // Start with existing URL

      if (selectedLogoFile) { // If a new file is selected, upload it
        updatedLogoUrl = await uploadLogo(selectedLogoFile);
      } else if (!logoUrl && editingPartner.logo) {
        // If logoUrl is cleared but there was an existing logo, remove it from data (optional: delete from storage)
        updatedLogoUrl = ""; 
      }

      const partnerRef = doc(db, "partners", editingPartner.id);
      const updatedData = {
        name,
        contact_email: contactEmail,
        contact_phone: contactPhone,
        logo: updatedLogoUrl, // Update with new or existing logo URL
        updatedAt: serverTimestamp(),
      };

      await updateDoc(partnerRef, updatedData);
      toast.success("פרטי השותף עודכנו בהצלחה!");
      resetFormFields();
      setShowEditPartnerForm(false);
      setEditingPartner(null);
    } catch (err) {
      console.error("Error updating partner:", err);
      toast.error("אירעה שגיאה בעדכון השותף. אנא נסה שנית.");
    }
  };

  // Handles clicking the delete icon
  const handleDeleteClick = (partnerId, partnerName) => {
    setPartnerToDelete({ id: partnerId, name: partnerName });
    setShowDeleteConfirmModal(true);
  };

  // Confirms and performs the delete operation
  const confirmDelete = async () => {
    if (!db || !currentUserId || !partnerToDelete?.id) {
      toast.error("Firebase database not available, user not authenticated, or partner ID is missing. Cannot delete.");
      return;
    }

    try {
      await deleteDoc(doc(db, "partners", partnerToDelete.id));
      toast.success(`השותף "${partnerToDelete.name}" נמחק בהצלחה.`);
      setShowDeleteConfirmModal(false);
      setPartnerToDelete(null);
    } catch (err) {
      console.error("Error deleting partner:", err);
      toast.error("אירעה שגיאה במחיקת השותף. אנא נסה שנית.");
    }
  };

  if (!isAuthReady || loading) {
    return <ElementalLoader />;
  }

  return (
    <DashboardLayout>
      <div className="container mx-auto min-h-screen py-12 px-4 sm:px-6 lg:px-8 relative" dir="rtl">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4 sm:gap-0">
          <div className="flex flex-col items-center sm:items-start gap-2 sm:gap-4 w-full sm:w-auto text-center sm:text-right">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold bg-black bg-clip-text text-transparent leading-[1.5] px-2 sm:px-6">
              ניהול שותפים
            </h1>
          </div>
          <button
            onClick={() => {
              resetFormFields();
              setShowAddPartnerForm(true);
            }}
            className="flex items-center gap-2 px-4 py-2 sm:px-6 sm:py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 shadow-md transition-all duration-200 whitespace-nowrap text-sm sm:text-base"
          >
            <FontAwesomeIcon icon={faPlus} className="ml-2" />
            הוסף שותף חדש
          </button>
        </div>

        {/* Add Partner Modal */}
        {showAddPartnerForm && (
          <Modal onClose={() => setShowAddPartnerForm(false)} title="טופס הוספת שותף">
            <form className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6" onSubmit={handleAddPartner}>
              {/* Partner Name */}
              <div className="relative flex flex-col">
                <label className="mb-1 text-sm font-medium text-gray-700">שם הארגון/שותף</label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="שם הארגון/שותף *"
                    className={inputStyle}
                  />
                  <FontAwesomeIcon icon={faBuilding} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
                </div>
              </div>

              {/* Contact Email */}
              <div className="relative flex flex-col">
                <label className="mb-1 text-sm font-medium text-gray-700">אימייל איש קשר</label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    placeholder="אימייל איש קשר *"
                    className={inputStyle}
                  />
                  <FontAwesomeIcon icon={faEnvelope} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
                </div>
              </div>

              {/* Contact Phone */}
              <div className="relative flex flex-col">
                <label className="mb-1 text-sm font-medium text-gray-700">טלפון איש קשר</label>
                <div className="relative">
                  <input
                    type="tel"
                    required // Made phone required as per request
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    placeholder="טלפון איש קשר *"
                    className={inputStyle}
                  />
                  <FontAwesomeIcon icon={faPhone} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
                </div>
              </div>

              {/* Logo File Input */}
              <div className="relative flex flex-col">
                <label className="mb-1 text-sm font-medium text-gray-700">לוגו (קובץ)</label>
                <div className="relative border-2 border-dashed border-gray-300 rounded-md p-4 text-center cursor-pointer hover:border-indigo-500 transition-colors duration-200">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoFileChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  {selectedLogoFile ? (
                    <p className="text-sm text-gray-600">קובץ נבחר: {selectedLogoFile.name}</p>
                  ) : (
                    <p className="text-sm text-gray-500">גרור ושחרר קובץ לכאן, או לחץ לבחירה</p>
                  )}
                  <FontAwesomeIcon icon={faCloudUploadAlt} className="mt-2 text-indigo-500 text-3xl" />
                </div>
              </div>

              {/* Submit Button */}
              <div className="col-span-1 md:col-span-2 mt-4 md:mt-6">
                <button
                  type="submit"
                  className="w-full py-2 sm:py-3 px-3 sm:px-4 rounded-md font-medium text-white text-base sm:text-lg bg-indigo-600 hover:bg-indigo-700 transition duration-300 ease-in-out shadow-md"
                >
                  הוסף שותף
                </button>
              </div>
            </form>
          </Modal>
        )}

        {/* Edit Partner Modal */}
        {showEditPartnerForm && (
          <Modal onClose={() => {
            setShowEditPartnerForm(false);
            setEditingPartner(null);
            resetFormFields();
          }} title="ערוך פרטי שותף">
            <form className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6" onSubmit={handleUpdatePartner}>
              {/* Partner Name */}
              <div className="relative flex flex-col">
                <label className="mb-1 text-sm font-medium text-gray-700">שם הארגון/שותף</label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="שם הארגון/שותף *"
                    className={inputStyle}
                  />
                  <FontAwesomeIcon icon={faBuilding} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
                </div>
              </div>

              {/* Contact Email */}
              <div className="relative flex flex-col">
                <label className="mb-1 text-sm font-medium text-gray-700">אימייל איש קשר</label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    placeholder="אימייל איש קשר *"
                    className={inputStyle}
                  />
                  <FontAwesomeIcon icon={faEnvelope} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
                </div>
              </div>

              {/* Contact Phone */}
              <div className="relative flex flex-col">
                <label className="mb-1 text-sm font-medium text-gray-700">טלפון איש קשר</label>
                <div className="relative">
                  <input
                    type="tel"
                    required
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    placeholder="טלפון איש קשר *"
                    className={inputStyle}
                  />
                  <FontAwesomeIcon icon={faPhone} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
                </div>
              </div>

              {/* Logo File Input for Edit */}
              <div className="relative flex flex-col">
                <label className="mb-1 text-sm font-medium text-gray-700">לוגו (קובץ חדש)</label>
                <div className="relative border-2 border-dashed border-gray-300 rounded-md p-4 text-center cursor-pointer hover:border-indigo-500 transition-colors duration-200">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoFileChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  {selectedLogoFile ? (
                    <p className="text-sm text-gray-600">קובץ נבחר: {selectedLogoFile.name}</p>
                  ) : logoUrl ? (
                    <div className="flex items-center justify-center gap-2">
                      <img src={logoUrl} alt="Current Logo" className="w-16 h-16 object-contain" />
                      <p className="text-sm text-gray-600">לוגו קיים. לחץ כדי להחליף.</p>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">גרור ושחרר קובץ לכאן, או לחץ לבחירה</p>
                  )}
                  <FontAwesomeIcon icon={faCloudUploadAlt} className="mt-2 text-indigo-500 text-3xl" />
                </div>
                {logoUrl && !selectedLogoFile && ( // Option to clear existing logo
                    <button
                        type="button"
                        onClick={() => {
                            setLogoUrl("");
                            setSelectedLogoFile(null);
                        }}
                        className="text-red-500 text-xs mt-1 hover:underline self-end"
                    >
                        נקה לוגו קיים
                    </button>
                )}
              </div>

              {/* Submit Button */}
              <div className="col-span-1 md:col-span-2 mt-4 md:mt-6">
                <button
                  type="submit"
                  className="w-full py-2 sm:py-3 px-3 sm:px-4 rounded-md font-medium text-white text-base sm:text-lg bg-green-600 hover:bg-green-700 transition duration-300 ease-in-out shadow-md"
                >
                  עדכן שותף
                </button>
              </div>
            </form>
          </Modal>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteConfirmModal && (
          <DeleteConfirmationModal
            onClose={() => {
              setShowDeleteConfirmModal(false);
              setPartnerToDelete(null);
            }}
            onConfirm={confirmDelete}
            partnerName={partnerToDelete?.name}
          />
        )}

        {/* Partners List Section */}
        <div className="md:col-span-3 mt-8">
          {partnersList.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {partnersList.map(partner => (
                <div key={partner.id} className="bg-white p-6 rounded-lg shadow-md border border-gray-200 relative">
                  {/* Action Icons */}
                  <div className="absolute top-4 left-4 flex gap-2">
                    <button
                      onClick={() => handleEditClick(partner)}
                      className="text-blue-500 hover:text-blue-700 transition duration-200"
                      title="ערוך שותף"
                    >
                      <FontAwesomeIcon icon={faEdit} size="lg" />
                    </button>
                    <button
                      onClick={() => handleDeleteClick(partner.id, partner.name)}
                      className="text-red-500 hover:text-red-700 transition duration-200"
                      title="מחק שותף"
                    >
                      <FontAwesomeIcon icon={faTrash} size="lg" />
                    </button>
                  </div>

                  <h4 className="text-lg sm:text-xl font-semibold text-gray-800 mb-2 mt-8 sm:mt-0 text-center">
                    {partner.logo && (
                      <img
                        src={partner.logo}
                        alt={`${partner.name} Logo`}
                        className="w-20 h-20 sm:w-24 sm:h-24 object-contain mx-auto mb-4 rounded-full"
                        onError={(e) => { e.target.onerror = null; e.target.src = "https://placehold.co/96x96/e2e8f0/64748b?text=Logo"; }}
                      />
                    )}
                    {partner.name}
                  </h4>
                  <p className="text-gray-700 text-xs sm:text-sm mb-1">
                    <span className="font-medium">אימייל:</span> {partner.contact_email}
                  </p>
                  <p className="text-gray-700 text-xs sm:text-sm mb-1">
                    <span className="font-medium">טלפון:</span> {partner.contact_phone}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-600 text-base sm:text-lg">אין שותפים רשומים במערכת.</p>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

export default Partners;