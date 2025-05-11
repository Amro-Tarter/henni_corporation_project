import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../config/firbaseConfig";

const ProtectedRoute = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const unsubscribe = onAuthStateChanged(auth, async (user) => {
        if (user) {
          const userRef = doc(db, "users", user.uid);
          const userSnap = await getDoc(userRef);
          if (userSnap.exists() && userSnap.data().is_active) {
            setAllowed(true);
          }
        }
        setLoading(false);
      });

      return () => unsubscribe();
    };

    checkAuth();
  }, []);

  if (loading) return null; // Or a spinner

  return allowed ? children : <Navigate to="/logIn" />;
};

export default ProtectedRoute;
