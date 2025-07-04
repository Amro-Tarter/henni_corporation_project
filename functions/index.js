/**
 * Import function triggers from their respective submodules:
 *
 * const {onCall} = require("firebase-functions/v2/https");
 * const {onDocumentWritten} = require("firebase-functions/v2/firestore");
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

const { onRequest } = require("firebase-functions/v2/https");
const logger = require("firebase-functions/logger");
const functions = require('firebase-functions');
const admin = require('firebase-admin'); // Import Firebase Admin SDK
const nodemailer = require('nodemailer');

// Initialize Firebase Admin SDK
admin.initializeApp();

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
    if (!context.auth || !context.auth.token.isAdmin) { // Assuming isAdmin is a custom claim
        throw new functions.https.HttpsError(
            'permission-denied',
            'Only admins can send notifications'
        );
    }

    const { userEmail, action, userName, subject, message } = data; // 'action' and 'userName' are not used in this function, consider removing them if not needed here

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

// NEW FUNCTION: Updates Firestore when user's email is verified in Firebase Auth
exports.updateUserEmailVerificationStatus = functions.auth.user().onUpdate(async (change, context) => {
    const oldUser = change.before;
    const newUser = change.after;

    // Only proceed if the emailVerified status has actually changed from false to true
    if (oldUser.emailVerified === false && newUser.emailVerified === true) {
        const uid = newUser.uid;
        try {
            await admin.firestore().collection('users').doc(uid).update({
                is_email_verified: true,
                emailVerifiedAt: admin.firestore.FieldValue.serverTimestamp() // Optional: record when it was verified
            });
            logger.info(`User ${uid} email verification status updated to true in Firestore.`);
        } catch (error) {
            logger.error(`Error updating user ${uid} email verification status in Firestore:`, error);
        }
    }
    return null; // Important: Cloud Functions must return a Promise, a value, or null
});