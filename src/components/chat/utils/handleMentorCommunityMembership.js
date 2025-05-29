import { db } from '@/config/firbaseConfig';
import { doc, collection, serverTimestamp, getDoc, setDoc, query, where, getDocs, updateDoc, arrayUnion } from 'firebase/firestore';

export const handleMentorCommunityMembership = async (userId, userRole, mentorName, username) => {
    try {
      // Fetch all users
      const usersSnapshot = await getDocs(collection(db, "users"));
      const allUsers = usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  
      // --- Remove user from mentor/admin communities if their role changed ---
      // Remove from all_mentors if not mentor
      if (userRole !== 'mentor') {
        const allMentorsQuery = query(
          collection(db, "conversations"),
          where("type", "==", "community"),
          where("communityType", "==", "all_mentors")
        );
        const allMentorsSnapshot = await getDocs(allMentorsQuery);
        for (const docSnap of allMentorsSnapshot.docs) {
          const data = docSnap.data();
          if (data.participants?.includes(userId)) {
            const newIds = data.participants.filter(id => id !== userId);
            const newNames = data.participantNames.filter(name => name !== username);
            await updateDoc(docSnap.ref, {
              participants: newIds,
              participantNames: newNames,
              lastMessage: `${username} left the mentors community`,
              lastUpdated: serverTimestamp(),
            });
          }
        }
      }
      // Remove from all_mentors_with_admin if not mentor or admin
      if (userRole !== 'mentor' && userRole !== 'admin') {
        const allMentorsAdminQuery = query(
          collection(db, "conversations"),
          where("type", "==", "community"),
          where("communityType", "==", "all_mentors_with_admin")
        );
        const allMentorsAdminSnapshot = await getDocs(allMentorsAdminQuery);
        for (const docSnap of allMentorsAdminSnapshot.docs) {
          const data = docSnap.data();
          if (data.participants?.includes(userId)) {
            const newIds = data.participants.filter(id => id !== userId);
            const newNames = data.participantNames.filter(name => name !== username);
            await updateDoc(docSnap.ref, {
              participants: newIds,
              participantNames: newNames,
              lastMessage: `${username} left the mentors+admin community`,
              lastUpdated: serverTimestamp(),
            });
          }
        }
      }
      // Remove from mentor_community if not mentor
      if (userRole !== 'mentor') {
        const mentorCommunityQuery = query(
          collection(db, "conversations"),
          where("type", "==", "community"),
          where("communityType", "==", "mentor_community"),
          where("mentorId", "==", userId)
        );
        const mentorCommunitySnapshot = await getDocs(mentorCommunityQuery);
        for (const docSnap of mentorCommunitySnapshot.docs) {
          const data = docSnap.data();
          if (data.participants?.includes(userId)) {
            const newIds = data.participants.filter(id => id !== userId);
            const newNames = data.participantNames.filter(name => name !== username);
            await updateDoc(docSnap.ref, {
              participants: newIds,
              participantNames: newNames,
              lastMessage: `${username} left the mentor community`,
              lastUpdated: serverTimestamp(),
            });
          }
        }
      }
  
      if (userRole === 'mentor') {
        await handleMentorCommunity(userId, username, allUsers);
        await handleAllMentorsCommunity(allUsers);
        await handleAllMentorsWithAdminCommunity(allUsers);
      } 
      else if (userRole === 'participant' && mentorName) {
        await handleParticipantCommunity(userId, username, mentorName, allUsers);
      }
  
      if (userRole === 'mentor' || userRole === 'admin') {
        await handleAllMentorsWithAdminCommunity(allUsers);
      }
    } catch (error) {
      console.error("Error handling mentor community chat:", error);
    }
  };
  
  // Helper functions
  const handleMentorCommunity = async (mentorId, mentorUsername, allUsers) => {
    // Find all mentees for this mentor
    const myParticipants = allUsers.filter(u => 
      u.role === 'participant' && u.mentorName === mentorUsername
    );
    
    const participantIds = myParticipants.map(u => u.id);
    const participantNames = myParticipants.map(u => u.username);
    const allIds = [mentorId, ...participantIds];
    const allNames = [mentorUsername, ...participantNames];
    
    // Build unread object
    const unread = allIds.reduce((acc, uid) => ({ ...acc, [uid]: 0 }), {});
    
    // Find existing mentor community
    const mentorCommunityQuery = query(
      collection(db, "conversations"),
      where("type", "==", "community"),
      where("communityType", "==", "mentor_community"),
      where("mentorId", "==", mentorId)
    );
    
    const mentorCommunitySnapshot = await getDocs(mentorCommunityQuery);
    let communityDoc;
    
    if (mentorCommunitySnapshot.empty) {
      // Create new community
      const newCommunityRef = doc(collection(db, "conversations"));
      await setDoc(newCommunityRef, {
        type: "community",
        communityType: "mentor_community",
        mentorId,
        mentorName: mentorUsername,
        participants: allIds,
        participantNames: allNames,
        unread,
        lastMessage: "Mentor community created!",
        lastUpdated: serverTimestamp(),
        createdAt: serverTimestamp(),
      });
      communityDoc = await getDoc(newCommunityRef);
    } else {
      // Update existing community
      communityDoc = mentorCommunitySnapshot.docs[0];
      const currentData = communityDoc.data();
      
      // Check if update needed
      const needsUpdate = 
        allIds.length !== currentData.participants.length ||
        !allIds.every(id => currentData.participants.includes(id));
      
      if (needsUpdate) {
        // Update unread status
        const newUnread = { ...currentData.unread };
        allIds.forEach(uid => newUnread[uid] = newUnread[uid] || 0);
        Object.keys(newUnread)
          .filter(uid => !allIds.includes(uid))
          .forEach(uid => delete newUnread[uid]);
        
        await updateDoc(communityDoc.ref, {
          participants: allIds,
          participantNames: allNames,
          unread: newUnread,
          lastMessage: "Mentor community updated!",
          lastUpdated: serverTimestamp(),
        });
      }
    }
  };
  
  const handleParticipantCommunity = async (userId, username, mentorName, allUsers) => {
    const mentor = allUsers.find(u => 
      u.role === 'mentor' && u.username === mentorName
    );
    if (!mentor) return;
  
    // Ensure mentor has a community
    await handleMentorCommunity(mentor.id, mentor.username, allUsers);
    
    // Remove from other mentor communities
    const allMentorCommunitiesQuery = query(
      collection(db, "conversations"),
      where("type", "==", "community"),
      where("communityType", "==", "mentor_community"),
      where("participants", "array-contains", userId)
    );
    
    const allMentorCommunitiesSnapshot = await getDocs(allMentorCommunitiesQuery);
    
    for (const communityDoc of allMentorCommunitiesSnapshot.docs) {
      const data = communityDoc.data();
      if (data.mentorId === mentor.id) continue;
      
      // Remove participant
      const newIds = data.participants.filter(id => id !== userId);
      const newNames = data.participantNames.filter(name => name !== username);
      const newUnread = { ...data.unread };
      delete newUnread[userId];
      
      await updateDoc(communityDoc.ref, {
        participants: newIds,
        participantNames: newNames,
        unread: newUnread,
        lastMessage: `${username} left the mentor community`,
        lastUpdated: serverTimestamp(),
      });
      
      // Add system message
      await addDoc(collection(db, "conversations", communityDoc.id, "messages"), {
        text: `${username} left the mentor community`,
        type: "system",
        createdAt: serverTimestamp(),
      });
    }
  };
  
  const handleAllMentorsCommunity = async (allUsers) => {
    const allMentors = allUsers.filter(u => u.role === 'mentor');
    const mentorIds = allMentors.map(u => u.id);
    const mentorNames = allMentors.map(u => u.username);
    
    const queryRef = query(
      collection(db, "conversations"),
      where("type", "==", "community"),
      where("communityType", "==", "all_mentors")
    );
    
    const snapshot = await getDocs(queryRef);
    
    if (snapshot.empty) {
      // Create new community
      const newRef = doc(collection(db, "conversations"));
      await setDoc(newRef, {
        type: "community",
        communityType: "all_mentors",
        participants: mentorIds,
        participantNames: mentorNames,
        lastMessage: "All mentors community created!",
        lastUpdated: serverTimestamp(),
        createdAt: serverTimestamp(),
      });
    } else {
      // Update existing community
      const docRef = snapshot.docs[0].ref;
      const data = snapshot.docs[0].data();
      
      // Check if update needed
      if (mentorIds.length !== data.participants.length ||
          !mentorIds.every(id => data.participants.includes(id))) {
        await updateDoc(docRef, {
          participants: mentorIds,
          participantNames: mentorNames,
          lastMessage: "All mentors community updated!",
          lastUpdated: serverTimestamp(),
        });
      }
    }
  };
  
  const handleAllMentorsWithAdminCommunity = async (allUsers) => {
    const allMentors = allUsers.filter(u => u.role === 'mentor');
    const allAdmins = allUsers.filter(u => u.role === 'admin');
    
    const mentorAdminIds = [
      ...allMentors.map(u => u.id),
      ...allAdmins.map(u => u.id)
    ];
    
    const mentorAdminNames = [
      ...allMentors.map(u => u.username),
      ...allAdmins.map(u => u.username)
    ];
    
    const queryRef = query(
      collection(db, "conversations"),
      where("type", "==", "community"),
      where("communityType", "==", "all_mentors_with_admin")
    );
    
    const snapshot = await getDocs(queryRef);
    
    if (snapshot.empty) {
      // Create new community
      const newRef = doc(collection(db, "conversations"));
      await setDoc(newRef, {
        type: "community",
        communityType: "all_mentors_with_admin",
        participants: mentorAdminIds,
        participantNames: mentorAdminNames,
        lastMessage: "All mentors + admin community created!",
        lastUpdated: serverTimestamp(),
        createdAt: serverTimestamp(),
      });
    } else {
      // Update existing community
      const docRef = snapshot.docs[0].ref;
      const data = snapshot.docs[0].data();
      
      // Check if update needed
      if (mentorAdminIds.length !== data.participants.length ||
          !mentorAdminIds.every(id => data.participants.includes(id))) {
        await updateDoc(docRef, {
          participants: mentorAdminIds,
          participantNames: mentorAdminNames,
          lastMessage: "All mentors + admin community updated!",
          lastUpdated: serverTimestamp(),
        });
      }
    }
  };