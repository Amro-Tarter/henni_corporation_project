import { collection, doc, getDoc, getDocs, query, updateDoc, arrayUnion, where } from 'firebase/firestore';
import { db } from '../../../config/firbaseConfig';

export async function handleCommunityChatMembership(userId, userElement) {
  try {
    const normalizedElement = userElement.toLowerCase();
    const userDoc = await getDoc(doc(db, "users", userId));
    const userData = userDoc.data();
    const username = userData.username;
    const userRole = userData.role;

    // 1. Find all community conversations the user is currently in
    const allCommunitiesQuery = query(
      collection(db, "conversations"),
      where("type", "==", "community"),
      where("participants", "array-contains", userId)
    );
    const allCommunitiesSnapshot = await getDocs(allCommunitiesQuery);

    // 2. Remove user from communities not matching element or role-based
    for (const communityDoc of allCommunitiesSnapshot.docs) {
      const data = communityDoc.data();
      if (data.element !== normalizedElement) {
        // Check if the community is a role-based community the user should stay in
        let shouldStay = false;
        if (userRole === 'mentor') {
          if (data.element === 'mentors' || data.element === 'mentors_admins') {
            shouldStay = true;
          }
        }
        if (userRole === 'admin' && data.element === 'mentors_admins') {
          shouldStay = true;
        }
        
        if (!shouldStay) {
          await updateDoc(communityDoc.ref, {
            participants: data.participants.filter((id) => id !== userId),
            participantNames: data.participantNames.filter((name) => name !== username),
          });
        }
      }
    }

    // 3. Add to element-based community
    let targetCommunity = null;
    const elementQuery = query(
      collection(db, "conversations"),
      where("type", "==", "community"),
      where("element", "==", normalizedElement)
    );
    const elementSnapshot = await getDocs(elementQuery);
    if (!elementSnapshot.empty) {
      const communityDoc = elementSnapshot.docs[0];
      const data = communityDoc.data();
      if (!data.participants.includes(userId)) {
        await updateDoc(communityDoc.ref, {
          participants: arrayUnion(userId),
          participantNames: arrayUnion(username),
        });
      }
      targetCommunity = {
        id: communityDoc.id,
        ...communityDoc.data(),
        lastUpdated: communityDoc.data().lastUpdated?.toDate(),
        createdAt: communityDoc.data().createdAt?.toDate(),
      };
    }

    // 4. Add to role-based communities
    const roleCommunities = [];
    if (userRole === 'mentor') {
      roleCommunities.push('mentors', 'mentors_admins');
    } else if (userRole === 'admin') {
      roleCommunities.push('mentors_admins');
    }

    for (const element of roleCommunities) {
      const q = query(
        collection(db, "conversations"),
        where("type", "==", "community"),
        where("element", "==", element)
      );
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        const communityDoc = querySnapshot.docs[0];
        const data = communityDoc.data();
        if (!data.participants.includes(userId)) {
          await updateDoc(communityDoc.ref, {
            participants: arrayUnion(userId),
            participantNames: arrayUnion(username),
          });
        }
      }
    }

    return targetCommunity;
  } catch (error) {
    console.error("Error handling community chat:", error);
  }
}