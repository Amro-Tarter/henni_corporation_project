import { useState, useEffect, useRef } from 'react';
import { db, storage } from '@/config/firbaseConfig';
import { collection, addDoc, getDocs, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { HiOutlineMailOpen, HiOutlineX } from 'react-icons/hi';


export default function SystemInquiries({ onClose, currentUser, elementColors, onHideSystemCalls, onSent, setNotification }) {
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
                filtered = users.filter(u => u.id !== currentUser.uid && (u.role === 'mentor' || u.role === 'participant'));
            } else {
                filtered = users.filter(u => u.role === 'admin');
            }
            setPossibleRecipients(filtered);
            // Map for quick username lookup
            const map = {};
            users.forEach(u => { map[u.id] = u.username || u.id; });
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
        setSystemCallFile(e.target.files[0] || null);
    };

    const handleSystemCallSubmit = async (e) => {
        e.preventDefault();
        setSystemCallError('');
        if (!systemCallRecipientId) {
            setSystemCallError('יש לבחור נמען מהרשימה.');
            setNotification && setNotification({ message: 'יש לבחור נמען מהרשימה.', type: 'error' });
            setTimeout(() => setNotification && setNotification(null), 3500);
            return;
        }
        if (!systemCallSubject.trim()) {
            setSystemCallError('יש להזין נושא.');
            setNotification && setNotification({ message: 'יש להזין נושא.', type: 'error' });
            setTimeout(() => setNotification && setNotification(null), 3500);
            return;
        }
        if (!systemCallContent.trim()) {
            setSystemCallError('יש להזין תוכן הפנייה.');
            setNotification && setNotification({ message: 'יש להזין תוכן הפנייה.', type: 'error' });
            setTimeout(() => setNotification && setNotification(null), 3500);
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
            setNotification({ message: 'הפנייה נשלחה בהצלחה!', type: 'success' });
            setTimeout(() => {
                setNotification(null);
                onClose();
            }, 2500);
        } catch (err) {
            setSystemCallError('שגיאה בשליחת הפנייה: ' + err.message);
            setIsSubmittingSystemCall(false);
            setNotification({ message: 'שגיאה בשליחת הפנייה: ' + err.message, type: 'error' });
            setTimeout(() => setNotification(null), 3500);
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
                                accept=".pdf,.doc,.docx,image/*"
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