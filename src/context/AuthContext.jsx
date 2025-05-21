import { createContext, useContext, useEffect, useState } from 'react';
import { 
  onAuthStateChanged, 
  signOut, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  sendPasswordResetEmail 
} from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '@/config/firbaseConfig'; 

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

// Authentication functions
const login = (email, password) => {
  return signInWithEmailAndPassword(auth, email, password);
};

const signup = (email, password) => {
  return createUserWithEmailAndPassword(auth, email, password);
};

const logout = () => {
  return signOut(auth);
};

const resetPassword = (email) => {
  return sendPasswordResetEmail(auth, email);
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // Get user data from Firestore
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          setCurrentUser({
            uid: user.uid,
            email: user.email,
            ...userDoc.data()
          });
        } else {
          // If no Firestore data exists, just use the auth user data
          setCurrentUser(user);
        }
      } else {
        setCurrentUser(null);
      }
      setLoading(false);
    });
    
    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    login,
    signup,
    logout,
    resetPassword,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};