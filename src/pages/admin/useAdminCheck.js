import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { auth,db } from "../../config/firbaseConfig";

export const useAdminCheck = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkRole = async () => {
      const user = auth.currentUser;
      if (!user) return setLoading(false);

      const docRef = doc(db, "users", user.uid);
      const snap = await getDoc(docRef);
      if (snap.exists() && snap.data().role === "admin") {
        setIsAdmin(true);
      }
      setLoading(false);
    };

    checkRole();
  }, []);

  return { isAdmin, loading };
};
