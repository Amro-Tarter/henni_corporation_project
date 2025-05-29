/**
 * Get the chat partner's display name.
 * @param {Array} participants
 * @param {string} conversationType
 * @param {string} element
 * @param {Object} currentUser
 * @param {Array} conversations
 * @param {string} groupName
 * @param {Array} participantNames
 * @param {string} communityType (optional)
 * @param {string} mentorName (optional)
 */
export function getChatPartner(participants, conversationType, element, currentUser, conversations, groupName, participantNames, communityType, mentorName) {
  if (conversationType === "group") {
    if (groupName && groupName.trim() !== "") {
      return groupName;
    }
    // Fallback: try to use participantNames (excluding current user)
    if (Array.isArray(participantNames) && currentUser?.username) {
      const names = participantNames.filter(name => name !== currentUser.username);
      return names.length > 0 ? names.join(", ") : "Unnamed Group";
    }
    return "Unnamed Group";
  }
  
  if (conversationType === "community") {
    if (communityType === 'mentor_community') {
      return mentorName ? `קהילה של ${mentorName}` : 'קהילת מנטור';
    } else if (communityType === 'element') {
      return element ? `${element} קהילה` : chatTitle || 'קהילה';
    } else if (communityType === 'all_mentors') {
      return 'קהילת כל המנטורים';
    } else if (communityType === 'all_mentors_with_admin') {
      return 'קהילת כל המנטורים והמנהלים';
    }
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
