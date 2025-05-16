import { useEffect, useRef } from "react";

/**
 * Hook to handle auto-scrolling of chat messages.
 * @param {Array} messages - The messages array.
 * @param {Object} selectedConversation - The current conversation.
 * @returns {Object} { messagesEndRef, messagesContainerRef }
 */
export function useChatScroll(messages, selectedConversation) {
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const resizeObserverRef = useRef(null);

  useEffect(() => {
    if (!messagesContainerRef.current) return;
    if (messages.length > 0) {
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "auto" });
      }, 50);
    }
    const container = messagesContainerRef.current;
    resizeObserverRef.current = new ResizeObserver(() => {
      const isNearBottom = container.scrollHeight - container.scrollTop <= container.clientHeight + 50;
      if (isNearBottom) {
        messagesEndRef.current?.scrollIntoView({ behavior: "auto" });
      }
    });
    resizeObserverRef.current.observe(container);
    return () => {
      resizeObserverRef.current?.disconnect();
    };
  }, [messages, selectedConversation?.id]);

  return { messagesEndRef, messagesContainerRef };
}
