import { useEffect, useRef, useState } from "react";

/**
 * Hook to manage emoji picker open/close and outside click.
 * @returns {Object} { showEmojiPicker, setShowEmojiPicker, emojiPickerRef }
 */
export function useEmojiPicker() {
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const emojiPickerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target)) {
        setShowEmojiPicker(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return { showEmojiPicker, setShowEmojiPicker, emojiPickerRef };
}
