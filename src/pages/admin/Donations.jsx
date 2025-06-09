import React, { useState, useEffect } from "react";
import { collection, query, getDocs, onSnapshot, doc, setDoc, serverTimestamp, where } from "firebase/firestore"; // Import 'where'
import { db, auth } from "../../config/firbaseConfig";
import { onAuthStateChanged } from "firebase/auth";
import { toast } from 'sonner';
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../../components/dashboard/DashboardLayout";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faDollarSign, faShekelSign, faUser, faEnvelope, faPhone, faCalendarAlt,
  faCreditCard, faSyncAlt, faHandHoldingHeart, faReceipt, faStickyNote,
  faCheckSquare, faInfoCircle, faProjectDiagram, faUserFriends, faPlus, faTimes,
  faMoneyBillWave, faPiggyBank, faHandshake, faClock
} from '@fortawesome/free-solid-svg-icons';
import CleanElementalOrbitLoader from '../../theme/ElementalLoader'

// Modal Component for Add Donation Form
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


function Donations() {
  const navigate = useNavigate();

  const [currentUserId, setCurrentUserId] = useState(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [loading, setLoading] = useState(true);
  const [donationsList, setDonationsList] = useState([]);
  const [showAddDonationForm, setShowAddDonationForm] = useState(false);

  // New states for participants and projects
  const [participants, setParticipants] = useState([]);
  const [projects, setProjects] = useState([]);

  // Form states
  const [amount, setAmount] = useState(0);
  const [currency, setCurrency] = useState("ILS");
  const [designatedPurpose, setDesignatedPurpose] = useState("");
  const [donationDate, setDonationDate] = useState("");
  const [donorEmail, setDonorEmail] = useState("");
  const [donorName, setDonorName] = useState("");
  const [donorPhone, setDonorPhone] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [isRecurring, setIsRecurring] = useState(false);
  const [notes, setNotes] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [recurrencePeriod, setRecurrencePeriod] = useState("");
  const [relatedParticipantId, setRelatedParticipantId] = useState(""); // This will now hold participant ID
  const [relatedProjectId, setRelatedProjectId] = useState("");       // This will now hold project ID
  const [taxReceiptDate, setTaxReceiptDate] = useState("");
  const [taxReceiptIssued, setTaxReceiptIssued] = useState(false);

  // Tailwind CSS input/textarea style for consistency
  const inputStyle = "appearance-none rounded-md w-full px-4 py-3 border border-gray-300 placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-right shadow-sm pr-10";
  const textareaStyle = "appearance-none rounded-md w-full px-4 py-3 border border-gray-300 placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-right h-24 shadow-sm";
  const checkboxStyle = "h-5 w-5 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded-md";

  // Authentication Listener and Data Fetching
  useEffect(() => {
    if (auth) {
      const unsubscribeAuth = onAuthStateChanged(auth, async (user) => { // Made async to await data fetches
        if (user) {
          setCurrentUserId(user.uid);
          setIsAuthReady(true);

          // Fetch donations
          const donationsCollectionRef = collection(db, "donations");
          const unsubscribeDonations = onSnapshot(donationsCollectionRef, (snapshot) => {
            const fetchedDonations = snapshot.docs.map(doc => ({
              id: doc.id,
              ...doc.data(),
              donation_date: doc.data().donation_date?.toDate(),
              tax_receipt_date: doc.data().tax_receipt_date?.toDate(),
            }));
            setDonationsList(fetchedDonations);
          }, (error) => {
            console.error("Error fetching donations:", error);
            toast.error("אירעה שגיאה בטעינת נתוני התרומות.");
          });

          // Fetch participants with role "participant"
          const participantsCollectionRef = collection(db, "users"); // Assuming users collection
          const qParticipants = query(participantsCollectionRef, where("role", "==", "participant"));
          try {
            const participantSnapshot = await getDocs(qParticipants);
            const fetchedParticipants = participantSnapshot.docs.map(doc => ({
              id: doc.id,
              name: doc.data().name || doc.data().email || doc.id, // Use name, then email, then ID as fallback
            }));
            setParticipants(fetchedParticipants);
          } catch (error) {
            console.error("Error fetching participants:", error);
            toast.error("אירעה שגיאה בטעינת נתוני המשתתפים.");
          }

         

          setLoading(false); // All data loaded
          return () => unsubscribeDonations(); // Cleanup donations listener on unmount
        } else {
          console.warn("No user authenticated. Donations page might require authentication.");
          setIsAuthReady(true);
          setLoading(false);
          // navigate("/login");
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

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!db) {
      toast.error("Firebase database not available. Please try again.");
      return;
    }

    if (amount <= 0 || !currency || !paymentMethod || (!isAnonymous && (!donorName || !donorEmail))) {
      toast.error("אנא מלא את כל שדות החובה: סכום, מטבע, אמצעי תשלום, ושם/אימייל תורם (אלא אם אנונימי).");
      return;
    }

    try {
      const donationData = {
        amount: Number(amount),
        currency,
        designated_purpose: designatedPurpose,
        donation_date: donationDate ? new Date(donationDate) : serverTimestamp(),
        donor_email: isAnonymous ? "" : donorEmail,
        donor_name: isAnonymous ? "אנונימי" : donorName,
        donor_phone: donorPhone,
        is_anonymous: isAnonymous,
        is_recurring: isRecurring,
        notes,
        payment_method: paymentMethod,
        recurrence_period: isRecurring ? recurrencePeriod : "",
        related_participant_id: relatedParticipantId,
        related_project_id: relatedProjectId,
        tax_receipt_date: taxReceiptDate ? new Date(taxReceiptDate) : null,
        tax_receipt_issued: taxReceiptIssued,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        submittedBy: currentUserId || "anonymous",
      };

      await setDoc(doc(db, "donations", crypto.randomUUID()), donationData);
      toast.success("התרומה נשלחה בהצלחה! תודה רבה.");

      // Reset form fields
      setAmount(0);
      setCurrency("ILS");
      setDesignatedPurpose("");
      setDonationDate("");
      setDonorEmail("");
      setDonorName("");
      setDonorPhone("");
      setIsAnonymous(false);
      setIsRecurring(false);
      setNotes("");
      setPaymentMethod("");
      setRecurrencePeriod("");
      setRelatedParticipantId("");
      setRelatedProjectId("");
      setTaxReceiptDate("");
      setTaxReceiptIssued(false);

      setShowAddDonationForm(false);
    } catch (err) {
      console.error("Error submitting donation:", err);
      toast.error("אירעה שגיאה בשליחת התרומה. אנא נסה שנית.");
    }
  };

  if (!isAuthReady || loading) {
  return <CleanElementalOrbitLoader/>;
  }

  return (
    <DashboardLayout>
      <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 relative" dir="rtl">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-extrabold text-gray-900">ניהול תרומות</h2>
            <p className="mt-2 text-sm text-gray-700">צפה, ערוך והוסף תרומות למערכת</p>
          </div>

          <div className="mb-6 text-center">
            <button
              onClick={() => setShowAddDonationForm(true)}
              className="py-2 px-6 rounded-md font-medium text-white bg-indigo-600 hover:bg-indigo-700 transition duration-300 ease-in-out shadow-md"
            >
              <FontAwesomeIcon icon={faPlus} className="ml-2" />
              הוסף תרומה חדשה
            </button>
          </div>

          {showAddDonationForm && (
            <Modal onClose={() => setShowAddDonationForm(false)}>
              <h3 className="text-2xl font-bold text-gray-800 mb-6 text-center">טופס תרומה</h3>
              <p className="mt-2 text-sm text-gray-700 text-center mb-6">תמכו בנו והיו חלק מהשינוי!</p>

              <form className="grid grid-cols-1 md:grid-cols-2 gap-6" onSubmit={handleSubmit}>
                {/* Section: Donation Details */}
                <div className="md:col-span-2 border-b pb-4 mb-6 border-gray-200">
                  <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <FontAwesomeIcon icon={faDollarSign} className="text-green-600" />
                    פרטי התרומה
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="relative flex flex-col">
                      <label className="mb-1 text-sm font-medium text-gray-700">סכום התרומה</label>
                      <div className="relative">
                        <input
                          type="number"
                          required
                          value={amount}
                          onChange={(e) => setAmount(e.target.value)}
                          placeholder="סכום *"
                          min="0"
                          className={inputStyle}
                        />
                        <FontAwesomeIcon icon={faDollarSign} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      </div>
                    </div>
                    <div className="relative flex flex-col">
                      <label className="mb-1 text-sm font-medium text-gray-700">מטבע</label>
                      <div className="relative">
                        <select
                          required
                          value={currency}
                          onChange={(e) => setCurrency(e.target.value)}
                          className={inputStyle}
                        >
                          <option value="ILS">ש"ח (ILS)</option>
                          <option value="USD">דולר (USD)</option>
                          <option value="EUR">יורו (EUR)</option>
                        </select>
                        <FontAwesomeIcon icon={faShekelSign} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      </div>
                    </div>
                    <div className="relative flex flex-col md:col-span-2">
                      <label className="mb-1 text-sm font-medium text-gray-700">תאריך התרומה</label>
                      <div className="relative">
                        <input
                          type="date"
                          value={donationDate}
                          onChange={(e) => setDonationDate(e.target.value)}
                          className={inputStyle}
                        />
                        <FontAwesomeIcon icon={faCalendarAlt} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Section: Donor Information */}
                <div className="md:col-span-2 border-b pb-4 mb-6 border-gray-200">
                  <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <FontAwesomeIcon icon={faUser} className="text-blue-600" />
                    פרטי התורם
                  </h3>
                  <div className="flex items-center justify-end gap-2 mb-4">
                    <label htmlFor="isAnonymous" className="text-sm font-medium text-gray-700 cursor-pointer">
                      תרומה אנונימית?
                    </label>
                    <input
                      id="isAnonymous"
                      type="checkbox"
                      checked={isAnonymous}
                      onChange={(e) => setIsAnonymous(e.target.checked)}
                      className={checkboxStyle}
                    />
                  </div>

                  {!isAnonymous && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="relative flex flex-col">
                        <label className="mb-1 text-sm font-medium text-gray-700">שם התורם</label>
                        <div className="relative">
                          <input
                            type="text"
                            required={!isAnonymous}
                            value={donorName}
                            onChange={(e) => setDonorName(e.target.value)}
                            placeholder="שם מלא *"
                            className={inputStyle}
                          />
                          <FontAwesomeIcon icon={faUser} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        </div>
                      </div>
                      <div className="relative flex flex-col">
                        <label className="mb-1 text-sm font-medium text-gray-700">אימייל התורם</label>
                        <div className="relative">
                          <input
                            type="email"
                            required={!isAnonymous}
                            value={donorEmail}
                            onChange={(e) => setDonorEmail(e.target.value)}
                            placeholder="אימייל *"
                            className={inputStyle}
                          />
                          <FontAwesomeIcon icon={faEnvelope} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        </div>
                      </div>
                      <div className="relative flex flex-col md:col-span-2">
                        <label className="mb-1 text-sm font-medium text-gray-700">טלפון התורם</label>
                        <div className="relative">
                          <input
                            type="tel"
                            value={donorPhone}
                            onChange={(e) => setDonorPhone(e.target.value)}
                            placeholder="טלפון"
                            className={inputStyle}
                          />
                          <FontAwesomeIcon icon={faPhone} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Section: Payment and Recurrence */}
                <div className="md:col-span-2 border-b pb-4 mb-6 border-gray-200">
                  <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <FontAwesomeIcon icon={faCreditCard} className="text-purple-600" />
                    פרטי תשלום ותדירות
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="relative flex flex-col">
                      <label className="mb-1 text-sm font-medium text-gray-700">אמצעי תשלום</label>
                      <div className="relative">
                        <select
                          required
                          value={paymentMethod}
                          onChange={(e) => setPaymentMethod(e.target.value)}
                          className={inputStyle}
                        >
                          <option value="">בחר אמצעי תשלום *</option>
                          <option value="Credit Card">כרטיס אשראי</option>
                          <option value="Bank Transfer">העברה בנקאית</option>
                          <option value="PayPal">פייפאל</option>
                          <option value="Cash">מזומן</option>
                          <option value="Other">אחר</option>
                        </select>
                        <FontAwesomeIcon icon={faCreditCard} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      </div>
                    </div>
                    <div className="relative flex flex-col">
                      <label htmlFor="isRecurring" className="text-sm font-medium text-gray-700 cursor-pointer flex items-center gap-2 mb-1">
                        <input
                          id="isRecurring"
                          type="checkbox"
                          checked={isRecurring}
                          onChange={(e) => setIsRecurring(e.target.checked)}
                          className={checkboxStyle}
                        />
                        תרומה חוזרת?
                      </label>
                      {isRecurring && (
                        <div className="relative">
                          <select
                            value={recurrencePeriod}
                            onChange={(e) => setRecurrencePeriod(e.target.value)}
                            className={inputStyle}
                          >
                            <option value="">בחר תדירות</option>
                            <option value="monthly">חודשי</option>
                            <option value="quarterly">רבעוני</option>
                            <option value="yearly">שנתי</option>
                          </select>
                          <FontAwesomeIcon icon={faSyncAlt} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Section: Purpose and Related IDs - UPDATED */}
                <div className="md:col-span-2 border-b pb-4 mb-6 border-gray-200">
                  <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <FontAwesomeIcon icon={faHandHoldingHeart} className="text-orange-600" />
                    מטרה וקישורים
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="relative flex flex-col">
                      <label className="mb-1 text-sm font-medium text-gray-700">מטרה ייעודית</label>
                      <div className="relative">
                        <input
                          type="text"
                          value={designatedPurpose}
                          onChange={(e) => setDesignatedPurpose(e.target.value)}
                          placeholder="לדוגמא: לפרויקט X, לילד Y"
                          className={inputStyle}
                        />
                        <FontAwesomeIcon icon={faInfoCircle} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      </div>
                    </div>

                    {/* Participant Select Input */}
                    <div className="relative flex flex-col">
                      <label className="mb-1 text-sm font-medium text-gray-700">בחר משתתף קשור</label>
                      <div className="relative">
                        <select
                          value={relatedParticipantId}
                          onChange={(e) => setRelatedParticipantId(e.target.value)}
                          className={inputStyle}
                        >
                          <option value="">בחר משתתף (אופציונלי)</option>
                          {participants.map(participant => (
                            <option key={participant.id} value={participant.id}>
                              {participant.name}
                            </option>
                          ))}
                        </select>
                        <FontAwesomeIcon icon={faUserFriends} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      </div>
                    </div>

                    {/* Project Select Input */}
                    <div className="relative flex flex-col md:col-span-2">
                      <label className="mb-1 text-sm font-medium text-gray-700">בחר פרויקט קשור</label>
                      <div className="relative">
                        <select
                          value={relatedProjectId}
                          onChange={(e) => setRelatedProjectId(e.target.value)}
                          className={inputStyle}
                        >
                          <option value="">בחר פרויקט (אופציונלי)</option>
                          {projects.map(project => (
                            <option key={project.id} value={project.id}>
                              {project.name}
                            </option>
                          ))}
                        </select>
                        <FontAwesomeIcon icon={faProjectDiagram} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Section: Tax Receipt Information */}
                <div className="md:col-span-2 border-b pb-4 mb-6 border-gray-200">
                  <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <FontAwesomeIcon icon={faReceipt} className="text-teal-600" />
                    קבלה לצרכי מס
                  </h3>
                  <div className="flex items-center justify-end gap-2 mb-4">
                    <label htmlFor="taxReceiptIssued" className="text-sm font-medium text-gray-700 cursor-pointer">
                      הוצאה קבלה לצרכי מס?
                    </label>
                    <input
                      id="taxReceiptIssued"
                      type="checkbox"
                      checked={taxReceiptIssued}
                      onChange={(e) => setTaxReceiptIssued(e.target.checked)}
                      className={checkboxStyle}
                    />
                  </div>
                  {taxReceiptIssued && (
                    <div className="relative flex flex-col md:col-span-2">
                      <label className="mb-1 text-sm font-medium text-gray-700">תאריך הוצאת קבלה</label>
                      <div className="relative">
                        <input
                          type="date"
                          value={taxReceiptDate}
                          onChange={(e) => setTaxReceiptDate(e.target.value)}
                          className={inputStyle}
                        />
                        <FontAwesomeIcon icon={faCalendarAlt} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      </div>
                    </div>
                  )}
                </div>

                {/* Section: Notes */}
                <div className="md:col-span-2">
                  <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <FontAwesomeIcon icon={faStickyNote} className="text-gray-600" />
                    הערות נוספות
                  </h3>
                  <div className="relative flex flex-col">
                    <label className="mb-1 text-sm font-medium text-gray-700 sr-only">הערות נוספות</label>
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="הערות פנימיות לגבי התרומה"
                      className={textareaStyle}
                    ></textarea>
                  </div>
                </div>

                {/* Submit Button */}
                <div className="col-span-1 md:col-span-2 mt-6">
                  <button
                    type="submit"
                    className="w-full py-3 px-4 rounded-md font-medium text-white text-lg bg-indigo-600 hover:bg-indigo-700 transition duration-300 ease-in-out shadow-md"
                  >
                    שלח תרומה
                  </button>
                </div>
              </form>
            </Modal>
          )}

          {/* Donations List Section */}
          <div className="md:col-span-3 mt-8">
            <h3 className="text-2xl font-bold text-gray-800 mb-4 text-center">רשימת תרומות קיימות</h3>
            {donationsList.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {donationsList.map(donation => (
                  <div key={donation.id} className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
                    <h4 className="text-xl font-semibold text-gray-800 mb-2 flex items-center gap-2">
                      <FontAwesomeIcon icon={faMoneyBillWave} className="text-green-500" />
                      {donation.amount.toLocaleString('he-IL', { style: 'currency', currency: donation.currency })}
                    </h4>
                    <p className="text-gray-700 text-sm mb-1">
                      <span className="font-medium">תורם:</span> {donation.is_anonymous ? 'אנונימי' : donation.donor_name}
                    </p>
                    {donation.donor_email && !donation.is_anonymous && (
                      <p className="text-gray-700 text-sm mb-1">
                        <span className="font-medium">אימייל:</span> {donation.donor_email}
                      </p>
                    )}
                    {donation.donor_phone && (
                      <p className="text-gray-700 text-sm mb-1">
                        <span className="font-medium">טלפון:</span> {donation.donor_phone}
                      </p>
                    )}
                    <p className="text-gray-700 text-sm mb-1">
                      <span className="font-medium">תאריך:</span> {donation.donation_date?.toLocaleDateString('he-IL')}
                    </p>
                    <p className="text-gray-700 text-sm mb-1">
                      <span className="font-medium">אמצעי תשלום:</span> {donation.payment_method}
                    </p>
                    {donation.is_recurring && (
                      <p className="text-gray-700 text-sm mb-1">
                        <span className="font-medium">תדירות:</span> {donation.recurrence_period}
                      </p>
                    )}
                    {donation.designated_purpose && (
                      <p className="text-gray-700 text-sm mb-1">
                        <span className="font-medium">מטרה:</span> {donation.designated_purpose}
                      </p>
                    )}
                    {donation.related_participant_id && (
                      <p className="text-gray-700 text-sm mb-1">
                        <span className="font-medium">מזהה משתתף:</span> {
                          // Display participant name instead of ID
                          participants.find(p => p.id === donation.related_participant_id)?.name || donation.related_participant_id
                        }
                      </p>
                    )}
                    {donation.related_project_id && (
                      <p className="text-gray-700 text-sm mb-1">
                        <span className="font-medium">מזהה פרויקט:</span> {
                          // Display project name instead of ID
                          projects.find(pr => pr.id === donation.related_project_id)?.name || donation.related_project_id
                        }
                      </p>
                    )}
                    <p className="text-gray-700 text-sm mb-1">
                      <span className="font-medium">קבלה למס:</span> {donation.tax_receipt_issued ? 'כן' : 'לא'}
                    </p>
                    {donation.tax_receipt_issued && donation.tax_receipt_date && (
                      <p className="text-gray-700 text-sm mb-1">
                        <span className="font-medium">תאריך קבלה:</span> {donation.tax_receipt_date.toLocaleDateString('he-IL')}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-600 mt-8">אין תרומות להצגה כרגע.</p>
            )}
          </div>
      </div>
    </DashboardLayout>
  );
}

export default Donations;