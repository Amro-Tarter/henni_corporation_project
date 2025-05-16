import { httpsCallable } from 'firebase/functions';
import { functions } from '../config/firbaseConfig';

export const sendRequestNotification = async (userEmail: string, action: 'accept' | 'reject', userName: string) => {
  try {
    const sendEmail = httpsCallable(functions, 'sendRequestNotification');
    await sendEmail({
      userEmail,
      action,
      userName,
      subject: action === 'accept' 
        ? 'בקשת ההצטרפות שלך אושרה' 
        : 'בקשת ההצטרפות שלך נדחתה',
      message: action === 'accept'
        ? `שלום ${userName},\n\nבקשת ההצטרפות שלך לארגון אושרה בהצלחה. כעת תוכל להתחבר ולגשת לכל התכונות של הארגון.\n\nבברכה,\nצוות הארגון`
        : `שלום ${userName},\n\nמצטערים להודיע שבקשת ההצטרפות שלך לארגון נדחתה.\n\nבברכה,\nצוות הארגון`
    });
  } catch (error) {
    console.error('Error sending email notification:', error);
    throw error;
  }
}; 