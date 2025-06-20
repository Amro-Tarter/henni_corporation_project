import { createContext, useContext, useEffect, useState } from 'react';
import {
  onAuthStateChanged,
  signOut,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  sendEmailVerification,          // ← NEW
} from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '@/config/firbaseConfig';

const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

/* ------------------------------------------------------------------ */
/* helpers                                                            */
/* ------------------------------------------------------------------ */

// send another email (throttled) and block the flow until verified
const insistOnVerified = async (user) => {
  if (user.emailVerified) return;

  // spam-guard: 1 min between resends
  if (!user._lastV || Date.now() - user._lastV > 60_000) {
    await sendEmailVerification(user, {
      url: `${window.location.origin}/verify-email`, // handle link here
      handleCodeInApp: true,
    });
    user._lastV = Date.now();
  }
  throw new Error('אשר את המייל לפני שממשיכים (בדוק את תיבת הדואר הנכנס).');
};

/* ------------------------------------------------------------------ */
/* auth functions                                                     */
/* ------------------------------------------------------------------ */

const login = async (email, password) => {
  const { user } = await signInWithEmailAndPassword(auth, email, password);
  await insistOnVerified(user);          // block unverified login
  return user;
};

const signup = async (email, password) => {
  const { user } = await createUserWithEmailAndPassword(auth, email, password);
  await sendEmailVerification(user, {    // send immediately
    url: `${window.location.origin}/verify-email`,
    handleCodeInApp: true,
  });
  return user;                           // caller can show “check your mail”
};

const logout        = () => signOut(auth);
const resetPassword = (email) => sendPasswordResetEmail(auth, email);

const resendVerification = () => {
  if (!auth.currentUser) throw new Error('לא מחובר.');
  return sendEmailVerification(auth.currentUser, {
    url: `${window.location.origin}/verify-email`,
    handleCodeInApp: true,
  });
};

/* ------------------------------------------------------------------ */
/* provider                                                           */
/* ------------------------------------------------------------------ */

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading,     setLoading]     = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (user) {
        await user.reload(); // pull fresh emailVerified flag
        const snap = await getDoc(doc(db, 'users', user.uid));

        setCurrentUser({
          uid:   user.uid,
          email: user.email,
          emailVerified: user.emailVerified,
          ...(snap.exists() ? snap.data() : {}),
        });
      } else {
        setCurrentUser(null);
      }
      setLoading(false);
    });
    return unsub;
  }, []);

  const value = {
    currentUser,
    login,
    signup,
    logout,
    resetPassword,
    resendVerification,
    loading,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
