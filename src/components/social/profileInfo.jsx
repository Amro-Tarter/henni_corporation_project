import React, { useState } from 'react';
import { MapPin, Pencil, Camera } from 'lucide-react';

// Define element options with Hebrew labels and emoji icons
const elementOptions = [
  { value: 'fire',  label: 'אש',   icon: '🔥'  },
  { value: 'water', label: 'מים',  icon: '💧'  },
  { value: 'air',   label: 'אוויר', icon: '🌪️' },
  { value: 'earth', label: 'אדמה', icon: '🌍'  },
  { value: 'metal', label: 'מתכת', icon: '⚙️'  },
];

// Lookup helper by value
const findOption = (value) => elementOptions.find(o => o.value === value) || { icon: '', label: '' };

const ProfileInfo = ({
  profilePic,
  username,
  location,
  bio,
  element,
  postsCount,
  followersCount,
  followingCount,
  onUpdateField,
  onUpdateProfilePic
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

  return (
    <div className="bg-white rounded-3xl p-6 flex flex-col md:flex-row items-center w-full max-w-3xl mx-auto gap-8">
      {/* Profile Picture */}
      <div className="relative group flex-shrink-0 -mt-6">
        <img
          src={profilePic}
          alt="Profile"
          className="w-28 h-28 md:w-36 md:h-36 rounded-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-black bg-opacity-30 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <label className="cursor-pointer">
            <Camera className="text-white w-6 h-6" />
            <input type="file" accept="image/*" className="hidden" onChange={handlePicChange} />
          </label>
        </div>
      </div>

      {/* Details Section */}
      <div className="flex-1 flex flex-col gap-6 w-full">
        {/* Header: Username & Element */}
        <div className="flex items-center justify-between w-full gap-4">
          {/* Username */}
          {editing === 'username' ? (
            <div className="flex items-center space-x-3">
              <input
                type="text"
                value={tempValue}
                onChange={e => setTempValue(e.target.value)}
                className="border-b-2 border-gray-300 focus:outline-none focus:border-orange-500 text-2xl font-semibold text-gray-900 transition-all duration-200"
              />
              <button onClick={saveEditing} className="px-4 py-1 bg-orange-500 text-white rounded-full text-sm hover:bg-orange-600 transition-colors duration-200">
                שמור
              </button>
              <button onClick={cancelEditing} className="px-4 py-1 bg-gray-200 text-gray-700 rounded-full text-sm hover:bg-gray-300 transition-colors duration-200">
                ביטול
              </button>
            </div>
          ) : (
            <div className="flex items-center group space-x-2">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900">{username}</h2>
              <Pencil onClick={() => startEditing('username', username)} className="opacity-0 group-hover:opacity-100 cursor-pointer w-5 h-5 text-gray-500 transition-opacity duration-200" />
            </div>
          )}

          {/* Element */}
          {editing === 'element' ? (
            <div className="flex flex-col w-full">
              <div className="grid grid-cols-5 gap-3 bg-gray-50 p-3 rounded-lg mb-3">
                {elementOptions.map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => setTempValue(opt.value)}
                    className={`flex flex-col items-center p-2 rounded-lg cursor-pointer transition-transform duration-200 ease-out ${
                      tempValue === opt.value ? 'bg-orange-500 text-white transform scale-105' : 'bg-white text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <span className="text-2xl mb-1">{opt.icon}</span>
                    <span className="text-sm font-medium">{opt.label}</span>
                  </button>
                ))}
              </div>
              <div className="flex space-x-3">
                <button onClick={saveEditing} className="px-4 py-1 bg-orange-500 text-white rounded-full text-sm hover:bg-orange-600 transition-colors duration-200">
                  שמור
                </button>
                <button onClick={cancelEditing} className="px-4 py-1 bg-gray-200 text-gray-700 rounded-full text-sm hover:bg-gray-300 transition-colors duration-200">
                  ביטול
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center group bg-orange-100 px-4 py-2 rounded-xl transition-colors duration-200 hover:bg-orange-200 space-x-2">
              <span className="text-2xl">{findOption(element).icon}</span>
              <span className="text-lg font-semibold text-gray-800">{findOption(element).label}</span>
              <Pencil onClick={() => startEditing('element', element)} className="opacity-0 group-hover:opacity-100 cursor-pointer w-5 h-5 text-gray-500 transition-opacity duration-200" />
            </div>
          )}
        </div>

        {/* Location */}
        <div className="relative group flex items-center text-gray-500 text-sm">
          {editing === 'location' ? (
            <div className="flex items-center space-x-3 w-full">
              <input
                type="text"
                value={tempValue}
                onChange={e => setTempValue(e.target.value)}
                className="flex-1 border-b-2 border-gray-300 focus:outline-none focus:border-orange-500 text-gray-700 transition-all duration-200"
              />
              <button onClick={saveEditing} className="px-4 py-1 bg-orange-500 text-white rounded-full text-sm hover:bg-orange-600 transition-colors duration-200">
                שמור
              </button>
              <button onClick={cancelEditing} className="px-4 py-1 bg-gray-200 text-gray-700 rounded-full text-sm hover:bg-gray-300 transition-colors duration-200">
                ביטול
              </button>
            </div>
          ) : (
            <>
              <MapPin className="ml-1 w-5 h-5" />
              <span className="ml-1">{location}</span>
              <Pencil onClick={() => startEditing('location', location)} className="ml-2 opacity-0 group-hover:opacity-100 cursor-pointer w-4 h-4 text-gray-500 transition-opacity duration-200" />
            </>
          )}
        </div>

        {/* Bio */}
        <div className="relative group w-full">
          {editing === 'bio' ? (
            <div className="flex flex-col gap-3">
              <textarea
                value={tempValue}
                onChange={e => setTempValue(e.target.value)}
                rows={3}
                className="w-full border border-gray-300 focus:border-orange-500 focus:ring-1 focus:ring-orange-200 focus:outline-none p-3 rounded-lg resize-none text-gray-700 transition-all duration-200"
              />
              <div className="flex space-x-3">
                <button onClick={saveEditing} className="px-4 py-1 bg-orange-500 text-white rounded-full text-sm hover:bg-orange-600 transition-colors duration-200">
                  שמור
                </button>
                <button onClick={cancelEditing} className="px-4 py-1 bg-gray-200 text-gray-700 rounded-full text-sm hover:bg-gray-300 transition-colors duration-200">
                  ביטול
                </button>
              </div>
            </div>
          ) : (
            <p className="text-gray-700 text-sm leading-relaxed">
              {bio}
              <Pencil onClick={() => startEditing('bio', bio)} className="absolute top-0 right-0 w-4 h-4 text-gray-500 opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity duration-200" />
            </p>
          )}
        </div>

        {/* Stats */}
        <div className="mt-6 grid grid-cols-3 text-center bg-orange-50 rounded-xl p-4 gap-6">
          <div>
            <p className="text-2xl font-bold text-gray-900">{postsCount}</p>
            <p className="text-xs text-gray-500">פוסטים</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">{followersCount}</p>
            <p className="text-xs text-gray-500">עוקבים</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">{followingCount}</p>
            <p className="text-xs text-gray-500">עוקב אחרי</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileInfo;