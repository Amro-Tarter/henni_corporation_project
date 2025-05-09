import React, { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import {
  doc,
  setDoc,
  serverTimestamp,
  collection,
  addDoc
} from "firebase/firestore";
import { auth, db } from "../config/firbaseConfig";
import "./auth.css";

const Signup = () => {
  const [form, setForm] = useState({
    email: "",
    password: "",
    username: "",
    location: "",
    element: "",
    phone: "",
  });
  const [notification, setNotification] = useState(null);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, form.email, form.password);
      const user = userCredential.user;

      const timestamp = serverTimestamp();
      const defaultPhotoURL = "https://firebasestorage.googleapis.com/v0/b/henini-prj.firebasestorage.app/o/profiles%2F123laith%2Fbackground.jpg?alt=media&token=3dce7749-b4a0-4200-8469-07507693daf3"

      // Create user document
      const userDoc = {
        email: form.email,
        username: form.username,
        element: form.element,
        created_at: timestamp,
        associated_id: "",
        phone: form.phone,
        is_active: false,
        last_login: timestamp,
        role: ""
      };

      await setDoc(doc(db, "users", user.uid), userDoc);

      // Create profile document
      const profileDoc = {
        username: form.username,
        location: form.location,
        element: form.element,
        followersCount: 0,
        followingCount: 0,
        postsCount: 0,
        photoURL: defaultPhotoURL,
        updatedAt: timestamp,
      };

      const profileRef = await addDoc(collection(db, "profiles"), profileDoc);

      // Update associated_id in users
      await setDoc(doc(db, "users", user.uid), { associated_id: profileRef.id }, { merge: true });

      // Success notification and redirect
      setNotification({ message: "נרשמת בהצלחה!", type: "success" });
     
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
          <div className="auth-form-group">
            <label htmlFor="username">שם משתמש</label>
            <input
              type="text"
              id="username"
              name="username"
              value={form.username}
              onChange={handleChange}
              required
            />
          </div>
          <div className="auth-form-group">
  <label htmlFor="phone">מספר טלפון</label>
  <input
    type="tel"
    id="phone"
    name="phone"
    value={form.phone}
    onChange={(e) => {
      const onlyNums = e.target.value.replace(/\D/g, "");
      setForm({ ...form, phone: onlyNums });
    }}
    pattern="[0-9]+"
    required
  />
</div>
          <div className="auth-form-group">
            <label htmlFor="location">מיקום</label>
            <input
              type="text"
              id="location"
              name="location"
              value={form.location}
              onChange={handleChange}
              required
            />
          </div>
          <div className="auth-form-group">
            <label htmlFor="element">אלמנט</label>
            <select
              id="element"
              name="element"
              value={form.element}
              onChange={handleChange}
              required
            >
              <option value="fire">אש</option>
              <option value="water">מים</option>
              <option value="earth">אדמה</option>
              <option value="metal">מתכת</option>
              <option value="air">אוויר</option>
            </select>
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
