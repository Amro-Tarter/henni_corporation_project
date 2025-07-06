// functions/index.js

// Import V2 HTTP and Firestore triggers
const { onCall, HttpsError } = require("firebase-functions/v2/https");
const { onDocumentUpdated } = require("firebase-functions/v2/firestore"); // Use onDocumentUpdated for onUpdate equivalent

const admin = require('firebase-admin'); // Firebase Admin SDK
const nodemailer = require('nodemailer'); // For sendRequestNotification (currently commented out)

// Initialize Firebase Admin SDK
admin.initializeApp();

// Initialize Firestore from Admin SDK for database operations
const db = admin.firestore();


/**
 * Callable Function: sendRequestNotification
 * (Currently commented out)
 */
/*
exports.sendRequestNotification = onCall(async (request) => { // V2 onCall takes a single 'request' object
    // Verify admin status
    if (!request.auth || !request.auth.token.isAdmin) {
        throw new HttpsError('permission-denied', 'Only admins can send notifications');
    }

    const { userEmail, subject, message } = request.data;

    try {
        await transporter.sendMail({
            from: admin.config().email.user,
            to: userEmail,
            subject: subject,
            text: message,
            html: message.replace(/\n/g, '<br>')
        });

        console.log(`Email notification sent to ${userEmail} for subject: ${subject}`);
        return { success: true, message: 'Email notification sent successfully.' };

    } catch (error) {
        console.error('Error sending email:', error);
        throw new HttpsError('internal', 'Error sending email notification', error.message);
    }
});
*/


/**
 * Callable Function: updateEmailVerifiedInFirestore (Generation 2)
 */
// updateEmailVerifiedInFirestore
exports.updateEmailVerifiedInFirestore = onCall(
  { region: 'us-central1' },
  async (request) => {
    if (!request.auth) {
        throw new HttpsError('unauthenticated', 'The function must be called while authenticated.');
    }
    const uid = request.auth.uid;
    try {
        const userRecord = await admin.auth().getUser(uid);
        const emailVerifiedStatus = userRecord.emailVerified;
        const userDocRef = db.collection('users').doc(uid);
        const userDocSnap = await userDocRef.get();

        if (!userDocSnap.exists) {
            return { success: false, message: 'User document not found.' };
        }

        const currentFirestoreStatus = userDocSnap.data().is_email_verified;

        if (emailVerifiedStatus !== currentFirestoreStatus) {
            await userDocRef.update({
                is_email_verified: emailVerifiedStatus,
                emailVerifiedAt: emailVerifiedStatus ? admin.firestore.FieldValue.serverTimestamp() : null
            });
            return { success: true, message: `Email verification status updated to ${emailVerifiedStatus}.` };
        } else {
            return { success: true, message: 'Email verification status already synced or no change needed.' };
        }
    } catch (error) {
        throw new HttpsError('internal', 'Failed to update email verification status.', error.message);
    }
  }
);


/**
 * Firestore Trigger: syncRoleToAuthClaims (Generation 2)
 */
// syncRoleToAuthClaims
exports.syncRoleToAuthClaims = onDocumentUpdated(
  {
    region: 'us-central1',
    document: 'users/{userId}'
  },
  async (event) => {
    const userId = event.params.userId;
    const newData = event.data.after.data();
    const previousData = event.data.before.data();

    if (newData.role !== previousData.role) {
        const userRole = newData.role;
        const isAdmin = (userRole === 'admin');

        try {
            await admin.auth().setCustomUserClaims(userId, { isAdmin : true, role: 'admin' });
            await db.collection('users').doc(userId).update({
                claimsSyncedAt: admin.firestore.FieldValue.serverTimestamp()
            });
        } catch (error) {
            console.error(`Error syncing role status for user ${userId}:`, error);
        }
    }
    return null;
  }
);


/**
 * Callable Function: cascadeDeleteUserCallable (Generation 2)
 */
