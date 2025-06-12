import { db } from '@/config/firbaseConfig';
import { doc, collection, serverTimestamp, getDoc, setDoc, query, where, getDocs, updateDoc, arrayUnion, addDoc } from 'firebase/firestore';

const COMMUNITY_DESCRIPTIONS = {
  element: 'קהילה זו מיועדת לכל חברי היסוד שלך. כאן תוכלו לשתף, לשאול ולהתחבר עם חברים מהיסוד.',
  mentor_community: 'קהילה זו כוללת את המנחה שלך ואת כל המשתתפים שמלווים על ידו. כאן אפשר להתייעץ, לשאול ולשתף.',
  all_mentors: 'קהילה זו מאגדת את כל המנחים בתכנית. כאן ניתן להחליף רעיונות, לשתף ידע ולתמוך זה בזה.',
  all_mentors_with_admin: 'קהילה זו כוללת את כל המנחים והמנהלים. כאן מתקיימים עדכונים, שיתופים ודיונים מקצועיים.'
};

export const handleElementCommunityChatMembership = async (userId, userElement) => {
    try {
      const normalizedElement = userElement;  
      const userDoc = await getDoc(doc(db, "users", userId));
      const username = userDoc.data().username;
      const userRole = userDoc.data().role;
      if (userRole === 'admin') {
        // admin members do not join community chats
        return null;
      }
      // 1. Find all element community conversations the user is currently in
      const allCommunitiesQuery = query(
        collection(db, "conversations"),
        where("type", "==", "community"),
        where("participants", "array-contains", userId),
        where("communityType", "in", [null, "element"])
      );
      const allCommunitiesSnapshot = await getDocs(allCommunitiesQuery);
      // 2. Remove user from all element communities except the new one
      for (const communityDoc of allCommunitiesSnapshot.docs) {
        const data = communityDoc.data();
        if (data.element !== normalizedElement) {
          await updateDoc(communityDoc.ref, {
            participants: data.participants.filter((id) => id !== userId),
            participantNames: data.participantNames.filter((name) => name !== username),
            lastMessage: `${username} עזב/ה את קהילת היסוד`,
          });
          await addDoc(collection(db, "conversations", communityDoc.id, "messages"), {
            text: `${username} עזב/ה את קהילת היסוד`,
            type: "system",
            createdAt: serverTimestamp(),
          });
        }
      }
      // 3. Find or create the new element community for the user's current element
      const elementCommunityDocId = `element_community_${normalizedElement}`;
      const elementCommunityRef = doc(db, "conversations", elementCommunityDocId);
      const elementCommunityDoc = await getDoc(elementCommunityRef);
      let communityDoc;
      if (!elementCommunityDoc.exists()) {
        // No community exists for this element → create it
        if (normalizedElement === 'admin_mentor') {
          return null;
        }
        await setDoc(elementCommunityRef, {
          participants: [userId],
          participantNames: [username],
          type: "community",
          element: normalizedElement,
          communityType: "element",
          lastMessage: COMMUNITY_DESCRIPTIONS.element,
          lastUpdated: serverTimestamp(),
          createdAt: serverTimestamp(),
        });
        await addDoc(collection(db, "conversations", elementCommunityDocId, "messages"), {
          text: COMMUNITY_DESCRIPTIONS.element,
          type: "system",
          createdAt: serverTimestamp(),
        });
        communityDoc = await getDoc(elementCommunityRef);
      } else {
        // A community already exists — use it
        communityDoc = elementCommunityDoc;
        const data = communityDoc.data();
        if (!data.participants.includes(userId)) {
          await updateDoc(communityDoc.ref, {
            participants: arrayUnion(userId),
            participantNames: arrayUnion(username),
            lastMessage: `${username} הצטרף/ה לקהילת היסוד`,
          });
          await addDoc(collection(db, "conversations", communityDoc.id, "messages"), {
            text: `${username} הצטרף/ה לקהילת היסוד`,
            type: "system",
            createdAt: serverTimestamp(),
          });
        }
      }
      return {
        id: communityDoc.id,
        ...communityDoc.data(),
        lastUpdated: communityDoc.data().lastUpdated?.toDate(),
        createdAt: communityDoc.data().createdAt?.toDate(),
      };
    } catch (error) {
      console.error("Error handling community chat:", error);
    }
  };