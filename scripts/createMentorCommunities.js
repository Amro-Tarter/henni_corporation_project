// Usage: node scripts/createMentorCommunities.js
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, query, where, getDocs, doc, setDoc, serverTimestamp } from 'firebase/firestore';

const firebaseConfig = {
    apiKey: "AIzaSyAIr7HfC8TPWAv_DaFx5uQbnCF4xyPX2gI",
    authDomain: "henini-prj.firebaseapp.com",
    projectId: "henini-prj",
    storageBucket: "henini-prj.firebasestorage.app",
    messagingSenderId: "702193062188",
    appId: "1:702193062188:web:8d7220d07ab17ef48a1c89",
    measurementId: "G-5JHE2J4RP2"
  };

const COMMUNITIES = [
  {
    element: 'mentors',
    name: 'Mentors Community',
    description: 'Community for all mentors',
    communityType: 'mentors',
  },
  {
    element: 'mentors_admins',
    name: 'Mentors & Admins Community',
    description: 'Community for all mentors and admins',
    communityType: 'mentors_admins',
  }
];

async function main() {
  // Initialize Firebase
  const app = initializeApp(firebaseConfig);
  const db = getFirestore(app);

  // Create general mentor/admin communities
  for (const community of COMMUNITIES) {
    // Check if community exists
    const q = query(
      collection(db, 'conversations'),
      where('type', '==', 'community'),
      where('element', '==', community.element)
    );
    const snapshot = await getDocs(q);
    if (!snapshot.empty) {
      console.log(`Community '${community.name}' already exists.`);
      continue;
    }
    // Create community
    const communityRef = doc(collection(db, 'conversations'));
    await setDoc(communityRef, {
      participants: [],
      participantNames: [],
      type: 'community',
      communityType: community.communityType,
      name: community.name,
      description: community.description,
      lastMessage: 'Community created!',
      lastUpdated: serverTimestamp(),
      createdAt: serverTimestamp(),
    });
    console.log(`Created community '${community.name}'.`);
  }

  // Create a community for each mentor with their participants
  // 1. Get all mentors
  const mentorsSnap = await getDocs(query(collection(db, 'users'), where('role', '==', 'mentor')));
  for (const mentorDoc of mentorsSnap.docs) {
    const mentor = mentorDoc.data();
    const mentorId = mentorDoc.id;
    const mentorUsername = mentor.username || mentorId;
    // 2. Find all participants for this mentor
    const participantsSnap = await getDocs(query(collection(db, 'users'), where('associated_id', '==', mentorId)));
    const participantIds = participantsSnap.docs.map(doc => doc.id);
    const participantNames = participantsSnap.docs.map(doc => doc.data().username || doc.id);
    // 3. Check if community exists
    const element = `mentor_${mentorId}`;
    const q = query(
      collection(db, 'conversations'),
      where('type', '==', 'community'),
      where('element', '==', element)
    );
    const snapshot = await getDocs(q);
    if (!snapshot.empty) {
      console.log(`Community for mentor '${mentorUsername}' already exists.`);
      continue;
    }
    // 4. Create the mentor's community
    const communityRef = doc(collection(db, 'conversations'));
    await setDoc(communityRef, {
      participants: [mentorId, ...participantIds],
      participantNames: [mentorUsername, ...participantNames],
      type: 'community',
      communityType: 'mentor-participants',
      name: `Mentor ${mentorUsername} Community`,
      description: `Community for mentor ${mentorUsername} and their participants`,
      lastMessage: 'Community created!',
      lastUpdated: serverTimestamp(),
      createdAt: serverTimestamp(),
    });
    console.log(`Created community for mentor '${mentorUsername}'.`);
  }

  process.exit(0);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
}); 