import React, { useState, useEffect, useCallback, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  collection, query, where, getDocs, getDoc, doc, updateDoc
} from 'firebase/firestore';
import { db } from '@/config/firbaseConfig';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  HandHeart, Users, Heart, TreePine, X, Edit2, Check, ChevronDown, ChevronUp
} from 'lucide-react';
import CTAButton from '@/components/CTAButton';

const DEFAULT_IMAGE = '/default_user_pic.jpg';

// Custom image component with fallback
function AvatarImg({ src, alt }) {
  const [imgSrc, setImgSrc] = useState(src || DEFAULT_IMAGE);
  return (
    <img
      src={imgSrc}
      alt={alt}
      onError={() => setImgSrc(DEFAULT_IMAGE)}
      className="w-full h-full object-cover"
      draggable={false}
    />
  );
}

const AboutSection = ({ currentUser }) => {
  // State
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [selectedMember, setSelectedMember] = useState(null);
  const [teamMembers, setTeamMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAllTeam, setShowAllTeam] = useState(false);
  const [newsletterModal, setNewsletterModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editData, setEditData] = useState({});
  const isAdmin = currentUser?.role === 'admin';

  // Ref for closing modals with ESC
  const modalRef = useRef();

  // Fetch admins on mount
  useEffect(() => {
    let active = true;
    const fetchAdminUsers = async () => {
      setLoading(true);
      try {
        const adminQuery = query(
          collection(db, 'users'),
          where('role', '==', 'admin')
        );
        const querySnapshot = await getDocs(adminQuery);
        const admins = [];
        for (const userDoc of querySnapshot.docs) {
          const userData = userDoc.data();
          const associatedId = userData.associated_id || userDoc.id;
          let profileData = {};
          try {
            const profileDoc = await getDoc(doc(db, 'profiles', associatedId));
            profileData = profileDoc.exists() ? profileDoc.data() : {};
          } catch {}
          const admin = {
            id: userDoc.id,
            associated_id: associatedId,
            displayName:
              profileData.displayName ||
              userData.displayName ||
              userData.email?.split('@')[0] ||
              'מנהל',
            role: userData.role,
            title: userData.title || profileData.title || 'מנהל מערכת',
            photoURL: profileData.photoURL || userData.photoURL || DEFAULT_IMAGE,
            bio:
              profileData.bio ||
              userData.bio ||
              'מנהל מערכת מנוסה המוביל את פעילות העמותה ומחויב לחזון ולמטרות שלנו.',
            email: userData.email,
            is_active: userData.is_active !== false,
          };
          if (admin.is_active) admins.push(admin);
        }
        admins.sort((a, b) => a.displayName.localeCompare(b.displayName));
        if (active) setTeamMembers(admins);
      } catch (error) {
        setTeamMembers([]);
      } finally {
        setLoading(false);
      }
    };
    fetchAdminUsers();
    return () => { active = false; };
  }, []);

  // Modal close on ESC
  useEffect(() => {
    function onKeyDown(e) {
      if (e.key === 'Escape') {
        setSelectedMember(null);
        setShowAllTeam(false);
        setNewsletterModal(false);
        setEditMode(false);
      }
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  // Feature cards data
  const features = [
    {
      title: 'החזון שלנו',
      icon: <Heart className="h-8 w-8 text-pink-600" />,
      description:
        'ב"עמותת לגלות את האור - הנני" אנו מאמינים שכל נער ונערה בישראל נושאים בתוכם אור ייחודי.',
    },
    {
      title: 'המטרה שלנו',
      icon: <Users className="h-8 w-8 text-orange-500" />,
      description:
        'יצירת דור חדש של מנהיגים צעירים, רגישים ומודעים – דרך הבמה היצירתית.',
    },
    {
      title: 'ההשפעה שלנו',
      icon: <HandHeart className="h-8 w-8 text-green-600" />,
      description:
        'התוכניות שלנו משנות חיים. אנו רואים את הנוער לא רק כאמנים – אלא ככוחות של שינוי.',
    },
  ];

  // Modal logic
  const openMemberModal = idx => {
    setEditMode(false);
    setSelectedMember(idx);
    setEditData({});
  };
  const closeMemberModal = () => {
    setEditMode(false);
    setSelectedMember(null);
    setEditData({});
  };
  const openNewsletter = () => setNewsletterModal(true);
  const closeNewsletter = () => setNewsletterModal(false);

  // Edit team member
  const startEdit = () => {
    const m = teamMembers[selectedMember];
    setEditData({ bio: m.bio, title: m.title });
    setEditMode(true);
  };
  const cancelEdit = () => {
    setEditData({});
    setEditMode(false);
  };

  const handleEditChange = e => {
    setEditData(ed => ({ ...ed, [e.target.name]: e.target.value }));
  };

  const saveEdit = async () => {
    const member = teamMembers[selectedMember];
    try {
      // Save to "profiles" collection
      await updateDoc(doc(db, 'profiles', member.associated_id), {
        bio: editData.bio,
        title: editData.title,
      });
      // Update local state
      const newTeam = teamMembers.map((m, i) =>
        i === selectedMember
          ? { ...m, bio: editData.bio, title: editData.title }
          : m
      );
      setTeamMembers(newTeam);
      setEditMode(false);
    } catch (err) {
      alert('שגיאה בשמירת הפרופיל');
    }
  };

  // View all modal logic
  const openAllTeam = () => setShowAllTeam(true);
  const closeAllTeam = () => setShowAllTeam(false);

  // Newsletter dummy logic (replace with real form/modal/route as needed)
  function NewsletterModal() {
    return (
      <AnimatePresence>
        {newsletterModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
          >
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 text-center relative">
              <button
                className="absolute top-4 left-4 bg-white rounded-full p-2 hover:bg-gray-100 shadow-md"
                onClick={closeNewsletter}
                aria-label="סגור"
              >
                <X className="h-5 w-5 text-gray-600" />
              </button>
              <TreePine className="mx-auto h-10 w-10 text-green-600 animate-pulse mb-2" />
              <h2 className="font-bold text-xl mb-3 text-orange-800">הרשמה לניוזלטר</h2>
              <form
                onSubmit={e => {
                  e.preventDefault();
                  alert('נרשמת בהצלחה! (הדמיה)');
                  closeNewsletter();
                }}
                className="space-y-4"
              >
                <input
                  type="email"
                  required
                  placeholder="האימייל שלך"
                  className="border rounded-lg px-4 py-2 w-full text-right focus:outline-none focus:border-orange-400"
                />
                <Button className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg py-2">
                  הירשם
                </Button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    );
  }

  // --- UI ---
  return (
    <section
      id="about-section"
      className="relative py-12 md:py-16 bg-gradient-to-br from-orange-50 via-orange-100 to-yellow-100 overflow-hidden"
    >
      {/* Decorative */}
      <div className="absolute top-0 left-0 w-32 h-32 rounded-full bg-pink-200/20 -translate-x-1/2 -translate-y-1/2 blur-2xl"></div>
      <div className="absolute bottom-0 right-0 w-48 h-48 rounded-full bg-orange-300/15 translate-x-1/3 translate-y-1/3 blur-2xl"></div>

      {/* Newsletter modal */}
      <NewsletterModal />

      {/* All Team Modal */}
      <AnimatePresence>
        {showAllTeam && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
          >
            <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto p-8 relative text-center">
              <button
                onClick={closeAllTeam}
                className="absolute top-4 left-4 bg-white rounded-full p-2 hover:bg-gray-100 shadow-md"
                aria-label="סגור"
              >
                <X className="h-5 w-5 text-gray-600" />
              </button>
              <h2 className="font-bold text-2xl mb-3 text-orange-800">
                כל צוות העמותה
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
                {teamMembers.map((member, idx) => (
                  <div
                    key={member.id}
                    className="bg-orange-50/80 rounded-xl p-4 shadow-sm border border-orange-100 cursor-pointer"
                    onClick={() => {
                      closeAllTeam();
                      openMemberModal(idx);
                    }}
                  >
                    <div className="relative w-20 h-20 mx-auto rounded-full overflow-hidden bg-orange-100 mb-3">
                      <AvatarImg src={member.photoURL} alt={member.displayName} />
                    </div>
                    <h4 className="text-base font-bold text-gray-900">{member.displayName}</h4>
                    <p className="text-orange-500 text-sm">{member.title}</p>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Compact Header */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-8 md:mb-12">
          <h2 className="font-bold text-3xl md:text-4xl text-orange-800 mb-3">
            שורשים של אור – החזון שמוביל אותנו
          </h2>
          <div className="h-1 w-20 bg-orange-500 mx-auto mb-4 rounded-full"></div>
          <p className="text-base md:text-lg text-gray-700 max-w-xl mx-auto leading-relaxed">
            כל ילד וילדה נולדים עם אור פנימי חד-פעמי. דרך אמנות, יצירה וחיבורים אנושיים, אנו יוצרים עבורם קרקע לצמיחה.
          </p>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-12">
          {features.map((feature, index) => (
            <div
              key={index}
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
              className={`transition-all duration-300 ${hoveredIndex === index ? 'transform -translate-y-1' : ''}`}
            >
              <Card className={`h-full bg-white/90 backdrop-blur-sm border-0 shadow-md rounded-2xl ${hoveredIndex === index ? 'shadow-lg shadow-orange-200/50' : ''}`}>
                <CardContent className="p-4 md:p-6 text-center h-full flex flex-col">
                  <div className="mb-3 flex justify-center">
                    <div className={`p-2 rounded-full bg-orange-50 ${hoveredIndex === index ? 'scale-110' : ''} transition-all duration-300`}>
                      {feature.icon}
                    </div>
                  </div>
                  <h3 className="text-lg md:text-xl font-bold mb-2 text-gray-900">{feature.title}</h3>
                  <p className="text-sm md:text-base text-gray-600 leading-relaxed flex-grow">{feature.description}</p>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>

        {/* Newsletter/CTA */}
        <div className="text-center mb-12 bg-gradient-to-br from-white/80 to-orange-50/80 backdrop-blur-sm rounded-2xl p-8 mx-auto max-w-3xl shadow-xl hover:shadow-2xl transition-all duration-300 border border-orange-100">
          <div className="inline-flex items-center gap-3 mb-4 bg-green-50 px-4 py-2 rounded-full">
            <TreePine className="h-6 w-6 text-green-600 animate-pulse" />
            <span className="text-green-700 font-semibold">חדש! הניוזלטר שלנו</span>
          </div>
          <h3 className="text-2xl md:text-3xl font-bold text-orange-800 mb-4">הישארו מעודכנים בפעילויות העמותה</h3>
          <p className="text-gray-600 mb-6 max-w-xl mx-auto">הצטרפו לקהילה שלנו וקבלו עדכונים שבועיים על פעילויות, אירועים והשפעות העמותה</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button
              onClick={openNewsletter}
              className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 
                         text-white px-8 py-3 rounded-lg shadow-md transition-all duration-300 
                         hover:shadow-xl hover:-translate-y-1 flex items-center gap-2"
            >
              <span>הרשמו לניוזלטר</span>
              <Edit2 className="h-4 w-4" />
            </Button>
             <CTAButton
              variant="inverse-fire"
              href="/newsletter"
              className="border-orange-200 text-orange-700 hover:bg-orange-50 px-6 py-3 rounded-lg transition-all duration-300"
            >
              קראו עוד
            </CTAButton>
          </div>
        </div>

        {/* Team Section */}
        <div className="text-center">
          <h3 className="text-2xl md:text-3xl font-bold text-orange-800 mb-2">צוות העמותה</h3>
          <p className="text-gray-600 mb-6 text-sm md:text-base">הכירו את האנשים שמובילים את החזון שלנו</p>

          {loading ? (
            <div className="flex justify-center items-center py-8">
              <div className="w-8 h-8 border-2 border-orange-200 border-t-orange-500 rounded-full animate-spin"></div>
              <span className="mr-3 text-gray-600">טוען מנהלים...</span>
            </div>
          ) : teamMembers.length === 0 ? (
            <div className="text-center py-8 text-gray-600">
              <Users className="h-12 w-12 mx-auto mb-3 text-gray-400" />
              <p>לא נמצאו מנהלים במערכת</p>
            </div>
          ) : (
            <>
              {/* Team Grid (first 3) */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                {teamMembers.slice(0, 3).map((member, idx) => (
                  <div
                    key={member.id}
                    onClick={() => openMemberModal(idx)}
                    className="bg-white/90 rounded-xl p-4 shadow-md cursor-pointer transform transition-all duration-300 hover:shadow-lg hover:-translate-y-1 border border-orange-100"
                  >
                    <div className="relative w-16 h-16 md:w-20 md:h-20 rounded-full mx-auto mb-3 overflow-hidden bg-orange-100">
                      <AvatarImg src={member.photoURL} alt={member.displayName} />
                    </div>
                    <h4 className="text-sm md:text-base font-bold text-gray-900 mb-1">{member.displayName}</h4>
                    <p className="text-gray-600 text-xs md:text-sm mb-1">{member.title}</p>
                    <p className="text-orange-500 text-xs">לחץ לפרטים נוספים</p>
                  </div>
                ))}
              </div>
              {/* View all team button */}
              <Button
                onClick={openAllTeam}
                className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-lg px-6 py-2 shadow-lg hover:shadow-xl transition-all duration-300"
              >
                {teamMembers.length > 3
                  ? `הכירו את כל הצוות (${teamMembers.length} חברים)`
                  : 'הכירו את כל הצוות'}
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Member modal */}
      <AnimatePresence>
        {selectedMember !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 flex items-center justify-center z-50 p-4 bg-black/50 backdrop-blur-sm"
          >
            <div
              className="relative bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto transform transition-all duration-300 scale-100"
              ref={modalRef}
            >
              <button
                onClick={closeMemberModal}
                className="absolute top-4 left-4 bg-white/90 rounded-full p-2 hover:bg-gray-100 transition-colors shadow-md z-10"
                aria-label="סגור"
              >
                <X className="h-5 w-5 text-gray-600" />
              </button>
              {teamMembers[selectedMember] && (
                <div className="p-6 flex flex-col md:flex-row gap-6 items-center md:items-start text-right">
                  <div className="w-32 h-32 rounded-full overflow-hidden flex-shrink-0 border-4 border-orange-200 shadow-lg">
                    <AvatarImg src={teamMembers[selectedMember].photoURL} alt={teamMembers[selectedMember].displayName} />
                  </div>
                  <div className="flex-1 text-center md:text-right">
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">
                      {teamMembers[selectedMember].displayName}
                    </h3>
                    {!editMode ? (
                      <>
                        <p className="text-lg text-orange-500 font-medium mb-4">
                          {teamMembers[selectedMember].title}
                        </p>
                        <p className="text-gray-700 leading-relaxed">{teamMembers[selectedMember].bio}</p>
                        {isAdmin && (
                          <Button
                            variant="ghost"
                            className="mt-4 text-sm text-orange-600"
                            onClick={startEdit}
                          >
                            <Edit2 className="inline-block w-4 h-4 mr-2" />
                            ערוך פרופיל
                          </Button>
                        )}
                        <div className="mt-6 flex justify-center md:justify-end">
                          <Button
                            onClick={closeMemberModal}
                            className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-lg"
                          >
                            סגור
                          </Button>
                        </div>
                      </>
                    ) : (
                      <>
                        <input
                          name="title"
                          className="border rounded-lg px-4 py-2 w-full my-2 text-right"
                          value={editData.title || ''}
                          onChange={handleEditChange}
                          placeholder="תפקיד"
                        />
                        <textarea
                          name="bio"
                          className="border rounded-lg px-4 py-2 w-full my-2 text-right"
                          value={editData.bio || ''}
                          onChange={handleEditChange}
                          placeholder="תיאור"
                          rows={4}
                        />
                        <div className="flex gap-4 justify-end mt-4">
                          <Button
                            onClick={cancelEdit}
                            variant="outline"
                            className="text-gray-600 border-gray-300"
                          >
                            ביטול
                          </Button>
                          <Button
                            onClick={saveEdit}
                            className="bg-green-500 hover:bg-green-600 text-white"
                          >
                            <Check className="inline-block w-4 h-4 ml-2" />
                            שמור
                          </Button>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};

export default AboutSection;
