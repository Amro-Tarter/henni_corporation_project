import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth ,db } from "../config/firbaseConfig";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import Notification from "../components/Notification";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faLeaf,
  faHammer,
  faWind,
  faWater,
  faFire
} from '@fortawesome/free-solid-svg-icons';
import { Phone } from "lucide-react";

function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [username, setUsername] = useState("");
  const [location, setLocation] = useState("");
  const [element, setElement] = useState("");
  const [phone, setPhone] = useState("");
  const inputStyle = "appearance-none rounded-md w-full px-3 py-3 pr-10 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-right";


  const [notification, setNotification] = useState(null);


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
  const usernameRegex = /^[a-zA-Z0-9_א-ת]+$/;

  if (!cityRegex.test(location)) {
    setNotification({ type: "error", message: "שם העיר חייב להכיל אותיות בלבד" });
    return;
  }

  if (!phoneRegex.test(phone)) {
    setNotification({ type: "error", message: "מספר הטלפון חייב להכיל מספרים בלבד" });
    return;
  }

  if (!usernameRegex.test(username)) {
    setNotification({ type: "error", message: "שם המשתמש יכול להכיל רק אותיות, מספרים וקו תחתון" });
    return;
  }

  if (password !== confirmPassword) {
    setNotification({ type: "error", message: "הסיסמאות אינן תואמות" });
    return;
  }

    try {
      const res = await createUserWithEmailAndPassword(auth, email, password);

      await updateProfile(res.user, { displayName });


      await setDoc(doc(db, "users", res.user.uid), {
        associated_id: res.user.uid,
        role : null,
        email,
        username,
        element,
        updatedAt: serverTimestamp(),
        createdAt:serverTimestamp(),
        is_active:false,
        last_login:serverTimestamp(),
        phone,
        location,
        
      });

      await setDoc(doc(db, "profiles", res.user.uid), {
        associated_id: res.user.uid,
        displayName,
        username,
        element,
        bio:"",
        location,
        followersCount: 0,
        followingCount: 0,
        postsCount: 0,
        createdAt: serverTimestamp(),
        photoURL:"https://firebasestorage.googleapis.com/v0/b/henini-prj.firebasestorage.app/o/profiles%2F123laith%2Fprofile.jpg?alt=media&token=3a72889a-42f8-490d-8968-bb2a3da06f98",
      });


      setNotification({ type: "success", message: "נרשמת בהצלחה!" });
      setTimeout(() => {
        navigate("/");
      }, 1000);
    } catch (err) {
      console.error(err);
      if (err.code === "auth/email-already-in-use") {
        setNotification({ type: "error", message: "האימייל הזה כבר בשימוש. נסה להתחבר או השתמש באימייל אחר." });
      } else {
        setNotification({ type: "error", message: "אירעה שגיאה ביצירת החשבון" });
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-500 to-cyan-100 py-12 px-4 sm:px-6 lg:px-8 relative" dir="rtl">
       {/* Floating Element Icons */}
            {/* Floating Element Icons */}
<div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
  {/* Element 1 - Leaf */}
  <div className="absolute top-10 left-10 opacity-40 animate-float-1">
    <FontAwesomeIcon icon={faLeaf} className="w-16 h-16 text-green-500" />
  </div>
  
  {/* Element 2 - Hammer */}
  <div className="absolute top-1/3 right-5 opacity-50 animate-float-2">
    <FontAwesomeIcon icon={faHammer} className="w-14 h-14 text-indigo-600" />
  </div>
  
  {/* Element 3 - Wind */}
  <div className="absolute top-1/2 left-1/4 opacity-45 animate-float-3">
    <FontAwesomeIcon icon={faWind} className="w-12 h-12 text-cyan-600" />
  </div>
  
  {/* Element 4 - Water */}
  <div className="absolute bottom-10 right-20 opacity-50 animate-float-4">
    <FontAwesomeIcon icon={faWater} className="w-14 h-14 text-blue-500" />
  </div>
  
  {/* Element 5 - Fire */}
  <div className="absolute bottom-1/4 left-5 opacity-40 animate-float-5">
    <FontAwesomeIcon icon={faFire} className="w-16 h-16 text-red-500" />
  </div>
  
  {/* Additional decorative icons */}
  <div className="absolute top-16 right-10 opacity-30 animate-float-6">
    <FontAwesomeIcon icon={faLeaf} className="w-12 h-12 text-green-400" />
  </div>
  
  <div className="absolute bottom-24 left-1/3 opacity-30 animate-float-7">
    <FontAwesomeIcon icon={faWind} className="w-10 h-10 text-teal-500" />
  </div>
  
  <div className="absolute top-3/5 left-1/4 opacity-35 animate-float-8">
    <FontAwesomeIcon icon={faWater} className="w-12 h-12 text-blue-400" />
  </div>
</div>

 
  
  <div className="w-full max-w-2xl bg-white/30 backdrop-blur-md rounded-xl shadow-lg overflow-hidden p-8 z-10">
     {/* Decorative Circles */}
  <div className="absolute -top-14 -left-14 w-40 h-40 bg-indigo-100 rounded-full opacity-60"></div>
  <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-cyan-100 rounded-full opacity-60"></div>

    {/* Heading */}
    <div className="text-center mb-6">
      <h2 className="text-3xl font-extrabold text-gray-900"> לגלות את האור הניני</h2>
      <p className="mt-2 text-sm text-gray-700">צור חשבון חדש</p>
    </div>

    {/* Signup Form */}
    {/* Signup Form */}
<form
  className="grid grid-cols-1 md:grid-cols-2 gap-4"
  onSubmit={handleSubmit}
>
  <input type="hidden" name="remember" defaultValue="true" />

  {/* Full Name */}
  <div className="flex flex-col">
    <label className="mb-1 text-sm font-medium text-gray-700">שם מלא</label>
    <input
      type="text"
      required
      value={displayName}
      onChange={(e) => setDisplayName(e.target.value)}
      placeholder="שם מלא"
      className={inputStyle}
    />
  </div>

  {/* Username */}
  <div className="flex flex-col">
    <label className="mb-1 text-sm font-medium text-gray-700">שם משתמש ייחודי</label>
    <input
      type="text"
      required
      value={username}
      onChange={(e) => setUsername(e.target.value)}
      placeholder="שם משתמש ייחודי"
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
      placeholder="כתובת אימייל"
      className={inputStyle}
    />
  </div>

  {/* Phone */}
  <div className="flex flex-col">
    <label className="mb-1 text-sm font-medium text-gray-700">מספר טלפון</label>
    <input
      type="tel"
      required
      value={phone}
      onChange={(e) => setPhone(e.target.value)}
      placeholder="מספר טלפון"
      className={inputStyle}
    />
  </div>

  {/* Password */}
  <div className="flex flex-col">
    <label className="mb-1 text-sm font-medium text-gray-700">סיסמה</label>
    <input
      type="password"
      required
      value={password}
      onChange={(e) => setPassword(e.target.value)}
      placeholder="סיסמה"
      className={inputStyle}
    />
  </div>

  {/* Confirm Password */}
  <div className="flex flex-col">
    <label className="mb-1 text-sm font-medium text-gray-700">אימות סיסמה</label>
    <input
      type="password"
      required
      value={confirmPassword}
      onChange={(e) => setConfirmPassword(e.target.value)}
      placeholder="אימות סיסמה"
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
      placeholder="מיקום"
      className={inputStyle}
    />
  </div>

  {/* Element */}
  <div className="flex flex-col">
    <label className="mb-1 text-sm font-medium text-gray-700">אלמנט</label>
    <select
      required
      value={element}
      onChange={(e) => setElement(e.target.value)}
      className={inputStyle}
    >
      <option value="">בחר אלמנט</option>
      <option value="fire">אש</option>
      <option value="water">מים</option>
      <option value="earth">אדמה</option>
      <option value="air">אוויר</option>
      <option value="metal">מתכת</option>
    </select>
  </div>

  {/* Submit Button */}
  <div className="col-span-1 md:col-span-2 mt-4">
    <button
      type="submit"
      className="w-full py-3 px-4 rounded-md bg-indigo-600 text-white font-medium hover:bg-indigo-700 transition"
    >
      הרשמה
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

      {notification && (
        <Notification type={notification.type} message={notification.message} />
      )}
    </div>
  );
}

export default Signup;
