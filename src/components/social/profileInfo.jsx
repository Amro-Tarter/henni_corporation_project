//ProfileInfo.jsx
import { useEffect } from 'react';
import { MapPin, Camera, MessageSquare, Users, Image, Info } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from '../ui/sonner';
import AirIcon from '@mui/icons-material/Air';
import LocalFloristIcon from '@mui/icons-material/LocalFlorist';
import ConstructionTwoToneIcon from '@mui/icons-material/ConstructionTwoTone';
import WaterDropTwoToneIcon from '@mui/icons-material/WaterDropTwoTone';
import WhatshotRoundedIcon from '@mui/icons-material/WhatshotRounded';

const elementOptions = [
  { value: 'fire', label: 'אש', icon: <WhatshotRoundedIcon style={{color: '#fca5a1'}} /> },
  { value: 'water', label: 'מים', icon: <WaterDropTwoToneIcon style={{color: '#60a5fa'}} /> },
  { value: 'air', label: 'אוויר', icon: <AirIcon style={{ color: '#87ceeb' }} /> },
  { value: 'earth', label: 'אדמה', icon: <LocalFloristIcon style={{color: '#4ade80'}} /> },
  { value: 'metal', label: 'מתכת', icon: <ConstructionTwoToneIcon style={{color: '#4b5563'}} /> },
];

// Helper function to find the option by value
const findOption = v => elementOptions.find(o => o.value === v) || { icon: '', label: '' };

// the info component
const Stat = ({ icon, count, label, element }) => {
  // use the pipe | to split into two lines
  const [topLabel, bottomLabel] = label.includes('|') ? label.split('|') : [label, ''];

  return (
    <div className="flex flex-col items-center hover:scale-105 transition-transform text-center">
      {icon && <div className={`text-${element} mb-1`}>{icon}</div>}
      <div className={`text-2xl sm:text-3xl font-bold text-${element}`}>{count}</div>
      <div className="flex flex-col leading-tight text-sm sm:text-base md:text-lg">
        <span className={`text-${element}-accent`}>{topLabel}</span>
        {bottomLabel && <span className={`text-${element}-accent`}>{bottomLabel}</span>}
      </div>
    </div>
  );
};

