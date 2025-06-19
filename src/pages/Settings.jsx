import React, { useState, useEffect } from 'react';
import { getAuth, updatePassword, reauthenticateWithCredential, EmailAuthProvider } from 'firebase/auth';
import { doc, getDoc, updateDoc, query, collection, where, getDocs } from 'firebase/firestore';
import { db } from '../config/firbaseConfig.ts';
import { ThemeProvider } from '../theme/ThemeProvider';
import { useNavigate } from 'react-router-dom';
import { toast } from '../components/ui/sonner';
import Navbar from '../components/social/Navbar.jsx';
import RightSidebar from '../components/social/Rightsidebar.jsx';
import ElementalLoader from '../theme/ElementalLoader';
import ConfirmationModal from '../components/social/ConfirmationModal';
import { Settings as SettingsIcon, User2, Lock, Power, Save, RefreshCcw, Eye, EyeOff, Info } from 'lucide-react';

const Settings = () => {
  const auth = getAuth();
  const user = auth.currentUser;
  const [element, setElement] = useState('earth');
  const [form, setForm] = useState({
    username: '',
    location: '',
    bio: '',
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
    isActive: true,
  });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showConfirmDeactivate, setShowConfirmDeactivate] = useState(false);

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      const profileDoc = await getDoc(doc(db, 'profiles', user.uid));
      if (userDoc.exists() && profileDoc.exists()) {
        const userData = userDoc.data();
        const profileData = profileDoc.data();
        setElement(userData.role && ['mentor', 'staff', 'admin'].includes(userData.role) ? 'red' : (userData.element || 'earth'));
        setForm({
          username: profileData.username || '',
          location: profileData.location || '',
          bio: profileData.bio || '',
          oldPassword: '',
          newPassword: '',
          confirmPassword: '',
          isActive: userData.is_active !== false,
        });
      }
      setLoading(false);
    };
    load();
  }, [user]);

  const handleChange = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

  const saveProfile = async () => {
    if (!form.username.trim()) {
      toast.error('שם משתמש לא יכול להיות ריק');
      return;
    }
    // Username check
    const q = query(collection(db, 'profiles'), where('username', '==', form.username));
    const snap = await getDocs(q);
    const usernameTaken = snap.docs.some(docu => docu.id !== user.uid);
    if (usernameTaken) {
      toast.error('שם המשתמש כבר בשימוש, נסה שם אחר');
      return;
    }
    await updateDoc(doc(db, 'profiles', user.uid), {
      username: form.username,
      location: form.location,
      bio: form.bio,
    });
    await updateDoc(doc(db, 'users', user.uid), {
      username: form.username,
      location: form.location,
    });
    toast.success('שינויים נשמרו בהצלחה 🎉');
  };

  const updatePass = async () => {
    if (!form.oldPassword || !form.newPassword || !form.confirmPassword) {
      toast.error('נא למלא את כל שדות הסיסמה');
      return;
    }
    if (form.newPassword !== form.confirmPassword) {
      toast.error('הסיסמאות אינן תואמות');
      return;
    }
    if (form.newPassword === form.oldPassword) {
      toast.warning('הסיסמה החדשה חייבת להיות שונה מהישנה');
      return;
    }
    // Strong password regex
    const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
    if (!strongPasswordRegex.test(form.newPassword)) {
      toast.error('הסיסמה חייבת לכלול לפחות אות קטנה, אות גדולה, מספר, תו מיוחד, ולפחות 8 תווים');
      return;
    }
    try {
      const credential = EmailAuthProvider.credential(user.email, form.oldPassword);
      await reauthenticateWithCredential(user, credential);
      await updatePassword(user, form.newPassword);
      setForm(f => ({ ...f, oldPassword: '', newPassword: '', confirmPassword: '' }));
      toast.success('🔐 הסיסמה עודכנה בהצלחה');
    } catch (err) {
      toast.error('⚠️ עדכון הסיסמה נכשל: ' + err.message);
    }
  };

  const toggleActive = async () => {
    await updateDoc(doc(db, 'users', user.uid), {
      is_active: !form.isActive,
    });
    setForm(prev => ({ ...prev, isActive: !prev.isActive }));
    toast.info(`החשבון ${form.isActive = 'הושבת'} בהצלחה`);
  };

  if (loading) {
    return (
      <ThemeProvider element={element}>
        <ElementalLoader />
      </ThemeProvider>
    );
  }

  return (
    <>
      <ThemeProvider element={element}>
        <div dir="rtl" className="min-h-screen flex flex-col bg-white">
          <Navbar element={element} />
          <div className="flex flex-1 pt-[56.8px]">
            <main
              className={`
            flex-1 pt-8 pb-20 sm:pb-4 px-2 sm:px-0
            max-w-3xl mx-auto
            transition-all duration-500 ease-in-out
          `}
            >
              <h1 className="text-3xl font-bold mb-6 flex items-center gap-2">
                <SettingsIcon className={`w-7 h-7 text-${element}`} />
                הגדרות חשבון
              </h1>

              <div className="space-y-6">

                {/* Profile Info */}
                <section className={`bg-white rounded-xl p-6 shadow-md space-y-4 border-2 border-${element}`}>
                  <h2 className="text-xl font-semibold flex items-center gap-2">
                    <User2 className={`w-5 h-5 text-${element}`} />
                    פרופיל
                  </h2>

                  {['username', 'location', 'bio'].map(field => (
                    <div key={field} className="flex flex-col gap-1">
                      <label className="text-sm text-gray-600">{{
                        username: 'שם משתמש',
                        location: 'מיקום',
                        bio: 'ביוגרפיה'
                      }[field]}</label>
                      <div className="flex gap-2 items-start">
                        {field !== 'bio' ? (
                          <>
                            <input
                              value={form[field]}
                              onChange={e => handleChange(field, e.target.value)}
                              maxLength={50}
                              className="w-full border rounded px-3 py-2 bg-gray-100 text-gray-700"
                            />
                            <div className="text-xs text-gray-400 mt-2 whitespace-nowrap">{form[field]?.length || 0} / 50</div>
                          </>
                        ) : (
                          <>
                            <textarea
                              value={form[field]}
                              onChange={e => handleChange(field, e.target.value)}
                              rows={3}
                              className="w-full border rounded px-3 py-2 bg-gray-100 text-gray-700"
                            />
                          </>
                        )}
                      </div>
                    </div>
                  ))}

                  <button
                    onClick={saveProfile}
                    className={`bg-${element} text-white py-2 px-5 rounded hover:bg-${element}-accent mt-4 self-start flex items-center gap-2`}
                  >
                    <Save className="w-5 h-5" />
                    שמור שינויים
                  </button>
                </section>

                {/* Password */}
                <section className={`bg-white rounded-xl p-6 shadow-md space-y-4 border-2 border-${element}`}>
                  <h2 className="text-xl font-semibold flex items-center gap-2">
                    <Lock className={`w-5 h-5 text-${element}`} />
                    שינוי סיסמה
                  </h2>

                  {/* Current Password */}
                  <div className="relative">
                    <input
                      type={showOldPassword ? "text" : "password"}
                      placeholder="סיסמה נוכחית"
                      className="w-full border rounded p-2"
                      value={form.oldPassword}
                      onChange={e => handleChange('oldPassword', e.target.value)}
                      autoComplete="current-password"
                    />
                    <button
                      type="button"
                      tabIndex={-1}
                      onClick={() => setShowOldPassword(v => !v)}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600"
                    >
                      {showOldPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>

                  {/* New Password */}
                  <div className="relative">
                    <label className="mb-1 text-sm font-medium text-gray-700 flex items-center gap-1">
                      סיסמה חדשה
                      <div className="group relative cursor-pointer">
                        <Info className={`w-4 h-4 text-${element} ml-1 cursor-pointer group-hover:text-${element}-accent`} />
                        <div className="absolute w-64 right-0 top-full mt-1 bg-white border border-gray-300 rounded shadow-md p-2 text-xs text-gray-800 opacity-0 group-hover:opacity-100 transition-opacity z-20 pointer-events-none text-right rtl">
                          הסיסמה חייבת לכלול:
                          <ul className="list-disc list-inside mt-1">
                            <li>אות קטנה</li>
                            <li>אות גדולה</li>
                            <li>מספר</li>
                            <li>תו מיוחד</li>
                            <li>לפחות 8 תווים</li>
                          </ul>
                        </div>
                      </div>
                    </label>
                    <input
                      type={showNewPassword ? "text" : "password"}
                      placeholder="סיסמה חדשה"
                      className="w-full border rounded p-2"
                      value={form.newPassword}
                      onChange={e => handleChange('newPassword', e.target.value)}
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      tabIndex={-1}
                      onClick={() => setShowNewPassword(v => !v)}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600 pt-6"
                    >
                      {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>

                  {/* Confirm Password */}
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="אימות סיסמה חדשה"
                      className="w-full border rounded p-2"
                      value={form.confirmPassword}
                      onChange={e => handleChange('confirmPassword', e.target.value)}
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      tabIndex={-1}
                      onClick={() => setShowConfirmPassword(v => !v)}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600"
                    >
                      {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>

                  <button
                    onClick={updatePass}
                    className={`bg-${element} text-white py-2 px-5 rounded hover:bg-${element}-accent flex items-center gap-2`}
                  >
                    <RefreshCcw className="w-5 h-5" />
                    עדכן סיסמה
                  </button>
                </section>


                {/* Deactivate Account */}
                {form.isActive && (
                  <section className={`bg-white rounded-xl p-6 shadow-md space-y-4 border-2 border-${element}`}>
                    <h2 className="text-xl font-semibold flex items-center gap-2">
                      <Power className={`w-5 h-5 text-${element}`} />
                      ניהול חשבון
                    </h2>
                    <p className="text-sm text-gray-600">
                      החשבון שלך פעיל. השבתת החשבון תמנע ממך להשתמש במערכת.
                    </p>
                    <button
                      onClick={() => setShowConfirmDeactivate(true)}
                      className={`py-2 px-4 rounded border flex items-center gap-2 border-red-500 text-red-500 hover:bg-red-100`}
                    >
                      <Power className="w-5 h-5" />
                      השבת חשבון
                    </button>
                  </section>
                )}

              </div>
            </main>
            <RightSidebar element={element} />
          </div>
        </div>
      </ThemeProvider>
      <ConfirmationModal
        open={showConfirmDeactivate}
        title="השבתת חשבון"
        message="האם אתה בטוח שברצונך להשבית את חשבונך? לא תוכל להשתמש בו לאחר מכן."
        confirmText="השבת"
        cancelText="ביטול"
        onConfirm={() => {
          toggleActive();
          setShowConfirmDeactivate(false);
        }}
        onCancel={() => setShowConfirmDeactivate(false)}
        element={element}
      />
    </>
  );

};

export default Settings;
