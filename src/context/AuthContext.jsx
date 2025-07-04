import { createContext, useContext, useEffect, useState } from 'react';
import {
  onAuthStateChanged,
  signOut,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  sendEmailVerification,
} from 'firebase/auth';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
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
  await insistOnVerified(user); // block unverified login
  return user;
};

const signup = async (email, password) => {
  const { user } = await createUserWithEmailAndPassword(auth, email, password);
  await sendEmailVerification(user, {
    url: `${window.location.origin}/verify-email`,
    handleCodeInApp: true,
  });
  return user;
};

const logout = () => signOut(auth);
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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (user) {
        await user.reload(); // pull fresh emailVerified flag

        const userRef = doc(db, 'users', user.uid);
        const snap = await getDoc(userRef);
        const data = snap.exists() ? snap.data() : {};

        // If email is now verified but Firestore field is still false → update it
        if (user.emailVerified && data.is_email_verified === false) {
          try {
            await updateDoc(userRef, { is_email_verified: true });
            console.log('Firestore: is_email_verified updated to true');
          } catch (err) {
            console.error('Failed to update is_email_verified in Firestore:', err);
          }
        }

        setCurrentUser({
          uid: user.uid,
          email: user.email,
          emailVerified: user.emailVerified,
          ...data,
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
