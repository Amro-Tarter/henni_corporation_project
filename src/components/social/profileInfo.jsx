//ProfileInfo.jsx
import React, { useState } from 'react';
import { MapPin, Pencil, Camera, MessageSquare, Users, Image } from 'lucide-react';
import { motion } from 'framer-motion';
import { useToast } from '/src/hooks/use-toast.jsx';
import { containsBadWord } from './utils/containsBadWord';

const elementOptions = [
  { value: 'fire', label: 'אש', icon: '🔥' },
  { value: 'water', label: 'מים', icon: '💧' },
  { value: 'air', label: 'אוויר', icon: '💨' },
  { value: 'earth', label: 'אדמה', icon: '🌱' },
  { value: 'metal', label: 'מתכת', icon: '⚙️' },
];

const findOption = v => elementOptions.find(o => o.value === v) || { icon: '', label: '' };

const Stat = ({ icon, count, label, element }) => (
  <div className="flex flex-col items-center hover:scale-105 transition-transform">
    {icon && <div className={`text-${element} mb-1`}>{icon}</div>}
    <div className={`text-2xl sm:text-3xl font-bold text-${element}`}>{count}</div>
    <div className={`text-sm text-${element}-accent`}>{label}</div>
  </div>
);

const Tooltip = ({ text, children }) => (
  <div className="group relative inline-flex">
    {children}
    <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-1 px-2 py-1 bg-gray-800 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-20 pointer-events-none">
      {text}
    </div>
  </div>
);

