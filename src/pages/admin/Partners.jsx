import React, { useState, useEffect } from "react";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { db, auth } from "../../config/firbaseConfig"; // Assuming this path is correct
import { onAuthStateChanged } from "firebase/auth";
import { toast } from 'sonner';
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../../components/dashboard/DashboardLayout";

function PartnerForm() {
  const navigate = useNavigate();

  // State for user ID and authentication readiness
  const [currentUserId, setCurrentUserId] = useState(null);
  const [isAuthReady, setIsAuthReady] = useState(false);

  // Form states matching Firestore structure
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [contactPerson, setContactPerson] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [contributionType, setContributionType] = useState("");
  const [description, setDescription] = useState("");
  const [logo, setLogo] = useState(""); // For logo URL
  const [organizationType, setOrganizationType] = useState("");
  const [partnershipStart, setPartnershipStart] = useState("");
  const [partnershipEnd, setPartnershipEnd] = useState("");
  const [status, setStatus] = useState("active"); // Default status
  const [website, setWebsite] = useState("");

  // Tailwind CSS input/textarea style for consistency
  const inputStyle = "appearance-none rounded-md w-full px-3 py-3 pr-10 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-right";
  const textareaStyle = "appearance-none rounded-md w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-right h-24";

  // Authentication Listener
  useEffect(() => {
    if (auth) {
      const unsubscribe = onAuthStateChanged(auth, (user) => {
        if (user) {
          setCurrentUserId(user.uid);
        } else {
          console.warn("No user authenticated. PartnerForm might require authentication.");
          // You might want to redirect to a login page or show an error
          // navigate("/login");
        }
        setIsAuthReady(true);
      });
      return () => unsubscribe();
    } else {
      console.error("Firebase Auth instance not available. Check ../../config/firbaseConfig.js");
      toast.error("Firebase authentication not configured correctly.");
      setIsAuthReady(true);
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!db || !currentUserId) {
      toast.error("Firebase database not available or user not authenticated. Please try again.");
      return;
    }

    // Basic validation
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

      // Add a new document with a generated ID in the 'partners' collection
      await setDoc(doc(db, "partners", crypto.randomUUID()), partnerData);
      toast.success("השותף נוסף בהצלחה!");

      // Reset form fields
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

      // Optional: Navigate to a partners list page
      // setTimeout(() => {
      //   navigate("/admin/partners");
      // }, 1500);

    } catch (err) {
      console.error("Error adding partner:", err);
      toast.error("אירעה שגיאה בהוספת השותף. אנא נסה שנית.");
    }
  };

  if (!isAuthReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-500 to-cyan-100 py-12 px-4 sm:px-6 lg:px-8 relative" dir="rtl">
        <div className="text-xl font-semibold text-gray-700">טוען...</div>
      </div>
    );
  }

  return (
        <DashboardLayout>

    <div
      className="min-h-screen flex items-center justify-center  py-12 px-4 sm:px-6 lg:px-8 relative"
      dir="rtl"
    >
      <div className="w-full max-w-4xl bg-white backdrop-blur-md rounded-xl shadow-lg overflow-hidden p-8 z-10">
        <div className="text-center mb-6">
          <h2 className="text-3xl font-extrabold text-gray-900">הוספת שותף חדש</h2>
          <p className="mt-2 text-sm text-gray-700">מלא את הפרטים הבאים כדי להוסיף שותף למערכת</p>
        </div>

        <form className="grid grid-cols-1 md:grid-cols-2 gap-6" onSubmit={handleSubmit}>
          {/* Partner Name */}
          <div className="md:col-span-2 flex flex-col">
            <label className="mb-1 text-sm font-medium text-gray-700">שם הארגון/שותף</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="שם הארגון/שותף *"
              className={inputStyle}
            />
          </div>

          {/* Contact Information */}
          <div className="flex flex-col">
            <label className="mb-1 text-sm font-medium text-gray-700">איש קשר</label>
            <input
              type="text"
              required
              value={contactPerson}
              onChange={(e) => setContactPerson(e.target.value)}
              placeholder="שם איש קשר *"
              className={inputStyle}
            />
          </div>
          <div className="flex flex-col">
            <label className="mb-1 text-sm font-medium text-gray-700">אימייל איש קשר</label>
            <input
              type="email"
              required
              value={contactEmail}
              onChange={(e) => setContactEmail(e.target.value)}
              placeholder="אימייל איש קשר *"
              className={inputStyle}
            />
          </div>
          <div className="flex flex-col">
            <label className="mb-1 text-sm font-medium text-gray-700">טלפון איש קשר</label>
            <input
              type="tel"
              value={contactPhone}
              onChange={(e) => setContactPhone(e.target.value)}
              placeholder="טלפון איש קשר"
              className={inputStyle}
            />
          </div>
          <div className="flex flex-col">
            <label className="mb-1 text-sm font-medium text-gray-700">כתובת</label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="כתובת"
              className={inputStyle}
            />
          </div>

          {/* Partnership Details */}
          <div className="flex flex-col">
            <label className="mb-1 text-sm font-medium text-gray-700">תאריך תחילת שותפות</label>
            <input
              type="date"
              value={partnershipStart}
              onChange={(e) => setPartnershipStart(e.target.value)}
              className={inputStyle}
            />
          </div>
          <div className="flex flex-col">
            <label className="mb-1 text-sm font-medium text-gray-700">תאריך סיום שותפות</label>
            <input
              type="date"
              value={partnershipEnd}
              onChange={(e) => setPartnershipEnd(e.target.value)}
              className={inputStyle}
            />
          </div>
          <div className="flex flex-col">
            <label className="mb-1 text-sm font-medium text-gray-700">סטטוס</label>
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
          </div>
          <div className="flex flex-col">
            <label className="mb-1 text-sm font-medium text-gray-700">סוג ארגון</label>
            <input
              type="text"
              value={organizationType}
              onChange={(e) => setOrganizationType(e.target.value)}
              placeholder="לדוגמא: עמותה, חברה, מוסד חינוכי"
              className={inputStyle}
            />
          </div>
          <div className="flex flex-col">
            <label className="mb-1 text-sm font-medium text-gray-700">סוג תרומה/שיתוף פעולה</label>
            <input
              type="text"
              value={contributionType}
              onChange={(e) => setContributionType(e.target.value)}
              placeholder="לדוגמא: תמיכה כספית, מתנדבים, ציוד"
              className={inputStyle}
            />
          </div>
          <div className="flex flex-col">
            <label className="mb-1 text-sm font-medium text-gray-700">אתר אינטרנט</label>
            <input
              type="url"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              placeholder="כתובת אתר אינטרנט (URL)"
              className={inputStyle}
            />
          </div>
          <div className="flex flex-col">
            <label className="mb-1 text-sm font-medium text-gray-700">לוגו (URL)</label>
            <input
              type="url"
              value={logo}
              onChange={(e) => setLogo(e.target.value)}
              placeholder="כתובת URL ללוגו"
              className={inputStyle}
            />
          </div>

          {/* Description */}
          <div className="md:col-span-2 flex flex-col">
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
      </div>
    </div>
      </DashboardLayout>
);
}

export default PartnerForm;
