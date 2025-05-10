import React, { useState, useEffect, useRef } from 'react';
import { ThumbsUp, MessageCircle, MoreHorizontal, Camera, Trash2, Check } from 'lucide-react';

const ProfilePost = ({ post, element, onDelete, onUpdate, onLike }) => {
  const {
    id,
    authorPhotoURL,
    authorName,
    createdAt,
    content,
    mediaUrl,
    likesCount,
    commentsCount,
    likedBy = []
  } = post;

  const [editing, setEditing] = useState(false);
  const [newContent, setNewContent] = useState(content);
  const [newMediaFile, setNewMediaFile] = useState(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const fileInputRef = useRef(null);
  const menuRef = useRef(null);

  const [liked, setLiked] = useState(false);
  useEffect(() => {
    setLiked(Array.isArray(likedBy) && likedBy.includes(post.authorId || ''));
  }, [likedBy, post.authorId]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const createdDate = createdAt?.toDate?.();
  const timeString = createdDate
    ? createdDate.toLocaleDateString('he-IL', {
        year: 'numeric', month: 'short', day: 'numeric',
        hour: '2-digit', minute: '2-digit'
      })
    : '';

  const isVideo = mediaUrl && /\.(mp4|webm|ogg)$/i.test(mediaUrl);

  const handleDeleteClick = () => {
    if (window.confirm('האם אתה בטוח שברצונך למחוק את הפוסט הזה?')) {
      onDelete(id);
      setIsMenuOpen(false);
    }
  };

  const handleConfirm = () => {
    onUpdate(id, { content: newContent, mediaFile: newMediaFile });
    setEditing(false);
    setNewMediaFile(null);
  };

  const toggleLike = () => {
    const newLiked = !liked;
    setLiked(newLiked);
    onLike(id, newLiked);
  };

  const pickNewMedia = () => fileInputRef.current?.click();
  const onFileChange = e => {
    const f = e.target.files[0];
    if (f) setNewMediaFile(f);
  };
  const toggleEditing = () => {
    setEditing(prev => !prev);
    setIsMenuOpen(false);
  };

  return (
    <div
      dir="rtl"
      className={`
        mb-8 max-w-4xl mx-auto rounded-xl overflow-hidden shadow-sm
        bg-white border border-${element}-accent
        hover:shadow-md transition-shadow duration-300
        pb-2
      `}
    >
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        accept={isVideo ? 'video/*' : 'image/*'}
        onChange={onFileChange}
      />

      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="relative">
            <img
              src={authorPhotoURL}
              alt={authorName}
              className={`
                w-12 h-12 rounded-full object-cover
                ring-2 ring-${element}-accent ring-offset-1
              `}
            />
          </div>
          <div className="flex flex-col">
            <h3 className={`text-lg font-bold `}>{authorName}</h3>
            <p className={`text-xs `}>{timeString}</p>
          </div>
        </div>
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className={`
              p-2 rounded-full transition-colors duration-200
              text-${element}-accent hover:text-${element} hover:bg-${element}-soft
            `}
            aria-label="אפשרויות נוספות"
          >
            <MoreHorizontal size={20} />
          </button>
          {isMenuOpen && (
            <div className={`
              absolute left-0 top-full mt-1 w-36
               border border-${element}-accent
              rounded-lg shadow-lg overflow-hidden z-10
            `}>
              <button
                onClick={toggleEditing}
                className={`
                  w-full text-right px-4 py-2 text-sm
                  hover:bg-${element}-soft transition-colors
                `}
              >
                {editing ? 'ביטול עריכה' : 'ערוך פוסט'}
              </button>
              <button
                onClick={handleDeleteClick}
                className={`
                  w-full text-right px-4 py-2 text-sm text-red-600
                  hover:bg-${element}-soft transition-colors
                `}
              >
                מחק פוסט
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="px-5 pb-4">
        {editing ? (
          <div className="relative mb-3">
            <textarea
              value={newContent}
              onChange={e => setNewContent(e.target.value)}
              className={`
                w-full border rounded-lg p-3 resize-none
                focus:ring-2 focus:ring-${element}-accent
                focus:border-${element}-accent border-${element}-soft
                transition-all outline-none
              `}
              rows={4}
              dir="rtl"
              placeholder="מה בליבך?"
            />
            <div className="flex justify-end gap-2 mt-2">
              <button
                onClick={() => setEditing(false)}
                className={`
                  px-4 py-2 text-sm rounded-md
                  text-${element}-accent bg-${element}-soft
                  hover:bg-${element}-accent hover:text-white
                  transition-colors
                `}
              >
                ביטול
              </button>
              <button
                onClick={handleConfirm}
                className={`
                  px-4 py-2 text-sm text-white rounded-md
                  bg-${element} hover:bg-${element}-accent
                  transition-colors flex items-center gap-1
                `}
              >
                <Check size={16} />
                שמור שינויים
              </button>
            </div>
          </div>
        ) : (
          <p className={`px-5 pb-2 text-base leading-relaxed`}>
            {content}
          </p>
        )}
      </div>

      {/* Media */}
      {mediaUrl && (
        <div
          className={`
            relative w-full overflow-hidden bg-${element}-soft
            ${editing ? 'cursor-pointer' : ''}
          `}
          onClick={editing ? pickNewMedia : undefined}
        >
          {editing && (
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black bg-opacity-40 backdrop-blur-sm">
              <Camera className="w-10 h-10 text-white" />
              <p className="text-white mt-2 font-medium">החלף מדיה</p>
            </div>
          )}
          <div className="w-full" style={{ height: '40rem' }}>
            {isVideo ? (
              <video
                className="absolute top-1/2 left-0 w-full transform -translate-y-1/2 object-cover"
                controls
              >
                <source
                  src={newMediaFile ? URL.createObjectURL(newMediaFile) : mediaUrl}
                  type="video/mp4"
                />
              </video>
            ) : (
              <img
                src={newMediaFile ? URL.createObjectURL(newMediaFile) : mediaUrl}
                alt="תוכן הפוסט"
                className="absolute top-1/2 left-0 w-full transform -translate-y-1/2 object-cover"
              />
            )}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className={`
        px-5 py-3 flex items-center justify-between
        border-t border-${element}-soft
      `}>
        <div className="flex items-center gap-6">
          <button
            onClick={toggleLike}
            className="flex items-center gap-2 group"
            aria-label={liked ? "הסר לייק" : "הוסף לייק"}
          >
            <div className={`
              p-1.5 rounded-full transition-colors
              ${liked
                ? `bg-${element} text-white`
                : `bg-${element}-soft text-${element} hover:bg-${element}-accent`
              }
            `}>
              <ThumbsUp
                size={18}
                className={liked ? 'fill-white' : `group-hover:fill-${element}-accent`}
              />
            </div>
            <span className={`
              text-sm font-medium transition-colors
              
            `}>
              {likesCount}
            </span>
          </button>

          <button className="flex items-center gap-2 group" aria-label="הצג תגובות">
            <div className={`
              p-1.5 rounded-full transition-colors
              bg-${element}-soft text-${element}
              hover:bg-${element}-accent hover:text-white
            `}>
              <MessageCircle size={18} />
            </div>
            <span className={`
              text-sm font-medium transition-colors
               group-hover:text-${element}
            `}>
              {commentsCount}
            </span>
          </button>
        </div>

        {editing && (
          <div className="flex items-center gap-2">
            <button
              onClick={handleDeleteClick}
              className="flex items-center gap-1 px-3 py-1.5 text-xs text-red-600 bg-red-50 rounded-md hover:bg-red-100 transition-colors"
            >
              <Trash2 size={14} />
              מחק
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfilePost;
