import React, { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../config/firbaseConfig"; // adjust the path as needed
import "./auth.css";

const Signup = () => {
  const [form, setForm] = useState({ email: "", password: "" });
  const [notification, setNotification] = useState(null);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createUserWithEmailAndPassword(auth, form.email, form.password);
      setNotification({ message: "נרשמת בהצלחה!", type: "success" });
      setForm({ email: "", password: "" });
    } catch (error) {
      let message = "שגיאה בהרשמה";
      if (error.code === "auth/email-already-in-use") {
        message = "אימייל זה כבר נמצא בשימוש";
      } else if (error.code === "auth/weak-password") {
        message = "הסיסמה צריכה להכיל לפחות 6 תווים";
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
        <h2 className="auth-title">הרשמה</h2>
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
          <button type="submit">הרשם</button>
        </form>
        <div className="auth-links">
          <a href="/">כבר יש לך חשבון? התחברות</a>
        </div>
      </div>
    </div>
  );
};

export default Signup;
