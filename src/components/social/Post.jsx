//Post.jsx
import React, { useState, useEffect, useRef } from 'react';
import { ThumbsUp, MessageCircle, MoreHorizontal, Camera, Trash2, Check, X, Smile, Edit2 } from 'lucide-react';
import { Comment, CommentInput } from './comments';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from '../ui/sonner';
import PostModalContent from './PostModalContent';
import ConfirmationModal from './ConfirmationModal';
import { containsBadWord } from './utils/containsBadWord';
import EmojiPickerPopover from './EmojiPickerPopover';

const Post = ({
  post,
  element,
  onDelete,
  onUpdate,
  onLike,
  comments,
  currentUser,
  onAddComment,
  onEditComment,
  onDeleteComment,
  isOwner,
  getAuthorProfile
}) => {
  const {
    id,
    createdAt,
    content = '',
    mediaUrl = '',
    likesCount = 0,
    commentsCount = 0,
    likedBy = [],
    authorId
  } = post || {};

  const [editing, setEditing] = useState(false);
  const [newContent, setNewContent] = useState(content);
  const [newMediaFile, setNewMediaFile] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [replyTo, setReplyTo] = useState(null);
  const [liked, setLiked] = useState(false);
  const [authorProfile, setAuthorProfile] = useState(null);
  const [showPostModal, setShowPostModal] = useState(false);
  const [floatLike, setFloatLike] = useState(false);
  const [warning, setWarning] = useState('');
  const [error, setError] = useState('');
  const [mediaType, setMediaType] = useState('');
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [commentToDelete, setCommentToDelete] = useState(null);


  const [showEmoji, setShowEmoji] = useState(false);
  const emojiBtnRef = useRef();
  const fileInputRef = useRef(null);
  const menuRef = useRef(null);
  const commentsRef = useRef(null);
  const navigate = useNavigate();


  useEffect(() => {
    const fetch = async () => {
      const profile = await getAuthorProfile(post.authorId);
      setAuthorProfile(profile);
    };
    fetch();
  }, [post.authorId, getAuthorProfile]);

  useEffect(() => {
    if (mediaUrl) {
      const isVideo = /\.(mp4|webm|ogg)$/i.test(mediaUrl);
      setMediaType(isVideo ? 'video' : 'image');
    }
  }, [mediaUrl]);

  useEffect(() => {
    setLiked(Array.isArray(likedBy) && likedBy.includes(currentUser.uid));
  }, [likedBy, currentUser.uid]);

  useEffect(() => {
    const handleClickOutside = e => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const openEmojiPicker = () => {
    if (emojiBtnRef.current) {
      const rect = emojiBtnRef.current.getBoundingClientRect();
    }
    setShowEmoji(true);
  };


  const createdDate = createdAt?.toDate?.();
  const timeString = createdDate
    ? createdDate.toLocaleDateString('he-IL', {
      year: 'numeric', month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit'
    })
    : '';

  const isVideo = /\.(mp4|webm|ogg)$/i.test(mediaUrl);

  const handleDelete = () => setShowConfirmDelete(true);

  const confirmDelete = async () => {
    if (!id || !onDelete) return;
    try {
      await onDelete(id);
      toast.success('הפוסט נמחק בהצלחה');
      setMenuOpen(false);
      setShowConfirmDelete(false);
    } catch (err) {
      console.error('Error deleting post:', err);
      toast.error('מחיקת הפוסט נכשלה. נסה שוב.');
      setShowConfirmDelete(false);
    }
  };

  const cancelDelete = () => setShowConfirmDelete(false);

  const handleSaveEdit = async () => {
    if (!id || !onUpdate) return;

    if (containsBadWord(newContent)) {
      setWarning('התוכן מכיל מילים לא ראויות!');
      setTimeout(() => setWarning(''), 3500);
      return;
    }
    try {
      await onUpdate(id, { content: newContent, mediaFile: newMediaFile });
      toast.success('הפוסט עודכן בהצלחה');
      setEditing(false);
      setNewMediaFile(null);
    } catch (err) {
      console.error('Error updating post:', err);
      toast.error('שגיאה בעדכון הפוסט. נסה שוב.');
    }
  }
  const insertEmoji = (emojiObject) => {
    const sym = emojiObject.emoji;
    const textarea = document.getElementById(`edit-textarea-${id}`);
    if (!textarea) {
      setNewContent(prev => prev + sym);
      return;
    }
    const [start, end] = [textarea.selectionStart, textarea.selectionEnd];
    setNewContent(prev => prev.slice(0, start) + sym + prev.slice(end));
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + sym.length, start + sym.length);
    }, 0);
  };

  const toggleLike = async () => {
    if (currentUser?.role === 'staff' || !id || !onLike || !currentUser) return;

    try {
      const newState = !liked;
      setLiked(newState);
      setFloatLike(true);
      await onLike(id, newState);
      setTimeout(() => setFloatLike(false), 600);
    } catch (err) {
      console.error('Error toggling like:', err);
      toast.error('שגיאה בעדכון הלייק');
    }
  };

  const toggleCommentsSection = () => {
    setShowComments(prev => !prev);
    if (showComments) setReplyTo(null);
  };

  const submitComment = text => {
    if (currentUser?.role === 'staff') return;

    if (replyTo) {
      onAddComment(id, text, replyTo);
      setReplyTo(null);
    } else {
      onAddComment(id, text);
    }
  };

  const pickMedia = () => fileInputRef.current?.click();

  const onMediaChange = async e => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file size (max 100MB for videos, 10MB for images)
    const maxSize = isVideo ? 100 * 1024 * 1024 : 10 * 1024 * 1024;
    if (file.size > maxSize) {
      toast.error(`הקובץ גדול מדי. הגודל המקסימלי הוא ${isVideo ? '100MB' : '10MB'}`);
      return;
    }

    // Validate file type
    const validVideoTypes = ['video/mp4', 'video/webm', 'video/ogg'];
    const validImageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

    if (isVideo && !validVideoTypes.includes(file.type)) {
      alert('Invalid video format. Please use MP4, WebM, or OGG format.');
      return;
    }

    if (!isVideo && !validImageTypes.includes(file.type)) {
      alert('Invalid image format. Please use JPEG, PNG, GIF, or WebP format.');
      return;
    }

    try {
      // For videos, we might want to check if the video is playable
      if (isVideo) {
        const videoBlob = URL.createObjectURL(file);
        const video = document.createElement('video');
        video.src = videoBlob;

        await new Promise((resolve, reject) => {
          video.onloadedmetadata = () => {
            URL.revokeObjectURL(videoBlob);
            // Check if video duration is reasonable (e.g., max 5 minutes)
            if (video.duration > 300) { // 5 minutes in seconds
              reject(new Error('Video too long. Maximum duration is 5 minutes.'));
            } else {
              resolve();
            }
          };
          video.onerror = () => reject(new Error('Invalid video file'));
        });
      }

      setNewMediaFile(file);
    } catch (err) {
      alert(err.message || 'Error processing media file');
      e.target.value = ''; // Reset input
      return;
    }
  };

  if (error) {
    return <div className="p-4 text-center text-red-500">{error}</div>;
  }

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
      <div
        dir="rtl"
        className={`mb-8 max-w-4xl mx-auto rounded-xl overflow-hidden shadow-sm bg-white border border-${element}-accent hover:shadow-md transition-shadow duration-300 pb-2`}
      >
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept="image/*,video/*"
          onChange={onMediaChange}
        />

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4">
          <div className="flex items-center gap-3 cursor-pointer"
            onClick={() => navigate(`/profile/${authorProfile?.username}`)}
          >
            {/* User profile picture */}
            <img
              src={authorProfile?.photoURL || '/profile.jpg'}
              alt={authorProfile?.username || 'משתמש'}
              className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover ring-2 ring-${element}-accent ring-offset-1`}
            />
            <div className="flex flex-col">
              <p className="text-xl font-bold">{authorProfile?.username || '...'}</p>
              <p className="text-sm text-gray-500">{timeString}</p>
            </div>
          </div>
          {isOwner && (
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setMenuOpen(prev => !prev)}
                className={`p-2 rounded-full transition-colors duration-200 text-${element}-accent hover:text-${element} hover:bg-${element}-soft`}
              >
                <MoreHorizontal size={25} />
              </button>
              {menuOpen && (
                <div className={`absolute left-0 top-full mt-1 w-36 border border-${element}-accent rounded-lg shadow-lg overflow-hidden z-10 bg-white`}>
                  <button
                    onClick={() => { setEditing(prev => !prev); setMenuOpen(false); }}
                    className={`w-full text-right px-4 py-2 text-sm hover:bg-${element}-soft transition-colors flex items-center gap-2`}
                  >
                    <Edit2 size={16} className={`text-${element}`} />
                    <span className={`text-${element} font-medium`}>
                      {editing ? 'ביטול עריכה' : 'ערוך פוסט'}
                    </span>
                  </button>
                  <button
                    onClick={handleDelete}
                    className={`w-full text-right px-4 py-2 text-sm text-red-600 hover:bg-${element}-soft transition-colors flex items-center gap-2`}
                  >
                    <Trash2 size={16} className="text-red-500" />
                    מחק פוסט
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="px-5 pb-2">
          {editing ? (
            <div className="relative mb-3">
              <textarea
                id={`edit-textarea-${id}`}
                value={newContent}
                onChange={e => setNewContent(e.target.value)}
                rows={4}
                dir="rtl"
                className={`w-full border rounded-lg p-3 resize-none focus:ring-2 focus:ring-${element}-accent focus:border-${element}-accent border-${element}-soft transition-all outline-none`}
                placeholder="מה בליבך?"
              />
              <div className="flex justify-end gap-2 mt-2 items-center">
                {/* Emoji Button on the left */}
                <div className="relative">
                  <button
                    type="button"
                    ref={emojiBtnRef}
                    onClick={openEmojiPicker}
                    className={`
                      hidden
                    px-2 py-2 rounded-md 
                    bg-${element}-soft 
                    text-${element} 
                    hover:bg-${element}-accent 
                    hover:text-white 
                    transition-colors
                    md:flex items-center
                  `}
                    aria-label="הוסף אימוג׳י"
                    tabIndex={-1}
                    style={{ zIndex: 10 }}
                  >
                    <Smile size={18} />
                  </button>
                  {/* Emoji Picker Portal */}
                  <EmojiPickerPopover
                    anchorRef={emojiBtnRef}
                    open={showEmoji}
                    onClose={() => setShowEmoji(false)}
                    onEmojiClick={(emojiObject) => {
                      insertEmoji(emojiObject);
                    }}
                  />
                </div>
                {/* Cancel Button */}
                <button
                  onClick={() => setEditing(false)}
                  className={`px-4 py-2 text-sm rounded-md text-${element}-accent bg-${element}-soft hover:bg-${element}-accent hover:text-white transition-colors`}
                >
                  ביטול
                </button>
                {/* Save Button */}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  onClick={handleSaveEdit}
                  className={`px-4 py-2 text-sm text-white rounded-md bg-${element} hover:bg-${element}-accent transition-colors flex items-center gap-1`}
                >
                  <Check size={16} />
                  שמור שינויים
                </motion.button>
              </div>

            </div>
          ) : (
            <p className="px-5 pb-2 text-base leading-relaxed whitespace-pre-wrap break-words break all overflow-hidden">{content}</p>
          )}
        </div>

        {/* Media */}
        {mediaUrl && !showPostModal && (
          <div
            className={`relative w-full overflow-hidden bg-${element}-soft ${editing ? '' : 'cursor-pointer group'
              }`}
            onClick={() => {
              if (!editing && !showPostModal) setShowPostModal(true);
            }}
          >
            {editing && (
              <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black bg-opacity-40 backdrop-blur-sm cursor-pointer"
              onClick={pickMedia}>
                <Camera className="w-10 h-10 text-white" />
                <p className="text-white mt-2 font-medium">החלף מדיה</p>
              </div>
            )}
            <div className={`group relative w-full max-h-[28rem] overflow-hidden flex justify-center items-center bg-${element}-soft cursor-pointer`}>
              {!editing && (
                <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                  <span className="text-white text-sm font-medium bg-black/40 px-3 py-1 rounded-full">הצג פוסט</span>
                </div>
              )}

              {mediaType === 'video' ? (
                <video
                  src={newMediaFile ? URL.createObjectURL(newMediaFile) : mediaUrl}
                  controls
                  preload="metadata"
                  className="max-h-[40rem] w-auto object-contain"
                  onError={(e) => {
                    console.error('Video loading error:', e);
                    // Fallback to image if video fails to load
                    e.target.style.display = 'none';
                  }}
                >
                  <source src={newMediaFile ? URL.createObjectURL(newMediaFile) : mediaUrl} />
                  הדפדפן שלך אינו תומך בהצגת וידאו.
                </video>
              ) : (
                <img
                  src={newMediaFile ? URL.createObjectURL(newMediaFile) : mediaUrl}
                  alt="תוכן הפוסט"
                  className="max-h-[40rem] w-full object-cover"
                  onError={(e) => {
                    console.error('Image loading error:', e);
                    e.target.alt = 'שגיאה בטעינת התמונה';
                  }}
                />
              )}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className={`px-5 py-3 flex items-center justify-between border-t border-${element}-soft`}>
          <div className="flex items-center gap-6">
            <div className="relative">
              {currentUser.role !== 'staff' ? (
                <button
                  onClick={toggleLike}
                  className="flex items-center gap-2 group"
                  aria-label={liked ? 'הסר לייק' : 'הוסף לייק'}
                >
                  <div
                    className={`p-1.5 rounded-full transition-colors ${liked
                      ? `bg-${element} text-white`
                      : `bg-${element}-soft text-${element} hover:bg-${element}-accent`
                      }`}
                  >
                    <ThumbsUp
                      size={18}
                      className={liked ? 'fill-white' : `group-hover:fill-${element}-accent`}
                    />
                  </div>
                  <span className="text-sm font-medium transition-colors">{likesCount}</span>
                </button>
              ) : (
                <div className="flex items-center gap-2 cursor-default opacity-70">
                  <div className={`p-1.5 rounded-full bg-${element}-soft text-${element}`}>
                    <ThumbsUp size={18} />
                  </div>
                  <span className="text-sm font-medium">{likesCount}</span>
                </div>
              )}

              {/* Floating Icon Animation */}
              <AnimatePresence>
                {floatLike && (
                  <motion.div
                    initial={{ opacity: 1, y: 0, scale: 1 }}
                    animate={{ opacity: 0, y: -40, scale: 1.5 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.6 }}
                    className={`absolute bottom-8 left-1/2 -translate-x-1/2 text-${element} pointer-events-none`}
                  >
                    <ThumbsUp size={24} className="fill-current" />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <button onClick={toggleCommentsSection} className="flex items-center gap-2 group" aria-label="הצג תגובות">
              <div className={`p-1.5 rounded-full transition-colors bg-${element}-soft text-${element} hover:bg-${element}-accent hover:text-white`}>
                <MessageCircle size={18} />
              </div>
              <span className="text-sm font-medium transition-colors group-hover:text-${element}">{commentsCount}</span>
            </button>
          </div>

          {editing && (
            <div className="flex items-center gap-2">
              <button onClick={handleDelete} className="flex items-center gap-1 px-3 py-1.5 text-xs text-red-600 bg-red-50 rounded-md hover:bg-red-100 transition-colors">
                <Trash2 size={14} /> מחק
              </button>
            </div>
          )}
        </div>

        {/* Comments Section */}
        <AnimatePresence initial={false}>
          {showComments && (
            <motion.div
              ref={commentsRef}
              className="px-5 py-4 border-t border-gray-200"
              key="comments-section"
              initial={{ y: -24, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -24, opacity: 0 }}
              transition={{ duration: 0.40 }}
            >
              {currentUser && currentUser.role !== 'staff' ? (
                <div className="flex gap-3 mb-4">
                  <img src={currentUser.photoURL || '/profile.jpg'} className="w-8 h-8 rounded-full object-cover" />
                  <CommentInput placeholder="הוסף תגובה..." element={element} onSubmit={submitComment} />
                </div>
              ) : (
                <p className="text-center text-sm text-gray-500 mb-4">אנשי צוות לא יכולים להגיב.</p>
              )}
              {comments.length > 0 ? (
                comments.map(c => (
                  <Comment
                    key={c.id}
                    comment={c}
                    element={element}
                    currentUser={currentUser}
                    onReply={currentUser?.role === 'staff' ? undefined : setReplyTo}
                    onEdit={onEditComment}
                    onDelete={(postId, commentId, isReply, parentCommentId) =>
                      setCommentToDelete({ postId, commentId, isReply, parentCommentId })
                    }
                    replyingToId={replyTo}
                    onSubmitReply={submitComment}
                    onCancelReply={() => setReplyTo(null)}
                    postId={id}
                    postAuthorId={post.authorId}
                    getAuthorProfile={getAuthorProfile}
                  />
                ))
              ) : (
                <p className="text-center text-gray-500">אין תגובות עדיין.</p>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {showPostModal && (
        <div className="fixed inset-0 z-40">
          {/* FULLSCREEN BLUR */}
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm" />
          {/* MODAL CONTENT */}
          <div className="flex items-center justify-center w-full h-full p-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.25 }}
              className="relative w-full max-w-3xl max-h-[90vh] bg-white rounded-xl overflow-hidden shadow-xl flex flex-col pointer-events-auto"
              onClick={e => e.stopPropagation()}
            >
              <button
                onClick={() => setShowPostModal(false)}
                className={`absolute top-4 left-4 z-50 text-${element} bg-white hover:bg-${element}-soft border border-${element}-accent p-2 rounded-full shadow-md transition-all`}
                aria-label="סגור פוסט"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="overflow-y-auto px-6 pt-10 pb-6 flex-1">
                <PostModalContent
                  post={post}
                  element={element}
                  currentUser={currentUser}
                  comments={comments}
                  onAddComment={onAddComment}
                  onEditComment={onEditComment}
                  onDeleteComment={onDeleteComment}
                  onLike={onLike}
                  onDelete={onDelete}
                  onUpdate={onUpdate}
                  isOwner={isOwner}
                  getAuthorProfile={getAuthorProfile}
                />
              </div>
            </motion.div>
          </div>
        </div>
      )}
      <ConfirmationModal
        open={showConfirmDelete}
        title="מחיקת פוסט"
        message="האם אתה בטוח שברצונך למחוק את הפוסט הזה?"
        confirmText="מחק"
        cancelText="ביטול"
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
        element={element}
      />

      <ConfirmationModal
        open={!!commentToDelete}
        title="מחיקת תגובה"
        message="האם אתה בטוח שברצונך למחוק את התגובה הזו?"
        confirmText="מחק"
        cancelText="ביטול"
        onConfirm={() => {
          if (commentToDelete) {
            onDeleteComment(
              commentToDelete.postId,
              commentToDelete.commentId,
              commentToDelete.isReply,
              commentToDelete.parentCommentId
            );
            setCommentToDelete(null);
          }
        }}
        onCancel={() => setCommentToDelete(null)}
        element={element}
      />
    </>
  );
};

export default Post;