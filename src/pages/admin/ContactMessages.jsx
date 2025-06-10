import React, { useState, useEffect } from 'react';
import DashboardLayout from "../../components/dashboard/DashboardLayout"; 
import { db } from "../../config/firbaseConfig";
import { collection, query, orderBy, getDocs } from 'firebase/firestore';
import ElementalLoader from "@/theme/ElementalLoader";
import { Mail, User, Book, MessageSquare, Clock } from 'lucide-react'; // Icons for better display

const ContactMessages = () => {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchContacts = async () => {
      try {
        setLoading(true);
        // Create a query to get documents from 'contact' collection, ordered by timestamp
        const q = query(collection(db, "contacts"), orderBy("timestamp", "desc"));
        const querySnapshot = await getDocs(q);

        const fetchedContacts = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setContacts(fetchedContacts);
      } catch (err) {
        console.error("Error fetching contact messages:", err);
        setError("Failed to load contact messages. Please check your network connection or Firestore permissions.");
      } finally {
        setLoading(false);
      }
    };

    fetchContacts();
  }, []);

  // --- Loading State ---
  if (loading) {
    return (
      
          <ElementalLoader />
        
    );
  }

  // --- Error State ---
  if (error) {
    return (
      <DashboardLayout>
        <div className="bg-red-50 border border-red-300 text-red-700 p-6 rounded-lg shadow-sm text-center">
          <p className="font-bold text-xl mb-2">אופס! שגיאה בטעינת ההודעות</p>
          <p>{error}</p>
          <p className="mt-3 text-sm">אנא נסה/י לרענן את העמוד או פנה/י לתמיכה.</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-6 bg-white rounded-lg shadow-md">
        <h1 className="text-3xl font-extrabold text-black mb-6 border-b pb-4">
          הודעות "צרו קשר" שהתקבלו
        </h1>

        {contacts.length === 0 ? (
          // --- No Contacts State ---
          <div className="text-center text-gray-600 p-8 bg-gray-150 rounded-lg border ">
            <p className="text-xl font-semibold">אין כרגע הודעות "צרו קשר" להצגה.</p>
            <p className="text-md mt-3">כאשר משתמשים ישלחו הודעות דרך טופס יצירת הקשר, הן יופיעו כאן באופן אוטומטי.</p>
          </div>
        ) : (
          // --- Display Contacts ---
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {contacts.map(contact => (
              <div key={contact.id} className="bg-gray-50 p-6 rounded-xl shadow-sm border  transition-transform hover:scale-[1.02] hover:shadow-md">
                <div className="flex items-center text-sm text-gray-500 mb-3 border-b pb-2 border-black-200">
                  <Clock size={16} className="ml-2 text-gray-400" />
                  <span className="text-gray-700">
                    {contact.timestamp ? new Date(contact.timestamp.seconds * 1000).toLocaleString('he-IL', {
                      year: 'numeric', month: 'short', day: 'numeric',
                      hour: '2-digit', minute: '2-digit', second: '2-digit'
                    }) : 'תאריך לא זמין'}
                  </span>
                </div>

                <h2 className="text-xl font-bold text-gray-700 mb-3 flex items-center">
                  <User size={20} className="ml-2 text-orange-600" />
                  {contact.name || 'שם לא צוין'}
                </h2>

                <p className="text-gray-700 mb-2 flex items-center">
                  <Mail size={18} className="ml-2 text-blue-500" />
                  <a href={`mailto:${contact.email}`} className="text-blue-600 hover:underline font-medium">
                    {contact.email || 'אימייל לא צוין'}
                  </a>
                </p>

                {contact.subject && (
                  <p className="text-gray-700 mb-2 flex items-center">
                    <Book size={18} className="ml-2 text-green-500" />
                    <span className="font-medium">נושא:</span> {contact.subject}
                  </p>
                )}

                <div className="mt-4 pt-4 border-t border-gray-200">
                  <p className="font-semibold text-gray-800 mb-2 flex items-center">
                    <MessageSquare size={18} className="ml-2 text-purple-500" />
                    הודעה:
                  </p>
                  <p className="text-gray-600 leading-relaxed p-4 rounded-md border border-black-200 text-sm">
                    {contact.message || 'הודעה ריקה'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default ContactMessages;