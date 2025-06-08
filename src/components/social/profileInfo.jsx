//ProfileInfo.jsx
import React, { useState } from 'react';
import { MapPin, Camera, MessageSquare, Users, Image, Info } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from '../ui/sonner';
import AirIcon from '@mui/icons-material/Air';

const elementOptions = [
  { value: 'fire', label: 'אש', icon: '🔥' },
  { value: 'water', label: 'מים', icon: '💧' },
  { value: 'air', label: 'אוויר', icon: <AirIcon style={{ color: '#87ceeb' }} /> },
  { value: 'earth', label: 'אדמה', icon: '🌱' },
  { value: 'metal', label: 'מתכת', icon: '⚒️' },
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
  onUpdateProfilePic,
  onUpdateBackgroundPic,
  postsCount,
  followersCount,
  followingCount,
  isOwner,
  isFollowing,
  uid,
  onFollowToggle
}) => {

  const followersLabel = isOwner
    ? "העוקבים שלי"
    : `העוקבים של ${username}`;

  const followingLabel = isOwner
    ? "אני עוקב אחרי"
    : `העוקב אחרי ${username}`;


  const handlePicChange = async e => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      await onUpdateProfilePic(file);
      toast.success('תמונת הפרופיל עודכנה בהצלחה 🎉');
    } catch (err) {
      toast.error('שגיאה בעת עדכון תמונת הפרופיל');
      console.error(err);
    }
  };

  const handleBackgroundChange = async e => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      await onUpdateBackgroundPic(file);
      toast.success('תמונת הרקע עודכנה בהצלחה 🎉');
    } catch (err) {
      toast.error('שגיאה בעת עדכון תמונת הרקע');
      console.error(err);
    }
  };

  return (
    <>
      <section className="w-full overflow-visible">
        {/* Background image and profile pic */}
        <div className={`relative w-full h-36 sm:h-48 md:h-64 bg-${element}-soft overflow-visible`}>
          {backgroundPic && (
            <img src={backgroundPic} alt="Cover background" className="object-cover w-full h-full rounded-lg" />
          )}
          {isOwner && (
            <label className={`
        absolute bottom-2 left-2 sm:bottom-3 sm:left-3 flex items-center justify-center p-1 sm:p-2
        bg-${element}-accent opacity-80 hover:opacity-70
        rounded-full cursor-pointer group
      `}>
              <Image className="text-white w-5 h-5" />
              <span className={`
          absolute left-full ml-1 sm:ml-2
          bg-${element}-accent bg-opacity-75 text-white text-xs rounded px-2 py-1
          opacity-0 group-hover:opacity-100 whitespace-nowrap
        `}>
                שינוי תמונת רקע
              </span>
              <input type="file" accept="image/*" className="hidden" onChange={handleBackgroundChange} />
            </label>
          )}

          <div className="absolute -bottom-14 sm:-bottom-16 right-6 sm:right-24 z-10">
            <div className={`
        relative w-28 h-28 sm:w-40 sm:h-40 border-4 border-${element} rounded-full overflow-hidden
        shadow-lg bg-${element}-soft hover:scale-105 transition-transform duration-300 group
      `}>
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

        <div className="px-4 sm:px-10 md:px-20 pt-16 sm:pt-14 mt-4 sm:mt-6 overflow-visible text-right">
          {/* Username/role/element */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sm:gap-6">
            <div className="flex items-center gap-2 sm:gap-3 text-${element}">
              <h1 className={`text-2xl sm:text-3xl md:text-4xl font-bold mb-2 sm:mb-3 text-${element}`}>{username}</h1>

              {isOwner && (
                <Tooltip text="באפשרותך לערוך את הפרטים שלך דרך עמוד ההגדרות">
                  <Info className="text-gray-500 hover:text-gray-600 w-4 h-4 cursor-pointer transition-colors" />
                </Tooltip>
              )}
            </div>

            {/* Element Display (READ ONLY) */}
            {['mentor', 'admin'].includes(role) ? (
              <Tooltip text="תפקיד המשתמש">
                <div className={`
        relative inline-flex items-center gap-2 sm:gap-3 px-3 sm:px-5 py-2 sm:py-3 rounded-full bg-${element}-soft text-${element}
        shadow-md ring-1 ring-${element}-accent
      `}
                  style={{ pointerEvents: "none", userSelect: "none" }}>
                  <span className="text-xl sm:text-2xl">
                    {role === 'mentor' && '🧑‍🏫'}
                    {role === 'admin' && '⭐'}
                  </span>
                  <span className="text-base sm:text-lg font-medium">
                    {role === 'mentor' ? 'מנחה' : 'מנהל'}
                  </span>
                </div>
              </Tooltip>
            ) : (
              <Tooltip text={isOwner ? "האלמנט שלך" : "האלמנט של המשתמש הזה"}>
                <div
                  className={`
        relative inline-flex items-center gap-2 sm:gap-3 px-3 sm:px-5 py-2 sm:py-3 rounded-full bg-${element}-soft text-${element}
        shadow-md ring-1 ring-${element}-accent
      `}
                  style={{ pointerEvents: "none", userSelect: "none" }}
                >
                  <span className="text-xl sm:text-2xl">{findOption(element).icon}</span>
                  <span className="text-base sm:text-lg font-medium">{findOption(element).label}</span>
                </div>
              </Tooltip>
            )}
          </div>
          {/* Location*/}
          <div className={`mt-4 flex flex-wrap items-center gap-2 text-base text-${element}`}>
            <MapPin className="w-5 h-5 ml-1" />
            <span>{location}</span>
          </div>

          {/* Bio */}
          <div className={`mt-4 text-base leading-relaxed text-${element}`}>
            {bio ? (
              <p className={`text-${element} break-words break-all whitespace-pre-line`}>{bio}</p>
            ) : (
              <p className="text-gray-400 italic">אין ביוגרפיה זמינה.</p>
            )}
          </div>

          {/* Follow button (mobile width full) */}
          {!isOwner && (
            <div className="flex justify-center mt-6">
              <button
                onClick={() => onFollowToggle(uid)}
                className={`
            w-full sm:w-auto px-8 sm:px-20 py-2 sm:py-3 rounded-full text-sm font-medium shadow-md transition-transform hover:scale-105
            ${isFollowing
                    ? 'bg-red-100 text-red-600 hover:bg-red-200'
                    : `bg-${element} text-white hover:bg-${element}-accent`}
          `}
              >
                {isFollowing ? 'בטל מעקב' : 'עקוב'}
              </button>
            </div>
          )}

          {/* Stats Bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className={`
        mt-8 grid grid-cols-3 sm:gap-x-40 gap-y-4 sm:flex sm:justify-center bg-${element}-soft rounded-xl p-5 shadow-md hover:shadow-lg transition-shadow duration-300
      `}
          >
            <Stat element={element} icon={<MessageSquare className="w-5 h-5" />} count={postsCount} label="פוסטים" />
            <Stat element={element} icon={<Users className="w-5 h-5" />} count={followersCount} label={followersLabel} />
            <Stat element={element} icon={<Users className="w-5 h-5" />} count={followingCount} label={followingLabel} />
          </motion.div>
        </div>
      </section>
    </>
  );
};

export default ProfileInfo;
