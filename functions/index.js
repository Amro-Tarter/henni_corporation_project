const functions = require('firebase-functions');
const nodemailer = require('nodemailer');
const admin = require('firebase-admin');
admin.initializeApp();

// Nodemailer config (unchanged)
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

exports.sendRequestNotification = functions.https.onCall(async (data, context) => {
  if (!context.auth || !context.auth.token.isAdmin) {
    throw new functions.https.HttpsError('permission-denied', 'Only admins can send notifications');
  }
  const { userEmail, subject, message } = data;
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: userEmail,
      subject: subject,
      text: message,
      html: message.replace(/\n/g, '<br>')
    });
    return { success: true };
  } catch (error) {
    console.error('Error sending email:', error);
    throw new functions.https.HttpsError('internal', 'Error sending email notification');
  }
});

// Delete user (admin/staff only)
exports.deleteUser = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'The function must be called while authenticated.');
  }
  const callerUid = context.auth.uid;
  const callerDoc = await admin.firestore().collection('users').doc(callerUid).get();
  const callerData = callerDoc.data();
  if (!callerData || (callerData.role !== 'admin' && callerData.role !== 'staff')) {
    throw new functions.https.HttpsError('permission-denied', 'Only admins and staff can delete users.');
  }
  try {
    const { uid } = data;
    // Delete user from Auth
    await admin.auth().deleteUser(uid);
    // Remove from all top-level role collections
    const roleCollections = ['staff', 'mentors', 'participants', 'family'];
    await Promise.all(roleCollections.map(collection =>
      admin.firestore().collection(collection).doc(uid).delete().catch(() => {})
    ));
    // Delete user and profile docs
    await admin.firestore().collection('users').doc(uid).delete();
    await admin.firestore().collection('profiles').doc(uid).delete();
    return { success: true };
  } catch (error) {
    console.error('Error deleting user:', error);
    throw new functions.https.HttpsError('internal', error.message || 'An error occurred while deleting the user.');
  }
});

// Update user role (admin only)
exports.updateUserRole = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'The function must be called while authenticated.');
  }
  const callerUid = context.auth.uid;
  const callerDoc = await admin.firestore().collection('users').doc(callerUid).get();
  const callerData = callerDoc.data();
  if (!callerData || callerData.role !== 'admin') {
    throw new functions.https.HttpsError('permission-denied', 'Only admins can update user roles.');
  }
  try {
    const { uid, newRole, userData } = data;
    const userRef = admin.firestore().collection('users').doc(uid);
    // Update user document with new role
    await userRef.update({
      role: newRole,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    // Remove from all role collections
    const roleCollections = ['staff', 'mentors', 'participants', 'family'];
    await Promise.all(roleCollections.map(collection =>
      admin.firestore().collection(collection).doc(uid).delete().catch(() => {})
    ));

    // Add to the appropriate collection (never 'user'; always 'participant' for that role)
    let targetCollection = newRole === 'user' ? 'participants' : newRole;
    if (targetCollection === 'user') targetCollection = 'participants';
    if (targetCollection !== 'admin') { // no collection for admin
      await admin.firestore().collection(targetCollection).doc(uid).set({
        ...userData,
        role: targetCollection,
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
    }

    // Update custom claims in Auth
    await admin.auth().setCustomUserClaims(uid, { role: newRole });
    return { success: true };
  } catch (error) {
    console.error('Error updating user role:', error);
    throw new functions.https.HttpsError('internal', error.message || 'An error occurred while updating the user role.');
  }
});
