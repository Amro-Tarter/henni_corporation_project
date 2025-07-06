import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { createUserWithEmailAndPassword, sendEmailVerification } from "firebase/auth";
import { auth, db } from "../config/firbaseConfig";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { Loader } from "lucide-react";
import './auth.css';
import { Eye, EyeOff } from "lucide-react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { toast } from 'sonner';
import AirIcon from '@mui/icons-material/Air';
import Navbar from '../components/layout/Navigation';
import LocalFloristIcon from '@mui/icons-material/LocalFlorist';
import ConstructionTwoToneIcon from '@mui/icons-material/ConstructionTwoTone';
import WaterDropTwoToneIcon from '@mui/icons-material/WaterDropTwoTone';
import WhatshotRoundedIcon from '@mui/icons-material/WhatshotRounded';
import VerificationModal from '../components/VerificationModal';


const ELEMENTS = [
    { key: 'earth', emoji: <LocalFloristIcon style={{color: '#4ade80'}} /> },
    { key: 'metal', emoji: <ConstructionTwoToneIcon style={{color: '#4b5563'}} /> },
    { key: 'air',   emoji: <AirIcon style={{color: '#87ceeb'}} /> },
    { key: 'water', emoji: <WaterDropTwoToneIcon style={{color: '#60a5fa'}} /> },
    { key: 'fire',  emoji: <WhatshotRoundedIcon style={{color: '#fca5a1'}} /> },
];

const FLOAT_POS = [
    { top: '20%', left: '10%', anim: 'animate-float-1' },
    { top: '33%', right: '20%', anim: 'animate-float-2' },
    { top: '50%', left: '25%', anim: 'animate-float-3' },
    { top: '10%', right: '20%', anim: 'animate-float-4' },
    { top: '25%', left: '5%', anim: 'animate-float-5' },
    { top: '20%', left: '50%', anim: 'animate-float-6' },
    { top: '76%', left: '33%', anim: 'animate-float-7' },
    { top: '60%', left: '25%', anim: 'animate-float-8' },
    { top: '5%', left: '70%', anim: 'animate-float-1' },
    { top: '85%', left: '50%', anim: 'animate-float-2' },
];

