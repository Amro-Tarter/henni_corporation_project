import React, { useState, useEffect } from "react";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { db, auth } from "../../config/firbaseConfig"; // Assuming this path is correct
import { onAuthStateChanged } from "firebase/auth";
import { toast } from 'sonner';
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../../components/dashboard/DashboardLayout";

function DonationForm() {
  const navigate = useNavigate();

  // State for user ID and authentication readiness
  const [currentUserId, setCurrentUserId] = useState(null);
  const [isAuthReady, setIsAuthReady] = useState(false);

  // Form states matching Firestore structure
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
  const [relatedParticipantId, setRelatedParticipantId] = useState("");
  const [relatedProjectId, setRelatedProjectId] = useState("");
  const [taxReceiptDate, setTaxReceiptDate] = useState("");
  const [taxReceiptIssued, setTaxReceiptIssued] = useState(false);

  // Tailwind CSS input/textarea style for consistency
  const inputStyle = "appearance-none rounded-md w-full px-3 py-3 pr-10 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-right";
  const textareaStyle = "appearance-none rounded-md w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-right h-24";
  const checkboxStyle = "h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded";

  // Authentication Listener (important for Firestore rules, even if public donation)
  useEffect(() => {
    if (auth) {
      const unsubscribe = onAuthStateChanged(auth, (user) => {
        if (user) {
          setCurrentUserId(user.uid);
          // Optionally pre-fill donor info if user is logged in
          // setDonorEmail(user.email || "");
          // setDonorName(user.displayName || "");
        } else {
          console.log("No user authenticated, allowing anonymous donation submission.");
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

    if (!db) {
      toast.error("Firebase database not available. Please try again.");
      return;
    }

    // Basic validation
    if (amount <= 0 || !currency || !paymentMethod || (!isAnonymous && (!donorName || !donorEmail))) {
      toast.error("אנא מלא את כל שדות החובה: סכום, מטבע, אמצעי תשלום, ושם/אימייל תורם (אלא אם אנונימי).");
      return;
    }

    try {
      const donationData = {
        amount: Number(amount), // Ensure it's a number
        currency,
        designated_purpose: designatedPurpose,
        donation_date: donationDate ? new Date(donationDate) : serverTimestamp(), // Use current timestamp if not provided
        donor_email: isAnonymous ? "" : donorEmail, // Clear email if anonymous
        donor_name: isAnonymous ? "אנונימי" : donorName, // Set name to "אנונימי" if anonymous
        donor_phone: donorPhone,
        is_anonymous: isAnonymous,
        is_recurring: isRecurring,
        notes,
        payment_method: paymentMethod,
        recurrence_period: isRecurring ? recurrencePeriod : "", // Clear if not recurring
        related_participant_id: relatedParticipantId,
        related_project_id: relatedProjectId,
        tax_receipt_date: taxReceiptDate ? new Date(taxReceiptDate) : null,
        tax_receipt_issued: taxReceiptIssued,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        submittedBy: currentUserId || "anonymous", // Track who submitted (if authenticated)
      };

      // Add a new document with a generated ID in the 'donations' collection
      await setDoc(doc(db, "donations", crypto.randomUUID()), donationData);
      toast.success("התרומה נשלחה בהצלחה! תודה רבה.");

      // Reset form fields after successful submission
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

      // Optional: Navigate to a thank you page or back to home
      // setTimeout(() => {
      //   navigate("/");
      // }, 2000);

    } catch (err) {
      console.error("Error submitting donation:", err);
      toast.error("אירעה שגיאה בשליחת התרומה. אנא נסה שנית.");
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
          <h2 className="text-3xl font-extrabold text-gray-900">טופס תרומה</h2>
          <p className="mt-2 text-sm text-gray-700">תמכו בנו והיו חלק מהשינוי!</p>
        </div>

        <form className="grid grid-cols-1 md:grid-cols-2 gap-6" onSubmit={handleSubmit}>
          {/* Donation Amount & Currency */}
          <div className="flex flex-col">
            <label className="mb-1 text-sm font-medium text-gray-700">סכום התרומה</label>
            <input
              type="number"
              required
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="סכום *"
              min="0"
              className={inputStyle}
            />
          </div>
          <div className="flex flex-col">
            <label className="mb-1 text-sm font-medium text-gray-700">מטבע</label>
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
          </div>

          {/* Donor Information */}
          <div className="md:col-span-2 flex items-center justify-end gap-2">
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
            <>
              <div className="flex flex-col">
                <label className="mb-1 text-sm font-medium text-gray-700">שם התורם</label>
                <input
                  type="text"
                  required={!isAnonymous}
                  value={donorName}
                  onChange={(e) => setDonorName(e.target.value)}
                  placeholder="שם מלא *"
                  className={inputStyle}
                />
              </div>
              <div className="flex flex-col">
                <label className="mb-1 text-sm font-medium text-gray-700">אימייל התורם</label>
                <input
                  type="email"
                  required={!isAnonymous}
                  value={donorEmail}
                  onChange={(e) => setDonorEmail(e.target.value)}
                  placeholder="אימייל *"
                  className={inputStyle}
                />
              </div>
            </>
          )}
          <div className="flex flex-col">
            <label className="mb-1 text-sm font-medium text-gray-700">טלפון התורם</label>
            <input
              type="tel"
              value={donorPhone}
              onChange={(e) => setDonorPhone(e.target.value)}
              placeholder="טלפון"
              className={inputStyle}
            />
          </div>
          <div className="flex flex-col">
            <label className="mb-1 text-sm font-medium text-gray-700">תאריך התרומה</label>
            <input
              type="date"
              value={donationDate}
              onChange={(e) => setDonationDate(e.target.value)}
              className={inputStyle}
            />
          </div>

          {/* Payment and Recurrence */}
          <div className="flex flex-col">
            <label className="mb-1 text-sm font-medium text-gray-700">אמצעי תשלום</label>
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
          </div>

          <div className="md:col-span-2 flex items-center justify-end gap-2">
            <label htmlFor="isRecurring" className="text-sm font-medium text-gray-700 cursor-pointer">
              תרומה חוזרת?
            </label>
            <input
              id="isRecurring"
              type="checkbox"
              checked={isRecurring}
              onChange={(e) => setIsRecurring(e.target.checked)}
              className={checkboxStyle}
            />
          </div>

          {isRecurring && (
            <div className="flex flex-col md:col-span-2">
              <label className="mb-1 text-sm font-medium text-gray-700">תדירות חזרה</label>
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
            </div>
          )}

          {/* Purpose and Related IDs */}
          <div className="flex flex-col">
            <label className="mb-1 text-sm font-medium text-gray-700">מטרה ייעודית</label>
            <input
              type="text"
              value={designatedPurpose}
              onChange={(e) => setDesignatedPurpose(e.target.value)}
              placeholder="לדוגמא: לפרויקט X, לילד Y"
              className={inputStyle}
            />
          </div>
          <div className="flex flex-col">
            <label className="mb-1 text-sm font-medium text-gray-700">מזהה משתתף קשור</label>
            <input
              type="text"
              value={relatedParticipantId}
              onChange={(e) => setRelatedParticipantId(e.target.value)}
              placeholder="מזהה משתתף (אופציונלי)"
              className={inputStyle}
            />
          </div>
          <div className="flex flex-col md:col-span-2">
            <label className="mb-1 text-sm font-medium text-gray-700">מזהה פרויקט קשור</label>
            <input
              type="text"
              value={relatedProjectId}
              onChange={(e) => setRelatedProjectId(e.target.value)}
              placeholder="מזהה פרויקט (אופציונלי)"
              className={inputStyle}
            />
          </div>

          {/* Tax Receipt Information */}
          <div className="md:col-span-2 flex items-center justify-end gap-2">
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
            <div className="flex flex-col md:col-span-2">
              <label className="mb-1 text-sm font-medium text-gray-700">תאריך הוצאת קבלה</label>
              <input
                type="date"
                value={taxReceiptDate}
                onChange={(e) => setTaxReceiptDate(e.target.value)}
                className={inputStyle}
              />
            </div>
          )}

          {/* Notes */}
          <div className="md:col-span-2 flex flex-col">
            <label className="mb-1 text-sm font-medium text-gray-700">הערות נוספות</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="הערות פנימיות לגבי התרומה"
              className={textareaStyle}
            ></textarea>
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
      </div>
    </div>
      </DashboardLayout>
);
}

export default DonationForm;
