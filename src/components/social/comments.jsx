//comments
import React, { useState, useEffect, useRef } from 'react';
import { Trash2, Check, Edit2, X, Send, Reply, Smile } from 'lucide-react';
import EmojiPickerPopover from './EmojiPickerPopover'; // adjust path if needed
import { containsBadWord } from './utils/containsBadWord';

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
  postId,
  postAuthorId,
  getAuthorProfile
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(comment.content || comment.text || '');
  const [authorProfile, setAuthorProfile] = useState(null);
  const isCommentAuthor = currentUser.uid === comment.authorId;
  const isPostOwner = currentUser.uid === postAuthorId;
  const canEditOrDelete = isCommentAuthor || isPostOwner;

  const commentTime = comment.createdAt || comment.timestamp;
  const formattedTime = commentTime
    ? new Intl.DateTimeFormat('he-IL', {
      year: 'numeric', month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit'
    }).format(typeof commentTime === 'object' ? commentTime : commentTime.toDate())
    : '';

  useEffect(() => {
    const fetch = async () => {
      const profile = await getAuthorProfile(comment.authorId);
      setAuthorProfile(profile);
    };
    fetch();
  }, [comment.authorId, getAuthorProfile]);

  const handleSave = () => {
    if (editText.trim() !== (comment.content || comment.text)) {
      onEdit(postId, comment.id, editText);
    }
    setIsEditing(false);
  };

  if (authorProfile === null) {
    return (
      <div className={`flex gap-3 ${isReply ? 'mr-12 mt-3' : 'mt-4'}`}>
        {/* Default avatar */}
        <img
          src="/profile.jpg"
          alt="Deleted user"
          className={`w-8 h-8 rounded-full object-cover mt-1 ring-2 ring-${element}-accent ring-offset-1`}
        />

        {/* Comment body */}
        <div className="flex-1">
          <div className={`p-3 rounded-lg bg-${element}-soft relative`}>
            <div className="flex justify-between">
              {/* Placeholder username */}
              <p className="font-semibold text-sm text-gray-500">משתמש שנמחק</p>

              {/* Trash button if post owner */}
              {isPostOwner && (
                <div className="flex gap-2">
                  <button
                    onClick={() =>
                      onDelete(postId, comment.id, isReply, isReply ? comment.parentId : null)
                    }
                    className="p-1 text-red-500 hover:text-red-700 transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              )}
            </div>

            {/* Message content */}
            <p className="text-sm mt-1 italic text-gray-500">
              משתמש זה נמחק ולכן התגובה לא זמינה.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex gap-3 ${isReply ? 'mr-12 mt-3' : 'mt-4'}`}>
      <img
        src={authorProfile?.photoURL || '/profile.jpg'}
        alt={authorProfile?.username || '...'}
        className={`w-8 h-8 rounded-full object-cover mt-1 ring-2 ring-${element}-accent ring-offset-1`}
      />
      <div className="flex-1">
        <div className={`p-3 rounded-lg bg-${element}-soft relative`}>
          <div className="flex justify-between">
            <p className="font-semibold text-sm">{authorProfile?.username}</p>
            {canEditOrDelete && !isEditing && (
              <div className="flex gap-2">
                <button
                  onClick={() => setIsEditing(true)}
                  className={`p-1 text-${element} hover:text-${element}-accent transition-colors`}
                >
                  <Edit2 size={14} />
                </button>
                <button
                  onClick={() => onDelete(postId, comment.id, isReply, isReply ? comment.parentId : null)}
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
                  onClick={() => { setEditText(comment.content || comment.text); setIsEditing(false); }}
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
            <p className="text-sm mt-1 whitespace-pre-wrap break-words break-all">{comment.content || comment.text}</p>
          )}
        </div>

        <div className="flex items-center text-xs mt-1 text-gray-500 gap-4">
          <span>{formattedTime}{comment.edited && ' (נערך)'}</span>
          {!isReply && currentUser.role !== 'staff' && (
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
              placeholder={`הגב ל ${authorProfile?.username || 'משתמש'}`}
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
                isReply={true}
                postId={postId}
                postAuthorId={postAuthorId}
                getAuthorProfile={getAuthorProfile}
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
  const [showEmoji, setShowEmoji] = useState(false);
  const emojiBtnRef = useRef();
  const ref = useRef();
  const pickerRef = useRef();
  const [emojiPos, setEmojiPos] = useState({ x: 0, y: 0 });
  const [warning, setWarning] = useState('');

  useEffect(() => {
    if (autoFocus && ref.current) ref.current.focus();
  }, [autoFocus]);

  // Insert emoji at cursor
  const insertEmoji = (emojiObject) => {
    const sym = emojiObject.emoji;
    const input = ref.current;
    if (!input) return;
    const [start, end] = [input.selectionStart, input.selectionEnd];
    setText(prev => prev.slice(0, start) + sym + prev.slice(end));
    setTimeout(() => {
      input.focus();
      input.setSelectionRange(start + sym.length, start + sym.length);
    }, 0);
    // Do NOT close picker here (multi-emoji experience)
  };

  const handleSubmit = e => {
    e.preventDefault();
    if (!text.trim()) return;

    if (containsBadWord(text)) {
      setWarning('הודעה זו מכילה מילים לא ראויות!');
      setTimeout(() => setWarning(''), 3500);
      return;
    }

    onSubmit(text);
    setText('');
    setShowEmoji(false);
    setWarning('');
  };

  // Click-outside handler: closes only if click is not on the picker or button
  useEffect(() => {
    if (!showEmoji) return;
    function handleClick(e) {
      if (
        pickerRef.current &&
        !pickerRef.current.contains(e.target) &&
        emojiBtnRef.current &&
        !emojiBtnRef.current.contains(e.target)
      ) {
        setShowEmoji(false);
      }
    }
    window.addEventListener('mousedown', handleClick);
    return () => window.removeEventListener('mousedown', handleClick);
  }, [showEmoji]);

  return (
    <>
      {warning &&
        <div
          style={{
            position: 'fixed',
            top: '80px',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 10000,
            minWidth: 300,
            maxWidth: 400,
            background: '#fee2e2',
            color: '#b91c1c',
            border: '1px solid #ef4444',
            borderRadius: 8,
            padding: '14px 22px',
            fontWeight: 500,
            textAlign: 'center',
            boxShadow: '0 2px 16px rgba(0,0,0,0.12)',
            fontSize: '1rem',
            pointerEvents: 'none'
          }}
        >
          {warning}
        </div>
      }
      <form onSubmit={handleSubmit} className="flex  sm:flex-row flex-col gap-2 w-full relative">
        <textarea
          ref={ref}
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder={placeholder}
          className={`w-full sm:flex-1 p-3 border border-${element}-soft rounded-lg resize-none focus:ring-2 focus:ring-${element}-accent transition-all`}
          rows={2}
          dir="rtl"
        />
        <div className="flex items-center w-full sm:w-auto sm:justify-end gap-2 relative">
          {/* Emoji Picker Button */}
          <button
            type="button"
            ref={emojiBtnRef}
            onClick={() => setShowEmoji(v => !v)}
            className={`hidden md:flex p-2 sm:px-2 sm:py-2 rounded-md bg-${element}-soft text-${element} hover:bg-${element}-accent hover:text-white transition-colors`}
            aria-label="הוסף אימוג׳י"
          >
            <Smile size={18} />
          </button>
          <EmojiPickerPopover
            anchorRef={emojiBtnRef}
            open={showEmoji}
            onClose={() => setShowEmoji(false)}
            onEmojiClick={emojiObject => insertEmoji(emojiObject)}
          />

          {onCancel && (
            <button
              type="button"
              onClick={() => { setText(''); onCancel(); }}
              className="px-4 py-2 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors text-sm"
            >
              ביטול
            </button>
          )}
          <button
            type="submit"
            disabled={!text.trim()}
            className={`px-4 py-2 bg-${element} text-white rounded-md hover:bg-${element}-accent disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-1 text-sm`}
          >
            <Send size={16} /> {buttonText || 'שלח'}
          </button>
        </div>
      </form>
    </>
  );
};