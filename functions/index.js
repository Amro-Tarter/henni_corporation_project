/**
 * Import function triggers from their respective submodules:
 *
 * const {onCall} = require("firebase-functions/v2/https");
 * const {onDocumentWritten} = require("firebase-functions/v2/firestore");
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

const {onRequest} = require("firebase-functions/v2/https");
const logger = require("firebase-functions/logger");
const functions = require('firebase-functions');
const nodemailer = require('nodemailer');
const admin = require('firebase-admin');

// Create and deploy your first functions
// https://firebase.google.com/docs/functions/get-started

// exports.helloWorld = onRequest((request, response) => {
//   logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });

// Configure email transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

exports.sendRequestNotification = functions.https.onCall(async (data, context) => {
  // Verify admin status
  if (!context.auth || !context.auth.token.isAdmin) {
    throw new functions.https.HttpsError(
      'permission-denied',
      'Only admins can send notifications'
    );
  }

  const { userEmail, action, userName, subject, message } = data;

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
    throw new functions.https.HttpsError(
      'internal',
      'Error sending email notification'
    );
  }
});

admin.initializeApp();

exports.deleteUser = functions.https.onCall(async (data, context) => {
  // Check if the request is authenticated
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'The function must be called while authenticated.'
    );
  }

  // Check if the user has admin privileges
  const callerUid = context.auth.uid;
  const callerDoc = await admin.firestore().collection('users').doc(callerUid).get();
  const callerData = callerDoc.data();

  if (!callerData || (callerData.role !== 'admin' && callerData.role !== 'staff')) {
    throw new functions.https.HttpsError(
      'permission-denied',
      'Only admins and staff can delete users.'
    );
  }

  try {
    const { uid } = data;
    
    // Delete the user from Firebase Auth
    await admin.auth().deleteUser(uid);
    
    return { success: true };
  } catch (error) {
    console.error('Error deleting user:', error);
    throw new functions.https.HttpsError(
      'internal',
      'An error occurred while deleting the user.'
    );
  }
});
