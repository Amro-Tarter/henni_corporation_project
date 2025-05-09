import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import { signInWithEmailAndPassword } from "firebase/auth";
import {
  doc,
  getDoc,
  updateDoc,
  serverTimestamp
} from "firebase/firestore";
import { auth, db } from "../config/firbaseConfig";
import { User, Lock, AlertCircle, CheckCircle, Loader } from "lucide-react";

const Login = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [notification, setNotification] = useState(null);
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  // Check for saved email in localStorage
  useEffect(() => {
    const savedEmail = localStorage.getItem("rememberedEmail");
    if (savedEmail) {
      setForm(prev => ({ ...prev, email: savedEmail }));
      setRememberMe(true);
    }
  }, []);

  const handleChange = (e) => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleRememberMe = () => {
    setRememberMe(!rememberMe);
  };

  const showNotification = (message, type) => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 5000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Handle remember me
      if (rememberMe) {
        localStorage.setItem("rememberedEmail", form.email);
      } else {
        localStorage.removeItem("rememberedEmail");
      }

      // 1. Sign in with Firebase Authentication
      const userCredential = await signInWithEmailAndPassword(
        auth,
        form.email,
        form.password
      );
      const user = userCredential.user;

      // 2. Check if user exists in Firestore and is active
      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        await signOut(auth);
        throw new Error("user-not-found");
      }

      const userData = userSnap.data();

      if (!userData.is_active) {
        await signOut(auth);
        throw new Error("user-inactive");
      }

      // 3. Update last_login timestamp
      await updateDoc(userRef, {
        last_login: serverTimestamp(),
      });

      // 4. Store authentication token in cookies (expires in 7 days)
      const token = await user.getIdToken();
      Cookies.set("authToken", token, { expires: 7 }); 
      
      // Store user element for theming
      localStorage.setItem("userElement", userData.element || "fire");

      // 5. Show success notification and redirect
      showNotification("התחברת בהצלחה! מעביר אותך לדף הבית...", "success");
      
      setTimeout(() => {
        navigate("/home");
      }, 1500);
      
    } catch (error) {
      console.error("Login error:", error);
      
      let message = "שגיאה בהתחברות. נסה שנית.";
      
      if (error.code === "auth/user-not-found" || error.message === "user-not-found") {
        message = "לא נמצא משתמש עם האימייל הזה";
      } else if (error.code === "auth/wrong-password") {
        message = "סיסמה שגויה, נסה שנית";
      } else if (error.code === "auth/too-many-requests") {
        message = "יותר מדי נסיונות התחברות. נסה שוב מאוחר יותר";
      } else if (error.code === "auth/invalid-email") {
        message = "כתובת האימייל אינה תקינה";
      } else if (error.message === "user-inactive") {
        message = "המשתמש שלך אינו פעיל. פנה למנהל המערכת.";
      }
      
      showNotification(message, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-900 to-red-800 py-12 px-4 sm:px-6 lg:px-8" dir="rtl">
      <div className="max-w-md w-full bg-white rounded-xl shadow-2xl p-8 space-y-8 relative overflow-hidden">
        {/* Decorative element background */}
        <div className="absolute -top-14 -left-14 w-40 h-40 bg-red-100 rounded-full opacity-60"></div>
        <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-orange-100 rounded-full opacity-60"></div>
        
        {/* Logo */}
        <div className="text-center relative">
          <h2 className="mt-2 text-3xl font-extrabold text-gray-900">לגלות את האור</h2>
          <p className="mt-2 text-sm text-gray-600">התחברות לחשבון שלך</p>
        </div>

        {/* Notification */}
        {notification && (
          <div 
            className={`rounded-md p-4 flex items-center justify-between ${
              notification.type === "error" 
                ? "bg-red-50 text-red-800 border border-red-200" 
                : "bg-green-50 text-green-800 border border-green-200"
            }`}
          >
            <div className="flex items-center">
              {notification.type === "error" ? (
                <AlertCircle className="ml-3 h-5 w-5 text-red-400" />
              ) : (
                <CheckCircle className="ml-3 h-5 w-5 text-green-400" />
              )}
              <p className="text-sm">{notification.message}</p>
            </div>
            <button 
              onClick={() => setNotification(null)}
              className="text-gray-400 hover:text-gray-500"
            >
              &times;
            </button>
          </div>
        )}

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
                  className="appearance-none rounded-md relative block w-full px-3 py-3 pr-10 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 focus:z-10 sm:text-sm"
                  placeholder="הכנס את האימייל שלך"
                  dir="ltr"
                />
              </div>
            </div>
            <div className="mb-1">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                סיסמה
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={form.password}
                  onChange={handleChange}
                  className="appearance-none rounded-md relative block w-full px-3 py-3 pr-10 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 focus:z-10 sm:text-sm"
                  placeholder="הכנס את הסיסמה שלך"
                  dir="ltr"
                />
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
                className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded cursor-pointer"
              />
              <label htmlFor="remember-me" className="mr-2 block text-sm text-gray-900 cursor-pointer">
                זכור אותי
              </label>
            </div>

            <div className="text-sm">
              <Link to="/forgotPassword" className="font-medium text-red-600 hover:text-red-500">
                שכחת סיסמה?
              </Link>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className={`group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white ${
                loading 
                  ? "bg-red-400 cursor-not-allowed" 
                  : "bg-red-800 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
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
            </button>
          </div>
        </form>

        <div className="text-center mt-4">
          <p className="text-sm text-gray-600">
            אין לך חשבון עדיין?{" "}
            <Link to="/signUp" className="font-medium text-red-600 hover:text-red-500">
              הרשמה
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;