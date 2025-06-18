import React, { useState, useEffect } from 'react';
import DashboardLayout from "../../components/dashboard/DashboardLayout";
import { db } from "../../config/firbaseConfig";
import { collection, query, orderBy, getDocs } from 'firebase/firestore';
import ElementalLoader from "@/theme/ElementalLoader";
import {
  Mail,
  Book,
  MessageSquare,
  // Star, // Removed Star icon import
  MoreVertical,
  Reply, // Keep Reply icon for the action button
  MailCheck, // Import MailCheck for the replied status icon
} from 'lucide-react';

const ContactMessages = () => {
  const [contacts, setContacts] = useState([]);
  const [filteredContacts, setFilteredContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [selectedContact, setSelectedContact] = useState(null);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'

  useEffect(() => {
    const fetchContacts = async () => {
      try {
        setLoading(true);
        const q = query(collection(db, "contacts"), orderBy("timestamp", "desc"));
        const querySnapshot = await getDocs(q);

        const fetchedContacts = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          isRead: false, // Add read status
          isReplied: false, // <--- New: Add replied status
          priority: 'normal' // Add priority
        }));
        setContacts(fetchedContacts);
        setFilteredContacts(fetchedContacts);
      } catch (err) {
        console.error("Error fetching contact messages:", err);
        setError("Failed to load contact messages. Please check your network connection or Firestore permissions.");
      } finally {
        setLoading(false);
      }
    };

    fetchContacts();
  }, []);

  // Filter and search functionality
  useEffect(() => {
    let filtered = contacts;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(contact =>
        contact.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contact.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contact.subject?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contact.message?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply category filter
    if (selectedFilter !== 'all') {
      filtered = filtered.filter(contact => {
        switch (selectedFilter) {
          case 'unread': return !contact.isRead;
          case 'replied': return contact.isReplied; // <--- Changed: Filter by replied status
          case 'recent': return contact.timestamp &&
            new Date() - new Date(contact.timestamp.seconds * 1000) < 24 * 60 * 60 * 1000;
          default: return true;
        }
      });
    }

    setFilteredContacts(filtered);
  }, [contacts, searchTerm, selectedFilter]);

  // Removed toggleStar as it's no longer needed
  // const toggleStar = (contactId) => {
  //   const updatedContacts = contacts.map(contact =>
  //     contact.id === contactId
  //       ? { ...contact, isStarred: !contact.isStarred }
  //       : contact
  //   );
  //   setContacts(updatedContacts);
  // };

  const markAsRead = (contactId) => {
    const updatedContacts = contacts.map(contact =>
      contact.id === contactId
        ? { ...contact, isRead: true }
        : contact
    );
    setContacts(updatedContacts);
  };

  // New function to mark a message as replied
  const markAsReplied = (contactId) => {
    const updatedContacts = contacts.map(contact =>
      contact.id === contactId
        ? { ...contact, isReplied: true }
        : contact
    );
    setContacts(updatedContacts);
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'תאריך לא זמין';

    const date = new Date(timestamp.seconds * 1000);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      return 'לפני כמה דקות';
    } else if (diffInHours < 24) {
      return `לפני ${Math.floor(diffInHours)} שעות`;
    } else if (diffInHours < 48) {
      return 'אתמול';
    } else {
      return date.toLocaleDateString('he-IL', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'border-red-500 bg-red-50';
      case 'medium': return 'border-yellow-500 bg-yellow-50';
      default: return 'border-gray-200 bg-white';
    }
  };

  // Function to handle replying to email - now also marks as replied
  const handleReplyEmail = (contact) => {
    const mailtoLink = `mailto:${contact.email}?subject=${encodeURIComponent(`RE: ${contact.subject || 'הודעה מטופס יצירת קשר'}`)}&body=${encodeURIComponent(`--- הודעה מקורית ---\nשם: ${contact.name || ''}\nאימייל: ${contact.email}\nנושא: ${contact.subject || ''}\nהודעה:\n${contact.message || ''}\n\n-------------------\n\n`)}`;
    window.open(mailtoLink, '_blank');
    markAsReplied(contact.id); // <--- Mark as replied when the mailto link is opened
  };

  // Loading State
  if (loading) {
    return <ElementalLoader />
  }

  // Error State
  if (error) {
    return (
      <DashboardLayout>
        <div className="max-w-2xl mx-auto mt-8">
          <div className="bg-gradient-to-r from-red-50 to-red-100 border border-red-200 rounded-xl p-8 text-center shadow-lg">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Mail className="w-8 h-8 text-red-600" />
            </div>
            <h2 className="text-2xl font-bold text-red-800 mb-2">אופס! שגיאה בטעינת ההודעות</h2>
            <p className="text-red-700 mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg transition-colors duration-200 font-medium"
            >
              נסה שוב
            </button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        {/* Header Section */}
        <div className="flex items-center justify-center gap-3 mb-2">
          <h1 className="text-4xl font-bold bg-black bg-clip-text text-transparent leading-[1.5]">הודעות צרו קשר</h1>
        </div>
        {/* Content Area */}
        {filteredContacts.length === 0 ? (
          <div className="bg-white rounded-xl p-12 text-center shadow-lg border border-gray-100">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <MessageSquare className="w-12 h-12 text-gray-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-3">
              {searchTerm || selectedFilter !== 'all' ? 'לא נמצאו תוצאות' : 'אין הודעות להצגה'}
            </h2>
            <p className="text-gray-600 max-w-md mx-auto">
              {searchTerm || selectedFilter !== 'all'
                ? 'נסה לשנות את מונחי החיפוש או הסינון'
                : 'כאשר משתמשים ישלחו הודעות דרך טופס יצירת הקשר, הן יופיעו כאן באופן אוטומטי.'
              }
            </p>
          </div>
        ) : (
          <div className={viewMode === 'grid'
            ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
            : "space-y-4"
          }>
            {filteredContacts.map(contact => (
              <div
                key={contact.id}
                className={`
                  ${getPriorityColor(contact.priority)}
                  ${viewMode === 'grid' ? 'p-6' : 'p-4 flex items-center space-x-4'}
                  rounded-xl shadow-sm border transition-all duration-200
                  hover:shadow-lg hover:scale-[1.02] cursor-pointer group
                `}
                onClick={() => {
                  setSelectedContact(contact);
                  markAsRead(contact.id);
                }}
              >
                {viewMode === 'grid' ? (
                  <>
                    {/* Grid View */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-500">
                          {formatDate(contact.timestamp)}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        {/* Replaced Star with MailCheck for replied status */}
                        <span
                            className={`p-1 rounded-full ${
                            contact.isReplied ? 'text-green-500' : 'text-gray-400'
                          }`}
                          title={contact.isReplied ? "הודעה זו ענתה" : "הודעה זו לא נענתה"}
                        >
                          <MailCheck size={16} />
                        </span>
                        {/* Reply Button for Grid View */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation(); // Prevent opening the contact details
                            handleReplyEmail(contact); // Pass the whole contact object
                          }}
                          className="p-1 rounded-full hover:bg-gray-100 text-blue-500"
                          title="השב למייל"
                        >
                          <Reply size={16} />
                        </button>
                        <button className="p-1 rounded-full hover:bg-gray-100 text-gray-400">
                          <MoreVertical size={16} />
                        </button>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center space-x-3">
                        <div>
                          <h3 className="font-bold text-gray-800 text-lg">
                            {contact.name || 'שם לא צוין'}
                          </h3>
                          <p className="text-sm text-gray-600">{contact.email}</p>
                        </div>
                      </div>

                      {contact.subject && (
                        <div className="bg-gray-50 rounded-lg p-3">
                          <p className="font-medium text-gray-800 flex items-center">
                            <Book size={16} className="ml-2 text-green-500" />
                            {contact.subject}
                          </p>
                        </div>
                      )}

                      <div className="bg-gray-50 rounded-lg p-4">
                        <p className="text-gray-700 text-sm leading-relaxed line-clamp-3">
                          {contact.message || 'הודעה ריקה'}
                        </p>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    {/* List View */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h3 className="font-bold text-gray-800 truncate">
                          {contact.name || 'שם לא צוין'}
                        </h3>
                        <span className="text-sm text-gray-500 flex-shrink-0 mr-4">
                          {formatDate(contact.timestamp)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 truncate">{contact.email}</p>
                      <p className="text-sm text-gray-700 truncate mt-1">
                        {contact.subject || contact.message}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      {/* Replaced Star with MailCheck for replied status */}
                      <span
                          className={`p-2 rounded-full ${
                          contact.isReplied ? 'text-green-500' : 'text-gray-400'
                        }`}
                        title={contact.isReplied ? "הודעה זו ענתה" : "הודעה זו לא נענתה"}
                      >
                        <MailCheck size={16} />
                      </span>
                      {/* Reply Button for List View */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation(); // Prevent opening the contact details
                          handleReplyEmail(contact); // Pass the whole contact object
                        }}
                        className="p-2 rounded-full hover:bg-gray-100 text-blue-500"
                        title="השב למייל"
                      >
                        <Reply size={16} />
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Contact Detail Modal */}
        {selectedContact && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-800">
                        {selectedContact.name || 'שם לא צוין'}
                      </h2>
                      <p className="text-gray-600">{selectedContact.email}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedContact(null)}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    ✕
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-6">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">תאריך:</span>
                    <p className="font-medium">{formatDate(selectedContact.timestamp)}</p>
                  </div>
                  {/* Replied Status Icon in Modal */}
                  <div className="flex items-center text-left">
                    <span
                      className={`inline-flex items-center ${
                        selectedContact.isReplied ? 'text-green-600' : 'text-gray-500'
                      }`}
                      title={selectedContact.isReplied ? "הודעה זו ענתה" : "הודעה זו לא נענתה"}
                    >
                      <MailCheck size={18} className="ml-2" />
                      {selectedContact.isReplied ? 'נענה' : 'לא נענה'}
                    </span>
                  </div>
                </div>

                {selectedContact.subject && (
                  <div>
                    <h3 className="font-bold text-gray-800 mb-2">נושא:</h3>
                    <p className="bg-gray-50 rounded-lg p-4 text-gray-700">
                      {selectedContact.subject}
                    </p>
                  </div>
                )}

                <div>
                  <h3 className="font-bold text-gray-800 mb-2">הודעה:</h3>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                      {selectedContact.message || 'הודעה ריקה'}
                    </p>
                  </div>
                </div>

                {/* Reply Button inside Modal (kept as action button) */}
                <div className="flex justify-end pt-4 border-t border-gray-100">
                    <button
                      onClick={() => handleReplyEmail(selectedContact)} // Pass the whole contact object
                      className="inline-flex items-center bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors duration-200 font-medium"
                    >
                      <Reply size={16} className="ml-2" />
                      השב למייל
                    </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default ContactMessages;