import React, { useState, useEffect, useRef, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  collection,
  getDocs,
  doc,
  getDoc,
  updateDoc,
  query,
  where,
  addDoc,
} from 'firebase/firestore';
import { db } from '@/config/firbaseConfig';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  HandHeart,
  Users,
  Heart,
  TreePine,
  X,
  Edit2,
  Check,
  MapPin,
  Mail,
  Crown,
  Star,
  Award,
  ChevronRight,
  ChevronLeft,
} from 'lucide-react';
import CTAButton from '@/components/CTAButton';
import { Link } from 'react-router-dom';
import { toast, Toaster } from 'sonner';

const DEFAULT_IMAGE = '/default_user_pic.jpg';

// Custom image component with fallback
function AvatarImg({ src, alt, className = "" }) {
  const [imgSrc, setImgSrc] = useState(src || DEFAULT_IMAGE);
  const [isLoading, setIsLoading] = useState(true);
  
  return (
    <div className={`relative ${className}`}>
      {isLoading && (
        <div className="absolute inset-0 bg-gradient-to-br from-orange-100 to-orange-200 animate-pulse rounded-full" />
      )}
      <img
        src={imgSrc}
        alt={alt}
        onError={() => setImgSrc(DEFAULT_IMAGE)}
        onLoad={() => setIsLoading(false)}
        className="w-full h-full object-cover transition-opacity duration-300"
        draggable={false}
        style={{ opacity: isLoading ? 0 : 1 }}
      />
    </div>
  );
}

