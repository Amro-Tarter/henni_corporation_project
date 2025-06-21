import React, { useState, useEffect } from "react";
import { auth, db } from "../config/firbaseConfig"; // Assuming you export auth and db
import { sendEmailVerification, onAuthStateChanged } from "firebase/auth";
import { useNavigate, useLocation } from "react-router-dom"; // Import useLocation
import { toast } from 'sonner';
import { doc, updateDoc } from "firebase/firestore"; // Import updateDoc for client-side Firestore update (optional)
import { Link } from "react-router-dom";
import Layout from '../components/layout/Layout';
import { motion } from 'framer-motion';

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
        <Layout>
            <main className="flex-grow pt-24 min-h-screen bg-gradient-to-b from-amber-50 to-white">
                <div className="container mx-auto px-6 py-16 relative overflow-hidden min-h-[calc(100vh-6rem)] flex items-center justify-center">
                    <motion.div
                        className="flex flex-col items-center justify-center text-center max-w-3xl mx-auto relative z-10"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        dir="rtl"
                    >
                        <div className="relative">
                            <div className="text-6xl mb-4">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-20 w-20 text-[#D73502] mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                            </div>
                        </div>
                       
                        <div className="h-1 w-32 bg-gradient-to-r from-amber-300 to-[#D73502] mx-auto rounded-full my-6" />
                       
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.2 }}
                        >
                            <h2 className="text-3xl font-semibold mb-6 text-[#801100]">אנא אמת את כתובת האימייל שלך</h2>
                            <div className="text-[#801100] mb-8 text-lg max-w-2xl mx-auto bg-white px-6 py-6 rounded-xl shadow-sm border border-amber-100">
                                <p className="mb-4">
                                    בקשתך הועברה בהצלחה! שלחנו קישור אימות לכתובת האימייל שלך:
                                </p>
                                <p className="font-medium text-[#D73502] mb-4 text-xl">
                                    {userEmail}
                                </p>
                                <p className="text-base">
                                    אנא בדוק את תיבת הדואר שלך (וגם את תיקיית הספאם/ג'אנק) ולחץ על הקישור כדי לאמת את חשבונך.
                                </p>
                            </div>
                        </motion.div>
                       
                        <motion.div
                            className="flex flex-col sm:flex-row gap-4 items-center justify-center"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.4 }}
                        >
                            <motion.button
                                onClick={handleResendVerification}
                                disabled={resendCooldown > 0}
                                whileHover={{ scale: resendCooldown > 0 ? 1 : 1.05 }}
                                whileTap={{ scale: resendCooldown > 0 ? 1 : 0.95 }}
                                className={`inline-flex items-center px-8 py-4 rounded-full shadow-lg transition-all duration-300 ${
                                    resendCooldown > 0
                                        ? "bg-gray-400 cursor-not-allowed text-white"
                                        : "bg-gradient-to-r from-[#D73502] to-[#E85826] text-white hover:shadow-xl hover:from-[#C42D00] hover:to-[#D73502]"
                                }`}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                                </svg>
                                {resendCooldown > 0 ? `שלח שוב בעוד ${resendCooldown} שניות` : "שלח אימייל אימות מחדש"}
                            </motion.button>
                            
                            <motion.div
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                <Link
                                    to="/login"
                                    className="inline-flex items-center px-8 py-4 bg-white text-[#D73502] border-2 border-[#D73502] rounded-full shadow-lg hover:shadow-xl hover:bg-[#D73502] hover:text-white transition-all duration-300"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
                                    </svg>
                                    חזור לדף ההתחברות
                                </Link>
                            </motion.div>
                        </motion.div>
                    </motion.div>
                </div>
            </main>
        </Layout>
    );
};

export default EmailVerificationPending;