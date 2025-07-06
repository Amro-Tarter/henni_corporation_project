// components/modals/VerificationModal.jsx
import React, { useEffect, useState } from 'react';
import { auth, db } from '../config/firbaseConfig';
import {
  sendEmailVerification,
  onAuthStateChanged,
} from 'firebase/auth';
import {
  getDoc,
  updateDoc,
  doc,
} from 'firebase/firestore';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const VerificationModal = ({ isOpen, onClose, userEmail }) => {
  const [resendCooldown, setResendCooldown] = useState(0);
  const [checkingVerification, setCheckingVerification] = useState(false);
  const navigate = useNavigate();
  const [isVerified, setIsVerified] = useState(false);
  const [userRole, setUserRole] = useState("");

  // Auto auth guard
  useEffect(() => {
    if (!isOpen) return;

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        navigate('/login');
      }
    });

    return () => unsubscribe();
  }, [isOpen, navigate]);

  const handleResendVerification = async () => {
    const user = auth.currentUser;

    if (!user) {
      toast.error('משתמש לא מחובר. אנא התחבר שוב.');
      navigate('/login');
      return;
    }

    try {
      await sendEmailVerification(user);
      toast.success('אימייל אימות חדש נשלח!');
      setResendCooldown(60);
    } catch (error) {
      console.error('Error sending verification email:', error);
      toast.error('שגיאה בשליחה מחדש. נסה שוב.');
    }
  };

  const handleCheckVerification = async () => {
    const user = auth.currentUser;
    if (!user) return;

    setCheckingVerification(true);
    try {
      await user.reload();

      if (user.emailVerified) {
        toast.success("האימייל שלך אומת בהצלחה!");

        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          const userData = userSnap.data();
          await updateDoc(userRef, { is_email_verified: true });
          setUserRole(userData.role);
          setIsVerified(true);

          // Auto redirect after 2 seconds
          setTimeout(() => {
            if (userData.role === "participant")
              navigate("/form/mDdp9oVf7RPfxW7zglcf");
            else if (userData.role === "mentor")
              navigate("/form/jw0JV5OLP7TxRaV5KaEa");
            else navigate("/");
          }, 2000);
        }
      } else {
        toast.error("האימייל עדיין לא אומת. נסה שוב מאוחר יותר.");
      }
    } catch (err) {
      console.error("Error verifying user:", err);
      toast.error("שגיאה בעת בדיקת האימות.");
    } finally {
      setCheckingVerification(false);
    }
  };

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setTimeout(() => setResendCooldown((prev) => prev - 1), 1000);
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-xl p-6 relative text-right">
        <button
          onClick={onClose}
          className="absolute top-4 left-4 text-gray-500 text-2xl hover:text-red-600"
          aria-label="סגור את החלון"
        >
          &times;
        </button>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="text-center">
            <div className="text-5xl mb-4 text-[#D73502]">📩</div>
            <h2 className="text-2xl font-bold mb-3 text-[#801100]">
              אנא אמת את כתובת האימייל שלך
            </h2>
            <p className="text-[#801100]">
              שלחנו קישור אימות לכתובת:{' '}
              <span className="text-[#D73502] font-semibold">{userEmail}</span>
            </p>
            <p className="text-sm mt-2">בדוק גם את תיקיית הספאם!</p>

            <div className="mt-6 flex flex-col gap-4 items-center justify-center">
              {/* Button to check verification */}
              {!isVerified && (
                <button
                  onClick={handleCheckVerification}
                  disabled={checkingVerification}
                  className="px-6 py-2 border-2 border-[#D73502] text-[#D73502] rounded-full hover:bg-[#D73502] hover:text-white transition duration-300"
                >
                  {checkingVerification ? "בודק אימות..." : "סיימתי את תהליך האימות"}
                </button>
              )}

              {/* Resend button */}
              <button
                onClick={handleResendVerification}
                disabled={resendCooldown > 0}
                className="text-sm text-blue-600 underline"
              >
                {resendCooldown > 0
                  ? `שליחה מחדש בעוד ${resendCooldown} שניות`
                  : "שלח אימייל שוב"}
              </button>
            </div>

            {/* Final redirect button (shown only after verified) */}
            {isVerified && (
              <div className="mt-6">
                <p className="text-green-600 font-semibold mb-2">החשבון אומת! מועבר להמשך...</p>
                <div className="text-sm text-gray-600">אם לא הועברת אוטומטית, לחץ על הכפתור למטה:</div>
                <button
                  onClick={() => {
                    if (userRole === "participant") navigate("/form/mDdp9oVf7RPfxW7zglcf");
                    else if (userRole === "mentor") navigate("/form/jw0JV5OLP7TxRaV5KaEa");
                    else navigate("/");
                  }}
                  className="mt-3 px-6 py-2 rounded-full text-white bg-gradient-to-r from-[#D73502] to-[#E85826] hover:from-[#C42D00] hover:to-[#D73502] transition"
                >
                  המשך לתהליך ההרשמה
                </button>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default VerificationModal;
