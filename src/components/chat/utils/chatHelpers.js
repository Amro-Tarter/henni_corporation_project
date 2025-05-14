/**
 * Get the chat partner's display name.
 * @param {Array} participants
 * @param {string} conversationType
 * @param {string} element
 * @param {Object} currentUser
 * @param {Array} conversations
 */
export function getChatPartner(participants, conversationType, element, currentUser, conversations) {
  if (conversationType === "community") {
    return `${element} Community`;
  }
  if (!participants || !currentUser.uid) return "Unknown";
  const partnerUid = participants.find((p) => p !== currentUser.uid);
  const conversation = conversations.find(conv => conv.participants.includes(partnerUid));
  return conversation?.participantNames?.find(name => name !== currentUser.username) || "Unknown";
}
