import React, { useState, useEffect, useCallback } from "react";
import { collection, query, getDocs, onSnapshot, doc, setDoc, updateDoc, deleteDoc, serverTimestamp } from "firebase/firestore"; // Added updateDoc, deleteDoc
import { db, auth } from "../../config/firbaseConfig";
import { onAuthStateChanged } from "firebase/auth";
import { toast } from 'sonner';
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../../components/dashboard/DashboardLayout";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faBuilding, faUser, faEnvelope, faPhone, faMapMarkerAlt, faCalendarAlt,
  faHandshake, faTag, faGlobe, faImage, faInfoCircle, faPlus, faTimes,
  faEdit, faTrash // Added Edit and Trash icons
} from '@fortawesome/free-solid-svg-icons';
import ElementalLoader from '../../theme/ElementalLoader'


// Reusable Modal Component
const Modal = ({ children, onClose, title }) => { // Added title prop
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
        {title && <h3 className="text-2xl font-bold text-gray-800 mb-6 text-center">{title}</h3>} {/* Display title */}
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

  const [currentUserId, setCurrentUserId] = useState(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [loading, setLoading] = useState(true);
  const [partnersList, setPartnersList] = useState([]);
  const [showAddPartnerForm, setShowAddPartnerForm] = useState(false);
  const [showEditPartnerForm, setShowEditPartnerForm] = useState(false); // New state for edit modal
  const [editingPartner, setEditingPartner] = useState(null); // New state for storing partner being edited

  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false); // New state for delete confirmation modal
  const [partnerToDelete, setPartnerToDelete] = useState(null); // New state for partner ID to delete

  // Form states - now also used for editing
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [contactPerson, setContactPerson] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [contributionType, setContributionType] = useState("");
  const [description, setDescription] = useState("");
  const [logo, setLogo] = useState("");
  const [organizationType, setOrganizationType] = useState("");
  const [partnershipStart, setPartnershipStart] = useState("");
  const [partnershipEnd, setPartnershipEnd] = useState("");
  const [status, setStatus] = useState("active");
  const [website, setWebsite] = useState("");

  // Tailwind CSS input/textarea style for consistency
  const inputStyle = "appearance-none rounded-md w-full px-4 py-3 border border-gray-300 placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-right shadow-sm pr-10";
  const textareaStyle = "appearance-none rounded-md w-full px-4 py-3 border border-gray-300 placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-right h-24 shadow-sm";

  // Helper to reset form fields
  const resetFormFields = useCallback(() => {
    setName("");
    setAddress("");
    setContactPerson("");
    setContactEmail("");
    setContactPhone("");
    setContributionType("");
    setDescription("");
    setLogo("");
    setOrganizationType("");
    setPartnershipStart("");
    setPartnershipEnd("");
    setStatus("active");
    setWebsite("");
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
              // Convert Firebase Timestamps to Date objects for consistency
              partnership_start: doc.data().partnership_start?.toDate(),
              partnership_end: doc.data().partnership_end?.toDate(),
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

  // Handles the submission of the Add Partner form
  const handleAddPartner = async (e) => {
    e.preventDefault();

    if (!db || !currentUserId) {
      toast.error("Firebase database not available or user not authenticated. Please try again.");
      return;
    }

    if (!name || !contactPerson || !contactEmail || !status) {
      toast.error("אנא מלא את כל השדות החובה (שם, איש קשר, אימייל, סטטוס).");
      return;
    }

    try {
      const partnerData = {
        name,
        address,
        contact_person: contactPerson,
        contact_email: contactEmail,
        contact_phone: contactPhone,
        contribution_type: contributionType,
        description,
        logo,
        organization_type: organizationType,
        // Convert to Firebase Timestamp if a date is selected
        partnership_start: partnershipStart ? new Date(partnershipStart) : null,
        partnership_end: partnershipEnd ? new Date(partnershipEnd) : null,
        status,
        website,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      await setDoc(doc(db, "partners", crypto.randomUUID()), partnerData);
      toast.success("השותף נוסף בהצלחה!");

      resetFormFields(); // Reset form fields after successful submission
      setShowAddPartnerForm(false);
    } catch (err) {
      console.error("Error adding partner:", err);
      toast.error("אירעה שגיאה בהוספת השותף. אנא נסה שנית.");
    }
  };

  // Handles clicking the edit icon
  const handleEditClick = (partner) => {
    setEditingPartner(partner);
    // Populate form fields with existing partner data
    setName(partner.name || "");
    setAddress(partner.address || "");
    setContactPerson(partner.contact_person || "");
    setContactEmail(partner.contact_email || "");
    setContactPhone(partner.contact_phone || "");
    setContributionType(partner.contribution_type || "");
    setDescription(partner.description || "");
    setLogo(partner.logo || "");
    setOrganizationType(partner.organization_type || "");
    // Format Date objects to YYYY-MM-DD for date input fields
    setPartnershipStart(partner.partnership_start ? partner.partnership_start.toISOString().split('T')[0] : "");
    setPartnershipEnd(partner.partnership_end ? partner.partnership_end.toISOString().split('T')[0] : "");
    setStatus(partner.status || "active");
    setWebsite(partner.website || "");

    setShowEditPartnerForm(true); // Open the edit modal
  };

  // Handles the submission of the Edit Partner form
  const handleUpdatePartner = async (e) => {
    e.preventDefault();

    if (!db || !currentUserId || !editingPartner?.id) {
      toast.error("Firebase database not available, user not authenticated, or partner ID is missing. Please try again.");
      return;
    }

    if (!name || !contactPerson || !contactEmail || !status) {
      toast.error("אנא מלא את כל השדות החובה (שם, איש קשר, אימייל, סטטוס).");
      return;
    }

    try {
      const partnerRef = doc(db, "partners", editingPartner.id);
      const updatedData = {
        name,
        address,
        contact_person: contactPerson,
        contact_email: contactEmail,
        contact_phone: contactPhone,
        contribution_type: contributionType,
        description,
        logo,
        organization_type: organizationType,
        partnership_start: partnershipStart ? new Date(partnershipStart) : null,
        partnership_end: partnershipEnd ? new Date(partnershipEnd) : null,
        status,
        website,
        updatedAt: serverTimestamp(), // Update timestamp
      };

      await updateDoc(partnerRef, updatedData);
      toast.success("פרטי השותף עודכנו בהצלחה!");
      resetFormFields();
      setShowEditPartnerForm(false); // Close the edit modal
      setEditingPartner(null); // Clear editing partner state
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
      setShowDeleteConfirmModal(false); // Close confirmation modal
      setPartnerToDelete(null); // Clear state
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
    <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4 sm:gap-0"> {/* Changed to flex-col on small, flex-row on sm+; added gap */}
      {/* Title */}
      <div className="flex flex-col items-center sm:items-start gap-2 sm:gap-4 w-full sm:w-auto text-center sm:text-right"> {/* Adjusted alignment and width */}
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold bg-black bg-clip-text text-transparent leading-[1.5] px-2 sm:px-6"> {/* Responsive font size, adjusted px */}
          ניהול שותפים
        </h1>
      </div>
      <button
        onClick={() => {
          resetFormFields(); // Clear fields before opening add form
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
        <form className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6" onSubmit={handleAddPartner}> {/* Adjusted gap */}
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

          {/* Contact Person */}
          <div className="relative flex flex-col">
            <label className="mb-1 text-sm font-medium text-gray-700">איש קשר</label>
            <div className="relative">
              <input
                type="text"
                required
                value={contactPerson}
                onChange={(e) => setContactPerson(e.target.value)}
                placeholder="שם איש קשר *"
                className={inputStyle}
              />
              <FontAwesomeIcon icon={faUser} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
            </div>
          </div>
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
          <div className="relative flex flex-col">
            <label className="mb-1 text-sm font-medium text-gray-700">טלפון איש קשר</label>
            <div className="relative">
              <input
                type="tel"
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                placeholder="טלפון איש קשר"
                className={inputStyle}
              />
              <FontAwesomeIcon icon={faPhone} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
            </div>
          </div>
          <div className="relative flex flex-col">
            <label className="mb-1 text-sm font-medium text-gray-700">כתובת</label>
            <div className="relative">
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="כתובת"
                className={inputStyle}
              />
              <FontAwesomeIcon icon={faMapMarkerAlt} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
            </div>
          </div>

          {/* Partnership Details */}
          <div className="relative flex flex-col">
            <label className="mb-1 text-sm font-medium text-gray-700">תאריך תחילת שותפות</label>
            <div className="relative">
              <input
                type="date"
                value={partnershipStart}
                onChange={(e) => setPartnershipStart(e.target.value)}
                className={inputStyle}
              />
              <FontAwesomeIcon icon={faCalendarAlt} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
            </div>
          </div>
          <div className="relative flex flex-col">
            <label className="mb-1 text-sm font-medium text-gray-700">תאריך סיום שותפות</label>
            <div className="relative">
              <input
                type="date"
                value={partnershipEnd}
                onChange={(e) => setPartnershipEnd(e.target.value)}
                className={inputStyle}
              />
              <FontAwesomeIcon icon={faCalendarAlt} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
            </div>
          </div>
          <div className="relative flex flex-col">
            <label className="mb-1 text-sm font-medium text-gray-700">סטטוס</label>
            <div className="relative">
              <select
                required
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className={inputStyle}
              >
                <option value="active">פעיל</option>
                <option value="inactive">לא פעיל</option>
                <option value="pending">ממתין</option>
              </select>
              <FontAwesomeIcon icon={faInfoCircle} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
            </div>
          </div>
          <div className="relative flex flex-col">
            <label className="mb-1 text-sm font-medium text-gray-700">סוג ארגון</label>
            <div className="relative">
              <input
                type="text"
                value={organizationType}
                onChange={(e) => setOrganizationType(e.target.value)}
                placeholder="לדוגמא: עמותה, חברה, מוסד חינוכי"
                className={inputStyle}
              />
              <FontAwesomeIcon icon={faTag} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
            </div>
          </div>
          <div className="relative flex flex-col">
            <label className="mb-1 text-sm font-medium text-gray-700">סוג תרומה/שיתוף פעולה</label>
            <div className="relative">
              <input
                type="text"
                value={contributionType}
                onChange={(e) => setContributionType(e.target.value)}
                placeholder="לדוגמא: תמיכה כספית, מתנדבים, ציוד"
                className={inputStyle}
              />
              <FontAwesomeIcon icon={faHandshake} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
            </div>
          </div>
          <div className="relative flex flex-col">
            <label className="mb-1 text-sm font-medium text-gray-700">אתר אינטרנט</label>
            <div className="relative">
              <input
                type="url"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                placeholder="כתובת אתר אינטרנט (URL)"
                className={inputStyle}
              />
              <FontAwesomeIcon icon={faGlobe} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
            </div>
          </div>
          <div className="relative flex flex-col">
            <label className="mb-1 text-sm font-medium text-gray-700">לוגו (URL)</label>
            <div className="relative">
              <input
                type="url"
                value={logo}
                onChange={(e) => setLogo(e.target.value)}
                placeholder="כתובת URL ללוגו"
                className={inputStyle}
              />
              <FontAwesomeIcon icon={faImage} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
            </div>
          </div>

          {/* Description */}
          <div className="md:col-span-2 relative flex flex-col">
            <label className="mb-1 text-sm font-medium text-gray-700">תיאור השותפות</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="תיאור מפורט של השותפות והפעילות המשותפת"
              className={textareaStyle}
            ></textarea>
          </div>

          {/* Submit Button */}
          <div className="col-span-1 md:col-span-2 mt-4 md:mt-6"> {/* Adjusted margin-top for smaller screens */}
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
        resetFormFields(); // Clear form on close
      }} title="ערוך פרטי שותף">
        <form className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6" onSubmit={handleUpdatePartner}> {/* Adjusted gap */}
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

          {/* Contact Person */}
          <div className="relative flex flex-col">
            <label className="mb-1 text-sm font-medium text-gray-700">איש קשר</label>
            <div className="relative">
              <input
                type="text"
                required
                value={contactPerson}
                onChange={(e) => setContactPerson(e.target.value)}
                placeholder="שם איש קשר *"
                className={inputStyle}
              />
              <FontAwesomeIcon icon={faUser} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
            </div>
          </div>
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
          <div className="relative flex flex-col">
            <label className="mb-1 text-sm font-medium text-gray-700">טלפון איש קשר</label>
            <div className="relative">
              <input
                type="tel"
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                placeholder="טלפון איש קשר"
                className={inputStyle}
              />
              <FontAwesomeIcon icon={faPhone} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
            </div>
          </div>
          <div className="relative flex flex-col">
            <label className="mb-1 text-sm font-medium text-gray-700">כתובת</label>
            <div className="relative">
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="כתובת"
                className={inputStyle}
              />
              <FontAwesomeIcon icon={faMapMarkerAlt} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
            </div>
          </div>

          {/* Partnership Details */}
          <div className="relative flex flex-col">
            <label className="mb-1 text-sm font-medium text-gray-700">תאריך תחילת שותפות</label>
            <div className="relative">
              <input
                type="date"
                value={partnershipStart}
                onChange={(e) => setPartnershipStart(e.target.value)}
                className={inputStyle}
              />
              <FontAwesomeIcon icon={faCalendarAlt} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
            </div>
          </div>
          <div className="relative flex flex-col">
            <label className="mb-1 text-sm font-medium text-gray-700">תאריך סיום שותפות</label>
            <div className="relative">
              <input
                type="date"
                value={partnershipEnd}
                onChange={(e) => setPartnershipEnd(e.target.value)}
                className={inputStyle}
              />
              <FontAwesomeIcon icon={faCalendarAlt} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
            </div>
          </div>
          <div className="relative flex flex-col">
            <label className="mb-1 text-sm font-medium text-gray-700">סטטוס</label>
            <div className="relative">
              <select
                required
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className={inputStyle}
              >
                <option value="active">פעיל</option>
                <option value="inactive">לא פעיל</option>
                <option value="pending">ממתין</option>
              </select>
              <FontAwesomeIcon icon={faInfoCircle} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
            </div>
          </div>
          <div className="relative flex flex-col">
            <label className="mb-1 text-sm font-medium text-gray-700">סוג ארגון</label>
            <div className="relative">
              <input
                type="text"
                value={organizationType}
                onChange={(e) => setOrganizationType(e.target.value)}
                placeholder="לדוגמא: עמותה, חברה, מוסד חינוכי"
                className={inputStyle}
              />
              <FontAwesomeIcon icon={faTag} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
            </div>
          </div>
          <div className="relative flex flex-col">
            <label className="mb-1 text-sm font-medium text-gray-700">סוג תרומה/שיתוף פעולה</label>
            <div className="relative">
              <input
                type="text"
                value={contributionType}
                onChange={(e) => setContributionType(e.target.value)}
                placeholder="לדוגמא: תמיכה כספית, מתנדבים, ציוד"
                className={inputStyle}
              />
              <FontAwesomeIcon icon={faHandshake} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
            </div>
          </div>
          <div className="relative flex flex-col">
            <label className="mb-1 text-sm font-medium text-gray-700">אתר אינטרנט</label>
            <div className="relative">
              <input
                type="url"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                placeholder="כתובת אתר אינטרנט (URL)"
                className={inputStyle}
              />
              <FontAwesomeIcon icon={faGlobe} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
            </div>
          </div>
          <div className="relative flex flex-col">
            <label className="mb-1 text-sm font-medium text-gray-700">לוגו (URL)</label>
            <div className="relative">
              <input
                type="url"
                value={logo}
                onChange={(e) => setLogo(e.target.value)}
                placeholder="כתובת URL ללוגו"
                className={inputStyle}
              />
              <FontAwesomeIcon icon={faImage} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
            </div>
          </div>

          {/* Description */}
          <div className="md:col-span-2 relative flex flex-col">
            <label className="mb-1 text-sm font-medium text-gray-700">תיאור השותפות</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="תיאור מפורט של השותפות והפעילות המשותפת"
              className={textareaStyle}
            ></textarea>
          </div>

          {/* Submit Button */}
          <div className="col-span-1 md:col-span-2 mt-4 md:mt-6"> {/* Adjusted margin-top for smaller screens */}
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
            <div key={partner.id} className="bg-white p-6 rounded-lg shadow-md border border-gray-200 relative"> {/* Added relative for positioning icons */}
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

              <h4 className="text-lg sm:text-xl font-semibold text-gray-800 mb-2 mt-8 sm:mt-0"> {/* Adjusted font size and margin-top */}
                {partner.logo && (
                  <img src={partner.logo} alt={`${partner.name} Logo`} className="w-20 h-20 sm:w-24 sm:h-24 object-contain mx-auto mb-4 rounded-full" onError={(e) => { e.target.onerror = null; e.target.src = "https://placehold.co/96x96/e2e8f0/64748b?text=Logo"; }} />
                )}
                {partner.name}
              </h4>
              <p className="text-gray-700 text-xs sm:text-sm mb-1"> {/* Adjusted font size */}
                <span className="font-medium">איש קשר:</span> {partner.contact_person}
              </p>
              <p className="text-gray-700 text-xs sm:text-sm mb-1"> {/* Adjusted font size */}
                <span className="font-medium">אימייל:</span> {partner.contact_email}
              </p>
              {partner.contact_phone && (
                <p className="text-gray-700 text-xs sm:text-sm mb-1"> {/* Adjusted font size */}
                  <span className="font-medium">טלפון:</span> {partner.contact_phone}
                </p>
              )}
              {partner.organization_type && (
                <p className="text-gray-700 text-xs sm:text-sm mb-1"> {/* Adjusted font size */}
                  <span className="font-medium">סוג ארגון:</span> {partner.organization_type}
                </p>
              )}
              {partner.contribution_type && (
                <p className="text-gray-700 text-xs sm:text-sm mb-1"> {/* Adjusted font size */}
                  <span className="font-medium">סוג תרומה:</span> {partner.contribution_type}
                </p>
              )}
              <p className="text-gray-700 text-xs sm:text-sm mb-1"> {/* Adjusted font size */}
                <span className="font-medium">סטטוס:</span> <span className={`font-bold ${partner.status === 'active' ? 'text-green-600' : partner.status === 'inactive' ? 'text-red-600' : 'text-yellow-600'}`}>{partner.status}</span>
              </p>
              {partner.partnership_start && (
                <p className="text-gray-700 text-xs sm:text-sm mb-1"> {/* Adjusted font size */}
                  <span className="font-medium">תחילת שותפות:</span> {partner.partnership_start.toLocaleDateString('he-IL')}
                </p>
              )}
              {partner.partnership_end && (
                <p className="text-gray-700 text-xs sm:text-sm mb-1"> {/* Adjusted font size */}
                  <span className="font-medium">סיום שותפות:</span> {partner.partnership_end.toLocaleDateString('he-IL')}
                </p>
              )}
              {partner.website && (
                <p className="text-gray-700 text-xs sm:text-sm mb-1"> {/* Adjusted font size */}
                  <span className="font-medium">אתר:</span> <a href={partner.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline truncate">{partner.website}</a>
                </p>
              )}
              {partner.description && (
                <details className="mt-2 text-xs sm:text-sm text-gray-600"> {/* Adjusted font size */}
                  <summary className="font-medium cursor-pointer">תיאור</summary>
                  <p className="mt-1">{partner.description}</p>
                </details>
              )}
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