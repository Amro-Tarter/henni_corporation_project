import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth ,db } from "../config/firbaseConfig";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faLeaf,
  faHammer,
  faWind,
  faWater,
  faFire
} from '@fortawesome/free-solid-svg-icons';
import './auth.css';
import { Eye, EyeOff } from "lucide-react"; // optional if using Lucide
import { collection, query, where, getDocs } from "firebase/firestore";
import { toast } from 'sonner'
import AirIcon from '@mui/icons-material/Air'; // Importing Air icon from MUI

const ELEMENTS = [
  { key: 'earth', type: 'emoji', value: '🌱' },
  { key: 'metal', type: 'emoji', value: '⚒️' },
  { key: 'air',   type: 'icon',  value: <AirIcon /> },
  { key: 'water', type: 'emoji', value: '💧' },
  { key: 'fire',  type: 'emoji', value: '🔥' },
];

const FLOAT_POS = [
  { top: '15%',  left: '10%', anim: 'animate-float-1' },
  { top: '80%', left: '80%', anim: 'animate-float-2' },
  { top: '90%', left: '10%', anim: 'animate-float-3' },
  { top: '60%', left: '20%',  anim: 'animate-float-4' },
  { top: '15%', left: '80%', anim: 'animate-float-5' },
];



function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [username, setUsername] = useState("");
  const [location, setLocation] = useState("");
  // Removed: const [element, setElement] = useState(""); // No longer needed
  const [phone, setPhone] = useState("");
  const inputStyle = "appearance-none rounded-md w-full px-3 py-3 pr-10 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-right";
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Removed: elementGradients object is no longer needed

  const navigate = useNavigate();

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
    `;
    document.head.appendChild(styleSheet);
    return () => {
      document.head.removeChild(styleSheet);
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Basic custom validations
    const cityRegex = /^[A-Za-zא-ת\s]+$/;
    const phoneRegex = /^0\d{9}$/;

    if (!cityRegex.test(location)) {
      toast.success("שם העיר חייב להכיל אותיות בלבד")
      return;
    }

    if (!phoneRegex.test(phone)) {
      toast.error("מספר הטלפון אינו מתאים")
      return
    }

    if (password !== confirmPassword) {
      toast.error("הסיסמאות אינן תואמות")
      return;
    }

    try {
      const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;

      if (!strongPasswordRegex.test(password)) {
        toast.error(".הסיסמה חייבת לכלול לפחות אות אחת קטנה, אות אחת גדולה, מספר אחד ותו מיוחד לפחות 8 תווים" )
        return;
      }

      // Check if username is already taken
      const q = query(collection(db, "users"), where("username", "==", username));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        toast.error(".שם המשתמש כבר קיים, נסה לבחור שם אחר" )
        return;
      }

      const res = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(res.user, { displayName });

      await setDoc(doc(db, "users", res.user.uid), {
        associated_id: res.user.uid,
        role : null,
        email,
        username,
        // Removed: element, // No longer set
        updatedAt: serverTimestamp(),
        createdAt:serverTimestamp(),
        is_active:false,
        last_login:serverTimestamp(),
        phone,
        location,
      });


      toast.success("הבקשה שלך בטיפול אנחנו ניצור איתך קשר בקרוב :)")

      setTimeout(() => {
        navigate("/");
      }, 2000);
    } catch (err) {
      console.error(err);
      if (err.code === "auth/email-already-in-use") {
        toast.error("המייל הזה כבר בשימוש. נסה להתחבר או השתמש באימייל אחר.")
      } else {
        toast.error( "אירעה שגיאה ביצירת החשבון ,נסה שנית מאוחר יותר בבקשה")
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center absolute inset-0 bg-red-900 opacity-95 py-12 px-4 sm:px-6 lg:px-8 relative" dir="rtl">
           <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
               {ELEMENTS.map((el, i) => (
                 <div
                   key={el.key}
                   className={`absolute ${FLOAT_POS[i].anim}`}
                   style={{
                     top:     FLOAT_POS[i].top,
                     left:    FLOAT_POS[i].left,
                     opacity: 0.6,
                   }}
                 >
                   {el.type === 'icon' ? (
                     // MUI icon, enlarge via inline style
                     React.cloneElement(el.value, { style: { fontSize: 64, color: '#87ceeb' } })
                   ) : (
                     // Emoji, use Tailwind for sizing
                     <span className="text-7xl">{el.value}</span>
                   )}
                 </div>
               ))}
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

            {/* Full Name */}
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


            {/* Container with 2 columns */}
            <div className="grid grid-cols-1 gap-4 w-full">

              {/* Password (structured identically) */}
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
                      className={`${inputStyle} pr-10`} // make room for icon
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
                    className={`${inputStyle} pr-10`} // space for icon
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

            {/* Removed: Element selection section */}
            {/* Submit Button */}
            <div className="col-span-1 md:col-span-2 ">
              <button
                type="submit"

                 className="w-full py-3 rounded-lg bg-gradient-to-r from-amber-500 via-orange-500 to-red-600 font-bold text-white hover:from-amber-400 hover:via-orange-400 hover:to-red-500 transition-all duration-300 flex justify-center items-center space-x-2">
                הרשם
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