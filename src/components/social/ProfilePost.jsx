import React, { useState, useEffect, useRef } from 'react';
import { FaThumbsUp as ThumbsUpIcon, FaComment, FaEllipsisH, FaCameraRetro } from 'react-icons/fa';

/**
 * ProfilePost component delegates data operations via callbacks.
 * Props:
 *  - post: { id, authorPhotoURL, authorName, createdAt, content, mediaUrl,
 *           likesCount, commentsCount, likedBy }
 *  - onDelete(id): called when user confirms deletion
 *  - onUpdate(id, { content, mediaFile }): called when user confirms edits
 *  - onLike(id, liked): called when user toggles like; parent should update DB
 */
const ProfilePost = ({ post, onDelete, onUpdate, onLike }) => {
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
  const fileInputRef = useRef(null);

  // Determine if this user has liked
  const [liked, setLiked] = useState(false);
  useEffect(() => {
    setLiked(Array.isArray(likedBy) && likedBy.includes(post.authorId || ''));
  }, [likedBy, post.authorId]);

  // Format timestamp
  const createdDate = createdAt?.toDate?.();
  const timeString = createdDate
    ? createdDate.toLocaleDateString('he-IL', {
        year: 'numeric', month: 'short', day: 'numeric',
        hour: '2-digit', minute: '2-digit'
      })
    : '';

  // Video check
  const isVideo = mediaUrl && /\.(mp4|webm|ogg)$/i.test(mediaUrl);

  // Handlers
  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this post?')) {
      onDelete(id);
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

  return (
    <div className="bg-white border border-orange-200 rounded-2xl overflow-hidden mb-6 max-w-4xl mx-auto" dir="rtl">
      {/* Hidden file input for media change */}
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        accept={isVideo ? 'video/*' : 'image/*'}
        onChange={onFileChange}
      />

      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-3">
          <img
            src={authorPhotoURL}
            alt={authorName}
            className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover border-2 border-orange-500"
          />
          <div className="flex flex-col text-right">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900">
              {authorName}
            </h3>
            <p className="text-xs sm:text-sm text-gray-500">{timeString}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {editing && (
            <>
              <button
                onClick={handleDelete}
                className="bg-red-100 text-red-600 px-3 py-1 rounded"
              >
                מחק פוסט
              </button>
              <button
                onClick={handleConfirm}
                className="bg-green-100 text-green-600 px-3 py-1 rounded"
              >
                אישור שינויים
              </button>
            </>
          )}
          <button
            onClick={() => setEditing(e => !e)}
            className="p-2 text-gray-600 hover:text-gray-800 border hover:border-gray-300 rounded-lg"
            style={{ fontSize: '1.5rem' }}
            title="ערוך פוסט"
          >
            <FaEllipsisH />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 py-3">
        {editing ? (
          <textarea
            value={newContent}
            onChange={e => setNewContent(e.target.value)}
            className="w-full border border-gray-300 rounded-lg p-2 text-sm text-gray-800 resize-none"
            rows={4}
            dir="rtl"
          />
        ) : (
          <p className="text-gray-700 text-sm sm:text-base leading-relaxed">
            {content}
          </p>
        )}
      </div>

      {/* Media */}
      {mediaUrl && (
        <div
          className={`relative w-full bg-gray-100 overflow-hidden ${editing ? 'cursor-pointer' : ''}`}
          {...(editing ? { onClick: pickNewMedia } : {})}
        >
          {editing && (
            <div className="absolute inset-0 bg-black bg-opacity-30 flex flex-col items-center justify-center z-10">
              <FaCameraRetro className="w-10 h-10 text-white" />
              <p className="text-white mt-2 text-sm">שנה תמונה</p>
            </div>
          )}
          {isVideo ? (
            <video
              className={`${editing ? 'filter blur-sm ' : ''}w-full object-cover`}
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
              alt="Post media"
              className={`${editing ? 'filter blur-sm ' : ''}w-full object-cover`}
            />
          )}
        </div>
      )}

      {/* Actions */}
      <div className="px-4 py-2 border-t border-orange-200 flex gap-5 text-base">
        <button onClick={toggleLike} className="flex items-center gap-2">
          <ThumbsUpIcon
            className="w-5 h-5"
            style={
              liked
                ? { fill: 'orange' }
                : { fill: 'transparent', stroke: 'orange', strokeWidth: 30 }
            }
          />
          <span className="text-lg text-gray-800">{likesCount}</span>
        </button>
        <button className="flex items-center gap-2">
          <FaComment
            className="w-5 h-5"
            style={{ fill: 'transparent', stroke: 'orange', strokeWidth: 30 }}
          />
          <span className="text-lg text-gray-600">{commentsCount}</span>
        </button>
      </div>
    </div>
  );
};

export default ProfilePost;
