import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { createUserWithEmailAndPassword, updateProfile, signOut } from "firebase/auth";
import { auth, db } from "../config/firbaseConfig";
import { doc, setDoc, serverTimestamp, collection, query, where, getDocs, getDoc } from "firebase/firestore";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faLeaf,
  faHammer,
  faWind,
  faWater,
  faFire
} from '@fortawesome/free-solid-svg-icons';
import { Phone } from "lucide-react";
import './auth.css';
import { useToast } from "@/hooks/use-toast";
import { Eye, EyeOff } from "lucide-react";
import Cookies from "js-cookie";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

function Signup() {
  const { toast } = useToast();
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    username: "",
    location: "",
    element: "",
    phone: ""
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const elementGradients = {
    fire: 'bg-gradient-to-r from-rose-700 via-amber-550 to-yellow-500',
    water: 'bg-gradient-to-r from-indigo-500 via-blue-400 to-teal-300',
    earth: 'bg-gradient-to-r from-lime-700 via-amber-600 to-stone-400',
    air: 'bg-gradient-to-r from-white via-sky-200 to-indigo-100',
    metal: 'bg-gradient-to-r from-zinc-300 via-slate-00 to-neutral-700',
  };

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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
    const { email, password, confirmPassword, username, location, phone, element } = formData;

    if (!email || !password || !confirmPassword || !username || !location || !phone || !element) {
      toast({
        variant: "destructive",
        title: "שגיאה",
        description: "אנא מלא את כל השדות החובה"
      });
      return false;
    }

    if (username.length < 3) {
      toast({
        variant: "destructive",
        title: "שגיאה",
        description: "שם המשתמש חייב להכיל לפחות 3 תווים"
      });
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast({
        variant: "destructive",
        title: "שגיאה",
        description: "כתובת האימייל אינה תקינה"
      });
      return false;
    }

    const cityRegex = /^[A-Za-zא-ת\s]+$/;
    if (!cityRegex.test(location)) {
      toast({
        variant: "destructive",
        title: "שגיאה",
        description: "שם העיר חייב להכיל אותיות בלבד"
      });
      return false;
    }

    const phoneRegex = /^0\d{9}$/;
    if (!phoneRegex.test(phone)) {
      toast({
        variant: "destructive",
        title: "שגיאה",
        description: "מספר הטלפון חייב להתחיל ב-0 ולהכיל 10 ספרות"
      });
      return false;
    }

    if (password !== confirmPassword) {
      toast({
        variant: "destructive",
        title: "שגיאה",
        description: "הסיסמאות אינן תואמות"
      });
      return false;
    }

    const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
    if (!strongPasswordRegex.test(password)) {
      toast({
        variant: "destructive",
        title: "שגיאה",
        description: "הסיסמה חייבת לכלול לפחות אות אחת קטנה, אות אחת גדולה, מספר אחד ותו מיוחד לפחות 8 תווים"
      });
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);

    try {
      // Check if username is already taken
      const usernameQuery = query(collection(db, "users"), where("username", "==", formData.username));
      const usernameSnapshot = await getDocs(usernameQuery);

      if (!usernameSnapshot.empty) {
        toast({
          variant: "destructive",
          title: "שגיאה",
          description: "שם המשתמש כבר קיים. נסה לבחור שם אחר"
        });
        setIsLoading(false);
        return;
      }

      // Create user account
      const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
      const user = userCredential.user;

      // Get the authentication token
      const token = await user.getIdToken();

      // Store the token in cookies (expires in 7 days)
      Cookies.set("authToken", token, { expires: 7 });

      // Store user element for theming
      localStorage.setItem("userElement", formData.element);

      // Create user document
      const userData = {
        associated_id: user.uid,
        role: "user",
        email: formData.email,
        username: formData.username,
        element: formData.element,
        updatedAt: serverTimestamp(),
        createdAt: serverTimestamp(),
        is_active: false,
        last_login: serverTimestamp(),
        phone: formData.phone,
        location: formData.location
      };

      // Create user document and verify it was created
      await setDoc(doc(db, "users", user.uid), userData);
      const userDoc = await getDoc(doc(db, "users", user.uid));
      
      if (!userDoc.exists()) {
        throw new Error("Failed to create user document");
      }

      // Create profile document
      const profileData = {
        associated_id: user.uid,
        displayName: formData.username,
        username: formData.username,
        element: formData.element,
        bio: "",
        location: formData.location,
        followersCount: 0,
        followingCount: 0,
        postsCount: 0,
        createdAt: serverTimestamp(),
        photoURL: "https://firebasestorage.googleapis.com/v0/b/henini-prj.firebasestorage.app/o/profiles%2F123laith%2Fprofile.jpg?alt=media&token=3a72889a-42f8-490d-8968-bb2a3da06f98"
      };

      // Create profile document and verify it was created
      await setDoc(doc(db, "profiles", user.uid), profileData);
      const profileDoc = await getDoc(doc(db, "profiles", user.uid));
      
      if (!profileDoc.exists()) {
        throw new Error("Failed to create profile document");
      }

      // Update user profile
      await updateProfile(user, { displayName: formData.username });

      // Show success message
      toast({
        title: "הבקשה נשלחה בהצלחה",
        description: "החשבון שלך ממתין לאישור מנהל המערכת. תקבל הודעה כשהוא יאושר."
      });

      // Sign out the user since account is not active yet
      await signOut(auth);
      Cookies.remove("authToken");

      // Navigate to home page
      navigate("/");

    } catch (error) {
      console.error("Signup error:", error);
      
      let errorMessage = "אירעה שגיאה ביצירת החשבון";
      
      switch (error.code) {
        case "auth/email-already-in-use":
          errorMessage = "כתובת האימייל כבר קיימת במערכת. נסה להתחבר או השתמש באימייל אחר";
          break;
        case "auth/invalid-email":
          errorMessage = "כתובת האימייל אינה תקינה";
          break;
        case "auth/operation-not-allowed":
          errorMessage = "הרשמה באמצעות אימייל וסיסמה אינה זמינה כרגע";
          break;
        case "auth/weak-password":
          errorMessage = "הסיסמה חלשה מדי. אנא בחר סיסמה חזקה יותר";
          break;
        case "auth/network-request-failed":
          errorMessage = "בעיה בחיבור לרשת. אנא בדוק את החיבור שלך ונסה שוב";
          break;
        case "permission-denied":
          errorMessage = "אין לך הרשאה לבצע פעולה זו";
          break;
        default:
          if (error.message.includes("Failed to create")) {
            errorMessage = "שגיאה ביצירת הפרופיל. אנא נסה שוב";
          }
      }

      toast({
        variant: "destructive",
        title: "שגיאה",
        description: errorMessage
      });
    } finally {
      setIsLoading(false);
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

 
  
  <div className="w-full max-w-2xl bg-white backdrop-blur-md rounded-xl shadow-lg overflow-hidden p-8 z-10">
     {/* Decorative Circles */}
  <div className="absolute -top-14 -left-14 w-40 h-40 bg-indigo-100 rounded-full opacity-60"></div>
  <div className="absolute z-10  -bottom-10 -right-10 w-32 h-32 bg-cyan-100 rounded-full opacity-60"></div>

    {/* Heading */}
    <div className="text-center mb-6">
      <h2 className="text-3xl font-extrabold text-gray-900"> לגלות את האור הניני</h2>
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
          name="username"
          value={formData.username}
          onChange={handleChange}
          placeholder="שם משתמש *"
          className="appearance-none rounded-md w-full px-3 py-3 pr-10 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-right"
        />
      </div>

      {/* Email */}
      <div className="flex flex-col">
        <label className="mb-1 text-sm font-medium text-gray-700">כתובת אימייל</label>
        <input
          type="email"
          required
          name="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="כתובת אימייל *"
          className="appearance-none rounded-md w-full px-3 py-3 pr-10 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-right"
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
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="סיסמה *"
              className="appearance-none rounded-md w-full px-3 py-3 pr-10 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-right"
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
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            placeholder="אימות סיסמה *"
            className="appearance-none rounded-md w-full px-3 py-3 pr-10 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-right"
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
          name="phone"
          value={formData.phone}
          onChange={handleChange}
          placeholder="* מספר טלפון"
          className="appearance-none rounded-md w-full px-3 py-3 pr-10 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-right"
        />
      </div>

      {/* Location */}
      <div className="flex flex-col">
        <label className="mb-1 text-sm font-medium text-gray-700">מיקום</label>
        <input
          type="text"
          required
          name="location"
          value={formData.location}
          onChange={handleChange}
          placeholder="מיקום *"
          className="appearance-none rounded-md w-full px-3 py-3 pr-10 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-right"
        />
      </div>

      {/* Element */}
      <div className=" shine-button col-span md:col-span-2 mt-2 flex flex-col items-center ">
        <label className="mb-2 text-center ">אלמנט</label>
        <select
          required
          name="element"
          value={formData.element}
          onChange={handleChange}
          style={{ outline: 'none', boxShadow: 'none' }}
          className={` 
            mb-2 text-center focus:ring-0 focus:border-gray-300		 border border-gray-300 appearance-none rounded-md w-full px-3 py-3 pr-10 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-right ${elementGradients[formData.element] || "bg-white"}`}
        >
          <option
            value=""
            className="mb-2 text-center 	"
          >
            בחר אלמנט
          </option>
          <option
            value="fire"
            className="mb-2 text-center  "
          >
            אש
          </option>
          <option
            value="water"
            className="mb-2 text-center"
          >
            מים
          </option>
          <option
            value="earth"
            className="mb-2 text-center"
          >
            אדמה
          </option>
          <option
            value="air"
            className="mb-2 text-center"
          >
            אוויר
          </option>
          <option
            value="metal"
            className="mb-2 text-center"
          >
            מתכת
          </option>
        </select>
        <span className="shine"></span>
      </div>

      {/* Submit Button */}
      <div className="col-span-1 md:col-span-2">
        <button
          type="submit"
          disabled={isLoading}
          className={`relative overflow-hidden z-10 w-full py-3 px-4 rounded-md font-medium text-black text-lg
            transition hover:opacity-95 
            ${elementGradients[formData.element] || "bg-gray-300"} 
            ${isLoading ? "opacity-50 cursor-not-allowed" : "shine-button"}`}
        >
          {isLoading ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              מתחבר...
            </span>
          ) : (
            "הרשם"
          )}
          <span className="shine"></span>
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
