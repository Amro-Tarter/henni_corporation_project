import React, { useEffect, useState } from 'react';
import { auth, db } from '@/config/firbaseConfig';
import { onAuthStateChanged } from 'firebase/auth';
import {
  doc,
  getDoc,
  updateDoc,
  serverTimestamp,
  collection,
  query,
  where,
  getDocs
} from 'firebase/firestore';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Save, User, Mail, Phone, Shield, Key, AlertTriangle } from 'lucide-react';
import Layout from '../components/layout/Layout';

const ELEMENTS = [
  { key: 'earth', emoji: '🌱', title: 'קורסי אדמה', description: 'פעילויות המקדמות יציבות, חיבור לאדמה ולעבודה עם חומרים טבעיים.', color: 'from-green-600 to-emerald-500', textColor: 'text-green-700', borderColor: 'border-green-400', hoverColor: 'hover:bg-green-600', bgColor: 'bg-green-500' },
  { key: 'metal', emoji: '⚒', title: 'קורסי מתכת', description: 'עיסוק בטכניקות מדויקות, פיתוח מיומנויות ועבודת ידיים.', color: 'from-gray-600 to-slate-500', textColor: 'text-gray-700', borderColor: 'border-gray-400', hoverColor: 'hover:bg-gray-600', bgColor: 'bg-gray-500' },
  { key: 'air', emoji: '💨', title: 'קורסי אוויר', description: 'תכנים המעודדים חשיבה יצירתית, מדיטציה ותודעה.', color: 'from-blue-500 to-cyan-400', textColor: 'text-blue-700', borderColor: 'border-blue-400', hoverColor: 'hover:bg-blue-500', bgColor: 'bg-blue-400' },
  { key: 'water', emoji: '💧', title: 'קורסי מים', description: 'תכנים העוסקים ברגש, ביטוי אישי וזרימה פנימית.', color: 'from-indigo-500 to-purple-400', textColor: 'text-indigo-700', borderColor: 'border-indigo-400', hoverColor: 'hover:bg-indigo-500', bgColor: 'bg-indigo-400' },
  { key: 'fire', emoji: '🔥', title: 'קורסי אש', description: 'פעילויות עם אנרגיה גבוהה, יצירה נלהבת ומוטיבציה.', color: 'from-red-600 to-orange-500', textColor: 'text-red-700', borderColor: 'border-red-400', hoverColor: 'hover:bg-red-600', bgColor: 'bg-red-500' },
];

