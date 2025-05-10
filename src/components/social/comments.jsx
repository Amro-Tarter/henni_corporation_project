import React, { useState, useEffect, useRef } from 'react';
import { Trash2, Check, Edit2, X, Send, Reply } from 'lucide-react';

/**
 * Renders a single comment (and its nested replies).
 */
export const Comment = ({
  comment,
  element,
  currentUser,
  onReply,
  onEdit,
  onDelete,
  replyingToId,
  onSubmitReply,
  onCancelReply,
  isReply = false,
  postId
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(comment.text);
  const isAuthor = currentUser.uid === comment.authorId;
  const formattedTime = comment.timestamp
    ? new Intl.DateTimeFormat('he-IL', {
        year: 'numeric', month: 'short', day: 'numeric',
        hour: '2-digit', minute: '2-digit'
      }).format(comment.timestamp)
    : '';

  const handleSave = () => {
    if (editText.trim() !== comment.text) {
      onEdit(postId, comment.id, editText);
    }
    setIsEditing(false);
  };

  return (
    <div className={`flex gap-3 ${isReply ? 'mr-12 mt-3' : 'mt-4'}`}>  
      <img
        src={comment.authorPhotoURL}
        alt={comment.username}
        className="w-8 h-8 rounded-full object-cover mt-1"
      />
      <div className="flex-1">
        <div className={`p-3 rounded-lg bg-${element}-soft relative`}>  
          <div className="flex justify-between">
            <h4 className="font-semibold text-sm">{comment.username}</h4>
            {isAuthor && !isEditing && (
              <div className="flex gap-2">
                <button
                  onClick={() => setIsEditing(true)}
                  className={`p-1 text-${element} hover:text-${element}-accent transition-colors`}
                >
                  <Edit2 size={14} />
                </button>
                <button
                  onClick={() => onDelete(postId, comment.id, isReply, isReply ? comment.parentCommentId : null)}
                  className="p-1 text-red-500 hover:text-red-700 transition-colors"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            )}
          </div>

          {isEditing ? (
            <>
              <textarea
                value={editText}
                onChange={e => setEditText(e.target.value)}
                className={`w-full p-2 border border-${element}-accent rounded-md text-sm resize-none focus:ring-2 focus:ring-${element}-accent transition-all`}
                rows={3}
                dir="rtl"
              />
              <div className="flex justify-end gap-2 mt-2">
                <button
                  onClick={() => { setEditText(comment.text); setIsEditing(false); }}
                  className="px-3 py-1 text-xs bg-gray-100 rounded-md flex items-center gap-1 hover:bg-gray-200 transition-colors"
                >
                  <X size={12} /> ביטול
                </button>
                <button
                  onClick={handleSave}
                  className={`px-3 py-1 text-xs bg-${element} text-white rounded-md flex items-center gap-1 hover:bg-${element}-accent transition-colors`}
                >
                  <Check size={12} /> שמור
                </button>
              </div>
            </>
          ) : (
            <p className="text-sm mt-1 whitespace-pre-wrap">{comment.text}</p>
          )}
        </div>

        <div className="flex items-center text-xs mt-1 text-gray-500 gap-4">
          <span>{formattedTime}{comment.edited && ' (נערך)'}</span>
          {!isReply && (
            <button
              onClick={() => onReply(comment.id)}
              className={`flex items-center gap-1 text-${element} hover:bg-${element}-soft transition-colors rounded-lg px-2 py-1`}
            >
              <Reply size={20} /> הגב
            </button>
          )}
        </div>

        {/* Reply input under this comment */}
        {replyingToId === comment.id && (
          <div className="mt-2">
            <CommentInput
              placeholder={`הגב ל${comment.username}`}
              element={element}
              initialValue={''}
              autoFocus
              onSubmit={text => { onSubmitReply(text, comment.id); }}
              onCancel={() => onCancelReply()}
            />
          </div>
        )}

        {/* Nested replies */}
        {comment.replies?.length > 0 && (
          <div className="mt-2">
            {comment.replies.map(reply => (
              <Comment
                key={reply.id}
                comment={reply}
                element={element}
                currentUser={currentUser}
                onReply={onReply}
                onEdit={onEdit}
                onDelete={onDelete}
                replyingToId={replyingToId}
                onSubmitReply={onSubmitReply}
                onCancelReply={onCancelReply}
                isReply
                postId={postId}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

/**
 * Input form for posting new comments or replies.
 */
export const CommentInput = ({
  onSubmit,
  onCancel,
  element,
  placeholder,
  autoFocus = false,
  initialValue = '',
  buttonText = ''
}) => {
  const [text, setText] = useState(initialValue);
  const ref = useRef();

  useEffect(() => {
    if (autoFocus && ref.current) ref.current.focus();
  }, [autoFocus]);

  const handleSubmit = e => {
    e.preventDefault();
    if (!text.trim()) return;
    onSubmit(text);
    setText('');
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-end gap-2 w-full">
      <textarea
        ref={ref}
        value={text}
        onChange={e => setText(e.target.value)}
        placeholder={placeholder}
        className={`w-full max-w-full p-3 border border-${element}-soft rounded-lg resize-none focus:ring-2 focus:ring-${element}-accent transition-all`}
        rows={2}
        dir="rtl"
      />
      {onCancel && (
        <button
          type="button"
          onClick={() => { setText(''); onCancel(); }}
          className="px-4 py-2 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
        >
          ביטול
        </button>
      )}
      <button
        type="submit"
        disabled={!text.trim()}
        className={`px-4 py-2 bg-${element} text-white rounded-md hover:bg-${element}-accent disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-1`}
      >
        <Send size={16} /> {buttonText || 'שלח'}
      </button>
    </form>
  );
};
