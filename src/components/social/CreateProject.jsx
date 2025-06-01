import React, { useState, useRef, useEffect } from 'react';
import { UserPlus, Upload, X, Send, Smile } from 'lucide-react'; // Lucide icons
import { FaPhotoVideo, FaVideo } from 'react-icons/fa';           // FontAwesome icons
import EmojiPicker from 'emoji-picker-react';
import { containsBadWord } from '../social/utils/containsBadWord';
import ElementalLoader from '/src/theme/ElementalLoader.jsx';

const CreateProject = ({
  profilePic,
  element,
  allUsers,
  onCreateProject
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [mediaFile, setMediaFile] = useState(null);
  const [mediaType, setMediaType] = useState('');
  const [previewUrl, setPreviewUrl] = useState(null);
  const [collaborators, setCollaborators] = useState([]);
  const [showUsers, setShowUsers] = useState(false);
  const [warning, setWarning] = useState('');
  const [showEmoji, setShowEmoji] = useState(false);
  const [emojiPos, setEmojiPos] = useState({ x: 0, y: 0 });
  const [collabSearch, setCollabSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const textareaRef = useRef();
  const emojiBtnRef = useRef();
  const fileInputRef = useRef();
  const usersPopupRef = useRef();
  const MAX_FIELD_LENGTH = 50;


  useEffect(() => {
    if (!showUsers) return;
    function handleClick(e) {
      if (
        usersPopupRef.current &&
        !usersPopupRef.current.contains(e.target) &&
        e.target.getAttribute('aria-label') !== 'הוסף משתפי פעולה'
      ) {
        setShowUsers(false);
      }
    }
    window.addEventListener('mousedown', handleClick);
    return () => window.removeEventListener('mousedown', handleClick);
  }, [showUsers]);


  // Emoji picker positioning
  useEffect(() => {
    if (showEmoji && emojiBtnRef.current) {
      const rect = emojiBtnRef.current.getBoundingClientRect();
      setEmojiPos({ x: rect.left, y: rect.bottom + 8 });
    }
  }, [showEmoji]);

  // Insert emoji at cursor
  const insertEmoji = (emojiObject) => {
    const sym = emojiObject.emoji;
    const input = textareaRef.current;
    if (!input) return;
    const [start, end] = [input.selectionStart, input.selectionEnd];
    setDescription(prev => prev.slice(0, start) + sym + prev.slice(end));
    setTimeout(() => {
      input.focus();
      input.setSelectionRange(start + sym.length, start + sym.length);
    }, 0);
  };

  // Pick media
  const pickMedia = (accept, type) => {
    setMediaType(type);
    fileInputRef.current.accept = accept;
    fileInputRef.current.click();
  };

  const onFileChange = e => {
    const f = e.target.files[0];
    if (f) {
      setMediaFile(f);
      setPreviewUrl(URL.createObjectURL(f));
    }
  };

  const handleAddCollaborator = uid => {
    if (!collaborators.includes(uid)) {
      setCollaborators([...collaborators, uid]);
    }
  };

  const handleRemoveCollaborator = uid => {
    setCollaborators(collaborators.filter(id => id !== uid));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      setWarning('חובה למלא כותרת ותיאור לפרויקט!');
      setTimeout(() => setWarning(''), 3000);
      return;
    }
    if (containsBadWord(title) || containsBadWord(description)) {
      setWarning('התוכן מכיל מילים לא ראויות!');
      setTimeout(() => setWarning(''), 3500);
      return;
    }
    setLoading(true); // show loader
    try {
      await onCreateProject({
        title,
        description,
        mediaFile,
        mediaType,
        collaborators,
      });
    } finally {
      setLoading(false); // hide loader
    }
    setTitle('');
    setDescription('');
    setMediaFile(null);
    setPreviewUrl(null);
    setCollaborators([]);
    setWarning('');
  };

  // Close emoji picker on outside click
  useEffect(() => {
    if (!showEmoji) return;
    function handleClick(e) {
      if (
        !emojiBtnRef.current?.contains(e.target) &&
        !document.getElementById('emoji-picker-portal')?.contains(e.target)
      ) {
        setShowEmoji(false);
      }
    }
    window.addEventListener('mousedown', handleClick);
    return () => window.removeEventListener('mousedown', handleClick);
  }, [showEmoji]);

  return (
  <>
    {loading && (
        <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center backdrop-blur-sm">
          <ElementalLoader element={element} />
        </div>
      )}  
    {warning && (
      <div
        style={{
          position: 'fixed',
          top: '75px',
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

    <div className="mb-10 flex justify-center px-2 sm:px-4" dir="rtl">
      <div className={`w-full max-w-2xl md:max-w-3xl lg:max-w-4xl bg-white rounded-2xl p-2 sm:p-4 md:p-6 space-y-4 border border-${element}-accent`}>
        <form onSubmit={handleSubmit} className="space-y-4">

          {/* Title */}
          <div className="flex flex-row items-start gap-2 sm:gap-4">
            <img
              src={profilePic}
              alt="Profile"
              className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover ring-2 ring-${element}-accent ring-offset-1`}              
            />
            <input
              className={`
                flex-1 bg-${element}-soft
                rounded-xl px-4 py-3
                text-lg text-${element}-dark font-bold
                border-0
                focus:outline-none
                focus:ring-2 focus:ring-${element}-accent
                transition
              `}
              value={title}
              onChange={e => {setTitle(e.target.value);}}
              maxLength={MAX_FIELD_LENGTH}
              placeholder="כותרת הפרויקט"
            />
            <div className="text-xs text-gray-400 text-left mt-1 whitespace-nowrap">
              {title.length} / {MAX_FIELD_LENGTH}
            </div>
          </div>

          {/* Description */}
          <div className="flex flex-col sm:flex-row items-start gap-2">
            <textarea
              ref={textareaRef}
              className={`
                w-full sm:flex-1 bg-${element}-soft
                rounded-xl px-4 py-3
                text-sm text-${element}-dark
                border-0
                resize-none
                focus:outline-none
                focus:ring-2 focus:ring-${element}-accent
                transition min-h-[80px]
              `}
              placeholder="תיאור הפרויקט שלך..."
              value={description}
              onChange={e => setDescription(e.target.value)}
              rows={3}
              dir="rtl"
            />
            <button
              type="button"
              ref={emojiBtnRef}
              onClick={() => setShowEmoji(val => !val)}
              className={`
                mt-2 sm:mt-0 ml-0 sm:ml-2 px-2 py-2
                rounded-md 
                bg-${element}-soft
                text-${element}
                hover:bg-${element}-accent
                hover:text-white
                transition-colors
                flex items-center emoji-picker-btn
              `}
              aria-label="הוסף אימוג׳י"
            >
              <Smile size={18} />
            </button>
            {showEmoji && (
              <div
                id="emoji-picker-portal"
                style={{
                  position: 'fixed',
                  left: emojiPos.x,
                  top: emojiPos.y,
                  zIndex: 1200,
                }}
              >
                <EmojiPicker
                  onEmojiClick={insertEmoji}
                  autoFocusSearch={false}
                  theme="light"
                  width={320}
                  height={380}
                />
              </div>
            )}
          </div>

          {/* Collaborators Row: Button + Chips + Search Popup */}
          <div className="relative z-20">
            <div className="flex flex-wrap items-center gap-2">
              {/* Add Collaborators Button */}
              <button
                type="button"
                onClick={() => setShowUsers(!showUsers)}
                className={`
                  px-3 py-2 rounded
                  bg-${element}-accent
                  hover:bg-${element}
                  text-white
                  font-semibold flex items-center gap-2
                  border border-${element}-accent
                  transition
                `}
              >
                <UserPlus size={16} /> הוסף משתפי פעולה
              </button>

              {/* Selected Collaborators as Chips */}
              {collaborators.map(uid => {
                const u = allUsers.find(x => x.id === uid);
                if (!u) return null;
                return (
                  <div
                    key={uid}
                    className={`flex items-center bg-${element}-soft px-2 py-1 rounded-full text-xs gap-2 border border-${element}-accent hover:bg-${element}-soft/80 transition`}
                    style={{ marginLeft: 4 }}
                  >
                    <img src={u.photoURL || '/default_user_pic.jpg'} className="w-5 h-5 rounded-full mr-1" alt={u.username} />
                    <span className={`text-${element}-dark font-medium`}>{u.username}</span>
                    <button
                      onClick={() => handleRemoveCollaborator(uid)}
                      className={`ml-2 text-${element}-accent hover:text-red-600 transition`}
                      aria-label="הסר משתף"
                    >
                      <X size={13} />
                    </button>
                  </div>
                );
              })}

              {/* Popup for user search & select */}
              {showUsers && (
                <div 
                  ref={usersPopupRef}
                  className="absolute mt-12 right-0 bg-white shadow-xl rounded-xl border border-gray-200 p-4 z-50 min-w-[240px]">
                  <input
                    type="text"
                    value={collabSearch}
                    onChange={e => setCollabSearch(e.target.value)}
                    placeholder="חפש משתמש לפי שם..."
                    className="w-full px-3 py-2 mb-3 rounded border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-300 text-sm"
                    autoFocus
                  />
                  <div className="max-h-48 overflow-y-auto space-y-1">
                    {allUsers
                      .filter(u =>
                        !collaborators.includes(u.id) &&
                        u.username.toLowerCase().includes(collabSearch.trim().toLowerCase())
                      )
                      .map(user => (
                        <div
                          key={user.id}
                          className="flex items-center gap-2 py-1 px-2 cursor-pointer hover:bg-gray-100 rounded transition"
                          onClick={() => {
                            handleAddCollaborator(user.id);
                            setCollabSearch('');
                          }}
                        >
                          <img src={user.photoURL || '/default_user_pic.jpg'} className="w-6 h-6 rounded-full" alt={user.username} />
                          <span className="text-sm">{user.username}</span>
                        </div>
                      ))}
                    {allUsers.filter(u =>
                        !collaborators.includes(u.id) &&
                        u.username.toLowerCase().includes(collabSearch.trim().toLowerCase())
                      ).length === 0 && (
                        <div className="text-xs text-gray-400 px-2 py-1">לא נמצאו משתמשים</div>
                      )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Media Buttons */}
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 justify-between">
            <button
              type="button"
              onClick={() => pickMedia('image/*', 'photo')}
              className={`flex items-center gap-2 flex-1 justify-center bg-${element}-soft text-${element} rounded-lg px-4 py-2 border border-${element}-accent hover:bg-${element}-accent hover:text-white transition`}
            >
              <FaPhotoVideo className={`h-5 w-5`} />
              תמונה
            </button>
            <button
              type="button"
              onClick={() => pickMedia('video/*', 'video')}
              className={`flex items-center gap-2 flex-1 justify-center bg-${element}-soft text-${element} rounded-lg px-4 py-2 border border-${element}-accent hover:bg-${element}-accent hover:text-white transition`}
            >
              <FaVideo className={`h-5 w-5`} />
              וידאו
            </button>
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              onChange={onFileChange}
            />
            {previewUrl && (
              <div className="mt-2 flex justify-center w-full">
                {mediaType === 'photo'
                  ? <img src={previewUrl} className="max-w-xs rounded-lg shadow-md" />
                  : <video src={previewUrl} className="max-w-xs rounded-lg shadow-md" controls />
                }
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 justify-end">
            <div className={`flex gap-3 transition-all duration-500 ${
              (title.trim() && description.trim()) || mediaFile ? 'opacity-100 max-h-20' : 'opacity-0 max-h-0 overflow-hidden'
            }`}>
              <button
                type="button"
                onClick={() => {
                  setTitle('');
                  setDescription('');
                  setMediaFile(null);
                  setPreviewUrl(null);
                  setCollaborators([]);
                  setWarning('');
                }}
                className={`
                  bg-${element}-soft
                  text-${element}-accent
                  font-semibold rounded-full px-6 py-2 text-sm
                  hover:bg-${element}-accent hover:text-white
                  border border-${element}-accent
                  transition
                `}
              >
                ביטול
              </button>
              <button
                type="submit"
                className={`
                  bg-${element}
                  text-white font-semibold
                  rounded-full px-6 py-2 text-sm
                  hover:bg-${element}-accent
                  transition
                `}
              >
                הוסף פרויקט
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  </>
);

};
export default CreateProject;