const ElementChip = ({ element }) => {
  const elementData = ELEMENTS.find(e => e.key === element);
  if (!elementData) return null;
  
  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium text-white bg-gradient-to-r ${elementData.color} mr-2 mb-2`}>
      <span className="mr-1">{elementData.emoji}</span>
      {element}
    </span>
  );
};

const PublicSettings = () => {
  const [userData, setUserData] = useState(null);
  const [originalData, setOriginalData] = useState(null);
  const [uid, setUid] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('general');
  const [validationErrors, setValidationErrors] = useState({});

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const ref = doc(db, 'users', user.uid);
        const snap = await getDoc(ref);
        if (snap.exists()) {
          const data = snap.data();
          // Ensure element is always an array
          if (data.element && !Array.isArray(data.element)) {
            data.element = [data.element];
          } else if (!data.element) {
            data.element = [];
          }
          
          setUserData(data);
          setOriginalData(data);
          setUid(user.uid);
          setIsAdmin(data.role === 'admin');
        }
        setLoading(false);
      }
    });
    return () => unsub();
  }, []);

  const handleChange = (field, value) => {
    setUserData(prev => ({ ...prev, [field]: value }));
    
    // Clear validation error when field is edited
    if (validationErrors[field]) {
      setValidationErrors(prev => ({...prev, [field]: null}));
    }
  };

  const validateEmail = email =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const validatePhone = phone =>
    /^[0-9]{9,15}$/.test(phone.replace(/\D/g, ''));

  const validateForm = () => {
    const errors = {};
    
    if (!validateEmail(userData.email)) {
      errors.email = "כתובת אימייל לא תקינה";
    }

    if (userData.phone_number && !validatePhone(userData.phone_number)) {
      errors.phone = "מספר טלפון לא תקין";
    }
    
    if (!userData.username || userData.username.trim() === '') {
      errors.username = "שם משתמש הוא שדה חובה";
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      Object.values(validationErrors).forEach(error => {
        if (error) toast.error(error);
      });
      return;
    }

    try {
      // Unique username check
      if (userData.username && userData.username !== originalData?.username) {
        const q = await getDocs(
          query(collection(db, "users"), where("username", "==", userData.username))
        );
        const nameTaken = q.docs.some(doc => doc.id !== uid);
        if (nameTaken) {
          toast.error("שם המשתמש הזה כבר קיים");
          setValidationErrors(prev => ({...prev, username: "שם המשתמש הזה כבר קיים"}));
          return;
        }
      }

      const ref = doc(db, 'users', uid);
      const elements = ensureElementIsArray(userData.element);
      
      // Create updatedData with only defined values to avoid Firebase errors
      const updatedData = {
        email: userData.email || '',
        username: userData.username || '',
        element: elements,
        updated_at: serverTimestamp()
      };
      
      // Only add phone_number if it exists and is not undefined
      if (userData.phone_number !== undefined) {
        updatedData.phone_number = userData.phone_number || '';
      }
      
      if (isAdmin) {
        // Only add admin fields if they exist and are not undefined
        if (userData.reset_token !== undefined) {
          updatedData.reset_token = userData.reset_token || '';
        }
        if (userData.role !== undefined) {
          updatedData.role = userData.role || 'user';
        }
      }

      await updateDoc(ref, updatedData);
      setOriginalData({ ...userData, element: elements }); // update local baseline
      toast.success("הפרטים עודכנו בהצלחה");
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("שגיאה בעדכון הפרטים");
    }
  };

  const getMainElementColor = () => {
    const elements = ensureElementIsArray(userData?.element);
    if (elements.length === 0) {
      return 'bg-gradient-to-r from-orange-500 to-red-500'; // Default
    }
    const primaryElement = elements[0];
    const elementData = ELEMENTS.find(e => e.key === primaryElement);
    return elementData ? `bg-gradient-to-r ${elementData.color}` : 'bg-gradient-to-r from-orange-500 to-red-500';
  };

  const ensureElementIsArray = (element) => {
    if (!element) return [];
    return Array.isArray(element) ? element : [element];
  };

  const getPrimaryElementTextColor = () => {
    const elements = ensureElementIsArray(userData?.element);
    if (elements.length === 0) {
      return 'text-red-700'; // Default
    }
    const primaryElement = elements[0];
    const elementData = ELEMENTS.find(e => e.key === primaryElement);
    return elementData ? elementData.textColor : 'text-red-700';
  };

  const getPrimaryElementBorder = () => {
    const elements = ensureElementIsArray(userData?.element);
    if (elements.length === 0) {
      return 'border-red-400'; // Default
    }
    const primaryElement = elements[0];
    const elementData = ELEMENTS.find(e => e.key === primaryElement);
    return elementData ? elementData.borderColor : 'border-red-400';
  };
  
  const getSaveButtonColor = () => {
    if (isUnchanged) {
      return 'bg-gray-400 cursor-not-allowed text-white';
    }
    
    const elements = ensureElementIsArray(userData?.element);
    if (elements.length === 0) {
      return 'bg-orange-500 hover:bg-orange-600 text-white';
    }
    
    const primaryElement = elements[0];
    const elementData = ELEMENTS.find(e => e.key === primaryElement);
    return elementData ? `${elementData.bgColor} ${elementData.hoverColor} text-white` : 'bg-orange-500 hover:bg-orange-600 text-white';
  };

  const isUnchanged = JSON.stringify(userData) === JSON.stringify(originalData);

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-orange-500"></div>
        </div>
      </Layout>
    );
  }
  
  if (!userData) {
    return (
      <Layout>
        <div className="p-6 text-center">
          <div className="bg-red-100 border border-red-400 rounded-lg p-4 mb-4">
            <AlertTriangle className="h-6 w-6 text-red-500 mx-auto mb-2" />
            <p className="text-red-700">לא נמצא משתמש</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div dir="rtl" className="p-6 pt-20 max-w-3xl mx-auto">
        <ToastContainer position="top-right" rtl autoClose={3000} />
        
        {/* Header with user's element colors */}
        <div className={`rounded-xl p-6 text-white shadow-lg mb-6 ${getMainElementColor()}`}>
          <h2 className="text-3xl font-bold mb-1">הגדרות המשתמש</h2>
          <p className="opacity-90">עדכון פרטים אישיים והעדפות</p>
          {userData.element && ensureElementIsArray(userData.element).length > 0 && (
            <div className="mt-3">
              <ElementChip element={ensureElementIsArray(userData.element)[0]} />
            </div>
          )}
        </div>

        {/* Tabs */}
        <div className="flex mb-6 border-b">
          <button 
            className={`px-4 py-2 font-medium ${activeTab === 'general' ? `${getPrimaryElementTextColor()} border-b-2 ${getPrimaryElementBorder()}` : 'text-gray-500'}`}
            onClick={() => setActiveTab('general')}>
            פרטים אישיים
          </button>
          <button 
            className={`px-4 py-2 font-medium ${activeTab === 'elements' ? `${getPrimaryElementTextColor()} border-b-2 ${getPrimaryElementBorder()}` : 'text-gray-500'}`}
            onClick={() => setActiveTab('elements')}>
            אלמנט
          </button>
          {isAdmin && (
            <button 
              className={`px-4 py-2 font-medium ${activeTab === 'admin' ? 'text-red-700 border-b-2 border-red-400' : 'text-gray-500'}`}
              onClick={() => setActiveTab('admin')}>
              הגדרות מנהל
            </button>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-md p-6 space-y-6">
          {/* General Tab */}
          {activeTab === 'general' && (
            <>
              <div className="space-y-2">
                <label className="block font-semibold flex items-center">
                  <User className="h-5 w-5 ml-1" />
                  שם משתמש
                </label>
                <input
                  type="text"
                  value={userData.username || ''}
                  onChange={e => handleChange('username', e.target.value)}
                  className={`w-full p-3 border rounded-md text-right ${validationErrors.username ? 'border-red-500' : getPrimaryElementBorder()}`}
                />
                {validationErrors.username && (
                  <p className="text-red-500 text-sm mt-1">{validationErrors.username}</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="block font-semibold flex items-center">
                  <Mail className="h-5 w-5 ml-1" />
                  אימייל
                </label>
                <input
                  type="email"
                  value={userData.email || ''}
                  onChange={e => handleChange('email', e.target.value)}
                  className={`w-full p-3 border rounded-md text-right ${validationErrors.email ? 'border-red-500' : getPrimaryElementBorder()}`}
                />
                {validationErrors.email && (
                  <p className="text-red-500 text-sm mt-1">{validationErrors.email}</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="block font-semibold flex items-center">
                  <Phone className="h-5 w-5 ml-1" />
                  מספר טלפון
                </label>
                <input
                  type="tel"
                  value={userData.phone_number || ''}
                  onChange={e => handleChange('phone_number', e.target.value)}
                  className={`w-full p-3 border rounded-md text-right ${validationErrors.phone ? 'border-red-500' : getPrimaryElementBorder()}`}
                />
                {validationErrors.phone && (
                  <p className="text-red-500 text-sm mt-1">{validationErrors.phone}</p>
                )}
              </div>
            </>
          )}

          {/* Elements Tab */}
          {activeTab === 'elements' && (
            <div className="space-y-4">
              <p className="text-gray-600 mb-4">בחר אלמנט אחד שמתאים לך. האלמנט הנבחר יקבע את צבעי הממשק.</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {ELEMENTS.map(element => (
                  <div 
                    key={element.key}
                    className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                      ensureElementIsArray(userData.element)[0] === element.key 
                        ? `border-2 bg-gradient-to-r ${element.color} text-white shadow-md` 
                        : `border-gray-200 hover:border-gray-300 bg-white`
                    }`}
                    onClick={() => handleChange('element', [element.key])}
                  >
                    <div className="flex items-center">
                      <div className="text-2xl ml-3">{element.emoji}</div>
                      <div>
                        <h3 className="font-bold">{element.title.replace('קורסי ', '')}</h3>
                        <p className={`text-sm ${ensureElementIsArray(userData.element)[0] === element.key ? 'text-white/80' : 'text-gray-600'}`}>
                          {element.description}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-yellow-800 text-sm">
                  <span className="font-bold">טיפ:</span> האלמנט שתבחר יקבע את צבעי הממשק האישי שלך.
                </p>
              </div>

              {userData.element && ensureElementIsArray(userData.element).length > 0 && (
                <div className="mt-4">
                  <h4 className="font-medium mb-2">האלמנט שלך:</h4>
                  <div className="flex">
                    <ElementChip element={ensureElementIsArray(userData.element)[0]} />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Admin Tab */}
          {activeTab === 'admin' && isAdmin && (
            <>
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg mb-6">
                <p className="text-red-800 flex items-center">
                  <Shield className="h-5 w-5 ml-2" />
                  <span className="font-bold">אזור מנהלים בלבד</span> - שינויים כאן ישפיעו על פונקציונליות המערכת
                </p>
              </div>
            
              <div className="space-y-2">
                <label className="block font-semibold flex items-center text-red-800">
                  <Key className="h-5 w-5 ml-1" />
                  Reset Token (admin only)
                </label>
                <input
                  type="text"
                  value={userData.reset_token || ''}
                  onChange={e => handleChange('reset_token', e.target.value)}
                  className="w-full p-3 border border-red-300 rounded-md text-right"
                />
              </div>

              <div className="space-y-2">
                <label className="block font-semibold flex items-center text-red-800">
                  <Shield className="h-5 w-5 ml-1" />
                  Role (admin only)
                </label>
                <select
                  value={userData.role || 'user'}
                  onChange={e => handleChange('role', e.target.value)}
                  className="w-full p-3 border border-red-300 rounded-md text-right"
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                  <option value="moderator">Moderator</option>
                </select>
              </div>
            </>
          )}

          <button
            onClick={handleSave}
            disabled={isUnchanged}
            className={`px-6 py-3 rounded-lg transition font-medium flex items-center justify-center w-full mt-8 ${getSaveButtonColor()}`}
          >
            <Save className="ml-2 h-5 w-5" />
            שמור שינויים
          </button>
        </div>
      </div>
    </Layout>
  );
};

export default PublicSettings;