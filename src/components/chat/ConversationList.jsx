import { useMemo, useEffect, useState, useRef } from "react";
import { db } from '@/config/firbaseConfig';
import { doc, getDoc, collection, query as firestoreQuery, where, getDocs, orderBy, onSnapshot, updateDoc, arrayUnion, query } from 'firebase/firestore';
import { All_mentors_with_admin_icon, All_mentors_icon, Mentor_icon } from './utils/icons_library';
import { HiOutlineChatBubbleBottomCenterText, HiUserGroup, HiMiniUsers, HiMiniHome, HiMagnifyingGlass } from "react-icons/hi2";
import { useNavigate } from "react-router-dom";
import notificationSound from "@/assets/notification.mp3"
import SystemInquiries from './components/SystemInquiries';
import { useNotifications } from '../social/NotificationsComponent';

/**
 * ConversationList displays the list of conversations.
 */
export default function ConversationList({
  selectedConversation,
  setSelectedConversation,
  searchQuery,
  setSearchQuery,
  filteredConversations,
  isLoadingConversations,
  setShowNewChatDialog,
  setShowNewGroupDialog,
  getChatPartner,
  elementColorsMap,
  activeTab,
  currentUser,
  onTabChange,
  showSystemCalls = false,
  onShowSystemCalls = () => {},
  onHideSystemCalls = () => {},
  selectedInquiry = null,
  setSelectedInquiry = () => {},
  inquiries: propInquiries = [],
  isLoadingInquiries: propIsLoadingInquiries = false,
  allConversations = [],
  mobilePanel,
  setMobilePanel,
  setNotification,
}) {
  const [usernames, setUsernames] = useState({});
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const [inquiries, setInquiries] = useState(propInquiries);
  const [isLoadingInquiries, setIsLoadingInquiries] = useState(propIsLoadingInquiries);
  const [closedInquiriesCount, setClosedInquiriesCount] = useState(0);
  const [unreadMessagesCount, setUnreadMessagesCount] = useState(0);
  const [showCreateInquiryDialog, setShowCreateInquiryDialog] = useState(false);
  const { removeInquiryNotification } = useNotifications();

  // Define filter items
  const filterItems = [
    { icon: HiMiniHome, label: "הכל", type: "all" },
    { icon: HiOutlineChatBubbleBottomCenterText, label: "פרטי", type: "direct" },
    { icon: HiMiniUsers, label: "קבוצות", type: "group" },
    { icon: HiUserGroup, label: `קהילות`, type: "community" }
  ];




  const visibleConversations = useMemo(() =>
    filteredConversations.filter((conv) => {
      if (activeTab === "all") return true;
      return conv.type === activeTab;
    }),
    [filteredConversations, activeTab]
  );

  useEffect(() => {
    setUnreadMessagesCount(allConversations.filter(conv => conv.unread?.[currentUser.uid] > 0).length);
  }, [allConversations, currentUser.uid]);

  useEffect(() => {
    setClosedInquiriesCount(inquiries.filter(inq => inq.status === 'closed').length);
  }, [inquiries]);

  useEffect(() => {
    const ids = new Set();
    visibleConversations.forEach(conv => {
      if (Array.isArray(conv.participants)) {
        conv.participants.forEach(id => ids.add(id));
      }
    });
    const idsToFetch = Array.from(ids).filter(id => !usernames[id]);
    if (idsToFetch.length === 0) return;
    Promise.all(idsToFetch.map(async (uid) => {
      try {
        const userDoc = await getDoc(doc(db, 'users', uid));
        return [uid, userDoc.exists() ? userDoc.data().username : uid];
      } catch {
        return [uid, uid];
      }
    })).then(entries => {
      setUsernames(prev => ({ ...prev, ...Object.fromEntries(entries) }));
    });
  }, [visibleConversations]);

  const filteredInquiries = useMemo(() => {
    if (!searchQuery) return inquiries;
    const q = searchQuery.trim().toLowerCase();
    return inquiries.filter(inquiry => {
      return (
        (inquiry.subject && inquiry.subject.toLowerCase().includes(q)) ||
        (inquiry.senderName && inquiry.senderName.toLowerCase().includes(q)) ||
        (inquiry.sender && inquiry.sender.toLowerCase().includes(q))
      );
    });
  }, [inquiries, searchQuery]);

  // Handle filter button click
  const handleFilterClick = (filterType) => {
    onTabChange(filterType);
    setIsDropdownOpen(false);
  };



  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    }
    if (isDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isDropdownOpen]);

  // Real-time listener for inquiries
  useEffect(() => {
    if (!currentUser?.uid) return;
    setIsLoadingInquiries(true);
    const q = firestoreQuery(
      collection(db, 'system_of_inquiries'),
      where('recipient', '==', currentUser.uid),
      orderBy('createdAt', 'desc')
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setInquiries(docs);
      setClosedInquiriesCount(docs.filter(inq => inq.status === 'closed').length);
      setIsLoadingInquiries(false);
    }, () => setIsLoadingInquiries(false));
    return () => unsubscribe();
  }, [showSystemCalls, currentUser?.uid]);

  // play notification sound for new inquiries if the prev inquiries count is less than the current inquiries count




  // When an inquiry is clicked, mark as seen immediately (optimistic update)
  const handleInquiryClick = (inquiry) => {
    setSelectedInquiry(inquiry);
    if (window.innerWidth < 768) {
      setMobilePanel('selected inquiry');
      navigate(`/chat/inquiry/${inquiry.id}`);
    }
    if (inquiry.status === 'closed') {
      inquiry.status = 'open';
      updateDoc(doc(db, 'system_of_inquiries', inquiry.id), {
        status: 'open'
      });
      setInquiries(prev => prev.map(inq => inq.id === inquiry.id ? { ...inq, status: 'open' } : inq));
      setClosedInquiriesCount(prev => prev - 1);
      // Remove the notification of it from the notification list
      removeInquiryNotification(inquiry.id);
    }
  };

  const urlParams = new URLSearchParams(window.location.search);
  const recipient_id = urlParams.get('recipient');

  // Fix: Move onShowSystemCalls out of render phase to avoid setState in render
  useEffect(() => {
    if (window.location.pathname === '/chat/inquiry' && !recipient_id) {
      onShowSystemCalls();
      setMobilePanel('inquiries list');
    }
  }, [recipient_id, onShowSystemCalls, setMobilePanel]);

  // Modal overlay for SystemInquiries
  const renderSystemInquiriesModal = () => {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 animate-fade-in">
        <SystemInquiries
          onClose={() => {
            setMobilePanel('inquiries list');
            setShowCreateInquiryDialog(false);
            navigate('/chat/inquiry');
          }}
          elementColors={elementColorsMap[currentUser?.element] || {}}
          currentUser={currentUser}
          setSelectedInquiry={(inquiry) => {
            setSelectedInquiry(inquiry);
            if (inquiry) {
              setMobilePanel('selected inquiry');
              navigate(`/chat/inquiry/${inquiry.id}`);
            }
          }}
          isLoadingInquiries={isLoadingInquiries}
          onShowSystemCalls={() => {
            setMobilePanel('inquiries list');
            onShowSystemCalls();
          }}
          setNotification={setNotification}
        />
      </div>
    )
  }

  if (mobilePanel === 'new inquiry' || recipient_id || showCreateInquiryDialog) {
    return renderSystemInquiriesModal();
  }

  return (
    <div className={`w-full md:w-80 lg:w-80 z-50 shadow-md flex flex-col conversation-list bg-white h-[calc(100dvh-4rem)] overflow-y-auto transition-all duration-500 ease-in-out ${mobilePanel === 'conversations' || mobilePanel === 'inquiries list' ? 'block' : 'hidden md:block'}`} dir="rtl" onClick={() => {setSelectedConversation(null); setSelectedInquiry(null);}}>
      <div className="p-2 sm:p-4 sticky top-0 bg-white z-10 border-b border-gray-100 transition-all duration-500 ease-in-out">
        <div className="flex flex-row gap-2">
          <button
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200 hover:bg-gray-200 w-1/2 ${!showSystemCalls ? 'text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'}`}
            style={{
              border: '1px solid #e5e7eb',
              background: !showSystemCalls ? elementColorsMap[currentUser?.element]?.primary : undefined
            }}
            onClick={e => { 
              e.stopPropagation(); 
              onHideSystemCalls();
              setMobilePanel('conversations');
            }}
          >
            <HiOutlineChatBubbleBottomCenterText className="text-base" />
            <span>שיחות</span>
            {unreadMessagesCount > 0 &&(
              <span className="ml-2 px-2 py-0.5 rounded-full text-xs font-bold bg-yellow-400 text-white">{unreadMessagesCount}</span>
            )}
          </button>
          <button
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200 w-1/2 ${showSystemCalls ? 'text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'}`}
            style={{
              border: '1px solid #e5e7eb',
              background: showSystemCalls ? elementColorsMap[currentUser?.element]?.primary : undefined
            }}
            onClick={e => { 
              e.stopPropagation(); 
              onShowSystemCalls(); 
              setIsDropdownOpen(false);
              setMobilePanel('inquiries list');
            }}
          >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" style={{ color: showSystemCalls ? "white" : elementColorsMap[currentUser.element].primary, strokeWidth: 2 }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V7a2 2 0 00-2-2H6a2 2 0 00-2 2v6m16 0v4a2 2 0 01-2 2H6a2 2 0 01-2-2v-4m16 0h-4a2 2 0 01-2 2H10a2 2 0 01-2-2H4" />
                      </svg>
            <span>פניות</span>
            {closedInquiriesCount > 0 && (
              <span className="ml-2 px-2 py-0.5 rounded-full text-xs font-bold bg-yellow-400 text-white">{closedInquiriesCount}</span>
            )}
          </button>
        </div>
        <h2 className="text-xs md:text-sm text-gray-500 mt-2">{showSystemCalls ? 'פניות שהתקבלו' : `הודעות (${visibleConversations.length})`}</h2>
        <div className="mt-2 sm:mt-4 relative">
          <input
            type="text"
            placeholder="חיפוש"
            className="w-full p-2 pr-8 bg-gray-100 rounded-lg text-xs md:text-sm text-right focus:ring-1 focus:outline-none transition-all duration-200"
            style={{ borderColor: "transparent", outlineColor: elementColorsMap[currentUser?.element]?.primary || '#ccc' }}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {/* Search icon */}
          <span className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none">
            <HiMagnifyingGlass className="w-5 h-5" />
          </span>
        </div>
        {/* Filter Dropdown */}
        <div className="mt-3 relative flex flex-row gap-2" ref={dropdownRef}>
          {!showSystemCalls && <button
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200 hover:bg-gray-200 w-1/2 justify-between ${!showSystemCalls ? 'text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'}`}
            style={{
              border: '1px solid #e5e7eb',
              background: !showSystemCalls ? elementColorsMap[currentUser?.element]?.primary : undefined
            }}
            onClick={e => { e.stopPropagation(); setIsDropdownOpen(v => !v); onHideSystemCalls(); }}
          >
            <span className="flex items-center gap-2 w-full">
              {(() => {
                const activeItem = filterItems.find(item => item.type === activeTab);
                if (!activeItem) return null;
                const Icon = activeItem.icon;
                <Icon className="text-base" />
              })()}
              <span>{filterItems.find(item => item.type === activeTab)?.label || ''}</span>
            </span>
            <svg className={`w-4 h-4 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>}
          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-1/2 bg-white border border-gray-200 rounded-lg shadow-lg z-20 transition-all duration-200">
              {filterItems.map((item, idx) => {
                const isActive = activeTab === item.type;
                const elementColors = elementColorsMap[currentUser?.element];
                const Icon = item.icon;
                return (
                  <button
                    key={idx}
                    className={`flex items-center gap-2 px-3 py-2 w-full text-right rounded-lg text-xs sm:text-sm font-medium transition-all duration-200 ${isActive ? 'bg-blue-100 font-bold text-black' : 'hover:bg-gray-100 text-gray-700'}`}
                    onClick={() => handleFilterClick(item.type)}
                    style={{ backgroundColor: isActive ? (elementColors?.light || '#e0e7ff') : undefined }}
                  >
                    <Icon className="text-base" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
      <div className="flex-1 overflow-y-auto max-h-[calc(100dvh-4rem)] px-1 sm:px-2 transition-all duration-500 ease-in-out">
        {showSystemCalls ? (
          isLoadingInquiries ? (
            <div className="p-4 text-center text-gray-500">טוען פניות...</div>
          ) : inquiries.length === 0 ? (
            <div className="p-4 text-center text-gray-500">לא התקבלו פניות.</div>
          ) : (
            filteredInquiries.sort((a, b) => b.createdAt.toDate() - a.createdAt.toDate()).map(inquiry => {
              const isSelected = selectedInquiry?.id === inquiry.id;
              const elementColor = elementColorsMap[currentUser?.element]?.primary || '#2563eb';
              const lightColor = elementColorsMap[currentUser?.element]?.light || '#f5f5f5';
              return (
                <div
                  key={inquiry.id}
                  onClick={e => {
                    e.stopPropagation();
                    handleInquiryClick(inquiry);
                  }}
                  className={`p-3 rounded-xl border cursor-pointer flex flex-col gap-2 mb-4 shadow-sm transition-all duration-200 ${isSelected ? 'ring-2 ring-offset-2' : ''}`}
                  style={{
                    background: isSelected ? lightColor : '#fff',
                    borderColor: isSelected ? elementColor : '#e5e7eb',
                    boxShadow: isSelected ? `0 2px 8px 0 ${elementColor}22` : '0 1px 4px 0 #0001',
                  }}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-base sm:text-lg font-bold truncate" style={{ color: elementColor }}>{inquiry.subject}</span>
                    {(inquiry.status === 'closed') && (
                      <span className="ml-2 px-2 py-0.5 rounded-full text-xs font-bold bg-yellow-400 text-white whitespace-nowrap">חדש</span>
                    )}
                  </div>
                  <div className="text-xs sm:text-sm text-gray-600 truncate">מאת: {inquiry.senderName || inquiry.sender} {inquiry.senderRole === 'admin' && <span className="text-gray-500">(מנהל)</span>}</div>
                  <div className="text-xs text-gray-500">{inquiry.createdAt?.toDate ? inquiry.createdAt.toDate().toLocaleString() : ''}</div>
                </div>
              );
            })
          )
        ) : (
          <>
            <div className="text-xs font-medium text-gray-500 px-2 sm:px-4 py-2 text-right">כל ההודעות</div>
            {isLoadingConversations ? (
              <div className="p-4 text-center text-gray-500">טוען צ'אטים...</div>
            ) : (
              visibleConversations.map((conv) => {
                const isSelected = selectedConversation?.id === conv.id;
                const mentorName = currentUser.mentorName;
                let avatar = null;
                if (conv.type === 'community' && conv.communityType === 'element') {
                  const icon = elementColorsMap[conv.element]?.icon;
                  avatar = (
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-200 text-2xl">
                      {icon}
                    </div>
                  );
                } else if (conv.type === 'community' && conv.communityType === 'mentor_community') {
                  avatar = (
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-200 text-2xl">
                      <Mentor_icon color='#7f1d1d' width={28} height={28}/>
                    </div>
                  );
                } else if (conv.type === 'community' && conv.communityType === 'all_mentors') {
                  avatar = (
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-200 text-2xl">
                      <All_mentors_icon color='#7f1d1d' width={28} height={28}/>
                    </div>
                  );
                } else if (conv.type === 'community' && conv.communityType === 'all_mentors_with_admin') {
                  avatar = (
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-200 text-2xl">
                      <All_mentors_with_admin_icon color='#7f1d1d' width={28} height={28}/>
                    </div>
                  );
                }
                
                else if (conv.type === 'group') {
                  avatar = conv.avatarURL ? (
                    <img src={conv.avatarURL} alt="group avatar" className="w-10 h-10 object-cover rounded-full" />
                  ) : (
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-200 text-xl text-gray-400">
                      <span role="img" aria-label="avatar">👤</span>
                    </div>
                  );
                } else if (conv.partnerProfilePic && currentUser.role !== 'admin') {
                  avatar = (
                    <img src={conv.partnerProfilePic} alt="avatar" className="w-10 h-10 object-cover rounded-full" />
                  );
                } else if (currentUser.role === 'admin' && conv.type === 'direct') {
                  avatar = (
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-200 text-4xl text-gray-900">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 512 512"
                        fill="currentColor"
                        className="w-6 h-6"
                      >
                        <path d="M256.064 32C132.288 32 32 125.248 32 241.6c0 66.016 34.816 123.36 89.216 160.192V480l81.312-44.608c17.472 4.736 35.84 7.296 53.536 7.296 123.744 0 223.936-93.248 223.936-209.6S379.808 32 256.064 32zm29.056 257.728l-54.4-58.88-111.936 58.88 132.736-141.632 54.4 58.88 111.936-58.88-132.736 141.632z"/>
                      </svg>
                    </div>
                  );
                }
                
                else {
                  avatar = (
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-200 text-xl text-gray-400">
                      <span role="img" aria-label="avatar">👤</span>
                    </div>
                  );
                }
                const bgColorStyle = isSelected ? { backgroundColor: elementColorsMap[currentUser?.element]?.light || '#f5f5f5' } : {};
                let partnerName;
                if (conv.displayName) {
                  partnerName = conv.displayName;
                } else if (currentUser.role === 'admin' && conv.type === 'direct') {
                  partnerName = Array.isArray(conv.participants)
                    ? conv.participants.map(uid => usernames[uid] || uid).join(' - ')
                    : 'Unknown';
                } else if (conv.type === 'direct' && Array.isArray(conv.participants)) {
                  partnerName = getChatPartner(
                    conv.participants,
                    conv.type,
                    conv.element,
                    currentUser,
                    undefined,
                    conv.type === 'group' ? conv.groupName : undefined,
                    conv.participantNames
                  );
                } else if (conv.type === 'community') {
                  partnerName = conv.displayName;
                } else {
                  partnerName = conv.groupName;
                }
                return (
                  <div
                    key={conv.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedConversation(conv);
                      if (conv.unread?.[currentUser.uid] > 0) {
                        updateDoc(doc(db, 'conversations', conv.id), {
                          unread: {
                            [currentUser.uid]: 0
                          }
                        });
                        setUnreadMessagesCount(prev => prev - 1);
                      }
                    }}
                    className={`p-3 rounded-md border-b border-gray-100 cursor-pointer hover:bg-gray-50 text-right mx-auto mb-2 w-full max-w-full flex items-center gap-3`}
                    style={bgColorStyle}
                  >
                    {avatar}
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-gray-900 truncate flex items-center gap-2">
                        {partnerName}
                        {partnerName === mentorName && (
                          <div className="text-gray-500 mt-1 text-sm">מנחה שלך</div>
                        )}
                        {/* Unread badge */}
                        {conv.unread?.[currentUser.uid] > 0 && (
                          <span
                            className="ml-2 inline-flex items-center justify-center px-2 py-0.5 rounded-full text-xs font-bold bg-yellow-400 text-white shadow"
                            aria-label={`יש ${conv.unread[currentUser.uid]} הודעות שלא נקראו`}
                            title={`יש ${conv.unread[currentUser.uid]} הודעות שלא נקראו`}
                          >
                            {conv.unread[currentUser.uid]}
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-gray-500 truncate">
                        {conv.lastMessage || "אין הודעות עדיין"}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </>
        )}
      </div>
      {activeTab === "direct" && currentUser.role !== 'admin' && !showSystemCalls && (
        <div className="p-2.5 border-t  border-gray-200">
          <button
            onClick={() => setShowNewChatDialog(true)}
            className="w-full text-white py-2 rounded-lg hover:opacity-90 transition-colors flex items-center justify-center gap-2 lg:mb-0 md:mb-12 mb-12"
            style={{ backgroundColor: elementColorsMap[currentUser?.element]?.primary || '#888' }}
          >
            <span className="text-xl">+</span>
            <span>צ'אט חדש</span>
          </button>
        </div>
      )}
      {activeTab === "group" && currentUser.role !== 'admin' && !showSystemCalls && (
        <div className="p-2.5 border-t border-gray-200">
          <button
            onClick={() => setShowNewGroupDialog(true)}
            className="w-full text-white py-2 rounded-lg hover:opacity-90 transition-colors flex items-center justify-center gap-2 lg:mb-0 md:mb-12 mb-12"
            style={{ backgroundColor: elementColorsMap[currentUser?.element]?.primary || '#888' }}
          >
            <span className="text-xl">+</span>
            <span>קבוצה חדשה</span>
          </button>
        </div>
      )}
      {/* Floating create inquiry button for small screens */}
      {showSystemCalls && (
        <button
          className="fixed bottom-6 right-6 z-50 bg-blue-600 text-white rounded-full shadow-lg px-6 py-3 text-lg font-bold md:hidden hover:bg-blue-700 transition-all"
          style={{ background: elementColorsMap[currentUser?.element]?.primary || '#2563eb' }}
          onClick={() => {
            setMobilePanel('new inquiry');
            setShowCreateInquiryDialog(true);

          }}
        >
          פנייה חדשה
        </button>
      )}
    </div>
  );
}

