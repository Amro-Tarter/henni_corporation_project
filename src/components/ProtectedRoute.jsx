import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../config/firbaseConfig";

const ProtectedRoute = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const userRef = doc(db, "users", user.uid);
          const userSnap = await getDoc(userRef);
          if (userSnap.exists() && userSnap.data().is_active === true && userSnap.data().is_email_verified== true) {
            setAllowed(true);
          } else {
            setAllowed(false);
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
          setAllowed(false);
        }
      } else {
        setAllowed(false);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) return null; // You can use a spinner here

  return allowed ? children : <Navigate to="/logIn" />;
};

export default ProtectedRoute;
