import { db } from '@/config/firbaseConfig';
import { doc, collection, serverTimestamp, getDoc, setDoc, query, where, getDocs, updateDoc, arrayUnion } from 'firebase/firestore';

export const handleElementCommunityChatMembership = async (userId, userElement) => {
    try {
      const normalizedElement = userElement;  
      const userDoc = await getDoc(doc(db, "users", userId));
      const username = userDoc.data().username;
      const userRole = userDoc.data().role;
      if (userRole === 'staff') {
        // Staff members do not join community chats
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
            lastMessage: `${username} left the community`
          });
          await addDoc(collection(db, "conversations", communityDoc.id, "messages"), {
            text: `${username} left the community`,
            type: "system",
            createdAt: serverTimestamp(),
          });
        }
      }
      // 3. Find or create the new element community for the user's current element
      const q = query(
        collection(db, "conversations"),
        where("type", "==", "community"),
        where("element", "==", normalizedElement),
        where("communityType", "in", [null, "element"])
      );
      const querySnapshot = await getDocs(q);
      let communityDoc;
      if (querySnapshot.empty) {
        // No community exists for this element → create it
        const newCommunityRef = doc(collection(db, "conversations"));
        await setDoc(newCommunityRef, {
          participants: [userId],
          participantNames: [username],
          type: "community",
          element: normalizedElement,
          communityType: "element",
          lastMessage: "Community created!",
          lastUpdated: serverTimestamp(),
          createdAt: serverTimestamp(),
        });
        await addDoc(collection(db, "conversations", newCommunityRef.id, "messages"), {
          text: "Community created! Welcome!",
          type: "system",
          createdAt: serverTimestamp(),
        });
        communityDoc = await getDoc(newCommunityRef);
      } else {
        // A community already exists — use the first one
        communityDoc = querySnapshot.docs[0];
        const data = communityDoc.data();
        if (!data.participants.includes(userId)) {
          await updateDoc(communityDoc.ref, {
            participants: arrayUnion(userId),
            participantNames: arrayUnion(username),
            lastMessage: `${username} joined the community`
          });
          await addDoc(collection(db, "conversations", communityDoc.id, "messages"), {
            text: `${username} joined the community`,
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