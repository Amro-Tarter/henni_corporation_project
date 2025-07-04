import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import { signInWithEmailAndPassword, signOut } from "firebase/auth";
import {
  doc,
  getDoc, // Directly get the user document by UID
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";
import { auth, db } from "../config/firbaseConfig";
import { User, Lock, Loader } from "lucide-react";
import { Eye, EyeOff } from "lucide-react";
import { toast } from 'sonner';
import AirIcon from '@mui/icons-material/Air';
import Navbar from '../components/layout/Navigation';
import LocalFloristIcon from '@mui/icons-material/LocalFlorist';
import ConstructionTwoToneIcon from '@mui/icons-material/ConstructionTwoTone';
import WaterDropTwoToneIcon from '@mui/icons-material/WaterDropTwoTone';
import WhatshotRoundedIcon from '@mui/icons-material/WhatshotRounded';

// Defined ELEMENTS array - consistent with your structure
const ELEMENTS = [
  { key: 'earth', emoji: <LocalFloristIcon style={{color: '#4ade80'}} /> },
  { key: 'metal', emoji: <ConstructionTwoToneIcon style={{color: '#4b5563'}} /> },
  { key: 'air',   emoji: <AirIcon style={{color: '#87ceeb'}} /> },
  { key: 'water', emoji: <WaterDropTwoToneIcon style={{color: '#60a5fa'}} /> },
  { key: 'fire',  emoji: <WhatshotRoundedIcon style={{color: '#fca5a1'}} /> },
];

const Login = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Check for saved email in localStorage
  useEffect(() => {
    const savedEmail = localStorage.getItem("rememberedEmail");
    if (savedEmail) {
      setForm(prev => ({ ...prev, email: savedEmail }));
      setRememberMe(true);
    }
  }, []);

  // Add animation styles (unchanged from your original)
  useEffect(() => {
    const styleSheet = document.createElement("style");
    styleSheet.type = "text/css";
    styleSheet.innerText = ` @keyframes float {
        0% { transform: translateY(0) rotate(0deg); }
        50% { transform: translateY(-20px) rotate(5deg); }
        100% { transform: translateY(0) rotate(0deg); }
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

  const handleChange = (e) => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleRememberMe = () => {
    setRememberMe(!rememberMe);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Handle remember me
    if (rememberMe) {
      localStorage.setItem("rememberedEmail", form.email);
    } else {
      localStorage.removeItem("rememberedEmail");
    }

    // 1. Sign in with Firebase Authentication
    let userCredential;
    try {
      userCredential = await signInWithEmailAndPassword(
        auth,
        form.email,
        form.password
      );
    } catch (error) {
      let description = "שגיאה בהתחברות. נסה שנית.";
      
      if (error.code === "auth/user-not-found") {
        description = "לא נמצא משתמש עם המייל הזה";
      } else if (error.code === "auth/wrong-password") {
        description = "סיסמה שגויה, נסה שנית";
      } else if (error.code === "auth/too-many-requests") {
        description = "יותר מדי נסיונות התחברות. נסה שוב מאוחר יותר";
      } else if (error.code === "auth/invalid-email") {
        description = "כתובת האימייל אינה תקינה";
      }
      
      toast.error("שגיאה", {
        description: description
      });
      
      setLoading(false);
      return;
    }
    
    const user = userCredential.user; // The authenticated Firebase user object

    // 2. Fetch user data from Firestore using the UID (document ID)
    const userDocRef = doc(db, "users", user.uid);
    let userDocSnap;
    try {
      userDocSnap = await getDoc(userDocRef);
    } catch (error) {
      toast.error("שגיאה", {
        description: "שגיאה בבדיקת נתוני המשתמש. נסה שנית."
      });
      
      await signOut(auth);
      setLoading(false);
      return;
    }

    if (!userDocSnap.exists()) {
      toast.error("שגיאה", {
        description: "לא נמצאו נתוני משתמש תואמים. פנה למנהל המערכת."
      });
      
      await signOut(auth); // Sign out if Firestore user data not found
      setLoading(false);
      return;
    }

    const userData = userDocSnap.data();

    // 3. Check if user is active
    if (!userData.is_active) {
      toast.error("שגיאה", {
        description: "המשתמש שלך אינו פעיל. פנה למנהל המערכת."
      });
      
      await signOut(auth);
      setLoading(false);
      return;
    }

    // 4. Update last_login timestamp
    try {
      await updateDoc(userDocRef, { // Use userDocRef directly
        last_login: serverTimestamp(),
      });
    } catch (error) {
      console.error("Error updating last_login:", error); // Log for more details
      toast.error("שגיאה", {
        description: "שגיאה בעדכון זמן כניסה. נסה שנית. (בדוק הרשאות Firestore)"
      });
      
      await signOut(auth);
      setLoading(false);
      return;
    }

    // 5. Store authentication token in cookies
    try {
      const token = await user.getIdToken();
      Cookies.set("authToken", token, { expires: 7 });
      
      // Store user element for theming
      localStorage.setItem("userElement", userData.element || "fire");
    } catch (error) {
      toast.error("שגיאה", {
        description: "שגיאה ביצירת טוקן התחברות. נסה שנית."
      });
      
      await signOut(auth);
      setLoading(false);
      return;
    }

    // 6. Show success notification and redirect
    toast.success("התחברת בהצלחה", {
      description: "מעביר אותך לדף הבית..."
    });
    
    setLoading(false);
    
    setTimeout(() => {
      navigate("/home");
    }, 1000);
  };

  return (
    
<div
  className="min-h-screen flex items-center justify-center absolute inset-0 bg-gradient-to-tl from-red-950 via-red-800 to-orange-600
  opacity-95 py-12 px-4 sm:px-6 lg:px-8 relative"
  dir="rtl"
>
  <Navbar/>
      {/* Floating Element Icons */}
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

      <div className="max-w-md w-full rounded-xl bg-white shadow-2xl p-8 space-y-8 relative overflow-hidden z-10">
      
        
        {/* Logo */}
        <div className="text-center relative">
          <h2 className="mt-2 text-3xl font-extrabold text-gray-900">עמותת לגלות את האור - הנני</h2>
          <p className="mt-2 text-sm text-gray-600">התחברות לחשבון שלך</p>
        </div>

        <form className="mt-8 space-y-6 relative" onSubmit={handleSubmit}>
          <div className="rounded-md -space-y-px">
            <div className="mb-5">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                אימייל
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={form.email}
                  onChange={handleChange}
                  className="appearance-none rounded-md relative block w-full px-3 py-3 pr-10 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                  placeholder="הכנס את האימייל שלך"
                  dir="rtl"
                />
              </div>
            </div>

            <div className="mb-1">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                סיסמה
              </label>
              <div className="relative">
                <div className="flex flex-col">
                  <div className="relative">
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="current-password"
                      required
                      value={form.password}
                      onChange={handleChange}
                      className="appearance-none rounded-md relative block w-full px-3 py-3 pr-10 pl-10 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                      placeholder="הכנס את הסיסמה שלך"
                      dir="rtl"
                    />

                    {/* Eye Icon Toggle */}
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 left-2 flex items-center text-gray-600 z-10"
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                checked={rememberMe}
                onChange={handleRememberMe}
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded cursor-pointer"
              />
              <label htmlFor="remember-me" className="mr-2 block text-sm text-gray-900 cursor-pointer">
                זכור אותי
              </label>
            </div>

            <div className="text-sm">
              <Link to="/forgotPassword" className="font-medium text-indigo-600 hover:text-indigo-500">
                שכחת סיסמה?
              </Link>
            </div>
          </div>

          <div>
               <button type="submit" disabled={loading}
className={`group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white   transition hover:opacity-95 
      shine-button ${
    loading
      ? "bg-gradient-to-r from-amber-500 via-orange-500 to-red-600 cursor-not-allowed"
      : "bg-gradient-to-r from-amber-500 via-orange-500 to-red-600 hover:bg-gradient-to-r from-amber-500 via-orange-500 to-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
  }`}             >
                {loading ? <Loader className="animate-spin" size={20}/> : 'התחבר'}
            <span className="shine" />

            </button>
          </div>
        </form>

        <div className="text-center mt-4">
          <p className="text-sm text-gray-600">
            אין לך חשבון עדיין?{" "}
            <Link to="/signUp" className="font-medium text-indigo-600 hover:text-indigo-500">
              הרשמה
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;