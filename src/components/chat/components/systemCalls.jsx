import { useState, useEffect, useRef } from 'react';
import { db, storage } from '@/config/firbaseConfig';
import { collection, addDoc, getDocs, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';

const SystemCalls = ({ currentUser, elementColors, onHideSystemCalls, onSent }) => {
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
            return;
        }
        if (!systemCallSubject.trim()) {
            setSystemCallError('יש להזין נושא.');
            return;
        }
        if (!systemCallContent.trim()) {
            setSystemCallError('יש להזין תוכן הפנייה.');
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
                status: 'open',
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
            alert('הפנייה נשלחה בהצלחה!');
            onHideSystemCalls();
        } catch (err) {
            setSystemCallError('שגיאה בשליחת הפנייה: ' + err.message);
            setIsSubmittingSystemCall(false);
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
        <div className="flex-1 flex flex-col items-center justify-center bg-gray-50 min-h-full p-6" dir="rtl">
            <div className="w-full max-w-lg bg-white shadow-xl rounded-xl p-8" style={{ border: `2px solid ${elementColors.primary}` }}>
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold" style={{ color: elementColors.primary }}>מערכת פניות - פנייה חדשה</h2>
                    <button
                        className="text-lg font-bold"
                        style={{ color: elementColors.primary }}
                        onClick={onHideSystemCalls}
                        aria-label="סגור מערכת פניות"
                    >✕</button>
                </div>
                <form onSubmit={handleSystemCallSubmit} className="space-y-5">
                    <div ref={recipientInputRef} className="relative">
                        <label className="block text-sm font-semibold mb-1" style={{ color: elementColors.primary }}>נמען</label>
                        <input
                            type="text"
                            className="w-full border rounded-lg p-2 text-right focus:ring-2"
                            style={{ borderColor: elementColors.primary, background: elementColors.light }}
                            value={systemCallRecipient}
                            onChange={handleRecipientInput}
                            placeholder="התחל להקליד שם..."
                            autoComplete="off"
                            required
                        />
                        {showDropdown && filteredRecipientOptions.length > 0 && (
                            <div className="absolute z-10 w-full bg-white border rounded-lg shadow-lg mt-1 max-h-40 overflow-y-auto">
                                {filteredRecipientOptions.map(user => (
                                    <div
                                        key={user.id}
                                        className="p-2 hover:bg-blue-100 cursor-pointer text-right"
                                        onClick={() => handleRecipientSelect(user)}
                                    >
                                        {user.username}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                    <div>
                        <label className="block text-sm font-semibold mb-1" style={{ color: elementColors.primary }}>נושא</label>
                        <input
                            type="text"
                            className="w-full border rounded-lg p-2 text-right focus:ring-2"
                            style={{ borderColor: elementColors.primary, background: elementColors.light }}
                            value={systemCallSubject}
                            onChange={e => setSystemCallSubject(e.target.value)}
                            required
                            placeholder="נושא הפנייה"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold mb-1" style={{ color: elementColors.primary }}>תוכן הפנייה</label>
                        <textarea
                            className="w-full border rounded-lg p-2 text-right focus:ring-2 min-h-[100px]"
                            style={{ borderColor: elementColors.primary, background: elementColors.light }}
                            value={systemCallContent}
                            onChange={e => setSystemCallContent(e.target.value)}
                            required
                            placeholder="כתוב את תוכן הפנייה כאן..."
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold mb-1" style={{ color: elementColors.primary }}>קובץ מצורף (אופציונלי)</label>
                        <input
                            type="file"
                            accept=".pdf,.doc,.docx,image/*"
                            className="w-full border rounded-lg p-2 text-right"
                            style={{ borderColor: elementColors.primary, background: elementColors.light }}
                            onChange={handleSystemCallFileChange}
                        />
                        {systemCallFile && (
                            <div className="mt-2 text-xs" style={{ color: elementColors.primary }}>קובץ נבחר: {systemCallFile.name}</div>
                        )}
                        {uploadProgress > 0 && uploadProgress < 100 && (
                            <div className="text-xs text-gray-500 mt-1">העלאה: {Math.round(uploadProgress)}%</div>
                        )}
                    </div>
                    {systemCallError && (
                        <div className="text-red-600 text-sm font-semibold">{systemCallError}</div>
                    )}
                    <button
                        type="submit"
                        className="w-full py-3 rounded-lg font-bold text-lg hover:opacity-90 transition-all disabled:opacity-60"
                        style={{ background: elementColors.primary, color: '#fff' }}
                        disabled={isSubmittingSystemCall}
                    >
                        {isSubmittingSystemCall ? "שולח..." : "שלח פנייה"}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default SystemCalls;