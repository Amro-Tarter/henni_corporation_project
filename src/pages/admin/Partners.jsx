import React, { useState, useEffect, useCallback } from "react";
import { collection, query, getDocs, onSnapshot, doc, setDoc, serverTimestamp } from "firebase/firestore";
import { db, auth } from "../../config/firbaseConfig"; 
import { onAuthStateChanged } from "firebase/auth";
import { toast } from 'sonner';
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../../components/dashboard/DashboardLayout";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faBuilding, faUser, faEnvelope, faPhone, faMapMarkerAlt, faCalendarAlt, 
  faHandshake, faTag, faGlobe, faImage, faInfoCircle, faPlus, faTimes 
} from '@fortawesome/free-solid-svg-icons'; // Added new icons
import CleanElementalOrbitLoader from '../../theme/ElementalLoader'


// Modal Component for Add Partner Form
const Modal = ({ children, onClose }) => {
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
        {children}
      </div>
    </div>
  );
};


function Partners() {
  const navigate = useNavigate();

  const [currentUserId, setCurrentUserId] = useState(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [loading, setLoading] = useState(true);
  const [partnersList, setPartnersList] = useState([]);
  const [showAddPartnerForm, setShowAddPartnerForm] = useState(false);

  // Form states
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

  // Tailwind CSS input/textarea style for consistency - UPDATED
  const inputStyle = "appearance-none rounded-md w-full px-4 py-3 border border-gray-300 placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-right shadow-sm pr-10";
  const textareaStyle = "appearance-none rounded-md w-full px-4 py-3 border border-gray-300 placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-right h-24 shadow-sm";

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
  const handleSubmit = async (e) => {
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
        partnership_start: partnershipStart ? new Date(partnershipStart) : null,
        partnership_end: partnershipEnd ? new Date(partnershipEnd) : null,
        status,
        website,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      await setDoc(doc(db, "partners", crypto.randomUUID()), partnerData);
      toast.success("השותף נוסף בהצלחה!");

      // Reset form fields after successful submission
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

      setShowAddPartnerForm(false); 
    } catch (err) {
      console.error("Error adding partner:", err);
      toast.error("אירעה שגיאה בהוספת השותף. אנא נסה שנית.");
    }
  };

  if (!isAuthReady || loading) {
    return <CleanElementalOrbitLoader />; 
  }
  if (loading) return <CleanElementalOrbitLoader/>;

  return (
    <DashboardLayout>
    <div className="container mx-auto min-h-screen py-12 px-4 sm:px-6 lg:px-8 relative" dir="rtl">
      <div className="flex justify-center items-center mb-8 relative">
         <button
            onClick={() => setShowAddPartnerForm(true)}
            className="flex gap-2 absolute left-0 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 shadow-md transition-all duration-200"
          >
            <FontAwesomeIcon icon={faPlus} className="ml-2" />
            הוסף שותף חדש
          </button>
        {/* Title */}
        <div className="flex flex-col items-center gap-4">
          <h1 className="text-4xl font-bold bg-black bg-clip-text text-transparent leading-[1.5] px-6">
            ניהול שותפים
          </h1>
        </div>
      </div>

        {showAddPartnerForm && (
          <Modal onClose={() => setShowAddPartnerForm(false)}>
            <h3 className="text-2xl font-bold text-gray-800 mb-6 text-center">טופס הוספת שותף</h3>
            <form className="grid grid-cols-1 md:grid-cols-2 gap-6" onSubmit={handleSubmit}>
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

                {/* Contact Information */}
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
                <div className="col-span-1 md:col-span-2 mt-6">
                  <button
                    type="submit"
                    className="w-full py-3 px-4 rounded-md font-medium text-white text-lg bg-indigo-600 hover:bg-indigo-700 transition duration-300 ease-in-out shadow-md"
                  >
                    הוסף שותף
                  </button>
                </div>
              </form>
            </Modal>
          )}

          {/* Partners List Section */}
          <div className="md:col-span-3 mt-8">
            <h3 className="text-2xl font-bold text-gray-800 mb-4 text-center">רשימת שותפים קיימים</h3>
            {partnersList.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {partnersList.map(partner => (
                  <div key={partner.id} className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
                    <h4 className="text-xl font-semibold text-gray-800 mb-2">{partner.name}</h4>
                    {partner.logo && (
                        <img src={partner.logo} alt={`${partner.name} Logo`} className="w-24 h-24 object-contain mx-auto mb-4 rounded-full" onError={(e) => { e.target.onerror = null; e.target.src="https://placehold.co/96x96/e2e8f0/64748b?text=Logo"; }}/>
                    )}
                    <p className="text-gray-700 text-sm mb-1">
                      <span className="font-medium">איש קשר:</span> {partner.contact_person}
                    </p>
                    <p className="text-gray-700 text-sm mb-1">
                      <span className="font-medium">אימייל:</span> {partner.contact_email}
                    </p>
                    {partner.contact_phone && (
                      <p className="text-gray-700 text-sm mb-1">
                        <span className="font-medium">טלפון:</span> {partner.contact_phone}
                      </p>
                    )}
                    {partner.organization_type && (
                      <p className="text-gray-700 text-sm mb-1">
                        <span className="font-medium">סוג ארגון:</span> {partner.organization_type}
                      </p>
                    )}
                    {partner.contribution_type && (
                      <p className="text-gray-700 text-sm mb-1">
                        <span className="font-medium">סוג תרומה:</span> {partner.contribution_type}
                      </p>
                    )}
                    <p className="text-gray-700 text-sm mb-1">
                      <span className="font-medium">סטטוס:</span> <span className={`font-bold ${partner.status === 'active' ? 'text-green-600' : partner.status === 'inactive' ? 'text-red-600' : 'text-yellow-600'}`}>{partner.status}</span>
                    </p>
                    {partner.partnership_start && (
                      <p className="text-gray-700 text-sm mb-1">
                        <span className="font-medium">תחילת שותפות:</span> {partner.partnership_start.toLocaleDateString('he-IL')}
                      </p>
                    )}
                    {partner.partnership_end && (
                      <p className="text-gray-700 text-sm mb-1">
                        <span className="font-medium">סיום שותפות:</span> {partner.partnership_end.toLocaleDateString('he-IL')}
                      </p>
                    )}
                    {partner.website && (
                      <p className="text-gray-700 text-sm mb-1">
                        <span className="font-medium">אתר:</span> <a href={partner.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline truncate">{partner.website}</a>
                      </p>
                    )}
                    {partner.description && (
                      <details className="mt-2 text-sm text-gray-600">
                        <summary className="font-medium cursor-pointer">תיאור</summary>
                        <p className="mt-1">{partner.description}</p>
                      </details>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-600 text-lg">אין שותפים רשומים במערכת.</p>
            )}
          </div>
      </div>
    </DashboardLayout>
  );
}

export default Partners;
