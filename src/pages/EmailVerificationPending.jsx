import React, { useState, useEffect } from "react";
import { auth, db } from "../config/firbaseConfig"; // Assuming you export auth and db
import { sendEmailVerification, onAuthStateChanged } from "firebase/auth";
import { useNavigate, useLocation } from "react-router-dom"; // Import useLocation
import { toast } from 'sonner';
import { doc, updateDoc } from "firebase/firestore"; // Import updateDoc for client-side Firestore update (optional)

const EmailVerificationPending = () => {
    const navigate = useNavigate();
    const location = useLocation(); // Use useLocation hook
    const [userEmail, setUserEmail] = useState("");
    const [resendCooldown, setResendCooldown] = useState(0); // Cooldown in seconds

    // Get email from navigation state or auth.currentUser
    useEffect(() => {
        const emailFromState = location.state?.userEmail;
        if (emailFromState) {
            setUserEmail(emailFromState);
        } else {
            // Fallback: If redirected without state, try to get from current auth user
            const user = auth.currentUser;
            if (user && !user.emailVerified) {
                setUserEmail(user.email);
            } else if (user && user.emailVerified) {
                // Already verified, redirect
                toast.success("האימייל שלך אומת בהצלחה! מנתב אותך לדף הבית.");
                navigate("/");
            } else {
                // No user logged in, navigate to login
                navigate("/login");
            }
        }
    }, [location.state, navigate]);


    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                // Reload user to get the latest emailVerified status
                user.reload().then(() => {
                    if (user.emailVerified) {
                        toast.success("האימייל שלך אומת בהצלחה! מנתב אותך לדף הבית.");
                        // Optional: client-side update of Firestore field
                        // This is less secure than a Cloud Function, but works if CF is not feasible.
                        // If you deployed the Cloud Function I provided, you can remove this client-side update.
                        if (db) { // Check if db is imported/available
                             updateDoc(doc(db, "users", user.uid), { is_email_verified: true })
                                .then(() => console.log("Firestore email_verified updated client-side"))
                                .catch(e => console.error("Error updating client-side Firestore:", e));
                        }
                        navigate("/"); // Navigate to dashboard or home
                    }
                });
            } else {
                // No user logged in, navigate to login
                navigate("/login");
            }
        });

        // Set up cooldown timer
        let timer;
        if (resendCooldown > 0) {
            timer = setInterval(() => {
                setResendCooldown((prev) => prev - 1);
            }, 1000);
        } else if (timer) {
            clearInterval(timer);
        }

        return () => {
            unsubscribe();
            if (timer) clearInterval(timer);
        };
    }, [navigate, resendCooldown, userEmail]); // Add userEmail to dependency array if you plan to use it dynamically here


    const handleResendVerification = async () => {
        const user = auth.currentUser;
        if (user) {
            try {
                await sendEmailVerification(user);
                toast.success("אימייל אימות חדש נשלח!");
                setResendCooldown(60); // Set a 60-second cooldown
            } catch (error) {
                console.error("Error resending verification email:", error);
                toast.error("שגיאה בשליחת אימייל אימות מחדש. נסה שוב מאוחר יותר.");
            }
        } else {
            toast.error("אין משתמש מחובר כדי לשלוח אימייל אימות. אנא התחבר מחדש.");
            navigate("/login"); // Redirect to login if somehow no user is found
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8 text-center" dir="rtl">
                <div>
                    <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
                        אנא אמת את כתובת האימייל שלך
                    </h2>
                    <p className="mt-2 text-sm text-gray-600">
                        חשבונך נוצר בהצלחה! שלחנו קישור אימות לכתובת האימייל שלך:
                        <br />
                        <span className="font-medium text-indigo-600">{userEmail}</span>
                    </p>
                    <p className="mt-2 text-sm text-gray-600">
                        אנא בדוק את תיבת הדואר שלך (וגם את תיקיית הספאם/ג'אנק) ולחץ על הקישור כדי לאמת את חשבונך.
                    </p>
                </div>

                <div className="mt-6">
                    <button
                        onClick={handleResendVerification}
                        disabled={resendCooldown > 0}
                        className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                            resendCooldown > 0
                                ? "bg-gray-400 cursor-not-allowed"
                                : "bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        }`}
                    >
                        {resendCooldown > 0 ? `שלח שוב בעוד ${resendCooldown} שניות` : "שלח אימייל אימות מחדש"}
                    </button>
                    <p className="mt-4 text-sm text-gray-600">
                        כבר אימתת?{" "}
                        <Link to="/login" className="font-medium text-indigo-600 hover:text-indigo-500 mr-1">
                            חזור לדף ההתחברות
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default EmailVerificationPending;