// Tooltip component for hover
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

  // determine the labels based on ownership
  const followersLabel = isOwner
    ? "העוקבים שלי"
    : `העוקבים של|${username}`;

  const followingLabel = isOwner
    ? "אני עוקב אחרי"
    : `${username}|עוקב אחרי`

  // handles personal pic change
  const handlePicChange = async e => { // e is the event from the file input
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

  // handles background pic change
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
        {/* Background image */}
        <div className={`relative w-full h-36 sm:h-48 md:h-56 bg-${element}-soft overflow-visible`}>
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
        </div>

        {/* Main profile row */}
        <div className="px-2 sm:px-8 md:px-20 mb-4 relative z-20 overflow-visible text-right">
          <div className="flex flex-col sm:flex-row items-center w-full gap-4 sm:gap-8">

            {/* Profile Pic */}
            <div className="flex-shrink-0 flex flex-col items-center -mt-16" style={{ zIndex: 1 }}>
              <div className={`
              relative w-32 h-32 sm:w-56 sm:h-56 border-4 border-${element} rounded-full overflow-hidden
              shadow-xl bg-${element}-soft hover:scale-105 transition-transform duration-300 group
            `}>
                <img
                  src={profilePic}
                  alt={`${username} avatar`}
                  className="object-cover w-full h-full rounded-full"
                />
                {isOwner && (
                  <label className={`
                  absolute inset-0 flex items-center justify-center
                  bg-black bg-opacity-0 hover:bg-opacity-40 transition-opacity cursor-pointer rounded-full
                `}>
                    <Camera className="text-white w-8 h-8 opacity-0 group-hover:opacity-100 scale-95 group-hover:scale-110 transition-all duration-200" />
                    <input type="file" accept="image/*" className="hidden" onChange={handlePicChange} />
                  </label>
                )}
              </div>
            </div>

            {/* Personal Info */}
            <div className=" flex flex-col flex-grow justify-start self-start md:self-auto text-right pr-2 pt-2 sm:pt-4 min-w-0 overflow-hidden">
              {/* Username */}
              <div className="flex items-center gap-3 mb-4">
                <motion.p
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5 }}
                  className={`text-2xl sm:text-5xl font-bold text-${element}`}
                >
                  {username}
                </motion.p>
                {isOwner && (
                  <Tooltip text="באפשרותך לערוך את הפרטים שלך דרך עמוד ההגדרות">
                    <Info className="text-gray-500 hover:text-gray-600 w-5 h-5 cursor-pointer transition-colors" />
                  </Tooltip>
                )}
              </div>
              {/* Location */}
              <div className={`flex items-center gap-2 text-base sm:text-lg text-${element} mb-2`}>
                <MapPin className="w-5 h-5 ml-1" />
                <span>{location}</span>
              </div>
              {/* Bio */}
              <div className="mb-0">
                {bio ? (
                  <p className={`text-${element} text-sm sm:text-lg leading-relaxed break-words whitespace-pre-line text-right`}>
                    {bio}
                  </p>
                ) : (
                  <p className="text-gray-400 italic text-right">אין ביוגרפיה זמינה.</p>
                )}
              </div>
            </div>

            {/* Role + Follow */}
            <div className="flex flex-col items-end flex-shrink-0 w-40 pt-2 sm:pt-4 ml:auto">
              <div className="mb-2">
                {['mentor', 'admin'].includes(role) ? (
                  <Tooltip text="תפקיד המשתמש">
                    <div className={`
                    inline-flex items-center gap-2 justify-center py-3 w-40 rounded-full bg-${element}-soft text-${element}
                    shadow-lg ring-2 ring-${element}-accent hover:shadow-xl transition-shadow duration-300
                  `}
                      style={{ pointerEvents: "none", userSelect: "none" }}>
                      <span className="text-3xl">
                        {role === 'mentor' && '🧑‍🏫'}
                        {role === 'admin' && '⭐'}
                      </span>
                      <span className="text-lg font-semibold">
                        {role === 'mentor' ? 'מנחה' : 'מנהל'}
                      </span>
                    </div>
                  </Tooltip>
                ) : (
                  <Tooltip text={isOwner ? "האלמנט שלך" : "האלמנט של המשתמש הזה"}>
                    <div className={`
                    inline-flex items-center gap-2 justify-center py-3 w-40 rounded-full bg-${element}-soft text-${element}
                    shadow-lg ring-2 ring-${element}-accent hover:shadow-xl transition-shadow duration-300
                  `}
                      style={{ pointerEvents: "none", userSelect: "none" }}>
                      <span className="text-3xl">{findOption(element).icon}</span>
                      <span className="text-lg font-semibold">{findOption(element).label}</span>
                    </div>
                  </Tooltip>
                )}
              </div>
              {!isOwner && (
              <button
                onClick={() => onFollowToggle(uid)}
                className={`
                  inline-flex items-center justify-center
                  w-40 py-3 mt-2 rounded-full shadow-lg ring-2
                  text-lg font-semibold transition-transform hover:scale-105
                  ${isFollowing
                    ? `bg-red-100 text-red-600 ring-${element}-accent hover:bg-red-200`
                    : `bg-${element} text-white ring-${element}-accent hover:bg-${element}-accent/90`}
                `}
              >
                {isFollowing ? 'בטל מעקב' : 'עקוב'}
              </button>
            )}
            </div>
          </div>
        </div>

        {/* Stats Bar */}
        <div className={`px-2 sm:px-8 md:px-20`}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className={`
            grid grid-cols-3 sm:gap-x-40 gap-y-4 sm:flex sm:justify-center
            bg-${element}-soft rounded-xl p-3 shadow-md hover:shadow-lg transition-shadow duration-300
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