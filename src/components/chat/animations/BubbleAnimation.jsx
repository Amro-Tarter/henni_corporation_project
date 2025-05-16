import React, { useEffect, useRef, useState } from 'react';
import './BubbleAnimation.css';

export default function BubbleAnimation({ onAnimationEnd, elementColors, sendButtonRef, icon }) {
  const [bubbleStyle, setBubbleStyle] = useState({});
  const bubbleRef = useRef(null);

  useEffect(() => {
    // Position the bubble over the send button
    if (sendButtonRef && sendButtonRef.current && bubbleRef.current) {
      const btnRect = sendButtonRef.current.getBoundingClientRect();
      const parentRect = bubbleRef.current.offsetParent?.getBoundingClientRect();
      if (btnRect && parentRect) {
        setBubbleStyle({
          position: 'absolute',
          left: btnRect.left - parentRect.left + btnRect.width / 2 - 11, // 11 = half bubble size
          bottom: window.innerHeight - btnRect.bottom + 8, // 8px offset for margin
        });
      }
    }
  }, [sendButtonRef]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (onAnimationEnd) onAnimationEnd();
    }, 800); // Match animation duration
    return () => clearTimeout(timer);
  }, [onAnimationEnd]);

  return (
    <div className="bubble-animation-absolute-container" ref={bubbleRef} style={{ position: 'absolute', left: 0, right: 0, bottom: 0, top: 0, pointerEvents: 'none', zIndex: 40 }}>
      <div className="bubble-animation-bubble flex items-center justify-center" style={{ backgroundColor: 'white', ...bubbleStyle }}>
        {icon && (
          <span style={{ fontSize: 20, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{icon}</span>
        )}
      </div>
    </div>
  );
} 