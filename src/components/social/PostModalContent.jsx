// src/components/social/PostModalContent.jsx
import React, { useEffect, useState, useRef } from 'react';
import { ThumbsUp, MessageCircle, Camera } from 'lucide-react';
import { Comment, CommentInput } from './comments';

const PostModalContent = ({
  post,
  element,
  currentUser,
  comments,
  onAddComment,
  onEditComment,
  onDeleteComment,
  onLike,
  onDelete,
  onUpdate,
  isOwner,
  getAuthorProfile
}) => {
  const {
    id,
    createdAt,
    content,
    mediaUrl,
    likesCount,
    commentsCount,
    likedBy = [],
    authorId
  } = post;

  const [authorProfile, setAuthorProfile] = useState(null);
  const [liked, setLiked] = useState(false);
  const [replyTo, setReplyTo] = useState(null);
  const commentsRef = useRef(null);

  const isVideo = /\.(mp4|webm|ogg)$/i.test(mediaUrl);

  useEffect(() => {
    const fetchProfile = async () => {
      const profile = await getAuthorProfile(authorId);
      setAuthorProfile(profile);
    };
    fetchProfile();
  }, [authorId, getAuthorProfile]);

  useEffect(() => {
    setLiked(Array.isArray(likedBy) && likedBy.includes(currentUser.uid));
  }, [likedBy, currentUser.uid]);

  const createdDate = createdAt?.toDate?.();
  const timeString = createdDate
    ? createdDate.toLocaleDateString('he-IL', {
        year: 'numeric', month: 'short', day: 'numeric',
        hour: '2-digit', minute: '2-digit'
      })
    : '';

  const toggleLike = () => {
    const newState = !liked;
    setLiked(newState);
    onLike(id, newState);
  };

  const submitComment = text => {
    if (replyTo) {
      onAddComment(id, text, replyTo);
      setReplyTo(null);
    } else {
      onAddComment(id, text);
    }
  };

  return (
    <div dir="rtl" className="flex flex-col gap-4">
      {/* Author Info */}
      <div className="flex items-center gap-3 mt-2">
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

      {/* Post Content */}
      <p className="text-base leading-relaxed">{content}</p>

      {/* Media */}
      {mediaUrl && (
        <div className={`relative w-full bg-${element}-soft rounded-lg overflow-hidden`}>
          {isVideo ? (
            <video
              src={mediaUrl}
              controls
              className="w-full max-h-[40rem] object-contain rounded-lg"
            />
          ) : (
            <img
              src={mediaUrl}
              alt="תוכן הפוסט"
              className="w-full max-h-[40rem] object-cover rounded-lg"
            />
          )}
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-6 pt-2 border-t border-gray-200">
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

        <div className="flex items-center gap-2">
          <div className={`p-1.5 rounded-full bg-${element}-soft text-${element}`}>
            <MessageCircle size={18} />
          </div>
          <span className="text-sm font-medium">{commentsCount}</span>
        </div>
      </div>

      {/* Comments */}
      <div ref={commentsRef} className="pt-4 border-t border-gray-200">
        <div className="flex gap-3 mb-4">
          <img src={currentUser.photoURL} alt="" className="w-8 h-8 rounded-full" />
          <CommentInput
            placeholder="הוסף תגובה..."
            element={element}
            onSubmit={submitComment}
          />
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
              onDelete={onDeleteComment}
              replyingToId={replyTo}
              onSubmitReply={(text, parentId) => {
                onAddComment(id, text, parentId);
                setReplyTo(null);
              }}
              onCancelReply={() => setReplyTo(null)}
              postId={id}
              postAuthorId={authorId}
              getAuthorProfile={getAuthorProfile}
            />
          ))
        ) : (
          <p className="text-center text-gray-500">אין תגובות עדיין.</p>
        )}
      </div>
    </div>
  );
};

export default PostModalContent;