exports.cascadeDeleteUserCallable = onCall(
    { region: 'us-central1' },
    async (request) => {
     
    // 1. Authentication and Authorization Check
    if (!request.auth || !request.auth.token.isAdmin) {
        throw new HttpsError('permission-denied', 'Admins only can delete users.');
    }

    const { uid } = request.data;

    if (!uid) {
        throw new HttpsError('invalid-argument', 'The UID is required for deletion.');
    }

    try {
        // --- 1. Delete from Firebase Auth ---
        await admin.auth().deleteUser(uid);
        console.log(`Successfully deleted user ${uid} from Firebase Auth.`);

        // --- 2. Delete from Firestore: users collection ---
        await db.collection("users").doc(uid).delete();
        console.log(`Deleted user document from 'users' for UID: ${uid}`);

        // --- 3. Delete from Firestore: profiles collection ---
        await db.collection("profiles").doc(uid).delete();
        console.log(`Deleted profile document from 'profiles' for UID: ${uid}`);

        // --- 4. Delete conversations & messages ---
        const conversationRef = db.collection("conversations").doc(uid);
        const messagesRef = conversationRef.collection("messages");
        const messagesSnapshot = await messagesRef.get();
        const messageDeletePromises = [];
        messagesSnapshot.forEach(doc => {
            messageDeletePromises.push(doc.ref.delete());
        });
        await Promise.all(messageDeletePromises);
        console.log(`Deleted all messages for conversation with UID: ${uid}`);

        await conversationRef.delete();
        console.log(`Deleted conversation document for UID: ${uid}`);


        // --- 5. Delete posts & comments by user ---
        const postsQuery = db.collection("posts").where("authorId", "==", uid);
        const postsSnapshot = await postsQuery.get();
        const postDeletePromises = [];
        for (const postDoc of postsSnapshot.docs) {
            const commentsRef = db.collection("posts").doc(postDoc.id).collection("comments");
            const commentsSnapshot = await commentsRef.get();
            const commentDeletePromises = [];
            commentsSnapshot.forEach(commentDoc => {
                commentDeletePromises.push(commentDoc.ref.delete());
            });
            await Promise.all(commentDeletePromises);
            console.log(`Deleted comments for post ${postDoc.id}`);

            postDeletePromises.push(postDoc.ref.delete());
        }
        await Promise.all(postDeletePromises);
        console.log(`Deleted all posts and their comments by authorId: ${uid}`);


        // --- 6. Delete comments the user made on others' posts ---
        const allPostsSnapshot = await db.collection("posts").get();
        const crossPostCommentDeletePromises = [];
        for (const postDoc of allPostsSnapshot.docs) {
            const commentsRef = db.collection("posts").doc(postDoc.id).collection("comments");
            const commentsSnapshot = await commentsRef.where("authorId", "==", uid).get();
            commentsSnapshot.forEach(commentDoc => {
                crossPostCommentDeletePromises.push(commentDoc.ref.delete());
            });
        }
        await Promise.all(crossPostCommentDeletePromises);
        console.log(`Deleted comments made by UID ${uid} on other users' posts.`);


        // --- 7. Delete mentorship where user is mentor ---
        const mentorMentorshipQuery = db.collection("mentorship").where("mentorId", "==", uid);
        const mentorMentorshipSnapshot = await mentorMentorshipQuery.get();
        const mentorMentorshipDeletePromises = [];
        mentorMentorshipSnapshot.forEach(doc => {
            mentorMentorshipDeletePromises.push(doc.ref.delete());
        });
        await Promise.all(mentorMentorshipDeletePromises);
        console.log(`Deleted mentorship records where UID ${uid} was the mentor.`);


        // --- 8. Delete mentorship where user is participant ---
        const participantMentorshipQuery = db.collection("mentorship").where("participantId", "==", uid);
        const participantMentorshipSnapshot = await participantMentorshipQuery.get();
        const participantMentorshipDeletePromises = [];
        participantMentorshipSnapshot.forEach(doc => {
            participantMentorshipDeletePromises.push(doc.ref.delete());
        });
        await Promise.all(participantMentorshipDeletePromises);
        console.log(`Deleted mentorship records where UID ${uid} was the participant.`);


        return { success: true, message: `User ${uid} and associated data deleted successfully.` };

    } catch (error) {
        console.error("Error during cascade user deletion for UID:", uid, error);
        throw new HttpsError('internal', 'Failed to perform cascade deletion.', error.message);
    }
});