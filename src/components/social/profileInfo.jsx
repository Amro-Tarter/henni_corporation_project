import React, { useState } from 'react';
import { MapPin, Pencil, Camera, MessageSquare, Users, Image } from 'lucide-react';

// Element options
const elementOptions = [
  { value: 'fire',  label: 'אש',   icon: '🔥'  },
  { value: 'water', label: 'מים',  icon: '💧'  },
  { value: 'air',   label: 'אוויר', icon: '🌪️' },
  { value: 'earth', label: 'אדמה', icon: '🌍'  },
  { value: 'metal', label: 'מתכת', icon: '⚙️'  },
];

const findOption = v => elementOptions.find(o => o.value === v) || { icon: '', label: '' };

// Small reusable stat tile component
const Stat = ({ icon, count, label }) => (
  <div className="flex flex-col items-center">
    {icon && <div className="text-orange-500 mb-1">{icon}</div>}
    <div className="text-2xl sm:text-3xl font-bold text-gray-900">{count}</div>
    <div className="text-sm text-gray-500">{label}</div>
  </div>
);

const ProfileInfo = ({
  profilePic,
  backgroundPic,
  username,
  location,
  bio,
  element,
  postsCount,
  followersCount,
  followingCount,
  onUpdateField,
  onUpdateProfilePic,
  onUpdateBackgroundPic,
}) => {
  const [editing, setEditing] = useState(null);
  const [tempValue, setTempValue] = useState('');

  const startEditing = (field, value) => {
    setEditing(field);
    setTempValue(value);
  };
  const saveEditing = () => {
    onUpdateField(editing, tempValue);
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
    <section className="w-full overflow-visible">
      {/* Cover & Profile */}
      <div className="relative w-full h-48 sm:h-64 bg-white rounded-t-3xl overflow-visible">
        {backgroundPic && (
          <img src={backgroundPic} alt="Cover background" className="object-cover w-full h-full" />
        )}
        <label className="absolute bottom-3 left-3 flex items-center justify-center p-2 bg-black bg-opacity-50 hover:bg-opacity-70 rounded-full cursor-pointer group">
          <Image className="text-white w-5 h-5" />
          <span className="absolute left-full ml-2 bg-black bg-opacity-75 text-white text-xs rounded px-2 py-1 opacity-0 group-hover:opacity-100 whitespace-nowrap">
            שינוי תמונת רקע
          </span>
          <input type="file" accept="image/*" className="hidden" onChange={handleBackgroundChange} />
        </label>

        <div className="absolute -bottom-16 right-24 z-10">
          <div className="relative w-40 h-40 border-4 border-orange-500 rounded-full overflow-hidden shadow-lg bg-white">
            <img src={profilePic} alt={`${username} avatar`} className="object-cover w-full h-full rounded-full" />
            <label className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-20 opacity-0 hover:opacity-100 transition-opacity cursor-pointer rounded-full">
              <Camera className="text-white w-6 h-6" />
              <input type="file" accept="image/*" className="hidden" onChange={handlePicChange} />
            </label>
            {!editing && (
              <div className="absolute -bottom-2 -left-2 bg-white rounded-full p-1 shadow-md">
                <span className="text-xl" title={findOption(element).label}>
                  {findOption(element).icon}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* User Info Card */}
      <div className="pr-20 pt-14 pl-20 mt-6 overflow-visible text-right">
        {/* Username & Element */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
          {editing === 'username' ? (
            <div className="flex justify-end items-center gap-3">
              <input
                type="text"
                value={tempValue}
                onChange={e => setTempValue(e.target.value)}
                className="border-b-2 border-gray-300 focus:border-orange-500 focus:outline-none text-3xl sm:text-4xl font-bold text-gray-900"
                dir="rtl"
              />
              <div className="flex gap-2">
                <button onClick={saveEditing} className="px-3 py-1 bg-orange-500 text-white rounded-full text-sm">שמור</button>
                <button onClick={cancelEditing} className="px-3 py-1 bg-gray-200 text-gray-700 rounded-full text-sm">ביטול</button>
              </div>
            </div>
          ) : (
            <div className="relative group inline-flex items-center space-x-reverse space-x-2">
              <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">{username}</h1>
              <Pencil onClick={() => startEditing('username', username)} className="opacity-0 group-hover:opacity-100 cursor-pointer w-5 h-5 text-gray-500" />
            </div>
          )}

          {editing === 'element' ? (
            <div className="mt-4 sm:mt-0">
              <div className="grid grid-cols-5 gap-2 bg-gray-50 p-2 rounded-xl">
                {elementOptions.map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => setTempValue(opt.value)}
                    className={`flex flex-col items-center p-2 rounded-lg transition-transform ${tempValue === opt.value ? 'bg-orange-500 text-white scale-110' : 'bg-white text-gray-700 hover:bg-gray-100'}`}
                  >
                    <span className="text-2xl mb-1">{opt.icon}</span>
                    <span className="text-sm font-medium">{opt.label}</span>
                  </button>
                ))}
              </div>
              <div className="flex justify-end gap-2 mt-2">
                <button onClick={saveEditing} className="px-3 py-1 bg-orange-500 text-white rounded-full text-sm">שמור</button>
                <button onClick={cancelEditing} className="px-3 py-1 bg-gray-200 text-gray-700 rounded-full text-sm">ביטול</button>
              </div>
            </div>
          ) : (
            <div className="relative group inline-flex items-center bg-orange-100 px-4 py-2 rounded-full space-x-reverse space-x-2">
              <span className="text-2xl">{findOption(element).icon}</span>
              <span className="text-lg font-medium text-gray-800">{findOption(element).label}</span>
              <Pencil onClick={() => startEditing('element', element)} className="opacity-0 group-hover:opacity-100 cursor-pointer w-5 h-5 text-gray-500" />
            </div>
          )}
        </div>

        {/* Location */}
        <div className="mt-6 group inline-flex items-center space-x-reverse space-x-2 text-gray-600 text-base">
          <MapPin className="w-5 h-5 ml-1" />
          {editing === 'location' ? (
            <div className="flex justify-end items-center gap-2 w-full">
              <input
                type="text"
                value={tempValue}
                onChange={e => setTempValue(e.target.value)}
                className="flex-1 border-b-2 border-gray-300 focus:border-orange-500 focus:outline-none text-base text-gray-700"
                dir="rtl"
              />
              <div className="flex gap-2">
                <button onClick={saveEditing} className="px-3 py-1 bg-orange-500 text-white rounded-full text-sm">שמור</button>
                <button onClick={cancelEditing} className="px-3 py-1 bg-gray-200 text-gray-700 rounded-full text-sm">ביטול</button>
              </div>
            </div>
          ) : (
            <>
              <span>{location}</span>
              <Pencil onClick={() => startEditing('location', location)} className="opacity-0 group-hover:opacity-100 cursor-pointer w-4 h-4 text-gray-500" />
            </>
          )}
        </div>

        {/* Bio */}
        <div className="mt-4 group relative">
          {editing === 'bio' ? (
            <div className="flex flex-col gap-2">
              <textarea
                value={tempValue}
                onChange={e => setTempValue(e.target.value)}
                rows={3}
                className="w-full border border-gray-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 rounded-lg p-3 resize-none text-base text-gray-700"
                dir="rtl"
              />
              <div className="flex justify-end gap-2">
                <button onClick={saveEditing} className="px-3 py-1 bg-orange-500 text-white rounded-full text-sm">שמור</button>
                <button onClick={cancelEditing} className="px-3 py-1 bg-gray-200 text-gray-700 rounded-full text-sm">ביטול</button>
              </div>
            </div>
          ) : (
            <p className="text-base text-gray-700 leading-relaxed">
              {bio}
              <Pencil onClick={() => startEditing('bio', bio)} className="absolute left-0 top-0 opacity-0 group-hover:opacity-100 cursor-pointer w-4 h-4 text-gray-500" />
            </p>
          )}
        </div>

        {/* Stats */}
        <div className="mt-8 grid grid-cols-3 gap-x-40 gap-y-4 sm:flex sm:justify-center bg-orange-50 rounded-xl p-5 shadow-md">
          <Stat icon={<MessageSquare className="w-5 h-5" />} count={postsCount} label="פוסטים" />
          <Stat icon={<Users className="w-5 h-5" />} count={followersCount} label="עוקבים" />
          <Stat icon={<Users className="w-5 h-5" />} count={followingCount} label="עוקב אחרי" />
        </div>
      </div>
    </section>
  );
};

export default ProfileInfo;
