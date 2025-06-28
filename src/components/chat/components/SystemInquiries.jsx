import { useState, useEffect, useRef } from 'react';
import { db, storage } from '@/config/firbaseConfig';
import { collection, addDoc, getDocs, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { HiOutlineMailOpen, HiOutlineX } from 'react-icons/hi';
import innerNoteSound from "@/assets/innerNoteSound.mp3"

function InquirySystemNotification({ message, type, onClose, actions, duration = 3500, elementColors }) {
    const [visible, setVisible] = useState(true);
    const fadeDuration = 500; // ms

    useEffect(() => {
        const audio = new window.Audio(innerNoteSound);
        audio.play();
    }, []);
  
    useEffect(() => {
      if (duration) {
        
        const timer = setTimeout(() => {
          setVisible(false);
          setTimeout(() => {
            onClose();
          }, fadeDuration);
        }, duration);
        return () => clearTimeout(timer);
      }
    }, [duration, onClose]);
  
    // Determine colors
    let bgColor, borderColor, textColor, hoverColor;
    if (type === 'error') {
      bgColor = 'bg-red-50';
      borderColor = 'border border-red-200';
      textColor = 'text-red-800';
      hoverColor = 'hover:bg-red-200';
    } else if (type === 'success') {
      bgColor = 'bg-green-50';
      borderColor = 'border border-green-200';
      textColor = 'text-green-800';
      hoverColor = 'hover:bg-green-200';
    } else {
      // Use elementColors for info/default
      bgColor = elementColors?.light ? '' : 'bg-blue-50';
      borderColor = elementColors?.light ? '' : 'border border-blue-200';
      textColor = elementColors?.primary ? '' : 'text-blue-800';
      hoverColor = elementColors?.hover ? '' : 'hover:bg-blue-200';
    }
  
    // Inline style for element colors (info/default)
    const infoStyle = type === 'error' || type === 'success' ? {} : {
      backgroundColor: elementColors?.light || undefined,
      border: elementColors?.primary ? `1px solid ${elementColors.primary}33` : undefined,
    };
    const infoTextStyle = type === 'error' || type === 'success' ? {} : {
      color: elementColors?.primary || undefined,
    };
    const infoHoverStyle = type === 'error' || type === 'success' ? {} : {
      backgroundColor: elementColors?.hover || undefined,
    };
  
    const handleClose = () => {
        setVisible(false);
        setTimeout(() => {
            onClose();
        }, fadeDuration);
    };

    return (
      <div
        className={
            `fixed top-6 left-1/2 z-50 w-full max-w-md px-4 sm:px-0 mt-10 flex justify-center transition-opacity duration-500` +
            (visible ? ' opacity-100' : ' opacity-0')
        }
        style={{ transform: 'translateX(-50%)' }}
      >
        <div
          className={`rounded-lg shadow-lg p-4 animate-fade-in flex items-center justify-between gap-4 ${bgColor} ${borderColor}`}
          style={infoStyle}
        >
          <div className="flex items-center gap-3 flex-1">
            {type === 'error' && (
              <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            )}
            {type === 'success' && (
              <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
            )}
            <p className={`text-sm font-medium ${textColor}`} style={infoTextStyle}>
              {message}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {actions && (
              <div className="flex items-center gap-2">
                {actions}
              </div>
            )}
            <button
              onClick={handleClose}
              className={`p-1 rounded-full hover:bg-opacity-20 ${hoverColor}`}
              style={infoHoverStyle}
            >
              <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    );
  }

export default function SystemInquiries({ onClose, currentUser, elementColors, onHideSystemCalls, onSent }) {
    const [systemCallRecipient, setSystemCallRecipient] = useState('');
    const [systemCallRecipientId, setSystemCallRecipientId] = useState('');
    const [systemCallSubject, setSystemCallSubject] = useState('');
    const [systemCallContent, setSystemCallContent] = useState('');
    const [systemCallFile, setSystemCallFile] = useState(null);
    const [systemCallError, setSystemCallError] = useState('');
    const [isSubmittingSystemCall, setIsSubmittingSystemCall] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [possibleRecipients, setPossibleRecipients] = useState([]);
    const [userMap, setUserMap] = useState({});
    const [showDropdown, setShowDropdown] = useState(false);
    const recipientInputRef = useRef(null);
    const [recipient, setRecipient] = useState('');
    const [users, setUsers] = useState([]);
    const [inquirySystemNotification, setInquirySystemNotification] = useState(null);
    const MAX_FILE_SIZE = 5 * 100 * 1024 * 1024; // 500MB

    useEffect(() => {
        const fetchUsers = async () => {
            const usersSnapshot = await getDocs(collection(db, 'users'));
            const users = usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setUsers(users);
        };
        fetchUsers();
        const urlParams = new URLSearchParams(window.location.search);
        const recipient_name = urlParams.get('recipient');
        const recipient_id = users.find(u => u.username === recipient_name)?.id;
        if (recipient_name) {   
            setRecipient(recipient_name);
            setSystemCallRecipient(recipient_name);
            setSystemCallRecipientId(recipient_id);
        }   
    }, [users]);

    // Fetch possible recipients from users collection
    useEffect(() => {
        const fetchRecipients = async () => {
            const usersSnapshot = await getDocs(collection(db, 'users'));
            const users = usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            let filtered = [];
            if (currentUser.role === 'admin') {
                filtered = users.filter(u => u.id !== currentUser.uid && (u.role === 'mentor' || u.role === 'participant') && u.is_active);
            } else {
                filtered = users.filter(u => u.role === 'admin');
            }
            setPossibleRecipients(filtered);
            // Map for quick username lookup
            const map = {};
            users.forEach(u => { if (u.is_active) map[u.id] = u.username || u.id; });
            setUserMap(map);
        };
        fetchRecipients();
    }, [currentUser]);

    // Filtered recipient options for dropdown
    const filteredRecipientOptions = systemCallRecipient
        ? possibleRecipients.filter(u =>
            (u.username || '').toLowerCase().includes(systemCallRecipient.toLowerCase())
        )
        : possibleRecipients;

    const handleRecipientInput = (e) => {
        setSystemCallRecipient(e.target.value);
        setShowDropdown(true);
        setSystemCallRecipientId('');
    };

    const handleRecipientSelect = (user) => {
        setSystemCallRecipient(user.username);
        setSystemCallRecipientId(user.id);
        setShowDropdown(false);
    };

    const handleSystemCallFileChange = (e) => {
        const file = e.target.files[0] || null;
        if (file) {
            // Allowed types: image, video, audio, pdf, doc, docx, txt
            const allowedTypes = [
                'image/', 'video/', 'audio/',
                'application/pdf',
                'application/msword',
                'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                'text/plain'
            ];
            const isAllowed = allowedTypes.some(type => file.type.startsWith(type) || file.name.endsWith('.doc') || file.name.endsWith('.docx') || file.name.endsWith('.pdf') || file.name.endsWith('.txt'));
            if (!isAllowed) {
                setSystemCallError('סוג הקובץ אינו נתמך. ניתן לצרף קבצי תמונה, וידאו, קול, PDF, DOC, DOCX, TXT.');
                setSystemCallFile(null);
                return;
            }
            if (file.size > MAX_FILE_SIZE) {
                setSystemCallError('הקובץ גדול מדי. הגודל המרבי הוא 100MB.');
                setSystemCallFile(null);
                return;
            }
            setSystemCallError('');
        }
        setSystemCallFile(file);
    };

    const handleSystemCallSubmit = async (e) => {
        e.preventDefault();
        setSystemCallError('');
        
        if (!systemCallRecipientId) {
            setSystemCallError('יש לבחור נמען מהרשימה.');
            setInquirySystemNotification && setInquirySystemNotification({ 
                message: 'יש לבחור נמען מהרשימה.', 
                type: 'error',
                duration: 3500,
                elementColors: elementColors
            });
            return;
        }

        if (!systemCallSubject.trim()) {
            setSystemCallError('יש להזין נושא.');
            setInquirySystemNotification && setInquirySystemNotification({ 
                message: 'יש להזין נושא.', 
                type: 'error',
                duration: 3500,
                elementColors: elementColors
            });
            return;
        }

        if (!systemCallContent.trim()) {
            setSystemCallError('יש להזין תוכן הפנייה.');
            setInquirySystemNotification && setInquirySystemNotification({ 
                message: 'יש להזין תוכן הפנייה.', 
                type: 'error',
                duration: 3500,
                elementColors: elementColors
            });
            return;
        }

        setIsSubmittingSystemCall(true);
        let fileUrl = null;
        let fileMeta = {};
        try {
            // Upload file if present
            if (systemCallFile) {
                const storageReference = ref(storage, `system_of_inquiries/${currentUser.uid}_${Date.now()}_${systemCallFile.name}`);
                const uploadTask = uploadBytesResumable(storageReference, systemCallFile);
                await new Promise((resolve, reject) => {
                    uploadTask.on('state_changed',
                        (snapshot) => {
                            setUploadProgress((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
                        },
                        reject,
                        async () => {
                            fileUrl = await getDownloadURL(uploadTask.snapshot.ref);
                            fileMeta = {
                                fileName: systemCallFile.name,
                                fileSize: systemCallFile.size,
                                fileType: systemCallFile.type,
                            };
                            resolve();
                        }
                    );
                });
            }
            // Save to system_of_inquiries collection
            const inquiryData = {
                sender: currentUser.uid,
                senderName: currentUser.username,
                recipient: systemCallRecipientId,
                senderRole: currentUser.role,
                recipientName: userMap[systemCallRecipientId] || systemCallRecipient,
                subject: systemCallSubject,
                content: systemCallContent,
                createdAt: serverTimestamp(),
                ...(fileUrl ? { fileUrl, ...fileMeta } : {}),
                status: 'closed',
            };
            await addDoc(collection(db, 'system_of_inquiries'), inquiryData);
            setIsSubmittingSystemCall(false);
            setSystemCallSubject('');
            setSystemCallContent('');
            setSystemCallFile(null);
            setSystemCallRecipient('');
            setSystemCallRecipientId('');
            setSystemCallError('');
            if (onSent) onSent();
            setInquirySystemNotification && setInquirySystemNotification({ 
                message: 'הפנייה נשלחה בהצלחה!', 
                type: 'success',
                duration: 2500,
                elementColors: elementColors
            });
            setTimeout(() => {
                onClose();
            }, 2500);

        } catch (err) {
            setSystemCallError('שגיאה בשליחת הפנייה: ' + err.message);
            setIsSubmittingSystemCall(false);
            setInquirySystemNotification && setInquirySystemNotification({ 
                message: 'שגיאה בשליחת הפנייה: ' + err.message, 
                type: 'error',
                duration: 3500,
                elementColors: elementColors
            });
        }
    };

    // Handle click outside dropdown to close
    useEffect(() => {
        function handleClickOutside(event) {
            if (recipientInputRef.current && !recipientInputRef.current.contains(event.target)) {
                setShowDropdown(false);
            }
        }
        if (showDropdown) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showDropdown]);

    return (
        <div className="flex-1 flex flex-col items-center justify-center bg-gray-50 min-h-full p-6 min-w-full animate-fade-in" dir="rtl">

            <div className="w-full max-w-lg bg-white shadow-2xl rounded-2xl p-0 overflow-hidden border-2" style={{ borderColor: elementColors?.primary }}>
                {/* Header */}
                <div className="flex items-center justify-between px-8 py-6 bg-gradient-to-l from-white to-gray-50 border-b" style={{ borderColor: elementColors?.primary }}>
                    <div className="flex items-center gap-3">
                        <span className="bg-blue-100 p-2 rounded-full">
                            <HiOutlineMailOpen className="text-2xl" style={{ color: elementColors?.primary }} />
                        </span>
                        <h2 className="text-2xl font-bold" style={{ color: elementColors?.primary }}>מערכת פניות - פנייה חדשה</h2>
                    </div>
                    <button
                        className="text-2xl font-bold hover:bg-gray-200 rounded-full p-2 transition"
                        style={{ color: elementColors?.primary }}
                        onClick={onClose}
                        aria-label="סגור מערכת פניות"
                    >
                        <HiOutlineX />
                    </button>
                </div>
                {/* Form */}
                <form onSubmit={handleSystemCallSubmit} className="space-y-6 px-8 py-6">
                    <div ref={recipientInputRef} className="relative">
                        <label className="block text-sm font-semibold mb-1" style={{ color: elementColors?.primary }}>נמען</label>
                        {recipient ? <input
                            disabled
                            type="text"
                            className="w-full border rounded-lg p-3 text-right focus:ring-2 focus:ring-blue-200 transition shadow-sm bg-gray-50"
                            style={{ borderColor: elementColors?.primary, background: elementColors?.light }}
                            onChange={handleRecipientInput}
                            value={recipient}
                            placeholder="התחל להקליד שם..."
                            autoComplete="off"
                            required
                        /> : <input
                            type="text"
                            className="w-full border rounded-lg p-3 text-right focus:ring-2 focus:ring-blue-200 transition shadow-sm bg-gray-50"
                            style={{ borderColor: elementColors?.primary, background: elementColors?.light }}
                            value={systemCallRecipient}
                            onChange={handleRecipientInput}
                            placeholder="התחל להקליד שם..."
                            autoComplete="off"
                            required
                        />}
                        {showDropdown && filteredRecipientOptions.length > 0 && !recipient && (
                            <div className="absolute z-20 w-full bg-white border rounded-lg shadow-lg mt-1 max-h-40 overflow-y-auto animate-fade-in border-blue-100">
                                {filteredRecipientOptions.map(user => (
                                    <div
                                        key={user.id}
                                        className="p-2 hover:bg-blue-50 cursor-pointer text-right transition"
                                        onClick={() => handleRecipientSelect(user)}
                                    >
                                        {user.username} {user.role === 'admin' ? '(מנהל)' : user.role === 'mentor' ? '(מנחה)' : user.role === 'participant' ? '(משתתף)' : ''}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                    <div>
                        <label className="block text-sm font-semibold mb-1" style={{ color: elementColors?.primary }}>נושא</label>
                        <input
                            type="text"
                            className="w-full border rounded-lg p-3 text-right focus:ring-2 focus:ring-blue-200 transition shadow-sm bg-gray-50"
                            style={{ borderColor: elementColors?.primary, background: elementColors?.light }}
                            value={systemCallSubject}
                            onChange={e => setSystemCallSubject(e.target.value)}
                            required
                            placeholder="נושא הפנייה"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold mb-1" style={{ color: elementColors?.primary }}>תוכן הפנייה</label>
                        <textarea
                            className="w-full border rounded-lg p-3 text-right focus:ring-2 focus:ring-blue-200 transition shadow-sm min-h-[120px] bg-gray-50"
                            style={{ borderColor: elementColors?.primary, background: elementColors?.light }}
                            value={systemCallContent}
                            onChange={e => setSystemCallContent(e.target.value)}
                            required
                            placeholder="כתוב את תוכן הפנייה כאן..."
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold mb-1" style={{ color: elementColors?.primary }}>קובץ מצורף (אופציונלי)</label>
                        <div className="flex items-center gap-3">
                            <input
                                type="file"
                                accept=".pdf,.doc,.docx,.txt,image/*,video/*,audio/*"
                                className="w-full border rounded-lg p-2 text-right bg-gray-50"
                                style={{ borderColor: elementColors?.primary, background: elementColors?.light }}
                                onChange={handleSystemCallFileChange}
                            />
                            {systemCallFile && (
                                <span className="text-xs px-2 py-1 rounded bg-blue-50 text-blue-700 border border-blue-200 animate-fade-in">{systemCallFile.name}</span>
                            )}
                        </div>
                        {uploadProgress > 0 && uploadProgress < 100 && (
                            <div className="w-full bg-gray-200 rounded-full h-2 mt-2 animate-fade-in">
                                <div
                                    className="bg-blue-500 h-2 rounded-full transition-all"
                                    style={{ width: `${uploadProgress}%` }}
                                />
                                <div className="text-xs text-gray-500 mt-1 text-center">העלאה: {Math.round(uploadProgress)}%</div>
                            </div>
                        )}
                    </div>
                    {systemCallError && (
                        <div className="text-red-600 text-sm font-semibold animate-fade-in">{systemCallError}</div>
                    )}
                    <button
                        type="submit"
                        className="w-full py-3 rounded-lg font-bold text-lg hover:opacity-90 transition-all disabled:opacity-60 shadow-md"
                        style={{ background: elementColors?.primary, color: '#fff' }}
                        disabled={isSubmittingSystemCall}
                    >
                        {isSubmittingSystemCall ? "שולח..." : "שלח פנייה"}
                    </button>
                </form>
            </div>
            {inquirySystemNotification && (
                <InquirySystemNotification
                    {...inquirySystemNotification}
                    onClose={() => setInquirySystemNotification(null)}
                />
            )}
            <style>{`
                .animate-fade-in {
                    animation: fadeIn 0.5s;
                }
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </div>
    );
};