import { useEffect, useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import EmojiPicker from 'emoji-picker-react';

export default function EmojiPickerPopover({
  anchorRef,
  open,
  onClose,
  onEmojiClick,
  width = 350,
  height = 400
}) {
  const [pos, setPos] = useState({ top: 0, left: 0 });
  const pickerRef = useRef();

  useEffect(() => {
    if (!open || !anchorRef?.current) return;
    function updatePos() {
      const rect = anchorRef.current.getBoundingClientRect();
      setPos({
        top: rect.bottom + window.scrollY + 8,
        left: rect.right - width + window.scrollX,
      });
    }
    updatePos();
    window.addEventListener('scroll', updatePos);
    window.addEventListener('resize', updatePos);
    return () => {
      window.removeEventListener('scroll', updatePos);
      window.removeEventListener('resize', updatePos);
    };
  }, [open, anchorRef, width]);

  // Close on click outside
  useEffect(() => {
    if (!open) return;
    function handleClick(e) {
      if (
        pickerRef.current &&
        !pickerRef.current.contains(e.target) &&
        anchorRef.current &&
        !anchorRef.current.contains(e.target)
      ) {
        onClose?.();
      }
    }
    window.addEventListener('mousedown', handleClick);
    return () => window.removeEventListener('mousedown', handleClick);
  }, [open, onClose, anchorRef]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    function handleKey(e) {
      if (e.key === 'Escape') onClose?.();
    }
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [open, onClose]);

  if (!open) return null;

  return createPortal(
    <div
      ref={pickerRef}
      style={{
        position: 'absolute',
        zIndex: 9999,
        top: pos.top,
        left: pos.left,
        minWidth: width,
      }}
    >
      <EmojiPicker
        onEmojiClick={onEmojiClick}
        width={width}
        height={height}
        autoFocusSearch={false}
        theme="light"
        searchDisabled={false}
        skinTonesDisabled={false}
      />
    </div>,
    document.body
  );
}
