import React, { useState } from "react";
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
  const [form, setForm] = useState({ email: "", password: "" });
  const [notification, setNotification] = useState(null);

  const handleChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
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
          username: user.email.split("@")[0],    // or "" if you don’t want to infer
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

      // 4. Notify & redirect
      setNotification({ message: "התחברת בהצלחה!", type: "success" });
      setForm({ email: "", password: "" });
      setTimeout(() => (window.location.href = "/home"), 200);
    } catch (error) {
      let message = "שגיאה בהתחברות";
      if (error.code === "auth/user-not-found") {
        message = "לא נמצא משתמש עם האימייל הזה";
      } else if (error.code === "auth/wrong-password") {
        message = "סיסמה שגויה";
      }
      setNotification({ message, type: "error" });
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
          <button type="submit">התחבר</button>
        </form>
        <div className="auth-links">
          <a href="/forgotPassword">שכחת סיסמה?</a> |{" "}
          <a href="/signUp">אין לך חשבון? הרשמה</a>
        </div>
      </div>
    </div>
  );
};

export default Login;
