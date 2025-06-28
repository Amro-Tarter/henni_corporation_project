import React, { useState , useEffect } from "react";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../config/firbaseConfig";
import { Link } from "react-router-dom";
import Notification from "../components/Notification"; // ✅ import notification
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {  Loader } from "lucide-react";
import {
  faLeaf,
  faHammer,
  faWind,
  faWater,
  faFire
} from '@fortawesome/free-solid-svg-icons';
import Navbar from '../components/layout/Navigation';
import SpaRoundedIcon from '@mui/icons-material/SpaRounded';
import ConstructionTwoToneIcon from '@mui/icons-material/ConstructionTwoTone';
import AirIcon from '@mui/icons-material/Air';
import WaterDropTwoToneIcon from '@mui/icons-material/WaterDropTwoTone';
import WhatshotRoundedIcon from '@mui/icons-material/WhatshotRounded';

const ELEMENTS = [
  { key: 'earth', emoji: <SpaRoundedIcon style={{color: '#4ade80'}} />, color: 'from-green-600 to-emerald-500', bgColor: 'bg-green-100' },
  { key: 'metal', emoji: <ConstructionTwoToneIcon style={{color: '#4b5563'}} />, color: 'from-gray-600 to-slate-500', bgColor: 'bg-gray-100' },
  { key: 'air',   emoji: <AirIcon style={{color: '#87ceeb'}} />, color: 'from-blue-500 to-cyan-400', bgColor: 'bg-blue-100' },
  { key: 'water', emoji: <WaterDropTwoToneIcon style={{color: '#60a5fa'}} />, color: 'from-indigo-500 to-purple-400', bgColor: 'bg-indigo-100' },
  { key: 'fire',  emoji: <WhatshotRoundedIcon style={{color: '#fca5a1'}} />, color: 'from-red-600 to-orange-500', bgColor: 'bg-red-100' },
];

const FLOAT_POS = [
  { top: '15%',  left: '10%', anim: 'animate-float-1' },
  { top: '80%', left: '80%', anim: 'animate-float-2' },
  { top: '90%', left: '10%', anim: 'animate-float-3' },
  { top: '60%', left: '20%',  anim: 'animate-float-4' },
  { top: '15%', left: '80%', anim: 'animate-float-5' },
];

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [notification, setNotification] = useState(null);
  const [loading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await sendPasswordResetEmail(auth, email);
      setNotification({
        message: "קישור לאיפוס סיסמה נשלח לאימייל שלך",
        type: "success",
      });
      setEmail("");
    } catch (error) {
      let message = "שגיאה בשליחת קישור לאיפוס";
      if (error.code === "auth/user-not-found") {
        message = "לא נמצא משתמש עם האימייל הזה";
      }
      setNotification({ message, type: "error" });
    }
  };


  // Add animation styles with enhanced visibility and movement
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
      .animate-float-4 { animation: float 12s ease-in-out 0.5s infinite; }
      .animate-float-5 { animation: float 7s ease-in-out 1.5s infinite; }
      .animate-float-6 { animation: float 11s ease-in-out 3s infinite; }
      .animate-float-7 { animation: float 9s ease-in-out 2s infinite; }
      .animate-float-8 { animation: float 10s ease-in-out 1s infinite; }
    `;
    document.head.appendChild(styleSheet);
    
    return () => {
      document.head.removeChild(styleSheet);
    };
  }, []);


  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-tl from-red-950 via-red-800 to-orange-600 py-12 px-4 sm:px-6 lg:px-8 relative" dir="rtl">
      <Navbar/>
      {/* Floating Element Icons */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        {/* Element 1 - Leaf */}
        <div className="absolute top-20 left-10 animate-float-1">
          {/* Using sx prop for explicit pixel size */}
          <SpaRoundedIcon sx={{ fontSize: '96px' }} className="text-green-500" />
        </div>

        {/* Element 2 - Hammer */}
        <div className="absolute top-1/3 right-20 animate-float-2">
          {/* Using sx prop for explicit pixel size */}
          <ConstructionTwoToneIcon sx={{ fontSize: '88px' }} className="text-gray-600" />
        </div>

        {/* Element 3 - Wind */}
        <div className="absolute top-1/2 left-1/4  animate-float-3">
          {/* Using a very large Tailwind text size class */}
          <AirIcon sx={{ fontSize: '88px' }} className="text-8xl text-cyan-600" />
        </div>

        {/* Element 4 - Water */}
        <div className="absolute bottom-10 right-20 animate-float-4">
          {/* Using sx prop for explicit pixel size */}
          <WaterDropTwoToneIcon sx={{ fontSize: '88px' }} className="text-blue-500" />
        </div>

        {/* Element 5 - Fire */}
        <div className="absolute bottom-1/4 left-5 animate-float-5">
          {/* Using a very large Tailwind text size class */}
          <WhatshotRoundedIcon sx={{ fontSize: '88px' }} className="text-8xl text-red-500" />
        </div>

        {/* Additional decorative icons */}
        <div className="absolute top-20 left-1/2 animate-float-6">
          {/* Using a large Tailwind text size class */}
          <SpaRoundedIcon sx={{ fontSize: '88px' }} className="text-7xl text-green-400" />
        </div>

        <div className="absolute bottom-24 left-1/3  animate-float-7">
          {/* Using a large Tailwind text size class */}
          <AirIcon sx={{ fontSize: '88px' }} className="text-6xl text-teal-500" />
        </div>

        <div className="absolute top-3/5 left-1/4 animate-float-8">
          {/* Using a large Tailwind text size class */}
          <WaterDropTwoToneIcon sx={{ fontSize: '88px' }} className="text-7xl text-blue-400" />
        </div>
      </div>


      <div className="max-w-md w-full bg-white rounded-xl shadow-2xl p-8 space-y-8 relative overflow-hidden z-10">
        {/* Decorative element background */}
        <div className="absolute -top-14 -left-14 w-40 h-40 bg-red-100 rounded-full opacity-60"></div>
        <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-orange-100 rounded-full opacity-60"></div>

        <div className="text-center relative">
          <h2 className="mt-2 text-3xl font-extrabold text-gray-900">איפוס סיסמה</h2>
          <p className="mt-2 text-sm text-gray-600">שלח קישור לאיפוס סיסמה לאימייל שלך</p>
        </div>

        {notification && (
          <Notification
            type={notification.type}
            message={notification.message}
            onClose={() => setNotification(null)}
          />
        )}

        <form className="mt-8 space-y-6 relative" onSubmit={handleSubmit}>
          <div className="mb-5">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              אימייל
            </label>
            <div className="relative">
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="appearance-none rounded-md relative block w-full px-3 py-3 pr-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 sm:text-sm"
                placeholder="הכנס את האימייל שלך"
                dir="rtl"
              />
            </div>
          </div>

          <div>
      <button
  type="submit"
  disabled={loading}

  
  className={`group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white   transition hover:opacity-95 
     shine-button ${
    loading
      ? "bg-gradient-to-r from-amber-500 via-orange-500 to-red-600 cursor-not-allowed"
      : "bg-gradient-to-r from-amber-500 via-orange-500 to-red-600 hover:bg-gradient-to-r from-amber-500 via-orange-500 to-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
  }`}   
    >
                    {loading ? <Loader className="animate-spin" size={20}/> : '    שלח קישור לאיפוס סיסמה'}

    <span className="shine" />
    </button>

          </div>
        </form>

        <div className="text-center mt-4">
          <p className="text-sm text-gray-600">
            זוכר את הסיסמה שלך?{" "}
            <Link to="/login" className="font-medium text-indigo-600 hover:text-indigo-500">
              התחבר
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
