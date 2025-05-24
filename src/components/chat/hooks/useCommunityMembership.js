import { collection, doc, getDoc, getDocs, query, updateDoc, arrayUnion, where } from 'firebase/firestore';
import { db } from '../../../config/firbaseConfig';

export async function handleCommunityChatMembership(userId, userElement) {
  try {
    const normalizedElement = userElement.toLowerCase();
    const userDoc = await getDoc(doc(db, "users", userId));
    const username = userDoc.data().username;
    // 1. Find all community conversations the user is currently in
    const allCommunitiesQuery = query(
      collection(db, "conversations"),
      where("type", "==", "community"),
      where("participants", "array-contains", userId)
    );
    const allCommunitiesSnapshot = await getDocs(allCommunitiesQuery);
    // 2. Remove user from all communities except the new one
    for (const communityDoc of allCommunitiesSnapshot.docs) {
      const data = communityDoc.data();
      if (data.element !== normalizedElement) {
        await updateDoc(communityDoc.ref, {
          participants: data.participants.filter((id) => id !== userId),
          participantNames: data.participantNames.filter((name) => name !== username),
        });
        // No system message for leaving
      }
    }
    // 3. Find the community for the user's current element
    const q = query(
      collection(db, "conversations"),
      where("type", "==", "community"),
      where("element", "==", normalizedElement)
    );
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      // A community exists — use the first one
      const communityDoc = querySnapshot.docs[0];
      const data = communityDoc.data();
      if (!data.participants.includes(userId)) {
        await updateDoc(communityDoc.ref, {
          participants: arrayUnion(userId),
          participantNames: arrayUnion(username),
        });
        // No system message for joining
      }
      return {
        id: communityDoc.id,
        ...communityDoc.data(),
        lastUpdated: communityDoc.data().lastUpdated?.toDate(),
        createdAt: communityDoc.data().createdAt?.toDate(),
      };
    }
    // If no community exists, do nothing
    return null;
  } catch (error) {
    console.error("Error handling community chat:", error);
  }
} 