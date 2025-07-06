import { createContext, useContext, useEffect, useState } from 'react';
import {
  onAuthStateChanged,
  signOut,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  sendEmailVerification,
} from 'firebase/auth';
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { auth, db } from '@/config/firbaseConfig';

const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

/* ------------------------------------------------------------------ */
/* Helpers                                                            */
/* ------------------------------------------------------------------ */

const insistOnVerified = async (user) => {
  await user.reload();

  if (user.emailVerified) return;

  // Throttle email sends to once per minute
  if (!user._lastV || Date.now() - user._lastV > 60_000) {
    await sendEmailVerification(user, {
      url: `${window.location.origin}/`, // ✅ Redirect to homepage after verify
      handleCodeInApp: true,
    });
    user._lastV = Date.now();
  }

  throw new Error('אשר את המייל לפני שממשיכים (בדוק את תיבת הדואר הנכנס).');
};

/* ------------------------------------------------------------------ */
/* Auth Actions                                                       */
/* ------------------------------------------------------------------ */

const login = async (email, password) => {
  const { user } = await signInWithEmailAndPassword(auth, email, password);
  await insistOnVerified(user);
  return user;
};

const signup = async (email, password) => {
  const { user } = await createUserWithEmailAndPassword(auth, email, password);

  await sendEmailVerification(user, {
    url: `${window.location.origin}/`, // ✅ Redirect to homepage after verify
    handleCodeInApp: true,
  });

  const userRef = doc(db, 'users', user.uid);
  await setDoc(userRef, {
    email: user.email,
    is_email_verified: false,
    createdAt: serverTimestamp(),
    // Add other fields like username, role, etc. if needed
  });

  return user;
};

const logout = () => signOut(auth);
const resetPassword = (email) => sendPasswordResetEmail(auth, email);
const resendVerification = () => {
  if (!auth.currentUser) throw new Error('לא מחובר.');
  return sendEmailVerification(auth.currentUser, {
    url: `${window.location.origin}/`, // ✅ Redirect to homepage after verify
    handleCodeInApp: true,
  });
};

/* ------------------------------------------------------------------ */
/* Provider                                                           */
/* ------------------------------------------------------------------ */

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (user) {
        await user.reload();

        const userRef = doc(db, 'users', user.uid);
        const snap = await getDoc(userRef);
        const data = snap.exists() ? snap.data() : {};

        // Update Firestore if Firebase email is verified but field is not
        if (user.emailVerified && data.is_email_verified === false) {
          try {
            await updateDoc(userRef, { is_email_verified: true });
            console.log('✅ Firestore: is_email_verified updated');
          } catch (err) {
            console.error('❌ Failed to update is_email_verified:', err);
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
