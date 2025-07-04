import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { createUserWithEmailAndPassword, sendEmailVerification } from "firebase/auth";
import { auth, db } from "../config/firbaseConfig";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { Loader } from "lucide-react";
import './auth.css'; // Make sure this CSS file contains your animation keyframes
import { Eye, EyeOff } from "lucide-react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { toast } from 'sonner';
import AirIcon from '@mui/icons-material/Air';
import Navbar from '../components/layout/Navigation';
import LocalFloristIcon from '@mui/icons-material/LocalFlorist';
import ConstructionTwoToneIcon from '@mui/icons-material/ConstructionTwoTone';
import WaterDropTwoToneIcon from '@mui/icons-material/WaterDropTwoTone';
import WhatshotRoundedIcon from '@mui/icons-material/WhatshotRounded';


const ELEMENTS = [
    { key: 'earth', emoji: <LocalFloristIcon style={{color: '#4ade80'}} /> },
    { key: 'metal', emoji: <ConstructionTwoToneIcon style={{color: '#4b5563'}} /> },
    { key: 'air',   emoji: <AirIcon style={{color: '#87ceeb'}} /> },
    { key: 'water', emoji: <WaterDropTwoToneIcon style={{color: '#60a5fa'}} /> },
    { key: 'fire',  emoji: <WhatshotRoundedIcon style={{color: '#fca5a1'}} /> },
];

