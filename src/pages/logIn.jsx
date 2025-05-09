import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import { signInWithEmailAndPassword } from "firebase/auth";
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp
} from "firebase/firestore";
import { auth, db } from "../config/firbaseConfig"; // make sure db is exported
import "./auth.css";

const Login = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [notification, setNotification] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 1. Sign in
      const { user } = await signInWithEmailAndPassword(
        auth,
        form.email,
        form.password
      );

      // 2. Firestore user doc ref
      const userRef = doc(db, "users", user.uid);
      const snap = await getDoc(userRef);

      if (!snap.exists()) {
        // 3a. If not there, create it
        await setDoc(userRef, {
          username: user.email.split("@")[0],
          email: user.email,
          role: "user",
          associated_id: "",
          created_at: serverTimestamp(),
          last_login: serverTimestamp(),
          is_active: true,
          reset_token: null
        });
      } else {
        // 3b. If it exists, just update last_login
        await updateDoc(userRef, {
          last_login: serverTimestamp()
        });
      }

      // 4. Grab the fresh ID token and stash it in a cookie
      const idToken = await user.getIdToken(/* forceRefresh */ true);
      Cookies.set("authToken", idToken, {
        expires: 7,          // 7 days
        secure: true,        // only over HTTPS
        sameSite: "strict",  // CSRF protection
        path: "/"            // available on all routes
      });

      // 5. Notify & redirect
      setNotification({ message: "התחברת בהצלחה!", type: "success" });
      setForm({ email: "", password: "" });
      setTimeout(() => navigate("/home"), 200);
    } catch (error) {
      let message = "שגיאה בהתחברות";
      if (error.code === "auth/user-not-found") {
        message = "לא נמצא משתמש עם האימייל הזה";
      } else if (error.code === "auth/wrong-password") {
        message = "סיסמה שגויה";
      }
      setNotification({ message, type: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-bg">
      <div className="auth-container">
        {notification && (
          <div className={`notification ${notification.type}`}>
            {notification.message}
          </div>
        )}
        <h2 className="auth-title">התחברות</h2>
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="auth-form-group">
            <label htmlFor="email">אימייל</label>
            <input
              type="email"
              id="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              required
            />
          </div>
          <div className="auth-form-group">
            <label htmlFor="password">סיסמה</label>
            <input
              type="password"
              id="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="auth-submit-btn"
          >
            {loading ? "טוען..." : "התחבר"}
          </button>
        </form>
        <div className="auth-links">
          <Link to="/forgotPassword">שכחת סיסמה?</Link> |{" "}
          <Link to="/signUp">אין לך חשבון? הרשמה</Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
