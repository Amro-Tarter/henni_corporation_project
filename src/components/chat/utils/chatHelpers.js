/**
 * Get the chat partner's display name.
 * @param {Array} participants
 * @param {string} conversationType
 * @param {string} element
 * @param {Object} currentUser
 * @param {Array} conversations
 */
export function getChatPartner(participants, conversationType, element, currentUser, conversations, groupName) {
  if (conversationType === "community") {
    return `${element} Community`;
  }
  if (conversationType === "group" && groupName) {
    return groupName;
  }
  if (!participants || !currentUser.uid) return "Unknown";
  // For direct chats, get the partner's name from participantNames if available
  const partnerUid = participants.find((p) => p !== currentUser.uid);
  // Try to find the conversation with these participants
  const conversation = conversations?.find(
    conv =>
      conv.type === 'direct' &&
      Array.isArray(conv.participants) &&
      conv.participants.length === 2 &&
      conv.participants.includes(currentUser.uid) &&
      conv.participants.includes(partnerUid)
  );
  // Use participantNames if available and not a community
  if (conversation && Array.isArray(conversation.participantNames)) {
    // Return the name that is not the current user
    const partnerName = conversation.participantNames.find(name => name !== currentUser.username);
    if (partnerName) return partnerName;
  }
  // Fallback: just return the partnerUid (or Unknown)
  return partnerUid || "Unknown";
}
