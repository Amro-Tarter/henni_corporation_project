import React, { useState, useEffect, useRef } from 'react';
import { ThumbsUp, MessageCircle, MoreHorizontal, Camera, Trash2, Check, X, Smile, Edit2, Users } from 'lucide-react';
import { Comment, CommentInput } from '../social/comments';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '/src/hooks/use-toast.jsx';
import ConfirmationModal from '../social/ConfirmationModal';
import EmojiPicker from 'emoji-picker-react';
import { containsBadWord } from '../social/utils/containsBadWord';

const Project = ({
  project,
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
  getUserProfile,
  allUsers // Needed for collaborators display
}) => {
  const {
    id,
    createdAt,
    title,
    description,
    mediaUrl,
    mediaType,
    likesCount = 0,
    commentsCount = 0,
    likedBy = [],
    collaborators = [],
    authorId,
  } = project;

  const [editing, setEditing] = useState(false);
  const [newDescription, setNewDescription] = useState(description);
  const [newMediaFile, setNewMediaFile] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [replyTo, setReplyTo] = useState(null);
  const [liked, setLiked] = useState(false);
  const [authorProfile, setAuthorProfile] = useState(null);
  const [collaboratorProfiles, setCollaboratorProfiles] = useState([]);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [commentToDelete, setCommentToDelete] = useState(null);
  const [warning, setWarning] = useState('');
  const [showEmoji, setShowEmoji] = useState(false);
  const [floatLike, setFloatLike] = useState(false);
  const emojiBtnRef = useRef();
  const emojiPickerRef = useRef();
  const [emojiPos, setEmojiPos] = useState({ x: 0, y: 0 });
  const [newTitle, setNewTitle] = useState(title);
  const [newCollaborators, setNewCollaborators] = useState(collaborators);
  const [showUsers, setShowUsers] = useState(false);
  const [collabSearch, setCollabSearch] = useState('');
  const usersPopupRef = useRef();
  const { toast } = useToast();
  const fileInputRef = useRef(null);
  const menuRef = useRef(null);
  const commentsRef = useRef(null);
  const navigate = useNavigate();

  // Fetch project owner and collaborators' profiles
  useEffect(() => {
    async function fetchProfiles() {
      setAuthorProfile(await getUserProfile(authorId));
      // collaborators: array of UIDs
      if (Array.isArray(collaborators)) {
        const results = await Promise.all(
          collaborators.map(uid => getUserProfile(uid))
        );
        setCollaboratorProfiles(results.filter(Boolean));
      }
    }
    fetchProfiles();
  }, [authorId, collaborators, getUserProfile]);

  useEffect(() => {
    if (!showUsers) return;
    function handleClick(e) {
      if (
        usersPopupRef.current &&
        !usersPopupRef.current.contains(e.target)
      ) {
        setShowUsers(false);
      }
    }
    window.addEventListener('mousedown', handleClick);
    return () => window.removeEventListener('mousedown', handleClick);
  }, [showUsers]);


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

  useEffect(() => {
    if (!showEmoji) return;
    function handleClick(e) {
      if (
        emojiPickerRef.current &&
        !emojiPickerRef.current.contains(e.target) &&
        emojiBtnRef.current &&
        !emojiBtnRef.current.contains(e.target)
      ) {
        setShowEmoji(false);
      }
    }
    window.addEventListener('mousedown', handleClick);
    return () => window.removeEventListener('mousedown', handleClick);
  }, [showEmoji]);

  const openEmojiPicker = () => {
    if (emojiBtnRef.current) {
      const rect = emojiBtnRef.current.getBoundingClientRect();
      setEmojiPos({
        x: rect.left,
        y: rect.bottom + 8,
      });
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

  const handleDelete = () => setShowConfirmDelete(true);

  const confirmDelete = () => {
    onDelete(id);
    setShowConfirmDelete(false);
    setMenuOpen(false);
  };

  const cancelDelete = () => setShowConfirmDelete(false);

  const handleSaveEdit = () => {
    if (containsBadWord(newTitle) || containsBadWord(newDescription)) {
      setWarning('הפרויקט מכיל מילים לא ראויות!');
      setTimeout(() => setWarning(''), 3500);
      return;
    }
    onUpdate(id, {
      title: newTitle,
      description: newDescription,
      collaborators: newCollaborators
    });
    toast({
      title: 'הצלחה',
      description: 'הפרויקט עודכן בהצלחה 🎉',
      variant: 'success',
    });
    setEditing(false);
  };


  const insertEmoji = (emojiObject) => {
    const sym = emojiObject.emoji;
    const textarea = document.getElementById(`edit-textarea-${id}`);
    if (!textarea) {
      setNewDescription(prev => prev + sym);
      return;
    }
    const [start, end] = [textarea.selectionStart, textarea.selectionEnd];
    setNewDescription(prev => prev.slice(0, start) + sym + prev.slice(end));
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + sym.length, start + sym.length);
    }, 0);
  };

  const toggleLike = () => {
    const newState = !liked;
    setLiked(newState);
    setFloatLike(true);
    onLike(id, newState);
    setTimeout(() => setFloatLike(false), 600);
  };


  const toggleCommentsSection = () => {
    setShowComments(prev => !prev);
    if (showComments) setReplyTo(null);
  };

  const submitComment = text => {
    if (replyTo) {
      onAddComment(id, text, replyTo);
      setReplyTo(null);
    } else {
      onAddComment(id, text);
    }
  };

  const pickMedia = () => fileInputRef.current?.click();
  const onMediaChange = e => {
    const file = e.target.files[0];
    if (file) setNewMediaFile(file);
  };

  return (
    <>
      {warning && (
        <div
          style={{
            position: 'fixed',
            top: '65px',
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
              src={authorProfile?.photoURL || '/default_user_pic.jpg'}
              alt={authorProfile?.username || 'משתמש'}
              className={`w-12 h-12 rounded-full object-cover ring-2 ring-${element}-accent ring-offset-1`}
            />
            <div className="flex flex-col">
              <h3 className="text-lg font-bold">{authorProfile?.username || '...'}</h3>
              <p className="text-xs text-gray-500">{timeString}</p>
            </div>
          </div>
          {isOwner &&(
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setMenuOpen(prev => !prev)}
                className={`p-2 rounded-full transition-colors duration-200 text-${element}-accent hover:text-${element} hover:bg-${element}-soft`}
              >
                <MoreHorizontal size={20} />
              </button>
              {menuOpen && (
                <div className={`absolute left-0 top-full mt-1 w-36 border border-${element}-accent rounded-lg shadow-lg overflow-hidden z-10 bg-white`}> 
                  <button
                    onClick={() => { setEditing(prev => !prev); setMenuOpen(false); }}
                    className={`w-full text-right px-4 py-2 text-sm hover:bg-${element}-soft transition-colors flex items-center gap-2`}
                  >
                    <Edit2 size={16} className={`text-${element}`} />
                    <span className={`text-${element} font-medium`}>
                      {editing ? 'ביטול עריכה' : 'ערוך פרויקט'}
                    </span>
                  </button>
                  <button
                    onClick={handleDelete}
                    className={`w-full text-right px-4 py-2 text-sm text-red-600 hover:bg-${element}-soft transition-colors flex items-center gap-2`}
                  >
                    <Trash2 size={16} className="text-red-500" />
                    מחק פרויקט
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* --- Edit Mode --- */}
        {editing ? (
          <>
            <div className="px-5 pb-1 flex items-center gap-4">
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
                value={newTitle}
                onChange={e => setNewTitle(e.target.value)}
                placeholder="כותרת הפרויקט"
              />
            </div>

            <div className="px-5 flex items-center gap-2 mt-6 mb-6 relative z-20 flex-wrap">
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
                <Users size={16} /> הוסף משתפי פעולה
              </button>
              {newCollaborators.map(uid => {
                const u = allUsers.find(x => x.id === uid);
                if (!u) return null;
                return (
                  <div
                    key={uid}
                    className={`flex items-center bg-${element}-soft px-2 py-1 rounded-full text-xs gap-2 border border-${element}-accent hover:bg-${element}-soft/80 transition`}
                  >
                    <img src={u.photoURL || '/default_user_pic.jpg'} className="w-5 h-5 rounded-full mr-1" alt={u.username} />
                    <span className={`text-${element}-dark font-medium`}>{u.username}</span>
                    <button
                      type="button"
                      onClick={() => setNewCollaborators(newCollaborators.filter(id => id !== uid))}
                      className={`ml-2 text-${element}-accent hover:text-red-600 transition`}
                      aria-label="הסר משתף"
                    >
                      <X size={13} />
                    </button>
                  </div>
                );
              })}
              {showUsers && (
                <div
                  ref={usersPopupRef}
                  className="absolute mt-12 right-0 bg-white shadow-xl rounded-xl border border-gray-200 p-4 z-50 min-w-[240px]"
                >
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
                        !newCollaborators.includes(u.id) &&
                        u.username.toLowerCase().includes(collabSearch.trim().toLowerCase())
                      )
                      .map(user => (
                        <div
                          key={user.id}
                          className={`flex items-center bg-${element}-soft px-2 py-1 rounded-full text-xs gap-2 border border-${element}-accent hover:bg-${element}-soft/80 transition`}
                          onClick={() => {
                            setNewCollaborators([...newCollaborators, user.id]);
                            setCollabSearch('');
                          }}
                        >
                          <img src={user.photoURL || '/default_user_pic.jpg'} className="w-6 h-6 rounded-full" alt={user.username} />
                          <span className="text-sm">{user.username}</span>
                        </div>
                      ))}
                    {allUsers.filter(u =>
                      !newCollaborators.includes(u.id) &&
                      u.username.toLowerCase().includes(collabSearch.trim().toLowerCase())
                    ).length === 0 && (
                      <div className="text-xs text-gray-400 px-2 py-1">לא נמצאו משתמשים</div>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="px-5 pb-4 mt-6">
              <div className="relative mb-3">
                <textarea
                  id={`edit-textarea-${id}`}
                  value={newDescription}
                  onChange={e => setNewDescription(e.target.value)}
                  rows={4}
                  dir="rtl"
                  className={`w-full border rounded-lg p-3 resize-none focus:ring-2 focus:ring-${element}-accent focus:border-${element}-accent border-${element}-soft transition-all outline-none`}
                  placeholder="מה בליבך?"
                />
                <div className="flex justify-end gap-2 mt-2 items-center">
                  <button
                    type="button"
                    ref={emojiBtnRef}
                    onClick={openEmojiPicker}
                    className={`
                      px-2 py-2 rounded-md 
                      bg-${element}-soft 
                      text-${element} 
                      hover:bg-${element}-accent 
                      hover:text-white 
                      transition-colors
                      flex items-center
                    `}
                    aria-label="הוסף אימוג׳י"
                    tabIndex={-1}
                    style={{ zIndex: 10 }}
                  >
                    <Smile size={18} />
                  </button>
                  <button
                    onClick={() => setEditing(false)}
                    className={`px-4 py-2 text-sm rounded-md text-${element}-accent bg-${element}-soft hover:bg-${element}-accent hover:text-white transition-colors`}
                  >
                    ביטול
                  </button>
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
                {showEmoji && (
                  <div
                    ref={emojiPickerRef}
                    style={{
                      position: 'fixed',
                      left: emojiPos.x,
                      top: emojiPos.y,
                      zIndex: 1000,
                    }}
                  >
                    <EmojiPicker
                      onEmojiClick={insertEmoji}
                      autoFocusSearch={false}
                      theme="light"
                      width={350}
                      height={400}
                    />
                  </div>
                )}
              </div>
            </div>
          </>
        ) : (
          // -------- NOT EDITING MODE: SPACING ADDED! --------
          <div className="px-5 pb-4 flex flex-col gap-6">
            <div>
              <h2 className={`font-bold text-xl text-${element}`}>{title}</h2>
            </div>

            {collaboratorProfiles.length > 0 && (
              <div className="flex items-center gap-2">
                <Users size={18} className={`text-${element}-accent`} />
                <span className="text-sm font-medium text-gray-700">משתפי פעולה:</span>
                {collaboratorProfiles.map((c, idx) => (
                  <button
                    key={c.uid || c.id || idx}
                    type="button"
                    onClick={() => navigate(`/profile/${c.username}`)}
                    className={`flex items-center bg-${element}-soft px-2 py-1 rounded-full text-xs gap-2 border border-${element}-accent hover:bg-${element}-soft/80 hover:scale-105
                                transition duration-130`}
                    title={`לבקר את הפרופיל של ${c.username}`}
                    tabIndex={0}
                  >
                    <img
                      src={c.photoURL || '/default_user_pic.jpg'}
                      alt={c.username}
                      className="w-6 h-6 rounded-full object-cover"
                    />
                    <span className="font-medium">{c.username}</span>
                  </button>
                ))}
              </div>
            )}

            <div>
              <p className="text-base leading-relaxed whitespace-pre-wrap break-words break-all overflow-hidden">{description}</p>
            </div>
          </div>
        )}

        {/* Media */}
        {mediaUrl && (
          <div className={`relative w-full overflow-hidden bg-${element}-soft`}>
            <div className="group relative w-full max-h-[40rem] overflow-hidden flex justify-center items-center bg-${element}-soft cursor-pointer">
              {mediaType === 'video' ? (
                <video
                  src={newMediaFile ? URL.createObjectURL(newMediaFile) : mediaUrl}
                  controls
                  className="max-h-[40rem] w-auto object-contain"
                />
              ) : (
                <img
                  src={newMediaFile ? URL.createObjectURL(newMediaFile) : mediaUrl}
                  alt="תוכן הפרויקט"
                  className="max-h-[40rem] w-full object-cover"
                />
              )}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className={`px-5 py-3 flex items-center justify-between border-t border-${element}-soft`}>
          <div className="flex items-center gap-6">
            <div className="relative">
              <button
                onClick={toggleLike}
                className="flex items-center gap-2 group"
                aria-label={liked ? 'הסר לייק' : 'הוסף לייק'}
              >
                <div
                  className={`p-1.5 rounded-full transition-colors ${
                    liked
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
              <div>
                <div className="flex gap-3 mb-4">
                  <img src={currentUser.photoURL} alt="" className="w-8 h-8 rounded-full" />
                  <CommentInput placeholder="הוסף תגובה..." element={element} onSubmit={submitComment} />
                </div>
                {comments.length > 0 ? (
                  comments.map(c => (
                    <Comment
                      key={c.id}
                      comment={c}
                      element={element}
                      currentUser={currentUser}
                      onReply={setReplyTo}
                      onEdit={onEditComment}
                      onDelete={() =>
                        setCommentToDelete({
                          projectId: id,
                          commentId: c.id,
                          isReply: c.parentCommentId ? true : false,
                          parentCommentId: c.parentCommentId || null,
                        })
                      }
                      replyingToId={replyTo}
                      onSubmitReply={(text, parentId) => {
                        onAddComment(id, text, parentId);
                        setReplyTo(null);
                      }}
                      onCancelReply={() => setReplyTo(null)}
                      postId={id}
                      postAuthorId={authorId}
                      getAuthorProfile={getUserProfile}
                    />
                  ))
                ) : (
                  <p className="text-center text-gray-500">אין תגובות עדיין.</p>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <ConfirmationModal
        open={showConfirmDelete}
        title="מחיקת פרויקט"
        message="האם אתה בטוח שברצונך למחוק את הפרויקט הזה?"
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
              commentToDelete.projectId,
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
export default Project;