const ProfileInfo = ({
  profilePic,
  backgroundPic,
  username,
  location,
  bio,
  element,
  role,
  postsCount,
  followersCount,
  followingCount,
  onUpdateField,
  onUpdateProfilePic,
  onUpdateBackgroundPic,
  isOwner,
  isFollowing,
  uid,
  onFollowToggle
}) => {
  const [editing, setEditing] = useState(null);
  const [tempValue, setTempValue] = useState('');
  const [warning, setWarning] = useState('');
  const { toast } = useToast();

  const startEditing = (field, value) => {
    setEditing(field);
    setTempValue(value);
  };

  const saveEditing = () => {
    if (containsBadWord(tempValue)) {
      setWarning('השדה מכיל מילים לא ראויות!');
      setTimeout(() => setWarning(''), 3500);
      return;
    }
    onUpdateField(editing, tempValue);
    toast({
      title: 'הצלחה',
      description: 'השינויים נשמרו בהצלחה 🎉',
    });
    setEditing(null);
  };

  const cancelEditing = () => setEditing(null);

  const handlePicChange = e => {
    const file = e.target.files[0];
    if (file) onUpdateProfilePic(file);
  };
  const handleBackgroundChange = e => {
    const file = e.target.files[0];
    if (file) onUpdateBackgroundPic(file);
  };

  return (
    <>
    {warning && (
      <div
        style={{
          position: 'fixed',
          top: '28px',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 9999,
          minWidth: 300,
          maxWidth: 400,
          background: '#fee2e2',
          color: '#b91c1c',
          border: '1px solid #ef4444',
          borderRadius: 8,
          padding: '14px 22px',
          fontWeight: 500,
          textAlign: 'center',
          boxShadow: '0 2px 16px rgba(0,0,0,0.13)',
          fontSize: '1rem',
          pointerEvents: 'none'
        }}
      >
        {warning}
      </div>
    )}
    <section className="w-full overflow-visible">
      <div className={`relative w-full h-48 sm:h-64 bg-${element}-soft overflow-visible`}>
        {backgroundPic && (
          <img src={backgroundPic} alt="Cover background" className="object-cover w-full h-full rounded-lg" />
        )}
        {isOwner && (
          <label className={`
            absolute bottom-3 left-3 flex items-center justify-center p-2
            bg-${element}-accent opacity-80 hover:opacity-70
            rounded-full cursor-pointer group
          `}>
            <Image className="text-white w-5 h-5" />
            <span className={`
              absolute left-full ml-2
              bg-${element}-accent bg-opacity-75 text-white text-xs rounded px-2 py-1
              opacity-0 group-hover:opacity-100 whitespace-nowrap
            `}>
              שינוי תמונת רקע
            </span>
            <input type="file" accept="image/*" className="hidden" onChange={handleBackgroundChange} />
          </label>
        )}

        <div className="absolute -bottom-16 right-24 z-10">
          <div className={`relative w-40 h-40 border-4 border-${element} rounded-full overflow-hidden shadow-lg bg-${element}-soft hover:scale-105 transition-transform duration-300 group`}>
            <img src={profilePic} alt={`${username} avatar`} className="object-cover w-full h-full rounded-full" />
            {isOwner && (
              <label className={`
                absolute inset-0 flex items-center justify-center
                bg-black bg-opacity-0 hover:bg-opacity-40 transition-opacity cursor-pointer rounded-full
              `}>
                <Camera className="text-white w-6 h-6 opacity-0 group-hover:opacity-100 scale-95 group-hover:scale-110 transition-all duration-200 " />
                <input type="file" accept="image/*" className="hidden" onChange={handlePicChange} />
              </label>
            )}
            <div className={`absolute -bottom-2 -left-2 bg-${element}-soft rounded-full p-1 shadow-md`}>
              <span className="text-xl" title={findOption(element).label}>{findOption(element).icon}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="px-20 pt-14 mt-6 overflow-visible text-right">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
          {editing === 'username' ? (
            <div className="flex justify-end items-center gap-3">
              <input type="text" value={tempValue} onChange={e => setTempValue(e.target.value)} className={`border-b-2 border-${element}-soft focus:border-${element}-accent focus:outline-none text-3xl sm:text-4xl font-bold text-${element}`} dir="rtl" />
              <div className="flex gap-2">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  onClick={saveEditing}
                  className={`px-3 py-1 bg-${element} text-white rounded-full text-sm`}
                >
                  שמור
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  onClick={cancelEditing}
                  className={`px-3 py-1 bg-${element}-soft text-${element}-accent rounded-full text-sm`}
                >
                  ביטול
                </motion.button>
              </div>
            </div>
          ) : (
            <div className={`flex items-center gap-3 text-${element}`}>
              <h1 className="text-3xl sm:text-4xl font-bold mb-3">{username}</h1>
              {role === 'mentor' && (
                <span
                  style={{ alignSelf: 'center' }}
                  className="ml-2 px-2 py-0.5 border border-blue-400 text-blue-700 text-xs rounded-full bg-blue-50 font-semibold flex items-center gap-1"
                  title="מנחה"
                >
                  <svg className="w-3 h-3 text-blue-400" fill="currentColor" viewBox="0 0 20 20"><path d="M10 1.5l2.47 5.26 5.81.5c.46.04.64.6.31.93l-4.38 3.94 1.35 5.72c.1.43-.37.77-.76.54L10 15.18l-4.8 2.15c-.39.17-.86-.12-.76-.54l1.35-5.72-4.38-3.94c-.33-.33-.15-.89.31-.93l5.81-.5L10 1.5z"/></svg>
                  מנחה
                </span>
              )}
              {isOwner && (
                <Tooltip text="ערוך שם משתמש">
                  <Pencil
                    onClick={() => startEditing('username', username)}
                    className="text-gray-400 hover:text-gray-600 cursor-pointer w-5 h-5 transition-colors"
                  />
                </Tooltip>
              )}
            </div>
          )}

          {/* Element Display (READ ONLY) */}
          <Tooltip text={isOwner ? "האלמנט שלך" : "האלמנט של המשתמש הזה"}>
            <div
              className={`relative inline-flex items-center gap-3 px-5 py-3 rounded-full bg-${element}-soft text-${element}
                shadow-md ring-1 ring-${element}-accent`}
              style={{ pointerEvents: "none", userSelect: "none" }}
            >
              <span className="text-2xl">{findOption(element).icon}</span>
              <span className="text-lg font-medium">{findOption(element).label}</span>
            </div>
          </Tooltip>         
        </div>

        <div className={`mt-6 flex items-center gap-2 text-base text-${element}`}>
          <MapPin className="w-5 h-5 ml-1" />
          {editing === 'location' ? (
            <>
              <input type="text" value={tempValue} onChange={e => setTempValue(e.target.value)} className={`flex-1 border-b-2 border-${element}-soft focus:border-${element}-accent focus:outline-none text-base text-${element}`} dir="rtl" />
              <div className="flex gap-2">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  onClick={saveEditing}
                  className={`px-3 py-1 bg-${element} text-white rounded-full text-sm`}
                >
                  שמור
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  onClick={cancelEditing}
                  className={`px-3 py-1 bg-${element}-soft text-${element}-accent rounded-full text-sm`}
                >
                  ביטול
                </motion.button>
              </div>
            </>
          ) : (
            <>
              <span>{location}</span>
              {isOwner && (
                <Tooltip text="ערוך מיקום">
                  <div className="ml-2 cursor-pointer" onClick={() => startEditing('location', location)}>
                    <Pencil className="text-gray-400 hover:text-gray-600 w-4 h-4 transition-colors" />
                  </div>
                </Tooltip>
              )}
            </>
          )}
        </div>

        <div className={`mt-4 flex items-start justify-between text-base leading-relaxed text-${element}`}>
          {editing === 'bio' ? (
            <div className="flex flex-col gap-2 w-full">
              <textarea value={tempValue} onChange={e => setTempValue(e.target.value)} rows={3} className={`w-full border border-${element}-soft focus:border-${element}-accent focus:ring-2 focus:ring-${element}-accent rounded-lg p-3 resize-none text-base`} dir="rtl" />
              <div className="flex justify-end gap-2">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  onClick={saveEditing}
                  className={`px-3 py-1 bg-${element} text-white rounded-full text-sm`}
                >
                  שמור
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  onClick={cancelEditing}
                  className={`px-3 py-1 bg-${element}-soft text-${element}-accent rounded-full text-sm`}
                >
                  ביטול
                </motion.button>
              </div>
            </div>
          ) : (
            <>
              {bio ? (
                <p className={`text-${element}`}>{bio}</p>
              ) : isOwner ? (
                <p className="text-gray-400 italic">הוסף תיאור קצר על עצמך...</p>
              ) : null}
              {isOwner && (
                <Tooltip text="ערוך ביוגרפיה">
                  <div className="ml-2">
                    <Pencil
                      onClick={() => startEditing('bio', bio)}
                      className="text-gray-400 hover:text-gray-600 w-4 h-4 cursor-pointer transition-colors"
                    />
                  </div>
                </Tooltip>
              )}
            </>
          )}
        </div>

        {!isOwner && (
          <div className="flex justify-center mt-6">
            <button
              onClick={() => onFollowToggle(uid)}
              className={`
                px-20 py-3 rounded-full text-sm font-medium shadow-md transition-transform hover:scale-105
                ${isFollowing
                  ? 'bg-red-100 text-red-600 hover:bg-red-200'
                  : `bg-${element} text-white hover:bg-${element}-accent`}
              `}
            >
              {isFollowing ? 'בטל מעקב' : 'עקוב'}
            </button>
          </div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className={`mt-8 grid grid-cols-3 gap-x-40 gap-y-4 sm:flex sm:justify-center bg-${element}-soft rounded-xl p-5 shadow-md hover:shadow-lg transition-shadow duration-300`}
        >
          <Stat element={element} icon={<MessageSquare className="w-5 h-5" />} count={postsCount} label="פוסטים" />
          <Stat element={element} icon={<Users className="w-5 h-5" />} count={followersCount} label="עוקבים" />
          <Stat element={element} icon={<Users className="w-5 h-5" />} count={followingCount} label="עוקב אחרי" />
        </motion.div>
      </div>
    </section>
    </>
  );
};

export default ProfileInfo;
