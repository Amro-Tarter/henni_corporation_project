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
  const [displayName, setDisplayName] = useState("");
  const [username, setUsername] = useState("");
  const [location, setLocation] = useState("");
  const [element, setElement] = useState("");
  const [phone, setPhone] = useState("");


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
        is_active:"false",
        last_login:serverTimestamp(),
        phone,
        location,
        
      });

      await setDoc(doc(db, "profiles", res.user.uid), {
        associated_id: res.user.uid,
        displayName,
        username,
        element,
        bio:null,
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
      setNotification({ type: "error", message: "אירעה שגיאה ביצירת החשבון" });
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

            
      {/* Signup Box */}
      <div className="max-w-md w-full bg-white rounded-xl shadow-2xl p-8 space-y-8 relative overflow-hidden z-10">
        <div className="absolute -top-14 -left-14 w-40 h-40 bg-indigo-100 rounded-full opacity-60"></div>
        <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-cyan-100 rounded-full opacity-60"></div>

        <div className="text-center relative">
          <h2 className="mt-2 text-3xl font-extrabold text-gray-900">לגלות את האור</h2>
          <p className="mt-2 text-sm text-gray-600">צור חשבון חדש</p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <input type="hidden" name="remember" defaultValue="true" />

          <div className="rounded-md shadow-sm space-y-4">
            <input
              type="text"
              required
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="שם מלא"
              className="appearance-none rounded-md relative block w-full px-3 py-3 pr-10 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-right"
            />
            <input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="שם משתמש ייחודי"
              className="appearance-none rounded-md relative block w-full px-3 py-3 pr-10 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-right"
            />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="כתובת אימייל"
              className="appearance-none rounded-md relative block w-full px-3 py-3 pr-10 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-right"
            />
            <input
              type="phone"
              required
              value={email}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="מספר טלפון"
              className="appearance-none rounded-md relative block w-full px-3 py-3 pr-10 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-right"
            />
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="סיסמה"
              className="appearance-none rounded-md relative block w-full px-3 py-3 pr-10 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-right"
            />
            <input
              type="text"
              required
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="מיקום"
              className="appearance-none rounded-md relative block w-full px-3 py-3 pr-10 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-right"
            />
          </div>

          <select
  required
  value={element}
  onChange={(e) => setElement(e.target.value)}
  className="appearance-none rounded-md relative block w-full px-3 py-3 pr-10 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-right"
>
  <option value="">אלימנט</option>
  <option value="fire">אש</option>
  <option value="water">מים</option>
  <option value="earth">אדמה</option>
  <option value="air">אוויר</option>
  <option value="metal">מתכת</option>
</select>

          <div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              הרשמה
            </button>
          </div>

          <div className="text-sm text-center">
            כבר יש לך חשבון?{" "}
            <Link to="/login" className="font-medium text-indigo-600 hover:text-indigo-500">
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
