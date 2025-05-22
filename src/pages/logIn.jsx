import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import { signInWithEmailAndPassword, signOut } from "firebase/auth";
import {
  doc,
  getDoc,
  updateDoc,
  serverTimestamp,
  collection, 
  query, 
  where, 
  getDocs
} from "firebase/firestore";
import { auth, db } from "../config/firbaseConfig";
import { User, Lock, Loader } from "lucide-react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faLeaf,
  faHammer,
  faWind,
  faWater,
  faFire
} from '@fortawesome/free-solid-svg-icons';
import { Eye, EyeOff } from "lucide-react";
import { toast } from 'sonner';

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

  // Add animation styles
  useEffect(() => {
    const styleSheet = document.createElement("style");
    styleSheet.type = "text/css";
    styleSheet.innerText = `       @keyframes float {
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
    
    const user = userCredential.user;
    const email = form.email;

    // 2. Check if user exists in Firestore
    const usersRef = collection(db, "users");
    const q = query(usersRef, where("email", "==", email));

    let querySnapshot;
    try {
      querySnapshot = await getDocs(q);
    } catch (error) {
      toast.error("שגיאה", {
        description: "שגיאה בבדיקת הנתונים. נסה שנית."
      });
      
      await signOut(auth);
      setLoading(false);
      return;
    }

    if (querySnapshot.empty) {
      toast.error("שגיאה", {
        description: "לא נמצא משתמש עם המייל הזה"
      });
      
      await signOut(auth);
      setLoading(false);
      return;
    }

    const userDoc = querySnapshot.docs[0];
    const userData = userDoc.data();

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
      await updateDoc(userDoc.ref, {
        last_login: serverTimestamp(),
      });
    } catch (error) {
      toast.error("שגיאה", {
        description: "שגיאה בעדכון זמן כניסה. נסה שנית."
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-500 to-cyan-100 py-12 px-4 sm:px-6 lg:px-8 relative" dir="rtl">
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

      <div className="max-w-md w-full rounded-xl bg-white shadow-2xl p-8 space-y-8 relative overflow-hidden z-10">
        {/* Decorative element background */}
        <div className="absolute -top-14 -left-14 w-40 h-40 bg-indigo-100 rounded-full opacity-60"></div>
        <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-cyan-100 rounded-full opacity-60"></div>
        
        {/* Logo */}
        <div className="text-center relative">
          <h2 className="mt-2 text-3xl font-extrabold text-gray-900">לגלות את האור הניני</h2>
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
            <button
              type="submit"
              disabled={loading}
              className={`shine-button group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white ${
                loading 
                  ? "bg-indigo-400 cursor-not-allowed" 
                  : "bg-indigo-500 hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              }`}
            >
              {loading ? (
                <span className="flex items-center">
                  <Loader className="animate-spin -ml-1 mr-2 h-4 w-4" />
                  מתחבר...
                </span>
              ) : (
                "התחבר"
              )}
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