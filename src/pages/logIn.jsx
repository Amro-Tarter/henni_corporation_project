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
      const userCredential = await signInWithEmailAndPassword(
        auth,
        form.email,
        user,
        form.password
      );
      const user = userCredential.user;

      // Check is_active field in Firestore
      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        throw new Error("user-not-found");
      }

      const userData = userSnap.data();

      if (!userData.is_active) {
        setNotification({
          message: "המשתמש שלך אינו פעיל. פנה למנהל המערכת.",
          type: "error",
        });
        return;
      }

      // Update last_login timestamp
      await updateDoc(userRef, {
        last_login: serverTimestamp(),
      });

      setNotification({ message: "התחברת בהצלחה!", type: "success" });
      setTimeout(() => {
        window.location.href = "/home";
      }, 500);
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
          <a href="/forgotPassword">שכחת סיסמה?</a> |{" "}
          <a href="/signUp">אין לך חשבון? הרשמה</a>
        </div>
      </div>
    </div>
  );
};

export default Login;
