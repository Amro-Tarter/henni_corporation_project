import React, { useState, useEffect, useRef } from 'react';
import { ThumbsUp, MessageCircle, MoreHorizontal, Camera, Trash2, Check } from 'lucide-react';
import { Comment, CommentInput } from './comments';

const ProfilePost = ({
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
  const [menuOpen, setMenuOpen] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [replyTo, setReplyTo] = useState(null);
  const [liked, setLiked] = useState(false);
  const [authorProfile, setAuthorProfile] = useState(null);

  const fileInputRef = useRef(null);
  const menuRef = useRef(null);
  const commentsRef = useRef(null);

  useEffect(() => {
    const fetch = async () => {
      const profile = await getAuthorProfile(post.authorId);
      setAuthorProfile(profile);
    };
    fetch();
  }, [post.authorId, getAuthorProfile]);


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
    if (showComments && commentsRef.current) {
      commentsRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [showComments]);

  const createdDate = createdAt?.toDate?.();
  const timeString = createdDate
    ? createdDate.toLocaleDateString('he-IL', {
        year: 'numeric', month: 'short', day: 'numeric',
        hour: '2-digit', minute: '2-digit'
      })
    : '';

  const isVideo = /\.(mp4|webm|ogg)$/i.test(mediaUrl);

  const handleDelete = () => {
    if (window.confirm('האם אתה בטוח שברצונך למחוק את הפוסט הזה?')) {
      onDelete(id);
      setMenuOpen(false);
    }
  };

  const handleSaveEdit = () => {
    onUpdate(id, { content: newContent, mediaFile: newMediaFile });
    setEditing(false);
    setNewMediaFile(null);
  };

  const toggleLike = () => {
    const newState = !liked;
    setLiked(newState);
    onLike(id, newState);
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
    <div
      dir="rtl"
      className={`mb-8 max-w-4xl mx-auto rounded-xl overflow-hidden shadow-sm bg-white border border-${element}-accent hover:shadow-md transition-shadow duration-300 pb-2`}
    >
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        accept={isVideo ? 'video/*' : 'image/*'}
        onChange={onMediaChange}
      />

      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4">
        <div className="flex items-center gap-3">
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
                  className={`w-full text-right px-4 py-2 text-sm hover:bg-${element}-soft transition-colors`}
                >
                  {editing ? 'ביטול עריכה' : 'ערוך פוסט'}
                </button>
                <button
                  onClick={handleDelete}
                  className={`w-full text-right px-4 py-2 text-sm text-red-600 hover:bg-${element}-soft transition-colors`}
                >
                  מחק פוסט
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="px-5 pb-4">
        {editing ? (
          <div className="relative mb-3">
            <textarea
              value={newContent}
              onChange={e => setNewContent(e.target.value)}
              rows={4}
              dir="rtl"
              className={`w-full border rounded-lg p-3 resize-none focus:ring-2 focus:ring-${element}-accent focus:border-${element}-accent border-${element}-soft transition-all outline-none`}
              placeholder="מה בליבך?"
            />
            <div className="flex justify-end gap-2 mt-2">
              <button
                onClick={() => setEditing(false)}
                className={`px-4 py-2 text-sm rounded-md text-${element}-accent bg-${element}-soft hover:bg-${element}-accent hover:text-white transition-colors`}
              >
                ביטול
              </button>
              <button
                onClick={handleSaveEdit}
                className={`px-4 py-2 text-sm text-white rounded-md bg-${element} hover:bg-${element}-accent transition-colors flex items-center gap-1`}
              >
                <Check size={16} />
                שמור שינויים
              </button>
            </div>
          </div>
        ) : (
          <p className="px-5 pb-2 text-base leading-relaxed">{content}</p>
        )}
      </div>

      {/* Media */}
      {mediaUrl && (
        <div
          className={`relative w-full overflow-hidden bg-${element}-soft ${editing ? 'cursor-pointer' : ''}`}
          onClick={editing ? pickMedia : undefined}
        >
          {editing && (
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black bg-opacity-40 backdrop-blur-sm">
              <Camera className="w-10 h-10 text-white" />
              <p className="text-white mt-2 font-medium">החלף מדיה</p>
            </div>
          )}
          <div className="w-full max-h-[40rem] overflow-hidden flex justify-center items-center bg-${element}-soft">
            {isVideo ? (
              <video
                src={newMediaFile ? URL.createObjectURL(newMediaFile) : mediaUrl}
                controls
                className="max-h-[40rem] w-auto object-contain"
              />
            ) : (
              <img
                src={newMediaFile ? URL.createObjectURL(newMediaFile) : mediaUrl}
                alt="תוכן הפוסט"
                className="max-h-[40rem] w-full object-cover"
              />
            )}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className={`px-5 py-3 flex items-center justify-between border-t border-${element}-soft`}> 
        <div className="flex items-center gap-6">
          <button onClick={toggleLike} className="flex items-center gap-2 group" aria-label={liked ? 'הסר לייק' : 'הוסף לייק'}>
            <div className={`p-1.5 rounded-full transition-colors ${liked ? `bg-${element} text-white` : `bg-${element}-soft text-${element} hover:bg-${element}-accent`} `}>
              <ThumbsUp size={18} className={liked ? 'fill-white' : `group-hover:fill-${element}-accent`} />
            </div>
            <span className="text-sm font-medium transition-colors">{likesCount}</span>
          </button>

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
      {showComments && (
        <div ref={commentsRef} className="px-5 py-4 border-t border-gray-200">
          <div className="flex gap-3 mb-4">
            <img src={currentUser.photoURL} alt="" className="w-8 h-8 rounded-full" />
            <CommentInput placeholder="הוסף תגובה..." element={element} onSubmit={submitComment} />
          </div>
          {replyTo && (
            <div className="ml-12 mb-4">
              <CommentInput placeholder="הגב..." element={element} onSubmit={submitComment} onCancel={() => setReplyTo(null)} />
            </div>
          )}
          {comments.length > 0 ? (
            comments.map(c => (
              <Comment
                key={c.id}
                comment={c}
                element={element}
                currentUser={currentUser}
                onReply={setReplyTo}
                onEdit={onEditComment}
                onDelete={onDeleteComment}
                postId={id}
                postAuthorId={post.authorId}
                getAuthorProfile={getAuthorProfile}
              />
            ))
          ) : (
            <p className="text-center text-gray-500">אין תגובות עדיין.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default ProfilePost;
