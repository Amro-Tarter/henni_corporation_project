/**
 * Get the chat partner's display name.
 * @param {Array} participants
 * @param {string} conversationType
 * @param {string} element
 * @param {Object} currentUser
 * @param {Array} conversations
 * @param {string} groupName
 */
export function getChatPartner(participants, conversationType, element, currentUser, conversations, groupName) {
  if (conversationType === "group") {
    return groupName && groupName.trim() !== "" ? groupName : "Unnamed Group";
  }
  
  if (conversationType === "community") {
    return `${element} Community`;
  }

  if (conversationType === "direct") {
    if (!participants || !currentUser.uid) return "Unknown";

    const partnerUid = participants.find((p) => p !== currentUser.uid);

    const conversation = conversations?.find(
      conv =>
        conv.type === 'direct' &&
        Array.isArray(conv.participants) &&
        conv.participants.length === 2 &&
        conv.participants.includes(currentUser.uid) &&
        conv.participants.includes(partnerUid)
    );

    if (conversation && Array.isArray(conversation.participantNames)) {
      const partnerName = conversation.participantNames.find(name => name !== currentUser.username);
      if (partnerName) return partnerName;
    }

    return partnerUid || "Unknown";
  }

  return "Unknown"; // fallback for any unrecognized type
}
