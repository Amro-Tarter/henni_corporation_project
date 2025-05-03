import React, { useState } from "react";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../config/firbaseConfig"; // adjust the path as needed
import "./auth.css";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [notification, setNotification] = useState(null);

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

  return (
    <div className="auth-bg">
      <div className="auth-container">
        {notification && (
          <div className={`notification ${notification.type}`}>
            {notification.message}
          </div>
        )}
        <h2 className="auth-title">איפוס סיסמה</h2>
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="auth-form-group">
            <label htmlFor="email">אימייל</label>
            <input
              type="email"
              id="email"
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <button type="submit">שלח קישור</button>
        </form>
        <div className="auth-links">
          <a href="/logIn">חזרה להתחברות</a>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
