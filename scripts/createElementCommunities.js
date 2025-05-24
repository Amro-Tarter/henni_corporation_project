// Usage: node scripts/createElementCommunities.js
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

const ELEMENTS = [
  'fire',
  'water',
  'earth',
  'air',
  'metal',
];

async function main() {
  // Initialize Firebase
  const app = initializeApp(firebaseConfig);
  const db = getFirestore(app);

  for (const element of ELEMENTS) {
    // Check if community exists
    const q = query(
      collection(db, 'conversations'),
      where('type', '==', 'community'),
      where('element', '==', element)
    );
    const snapshot = await getDocs(q);
    if (!snapshot.empty) {
      console.log(`Community for element '${element}' already exists.`);
      continue;
    }
    // Create community
    const communityRef = doc(collection(db, 'conversations'));
    await setDoc(communityRef, {
      participants: [],
      participantNames: [],
      type: 'community',
      communityType: 'element',
      element,
      lastMessage: 'Community created!',
      lastUpdated: serverTimestamp(),
      createdAt: serverTimestamp(),
    });
    console.log(`Created community for element '${element}'.`);
  }
  process.exit(0);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
}); 