// Newsletter Modal Component
const NewsletterModal = ({ isOpen, closeNewsletter }) => {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async e => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await addDoc(collection(db, "newsletterSubscribers"), {
        email,
        createdAt: new Date(),
      });
      toast.success("נרשמת בהצלחה!");
      closeNewsletter();
      setEmail("");
    } catch (err) {
      toast.error("אירעה שגיאה, אנא נסה שוב.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 text-center relative"
          >
            <button
              className="absolute top-4 left-4 bg-white rounded-full p-2 hover:bg-gray-100 shadow-md transition-colors"
              onClick={closeNewsletter}
              aria-label="סגור"
            >
              <X className="h-5 w-5 text-gray-600" />
            </button>
            <TreePine className="mx-auto h-10 w-10 text-green-600 animate-pulse mb-2" />
            <h2 className="font-bold text-xl mb-3 text-orange-800">הרשמה לניוזלטר</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                placeholder="האימייל שלך"
                className="border rounded-lg px-4 py-2 w-full text-right focus:outline-none focus:border-orange-400 transition-colors"
              />
              <Button 
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg py-2 disabled:opacity-50"
              >
                {isSubmitting ? "נרשם..." : "הירשם"}
              </Button>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Enhanced Team Member Card Component
const TeamMemberCard = ({ member, index, onClick, isFounder = false }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
      className={`group relative cursor-pointer transform transition-all duration-300 hover:-translate-y-2 hover:scale-[1.02] ${
        isFounder ? 'col-span-full sm:col-span-1' : ''
      }`}
    >
      <div
        className={`relative bg-white rounded-2xl p-6 shadow-lg border-2 transition-all duration-300 overflow-hidden ${isHovered ? 'shadow-2xl shadow-orange-200/50' : ''}`}
      >

        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-0 right-0 w-20 h-20 bg-orange-300 rounded-full transform translate-x-8 -translate-y-8" />
          <div className="absolute bottom-0 left-0 w-16 h-16 bg-pink-300 rounded-full transform -translate-x-6 translate-y-6" />
        </div>

        <div className="relative z-10 flex flex-col items-center text-center">
          {/* Avatar with enhanced effects */}
          <div className="relative mb-4">
            <div
              className={`w-40 h-40 md:w-48 md:h-48 rounded-full overflow-hidden border-4 transition-all duration-300 ${
                isFounder
                  ? 'border-gradient-to-r from-yellow-400 to-orange-500 shadow-lg'
                  : 'border-orange-200 group-hover:border-orange-400'
              } ${isHovered ? 'shadow-xl' : 'shadow-md'}`}
            >
              <AvatarImg src={member.photoURL} alt={member.username} className="rounded-full" />
            </div>
            
            {/* Hover effect ring */}
            <div
              className={`absolute inset-0 rounded-full border-2 border-orange-400 transition-all duration-300 ${
                isHovered ? 'scale-110 opacity-50' : 'scale-100 opacity-0'
              }`}
            />
          </div>

          {/* Name and Title */}
          <div className="space-y-2 mb-4">
            <h4 className="text-lg font-bold text-gray-900 transition-colors group-hover:text-orange-700">
              {member.username}
            </h4>
            <div className="flex items-center justify-center gap-2">
              {isFounder && <Star className="h-4 w-4 text-yellow-500" />}
              <p className="text-sm font-medium text-orange-600 bg-orange-50 px-3 py-1 rounded-full">
                {member.title}
              </p>
            </div>
          </div>

          {/* Bio Preview */}
          <p className="text-sm text-gray-600 line-clamp-2 mb-4 leading-relaxed">
            {member.bio}
          </p>

          {/* Action Button */}
          <div
            className={`flex items-center gap-2 text-sm font-medium transition-all duration-300 ${
              isHovered ? 'text-orange-600' : 'text-orange-500'
            }`}
          >
            <span>הצג פרופיל מלא</span>
            <ChevronLeft className={`h-4 w-4 transition-transform duration-300 ${isHovered ? 'translate-x-1' : ''}`} />
          </div>
        </div>

        {/* Hover overlay */}
        <div
          className={`absolute inset-0 bg-gradient-to-t from-orange-500/10 to-transparent rounded-2xl transition-opacity duration-300 ${
            isHovered ? 'opacity-100' : 'opacity-0'
          }`}
        />
      </div>
    </motion.div>
  );
};

const AboutSection = ({ currentUser }) => {
  // State
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [selectedMember, setSelectedMember] = useState(null);
  const [teamMembers, setTeamMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newsletterModal, setNewsletterModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editData, setEditData] = useState({});

  const isAdmin = currentUser?.role === 'admin';

  // Refs
  const modalRef = useRef();

  // Fetch admins on mount
  useEffect(() => {
    let active = true;
    const fetchAdminUsers = async () => {
      setLoading(true);
      try {
        const adminQuery = query(
          collection(db, 'staff'),
          where('in_role', 'not-in', ['ועדת ביקורת'])
        );
        const querySnapshot = await getDocs(adminQuery);
        const admins = [];
        for (const userDoc of querySnapshot.docs) {
          const userData = userDoc.data();
          const associatedId = userData.associated_id || userDoc.id;
          const admin = {
            id: userDoc.id,
            associated_id: associatedId,
            username:
              userData.username ||
              userData.email?.split('@')[0] ||
              'מנהל',
            role: userData.role,
            in_role: userData.in_role,
            title:
              userData.title ||
              (userData.in_role === 'מייסדת ומנכ"לית' ? 'מייסדת ומנכ"לית' : userData.in_role),
            photoURL: userData.photoURL || DEFAULT_IMAGE,
            bio:
              userData.bio ||
              (userData.in_role === 'מייסדת ומנכ"לית'
                ? 'מנכ"ל העמותה, מוביל את החזון והפעילות למען בני הנוער בישראל.'
                : 'מנהל מערכת מנוסה המוביל את פעילות העמותה ומחויב לחזון ולמטרות שלנו.'),
            email: userData.email,
            is_active: userData.is_active !== false,
          };
          if (admin.is_active) admins.push(admin);
        }

        // Sort: מייסדת ומנכ"לית first, then staff members by name
        admins.sort((a, b) => {
          if (a.in_role === 'מייסדת ומנכ"לית' && b.in_role !== 'מייסדת ומנכ"לית') return -1;
          if (b.in_role === 'מייסדת ומנכ"לית' && a.in_role !== 'מייסדת ומנכ"לית') return 1;
          return a.username.localeCompare(b.username);
        });

        if (active) setTeamMembers(admins);
      } catch (error) {
        console.error('Error fetching admin users:', error);
        setTeamMembers([]);
      } finally {
        setLoading(false);
      }
    };
    fetchAdminUsers();
    return () => {
      active = false;
    };
  }, []);

  // Modal close on ESC
  useEffect(() => {
    function onKeyDown(e) {
      if (e.key === 'Escape') {
        setSelectedMember(null);
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
        'יוצרים מהפכה שקטה מפתחים מנהיגות אותנטית דרך כוחה המעצים של האמנות',
    },
  ];

  // Modal logic
  const openMemberModal = useCallback(idx => {
    setEditMode(false);
    setSelectedMember(idx);
    setEditData({});
  }, []);

  const closeMemberModal = useCallback(() => {
    setEditMode(false);
    setSelectedMember(null);
    setEditData({});
  }, []);

  const openNewsletter = useCallback(() => setNewsletterModal(true), []);
  const closeNewsletter = useCallback(() => setNewsletterModal(false), []);

  // Edit team member
  const startEdit = useCallback(() => {
    const m = teamMembers[selectedMember];
    setEditData({ bio: m.bio, title: m.title });
    setEditMode(true);
  }, [selectedMember, teamMembers]);

  const cancelEdit = useCallback(() => {
    setEditData({});
    setEditMode(false);
  }, []);

  const handleEditChange = useCallback(e => {
    setEditData(ed => ({ ...ed, [e.target.name]: e.target.value }));
  }, []);

  const saveEdit = async () => {
    const member = teamMembers[selectedMember];
    try {
      await updateDoc(doc(db, 'profiles', member.associated_id), {
        bio: editData.bio,
        title: editData.title,
      });
      const newTeam = teamMembers.map((m, i) =>
        i === selectedMember ? { ...m, bio: editData.bio, title: editData.title } : m
      );
      setTeamMembers(newTeam);
      setEditMode(false);
      toast.success('הפרופיל נשמר בהצלחה!');
    } catch (err) {
      toast.error('שגיאה בשמירת הפרופיל');
    }
  };

  // Loading component
  const LoadingCard = ({ index }) => (
    <div className="animate-pulse">
      <div className="bg-white rounded-2xl p-6 border-2 border-gray-100">
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="w-20 h-20 md:w-24 md:h-24 bg-gray-200 rounded-full" />
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded w-24" />
            <div className="h-3 bg-gray-200 rounded w-32" />
          </div>
          <div className="space-y-2 w-full">
            <div className="h-3 bg-gray-200 rounded" />
            <div className="h-3 bg-gray-200 rounded w-3/4" />
          </div>
        </div>
      </div>
    </div>
  );

  // --- UI ---
  return (
    <section
      id="about-section"
      className="relative py-12 md:py-16 bg-gradient-to-br from-orange-50 via-orange-100 to-yellow-100 overflow-hidden"
    >
      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-32 h-32 rounded-full bg-pink-200/20 -translate-x-1/2 -translate-y-1/2 blur-2xl" />
      <div className="absolute bottom-0 right-0 w-48 h-48 rounded-full bg-orange-300/15 translate-x-1/3 translate-y-1/3 blur-2xl" />

      {/* Newsletter modal */}
      <NewsletterModal isOpen={newsletterModal} closeNewsletter={closeNewsletter} />

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="text-center mb-8 md:mb-12">
          <h2 className="font-bold text-3xl md:text-4xl text-orange-800 mb-3">
            מנהיגות דיאלוגית של דור המחר
          </h2>
          <div className="h-1 w-20 bg-orange-500 mx-auto mb-4 rounded-full" />
          <p className="text-base md:text-lg text-gray-700 max-w-xl mx-auto leading-relaxed">
            בלב כל נער ונערה בישראל טמון אור ייחודי – כישרון שממתין להתגלות, קול שמבקש להישמע, והשפעה שעתידה לשנות עולמות
          </p>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-12">
          {features.map((feature, index) => (
            <div
              key={index}
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
              className={`transition-all duration-300 ${
                hoveredIndex === index ? 'transform -translate-y-1' : ''
              }`}
            >
              <Card
                className={`h-full bg-white/90 backdrop-blur-sm border-0 shadow-md rounded-2xl ${
                  hoveredIndex === index ? 'shadow-lg shadow-orange-200/50' : ''
                }`}
              >
                <CardContent className="p-4 md:p-6 text-center h-full flex flex-col">
                  <div className="mb-3 flex justify-center">
                    <div
                      className={`p-2 rounded-full bg-orange-50 ${
                        hoveredIndex === index ? 'scale-110' : ''
                      } transition-all duration-300`}
                    >
                      {feature.icon}
                    </div>
                  </div>
                  <h3 className="text-lg md:text-xl font-bold mb-2 text-gray-900">
                    {feature.title}
                  </h3>
                  <p className="text-sm md:text-base text-gray-600 leading-relaxed flex-grow">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>

        {/* Enhanced Team Section */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <h3 className="text-2xl md:text-3xl font-bold text-orange-800">צוות העמותה</h3>
          </div>
          <p className="text-gray-600 mb-8 text-sm md:text-base max-w-2xl mx-auto">
            הכירו את האנשים המחויבים והמסורים שמובילים את החזון שלנו ופועלים יום יום למען קהילת הנוער בישראל
          </p>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
              {[0, 1, 2].map((index) => (
                <LoadingCard key={index} index={index} />
              ))}
            </div>
          ) : teamMembers.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-12 bg-white/50 rounded-2xl border-2 border-dashed border-orange-200"
            >
              <Users className="h-16 w-16 mx-auto mb-4 text-orange-300" />
              <h4 className="text-lg font-semibold text-gray-600 mb-2">אין חברי צוות זמינים</h4>
              <p className="text-gray-500">לא נמצאו עובדים פעילים במערכת כרגע</p>
            </motion.div>
          ) : (
            <>
              {/* Enhanced Team Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
                {teamMembers.slice(0, 3).map((member, idx) => (
                  <TeamMemberCard
                    key={member.id}
                    member={member}
                    index={idx}
                    onClick={() => openMemberModal(idx)}
                    isFounder={member.in_role === 'מייסדת ומנכ"לית'}
                  />
                ))}
              </div>

              {/* Enhanced View All Button */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Button
                  asChild
                  className="group bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-xl px-8 py-3 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                >
                  <Link to="/team" className="flex items-center gap-3">
                    <Users className="h-5 w-5 group-hover:scale-110 transition-transform" />
                    <span>הכירו את כל הצוות</span>
                    <ChevronLeft className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </Button>
              </motion.div>
            </>
          )}
        </div>

        {/* Newsletter/CTA */}
        <div className="text-center rounded-2xl p-8 mx-auto max-w-3xl transition-all duration-300 border border-orange-100">
          <div className="inline-flex items-center gap-3 mb-4 bg-green-50 px-4 py-2 rounded-full">
            <TreePine className="h-6 w-6 text-green-600 animate-pulse" />
            <span className="text-green-700 font-semibold">חדש! הניוזלטר שלנו</span>
          </div>
          <h3 className="text-2xl md:text-3xl font-bold text-orange-800 mb-4">
            הישארו מעודכנים בפעילויות העמותה
          </h3>
          <p className="text-gray-600 mb-6 max-w-xl mx-auto">
            הצטרפו לקהילה שלנו וקבלו עדכונים שבועיים על פעילויות, אירועים והשפעות העמותה
          </p>
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
      </div>

      {/* Enhanced Member Modal */}
      <AnimatePresence>
        {selectedMember !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 flex items-center justify-center z-50 p-4 bg-black/50 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[85vh] overflow-y-auto"
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
                <div className="relative">
                  {/* Header with gradient background */}
                  <div className="bg-gradient-to-br from-orange-100 via-orange-50 to-yellow-50 p-6 rounded-t-2xl">
                    <div className="flex flex-col md:flex-row gap-6 items-center md:items-start text-center md:text-right">
                      <div className="relative">
                        <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-xl">
                          <AvatarImg
                            src={teamMembers[selectedMember].photoURL}
                            alt={teamMembers[selectedMember].username}
                            className="rounded-full"
                          />
                        </div>
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
                          <h3 className="text-2xl font-bold text-gray-900">
                            {teamMembers[selectedMember].username}
                          </h3>
                        </div>
                        
                        {editMode ? (
                          <input
                            type="text"
                            name="title"
                            value={editData.title}
                            onChange={handleEditChange}
                            className="text-lg font-medium text-orange-600 bg-white border border-orange-200 rounded px-3 py-1 w-full mb-4"
                          />
                        ) : (
                          <p className="text-lg font-medium text-orange-600 bg-orange-50 px-4 py-2 rounded-full inline-block mb-4">
                            {teamMembers[selectedMember].title}
                          </p>
                        )}

                        {/* Contact Info */}
                        <div className="flex items-center justify-center md:justify-start gap-4 text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <Mail className="h-4 w-4" />
                            <span>{teamMembers[selectedMember].email}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <MapPin className="h-4 w-4" />
                            <span>ישראל</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    <div className="mb-6">
                      <h4 className="text-lg font-semibold text-gray-900 mb-3">אודות</h4>
                      {editMode ? (
                        <textarea
                          name="bio"
                          value={editData.bio}
                          onChange={handleEditChange}
                          rows={4}
                          className="w-full text-gray-700 leading-relaxed border border-gray-200 rounded-lg p-3 resize-none focus:outline-none focus:border-orange-400"
                        />
                      ) : (
                        <p className="text-gray-700 leading-relaxed">
                          {teamMembers[selectedMember].bio}
                        </p>
                      )}
                    </div>

                    {/* Role Badge */}
                    <div className="mb-6">
                      <span className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white px-4 py-2 rounded-full text-sm font-medium">
                        <Users className="h-4 w-4" />
                        {teamMembers[selectedMember].in_role}
                      </span>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3 pt-4 border-t border-gray-100">
                      {editMode ? (
                        <>
                          <Button
                            onClick={saveEdit}
                            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
                          >
                            <Check className="h-4 w-4" />
                            שמור
                          </Button>
                          <Button
                            onClick={cancelEdit}
                            variant="outline"
                            className="flex items-center gap-2 border-gray-300 text-gray-700 hover:bg-gray-50 px-4 py-2 rounded-lg transition-colors"
                          >
                            <X className="h-4 w-4" />
                            ביטול
                          </Button>
                        </>
                      ) : (
                        <>
                          {isAdmin && (
                            <Button
                              onClick={startEdit}
                              variant="outline"
                              className="flex items-center gap-2 border-orange-300 text-orange-700 hover:bg-orange-50 px-4 py-2 rounded-lg transition-colors"
                            >
                              <Edit2 className="h-4 w-4" />
                              ערוך
                            </Button>
                          )}
                          <Button
                            onClick={closeMemberModal}
                            className="flex items-center gap-2 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors"
                          >
                            סגור
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <Toaster position="top-center" />
    </section>
  );
};

export default AboutSection;