function Signup() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [username, setUsername] = useState("");
    const [location, setLocation] = useState("");
    const [phone, setPhone] = useState("");
    const inputStyle = "appearance-none rounded-md w-full px-3 py-3 pr-10 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-right";
    const selectStyle = "appearance-none rounded-md w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-right";
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [selectedRole, setSelectedRole] = useState("");
    const [showVerificationModal, setShowVerificationModal] = useState(false);

    const navigate = useNavigate();
        
    useEffect(() => {
        if (showVerificationModal) {
            document.body.classList.add('overflow-hidden');
        } else {
            document.body.classList.remove('overflow-hidden');
        }
    }, [showVerificationModal]);

    // Animation styles (unchanged from your original)
    useEffect(() => {
        const styleSheet = document.createElement("style");
        styleSheet.type = "text/css";
        styleSheet.innerText = `
            @keyframes float {
                0% { transform: translateY(0) rotate(0deg) scale(1); }
                50% { transform: translateY(-25px) rotate(8deg) scale(1.05); }
                100% { transform: translateY(0) rotate(0deg) scale(1); }
            }
            .animate-float-1 { animation: float 8s ease-in-out infinite; }
            .animate-float-2 { animation: float 9s ease-in-out 1s infinite; }
            .animate-float-3 { animation: float 10s ease-in-out 2s infinite; }
            .animate-float-4 { animation: float 11s ease-in-out 3s infinite; }
            .animate-float-5 { animation: float 12s ease-in-out 4s infinite; }
            .animate-float-6 { animation: float 8.5s ease-in-out 0.5s infinite; }
            .animate-float-7 { animation: float 9.5s ease-in-out 1.5s infinite; }
            .animate-float-8 { animation: float 10.5s ease-in-out 2.5s infinite; }
        `;
        document.head.appendChild(styleSheet);
        return () => {
            document.head.removeChild(styleSheet);
        };
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true); // Start loading

        // Basic custom validations
        const cityRegex = /^[A-Za-zא-ת\s]+$/;
        const phoneRegex = /^0\d{9}$/;

        if (!cityRegex.test(location)) {
            toast.error("שם העיר חייב להכיל אותיות בלבד");
            setLoading(false);
            return;
        }

        if (!phoneRegex.test(phone)) {
            toast.error("מספר הטלפון אינו מתאים");
            setLoading(false);
            return;
        }

        if (password !== confirmPassword) {
            toast.error("הסיסמאות אינן תואמות");
            setLoading(false);
            return;
        }

        try {
            const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;

            if (!strongPasswordRegex.test(password)) {
                toast.error(".הסיסמה חייבת לכלול לפחות אות אחת קטנה, אות אחת גדולה, מספר אחד ותו מיוחד לפחות 8 תווים");
                setLoading(false);
                return;
            }

            // Check if username is already taken
            const q = query(collection(db, "users"), where("username", "==", username));
            const querySnapshot = await getDocs(q);

            if (!querySnapshot.empty) {
                toast.error(".שם המשתמש כבר קיים, נסה לבחור שם אחר");
                setLoading(false);
                return;
            }

            const res = await createUserWithEmailAndPassword(auth, email, password);

            // Send email verification
            await sendEmailVerification(res.user);

            // Add user data to Firestore
            await setDoc(doc(db, "users", res.user.uid), {
                associated_id: res.user.uid,
                role: selectedRole,
                email,
                username,
                updatedAt: serverTimestamp(),
                createdAt: serverTimestamp(),
                is_active: false,
                last_login: serverTimestamp(),
                phone,
                location,
                is_email_verified: false, // NEW: Add this field, initially false
            });

            toast.success("נשלח אימייל אימות. אנא בדוק את תיבת הדואר שלך (כולל ספאם) כדי לאמת את חשבונך.");
            //show the modal of email-verification
            setShowVerificationModal(true);

            
        } catch (err) {
            console.error(err);
            if (err.code === "auth/email-already-in-use") {
                toast.error("המייל הזה כבר בשימוש. נסה להתחבר או השתמש באימייל אחר.");
            } else {
                toast.error("אירעה שגיאה ביצירת החשבון, נסה שנית מאוחר יותר בבקשה");
            }
        } finally {
            setLoading(false); // Stop loading regardless of success or failure
        }
    };

    return (
        <div
        className="min-h-screen flex flex-col items-center justify-start bg-gradient-to-tl from-red-950 via-red-800 to-orange-600 opacity-95 pt-24 pb-12 px-4 sm:px-6 lg:px-8 relative"
        dir="rtl"
        > 
            <Navbar />
            <div className="fixed inset-0 pointer-events-none  z-0">
                {/* Element 1 - Leaf */}
                <div className="absolute top-20 left-10 animate-float-1">
                    <LocalFloristIcon sx={{ fontSize: '96px' }} className="text-green-500" />
                </div>

                {/* Element 2 - Hammer */}
                <div className="absolute top-1/3 right-20 animate-float-2">
                    <ConstructionTwoToneIcon sx={{ fontSize: '88px' }} className="text-gray-600" />
                </div>

                {/* Element 3 - Wind */}
                <div className="absolute top-1/2 left-1/4 animate-float-3">
                    <AirIcon sx={{ fontSize: '88px' }} className="text-cyan-600" />
                </div>

                {/* Element 4 - Water */}
                <div className="absolute bottom-10 right-20 animate-float-4">
                    <WaterDropTwoToneIcon sx={{ fontSize: '88px' }} className="text-blue-500" />
                </div>

                {/* Element 5 - Fire */}
                <div className="absolute bottom-1/4 left-5 animate-float-5">
                    <WhatshotRoundedIcon sx={{ fontSize: '88px' }} className="text-red-500" />
                </div>

                {/* Additional decorative icons */}
                <div className="absolute top-20 left-1/2 animate-float-6">
                    <LocalFloristIcon sx={{ fontSize: '88px' }} className="text-green-500" />
                </div>

                <div className="absolute bottom-24 left-1/3 animate-float-7">
                    <AirIcon sx={{ fontSize: '88px' }} className="text-cyan-600" />
                </div>

                <div className="absolute top-3/5 left-1/4 animate-float-8">
                    <WaterDropTwoToneIcon sx={{ fontSize: '88px' }} className="text-blue-500" />
                </div>
            </div>

            {/* This div no longer needs max-h or overflow, as the parent will scroll */}
            <div className="w-full max-w-2xl bg-white backdrop-blur-md rounded-xl shadow-lg p-8 space-y-8 z-10"> 
                {/* Heading */}
                <div className="text-center mb-6">
                    <h2 className="text-3xl font-extrabold text-gray-900"> עמותת לגלות את האור - הנני</h2>
                    <p className="mt-2 text-sm text-gray-700">צור חשבון חדש</p>
                </div>

                {/* Signup Form */}
                <form
                    className="grid grid-cols-1 md:grid-cols-2 gap-4"
                    onSubmit={handleSubmit}
                >
                    <input type="hidden" name="remember" defaultValue="true" />

                    {/* Username */}
                    <div className="flex flex-col">
                        <label className="mb-1 text-sm font-medium text-gray-700">שם משתמש</label>
                        <input
                            type="text"
                            required
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="שם משתמש *"
                            className={inputStyle}
                        />
                    </div>

                    {/* Email */}
                    <div className="flex flex-col">
                        <label className="mb-1 text-sm font-medium text-gray-700">כתובת אימייל</label>
                        <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="כתובת אימייל *"
                            className={inputStyle}
                        />
                    </div>

                    {/* Password */}
                    <div className="flex flex-col">
                        <label className="mb-1 text-sm font-medium text-gray-700 flex items-center gap-1">
                            סיסמה
                            <div className="group relative cursor-pointer text-blue-600">
                                ⓘ
                                <div className="absolute w-64 right-0 top-full mt-1 bg-white border border-gray-300 rounded shadow-md p-2 text-xs text-gray-800 opacity-0 group-hover:opacity-100 transition-opacity z-20 pointer-events-none text-right rtl">
                                    הסיסמה חייבת לכלול:
                                    <ul className="list-disc list-inside mt-1">
                                        <li>אות קטנה</li>
                                        <li>אות גדולה</li>
                                        <li>מספר</li>
                                        <li>תו מיוחד (כמו @, #, !, ?)</li>
                                        <li>לפחות 8 תווים</li>
                                    </ul>
                                </div>
                            </div>
                        </label>

                        <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="סיסמה *"
                                className={`${inputStyle} pr-10`}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute inset-y-0 left-2 flex items-center text-gray-600"
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>

                    {/* Confirm Password */}
                    <div className="flex flex-col">
                        <label className="mb-1 text-sm font-medium text-gray-700">אימות סיסמה</label>

                        <div className="relative">
                            <input
                                type={showConfirmPassword ? "text" : "password"}
                                required
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="אימות סיסמה *"
                                className={`${inputStyle} pr-10`}
                            />
                            <button
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                className="absolute inset-y-0 left-2 flex items-center text-gray-600"
                            >
                                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>

                    {/* Phone */}
                    <div className="flex flex-col">
                        <label className="mb-1 text-sm font-medium text-gray-700">מספר טלפון</label>
                        <input
                            type="tel"
                            required
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            placeholder="* מספר טלפון"
                            className={inputStyle}
                        />
                    </div>

                    {/* Location */}
                    <div className="flex flex-col">
                        <label className="mb-1 text-sm font-medium text-gray-700">מיקום</label>
                        <input
                            type="text"
                            required
                            value={location}
                            onChange={(e) => setLocation(e.target.value)}
                            placeholder="מיקום *"
                            className={inputStyle}
                        />
                    </div>

                    {/* Submit Button */}
                    <div className="col-span-1 md:col-span-2 ">
                        <button
                            type="submit"
                            className={`group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white transition hover:opacity-95
                                    shine-button ${
                                loading
                                    ? "bg-gradient-to-r from-amber-500 via-orange-500 to-red-600 cursor-not-allowed"
                                    : "bg-gradient-to-r from-amber-500 via-orange-500 to-red-600 hover:bg-gradient-to-r from-amber-500 via-orange-500 to-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2"
                            }`}
                            disabled={loading} // Disable button while loading
                        >
                            {loading ? <Loader className="animate-spin" size={20} /> : 'הרשם'}
                            <span className="shine" />
                        </button>
                    </div>


                        {/* Role Selection */}
                        <div className="flex flex-col col-span-1 md:col-span-2">
                        <label className="mb-1 text-sm font-medium text-gray-700">בחר/י את תפקידך בעמותה</label>
                        <select
                            required
                            value={selectedRole}
                            onChange={(e) => setSelectedRole(e.target.value)}
                            className={selectStyle}
                        >
                            <option value="">בחר/י תפקיד</option>
                            <option value="participant">משתתף</option>
                            <option value="mentor">מנטור</option>
                            <option value="other">אחר</option>
                        </select>
                        </div>
                        
                        <VerificationModal
                            isOpen={showVerificationModal}
                            onClose={() => setShowVerificationModal(false)}
                            userEmail={email}
                        />

                    {/* Login Link */}
                    <div className="col-span-1 md:col-span-2 text-center text-sm">
                        כבר יש לך חשבון?{" "}
                        <Link to="/login" className="text-indigo-600 hover:text-indigo-500 font-medium">
                            התחבר כאן
                        </Link>
                    </div>

                </form>
            </div>
        </div>
    );
}

export default Signup;