// Note: I've added more FLOAT_POS to give you more unique positions if you decide to add more icons later.
const FLOAT_POS = [
    { top: '20%', left: '10%', anim: 'animate-float-1' }, // Element 1
    { top: '33%', right: '20%', anim: 'animate-float-2' }, // Element 2
    { top: '50%', left: '25%', anim: 'animate-float-3' }, // Element 3
    { top: '10%', right: '20%', anim: 'animate-float-4' }, // Element 4
    { top: '25%', left: '5%', anim: 'animate-float-5' }, // Element 5
    { top: '20%', left: '50%', anim: 'animate-float-6' }, // Additional 1 (Leaf)
    { top: '76%', left: '33%', anim: 'animate-float-7' }, // Additional 2 (Air)
    { top: '60%', left: '25%', anim: 'animate-float-8' }, // Additional 3 (Water)
    { top: '5%', left: '70%', anim: 'animate-float-1' }, // Another one
    { top: '85%', left: '50%', anim: 'animate-float-2' }, // Yet another
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

    // New state variables for the added questions
    const [howDidYouHear, setHowDidYouHear] = useState("");
    const [howDidYouHearOther, setHowDidYouHearOther] = useState("");
    const [commitmentLevel, setCommitmentLevel] = useState("");
    const [commitmentLevelOther, setCommitmentLevelOther] = useState("");
    const [artisticAffinity, setArtisticAffinity] = useState("");
    const [artisticAffinityOther, setArtisticAffinityOther] = useState("");
    const [goalAsVolunteer, setGoalAsVolunteer] = useState("");
    const [goalAsVolunteerOther, setGoalAsVolunteerOther] = useState("");
    const [artLeadershipConnection, setArtLeadershipConnection] = useState("");
    const [artLeadershipConnectionOther, setArtLeadershipConnectionOther] = useState("");
    const [skillsResources, setSkillsResources] = useState([]); // This will be an array for multi-select
    const [skillsResourcesOther, setSkillsResourcesOther] = useState("");
    const [financialSupport, setFinancialSupport] = useState("");
    const [financialSupportOther, setFinancialSupportOther] = useState("");
    const [preferredActivityArea, setPreferredActivityArea] = useState("");
    const [preferredActivityAreaOther, setPreferredActivityAreaOther] = useState("");


    const navigate = useNavigate();

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

    const handleSkillsResourcesChange = (e) => {
        const { value, checked } = e.target;
        if (value === "Other") {
            // Handle the "Other" checkbox specifically
            if (checked) {
                setSkillsResources([...skillsResources, value]);
            } else {
                setSkillsResources(skillsResources.filter(skill => skill !== value));
                setSkillsResourcesOther(""); // Clear other text if unchecked
            }
        } else {
            // Handle regular checkboxes
            if (checked) {
                setSkillsResources([...skillsResources, value]);
            } else {
                setSkillsResources(skillsResources.filter(skill => skill !== value));
            }
        }
    };

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

        // Validate new required fields
        if (!howDidYouHear || (howDidYouHear === "Other" && !howDidYouHearOther)) {
            toast.error("אנא בחר/י כיצד הגעת לעמותה.");
            setLoading(false);
            return;
        }
        if (!commitmentLevel || (commitmentLevel === "Other" && !commitmentLevelOther)) {
            toast.error("אנא בחר/י את רמת המחויבות והזמינות שלך.");
            setLoading(false);
            return;
        }
        if (!artisticAffinity || (artisticAffinity === "Other" && !artisticAffinityOther)) {
            toast.error("אנא בחר/י את הזיקה העיקרית שלך לתחומי האמנות.");
            setLoading(false);
            return;
        }
        if (!goalAsVolunteer || (goalAsVolunteer === "Other" && !goalAsVolunteerOther)) {
            toast.error("אנא בחר/י איזו מטרה היית רוצה להשיג כפעיל/ה בעמותה.");
            setLoading(false);
            return;
        }
        if (!artLeadershipConnection || (artLeadershipConnection === "Other" && !artLeadershipConnectionOther)) {
            toast.error("אנא בחר/י מה הקשר המשמעותי ביותר בין אמנות למנהיגות.");
            setLoading(false);
            return;
        }
        if (skillsResources.length === 0 || (skillsResources.includes("Other") && !skillsResourcesOther)) {
            toast.error("אנא בחר/י אילו כישורים או משאבים את/ה יכול/ה להביא לעמותה.");
            setLoading(false);
            return;
        }
        if (!financialSupport || (financialSupport === "Other" && !financialSupportOther)) {
            toast.error("אנא בחר/י באיזה אופן את/ה מתכנן/ת לתמוך כספית בעמותה.");
            setLoading(false);
            return;
        }
        if (!preferredActivityArea || (preferredActivityArea === "Other" && !preferredActivityAreaOther)) {
            toast.error("אנא בחר/י באיזה תחום פעילות היית רוצה להיות מעורב/ת במיוחד.");
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
                role: null,
                email,
                username,
                updatedAt: serverTimestamp(),
                createdAt: serverTimestamp(),
                is_active: false,
                last_login: serverTimestamp(),
                phone,
                location,
                is_email_verified: false, // NEW: Add this field, initially false
                // New fields for the questionnaire
                howDidYouHear: howDidYouHear === "Other" ? howDidYouHearOther : howDidYouHear,
                commitmentLevel: commitmentLevel === "Other" ? commitmentLevelOther : commitmentLevel,
                artisticAffinity: artisticAffinity === "Other" ? artisticAffinityOther : artisticAffinity,
                goalAsVolunteer: goalAsVolunteer === "Other" ? goalAsVolunteerOther : goalAsVolunteer,
                artLeadershipConnection: artLeadershipConnection === "Other" ? artLeadershipConnectionOther : artLeadershipConnection,
                skillsResources: skillsResources.includes("Other") ? [...skillsResources.filter(s => s !== "Other"), skillsResourcesOther] : skillsResources,
                financialSupport: financialSupport === "Other" ? financialSupportOther : financialSupport,
                preferredActivityArea: preferredActivityArea === "Other" ? preferredActivityAreaOther : preferredActivityArea,
            });

            toast.success("נשלח אימייל אימות. אנא בדוק את תיבת הדואר שלך (כולל ספאם) כדי לאמת את חשבונך.");

            // *** IMPORTANT CHANGE HERE ***
            // Navigate to the dedicated email verification pending page, passing the email
            navigate("/verify-email-pending", { state: { userEmail: email } });

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
        <div className="min-h-screen flex items-center justify-center absolute inset-0 bg-gradient-to-tl from-red-950 via-red-800 to-orange-600 opacity-95 py-12 px-4 sm:px-6 lg:px-8 relative" dir="rtl">
            <Navbar />
            <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
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

            <div className="w-full max-w-2xl bg-white backdrop-blur-md rounded-xl shadow-lg overflow-hidden p-8 z-10">
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

                    {/* --- New Questions --- */}

                    {/* כיצד הגעת לעמותת "לגלות את האור - הנני"? */}
                    <div className="flex flex-col col-span-full">
                        <label className="mb-1 text-sm font-medium text-gray-700">
                            כיצד הגעת לעמותת "לגלות את האור - הנני"? *
                        </label>
                        <select
                            required
                            value={howDidYouHear}
                            onChange={(e) => { setHowDidYouHear(e.target.value); if (e.target.value !== "Other") setHowDidYouHearOther(""); }}
                            className={selectStyle}
                        >
                            <option value="">בחר/י...</option>
                            <option value="דרך היכרות אישית עם אחד מחברי הוועד או הצוות">דרך היכרות אישית עם אחד מחברי הוועד או הצוות</option>
                            <option value="חיפוש עצמאי אחר אפשרויות התנדבות בתחום האמנות והחינוך">חיפוש עצמאי אחר אפשרויות התנדבות בתחום האמנות והחינוך</option>
                            <option value="המלצה מחבר/ה או עמית/ה">המלצה מחבר/ה או עמית/ה</option>
                            <option value="חשיפה לפעילות העמותה באירוע או במדיה">חשיפה לפעילות העמותה באירוע או במדיה</option>
                            <option value="Other">אחר (פרט/י)</option>
                        </select>
                        {howDidYouHear === "Other" && (
                            <input
                                type="text"
                                required // Make required if "Other" is selected
                                value={howDidYouHearOther}
                                onChange={(e) => setHowDidYouHearOther(e.target.value)}
                                placeholder="פרט/י"
                                className={`${inputStyle} mt-2`}
                            />
                        )}
                    </div>

                    {/* מהי רמת המחויבות והזמינות שאתה/את יכול/ה להציע לפעילות העמותה */}
                    <div className="flex flex-col col-span-full">
                        <label className="mb-1 text-sm font-medium text-gray-700">
                            מהי רמת המחויבות והזמינות שאתה/את יכול/ה להציע לפעילות העמותה? *
                        </label>
                        <select
                            required
                            value={commitmentLevel}
                            onChange={(e) => { setCommitmentLevel(e.target.value); if (e.target.value !== "Other") setCommitmentLevelOther(""); }}
                            className={selectStyle}
                        >
                            <option value="">בחר/י...</option>
                            <option value="2-4 שעות בשבוע (כולל ישיבות והכנה)">2-4 שעות בשבוע (כולל ישיבות והכנה)</option>
                            <option value="5-8 שעות בחודש (בעיקר ישיבות והתייעצויות)">5-8 שעות בחודש (בעיקר ישיבות והתייעצויות)</option>
                            <option value="3-5 שעות בחודש (השתתפות בישיבות בלבד)">3-5 שעות בחודש (השתתפות בישיבות בלבד)</option>
                            <option value="פחות מ-3 שעות בחודש">פחות מ-3 שעות בחודש</option>
                            <option value="תלוי בתקופה, אך אני מחויב/ת לתהליך">תלוי בתקופה, אך אני מחויב/ת לתהליך</option>
                            <option value="Other">אחר (פרט/י)</option>
                        </select>
                        {commitmentLevel === "Other" && (
                            <input
                                type="text"
                                required
                                value={commitmentLevelOther}
                                onChange={(e) => setCommitmentLevelOther(e.target.value)}
                                placeholder="פרט/י"
                                className={`${inputStyle} mt-2`}
                            />
                        )}
                    </div>

                    {/* מה הזיקה העיקרית שלך לתחומי האמנות והיצירה? */}
                    <div className="flex flex-col col-span-full">
                        <label className="mb-1 text-sm font-medium text-gray-700">
                            מה הזיקה העיקרית שלך לתחומי האמנות והיצירה? *
                        </label>
                        <select
                            required
                            value={artisticAffinity}
                            onChange={(e) => { setArtisticAffinity(e.target.value); if (e.target.value !== "Other") setArtisticAffinityOther(""); }}
                            className={selectStyle}
                        >
                            <option value="">בחר/י...</option>
                            <option value="אני עוסק/ת באופן מקצועי באחד מתחומי האמנות (מוזיקה, תיאטרון, אמנות פלסטית, מחול, כתיבה וכד')">אני עוסק/ת באופן מקצועי באחד מתחומי האמנות (מוזיקה, תיאטרון, אמנות פלסטית, מחול, כתיבה וכד')</option>
                            <option value="אני עוסק/ת בחינוך או הוראה בתחומי האמנויות">אני עוסק/ת בחינוך או הוראה בתחומי האמנויות</option>
                            <option value="יש לי רקע או הכשרה פורמלית בתחומי האמנות אך איני עוסק/ת בכך כיום">יש לי רקע או הכשרה פורמלית בתחומי האמנות אך איני עוסק/ת בכך כיום</option>
                            <option value="אני צרכן/ית תרבות ואמנות ומאמין/ה בכוחם לחולל שינוי">אני צרכן/ית תרבות ואמנות ומאמין/ה בכוחם לחולל שינוי</option>
                            <option value="אין לי רקע אמנותי מובהק, אך יש לי עניין בקשר בין אמנות למנהיגות">אין לי רקע אמנותי מובהק, אך יש לי עניין בקשר בין אמנות למנהיגות</option>
                            <option value="Other">אחר (פרט/י)</option>
                        </select>
                        {artisticAffinity === "Other" && (
                            <input
                                type="text"
                                required
                                value={artisticAffinityOther}
                                onChange={(e) => setArtisticAffinityOther(e.target.value)}
                                placeholder="פרט/י"
                                className={`${inputStyle} mt-2`}
                            />
                        )}
                    </div>

                    {/* איזו מטרה היית רוצה להשיג כפעיל בעמותה ? */}
                    <div className="flex flex-col col-span-full">
                        <label className="mb-1 text-sm font-medium text-gray-700">
                            איזו מטרה היית רוצה להשיג כפעיל/ה בעמותה ? *
                        </label>
                        <select
                            required
                            value={goalAsVolunteer}
                            onChange={(e) => { setGoalAsVolunteer(e.target.value); if (e.target.value !== "Other") setGoalAsVolunteerOther(""); }}
                            className={selectStyle}
                        >
                            <option value="">בחר/י...</option>
                            <option value="לסייע בהרחבת היקף פעילות העמותה למספר גדול יותר של בני נוער">לסייע בהרחבת היקף פעילות העמותה למספר גדול יותר של בני נוער</option>
                            <option value="לשפר את האיתנות הפיננסית של העמותה ומקורות המימון שלה">לשפר את האיתנות הפיננסית של העמותה ומקורות המימון שלה</option>
                            <option value="ליצור שותפויות אסטרטגיות חדשות עם ארגונים משיקים">ליצור שותפויות אסטרטגיות חדשות עם ארגונים משיקים</option>
                            <option value="לשפר את המודעות הציבורית לפעילות העמותה ולחזק את המיתוג שלה">לשפר את המודעות הציבורית לפעילות העמותה ולחזק את המיתוג שלה</option>
                            <option value="לפתח תכניות חדשות המשלבות אמנות ומנהיגות">לפתח תכניות חדשות המשלבות אמנות ומנהיגות</option>
                            <option value="Other">אחר (פרט/י)</option>
                        </select>
                        {goalAsVolunteer === "Other" && (
                            <input
                                type="text"
                                required
                                value={goalAsVolunteerOther}
                                onChange={(e) => setGoalAsVolunteerOther(e.target.value)}
                                placeholder="פרט/י"
                                className={`${inputStyle} mt-2`}
                            />
                        )}
                    </div>

                    {/* מה לדעתך הקשר המשמעותי ביותר בין אמנות למנהיגות? */}
                    <div className="flex flex-col col-span-full">
                        <label className="mb-1 text-sm font-medium text-gray-700">
                            מה לדעתך הקשר המשמעותי ביותר בין אמנות למנהיגות? *
                        </label>
                        <select
                            required
                            value={artLeadershipConnection}
                            onChange={(e) => { setArtLeadershipConnection(e.target.value); if (e.target.value !== "Other") setArtLeadershipConnectionOther(""); }}
                            className={selectStyle}
                        >
                            <option value="">בחר/י...</option>
                            <option value="אמנות מפתחת ביטחון עצמי וקול אישי, תכונות חיוניות למנהיגות אפקטיבית">אמנות מפתחת ביטחון עצמי וקול אישי, תכונות חיוניות למנהיגות אפקטיבית</option>
                            <option value="יצירה מלמדת התמדה, משמעת ופתרון בעיות, מיומנויות נדרשות למנהיגים">יצירה מלמדת התמדה, משמעת ופתרון בעיות, מיומנויות נדרשות למנהיגים</option>
                            <option value="אמנות מפתחת חשיבה יצירתית וראייה חדשנית לאתגרים">אמנות מפתחת חשיבה יצירתית וראייה חדשנית לאתגרים</option>
                            <option value="אמנות מקדמת הקשבה והבנת נקודות מבט שונות, מרכיבים מהותיים במנהיגות">אמנות מקדמת הקשבה והבנת נקודות מבט שונות, מרכיבים מהותיים במנהיגות</option>
                            <option value="אמנות מאפשרת ביטוי אישי ויכולת השפעה על אחרים דרך רגש וחיבור">אמנות מאפשרת ביטוי אישי ויכולת השפעה על אחרים דרך רגש וחיבור</option>
                            <option value="Other">אחר (פרט/י)</option>
                        </select>
                        {artLeadershipConnection === "Other" && (
                            <input
                                type="text"
                                required
                                value={artLeadershipConnectionOther}
                                onChange={(e) => setArtLeadershipConnectionOther(e.target.value)}
                                placeholder="פרט/י"
                                className={`${inputStyle} mt-2`}
                            />
                        )}
                    </div>

                    {/* אילו כישורים או משאבים אתה/את יכול/ה להביא לעמותה? */}
                    <div className="flex flex-col col-span-full">
                        <label className="mb-1 text-sm font-medium text-gray-700">
                            אילו כישורים או משאבים אתה/את יכול/ה להביא לעמותה? *
                        </label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {[
                                "מומחיות מקצועית באחד מתחומי האמנות",
                                "ניסיון בגיוס כספים ופיתוח משאבים",
                                "קשרים עם גורמים רלוונטיים (רשויות, קרנות, מוסדות חינוך וכד')",
                                "ניסיון בניהול ואסטרטגיה ארגונית",
                                "מיומנויות שיווק, תקשורת או מדיה דיגיטלית",
                                "יכולות חניכה, הדרכה או ליווי",
                                "מומחיות משפטית או פיננסית",
                                "יכולת תרומה כספית משמעותית"
                            ].map((option) => (
                                <div key={option} className="flex items-center">
                                    <input
                                        type="checkbox"
                                        id={`skill-${option}`}
                                        value={option}
                                        checked={skillsResources.includes(option)}
                                        onChange={handleSkillsResourcesChange}
                                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                                    />
                                    <label htmlFor={`skill-${option}`} className="ml-2 block text-sm text-gray-900 pr-2">
                                        {option}
                                    </label>
                                </div>
                            ))}
                            <div className="flex items-center">
                                <input
                                    type="checkbox"
                                    id="skill-other"
                                    value="Other"
                                    checked={skillsResources.includes("Other")}
                                    onChange={handleSkillsResourcesChange}
                                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                                />
                                <label htmlFor="skill-other" className="ml-2 block text-sm text-gray-900 pr-2">
                                    אחר (פרט/י)
                                </label>
                            </div>
                        </div>
                        {skillsResources.includes("Other") && (
                            <input
                                type="text"
                                required
                                value={skillsResourcesOther}
                                onChange={(e) => setSkillsResourcesOther(e.target.value)}
                                placeholder="פרט/י"
                                className={`${inputStyle} mt-2`}
                            />
                        )}
                    </div>


                    {/* באיזה אופן אתה/את מתכנן/ת לתמוך כספית בעמותה? */}
                    <div className="flex flex-col col-span-full">
                        <label className="mb-1 text-sm font-medium text-gray-700">
                            באיזה אופן אתה/את מתכנן/ת לתמוך כספית בעמותה? *
                        </label>
                        <select
                            required
                            value={financialSupport}
                            onChange={(e) => { setFinancialSupport(e.target.value); if (e.target.value !== "Other") setFinancialSupportOther(""); }}
                            className={selectStyle}
                        >
                            <option value="">בחר/י...</option>
                            <option value="תרומה אישית משמעותית (מעל 5,000 ₪)">תרומה אישית משמעותית (מעל 5,000 ₪)</option>
                            <option value="תרומה אישית קבועה (בין 100-500 ₪)">תרומה אישית קבועה (בין 100-500 ₪)</option>
                            <option value="סיוע בגיוס משאבים מגורמים חיצוניים (קרנות, תורמים, עסקים)">סיוע בגיוס משאבים מגורמים חיצוניים (קרנות, תורמים, עסקים)</option>
                            <option value="תרומה חד-פעמית ו/או תמיכה במיזמים ספציפיים">תרומה חד-פעמית ו/או תמיכה במיזמים ספציפיים</option>
                            <option value="אין באפשרותי לתרום כספית כרגע, אך אתרום מזמני וכישוריי">אין באפשרותי לתרום כספית כרגע, אך אתרום מזמני וכישוריי</option>
                            <option value="Other">אחר (פרט/י)</option>
                        </select>
                        {financialSupport === "Other" && (
                            <input
                                type="text"
                                required
                                value={financialSupportOther}
                                onChange={(e) => setFinancialSupportOther(e.target.value)}
                                placeholder="פרט/י"
                                className={`${inputStyle} mt-2`}
                            />
                        )}
                    </div>

                    {/* מבין תחומי הפעילות הבאים של העמותה, באיזה תחום היית רוצה להיות מעורב/ת במיוחד? */}
                    <div className="flex flex-col col-span-full">
                        <label className="mb-1 text-sm font-medium text-gray-700">
                            מבין תחומי הפעילות הבאים של העמותה, באיזה תחום היית רוצה להיות מעורב/ת במיוחד? *
                        </label>
                        <select
                            required
                            value={preferredActivityArea}
                            onChange={(e) => { setPreferredActivityArea(e.target.value); if (e.target.value !== "Other") setPreferredActivityAreaOther(""); }}
                            className={selectStyle}
                        >
                            <option value="">בחר/י...</option>
                            <option value="ליווי מקצועי ותכנית הלימודים האמנותית">ליווי מקצועי ותכנית הלימודים האמנותית</option>
                            <option value="פיתוח משאבים וקשרים אסטרטגיים">פיתוח משאבים וקשרים אסטרטגיים</option>
                            <option value="שיווק, פרסום וקידום דיגיטלי">שיווק, פרסום וקידום דיגיטלי</option>
                            <option value="תפעול, לוגיסטיקה וארגון אירועים">תפעול, לוגיסטיקה וארגון אירועים</option>
                            <option value="פיתוח תכניות חדשות והרחבת פעילות העמותה">פיתוח תכניות חדשות והרחבת פעילות העמותה</option>
                            <option value="Other">אחר (פרט/י)</option>
                        </select>
                        {preferredActivityArea === "Other" && (
                            <input
                                type="text"
                                required
                                value={preferredActivityAreaOther}
                                onChange={(e) => setPreferredActivityAreaOther(e.target.value)}
                                placeholder="פרט/י"
                                className={`${inputStyle} mt-2`}
                            />
                        )}
                    </div>

                    {/* --- End New Questions --- */}

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