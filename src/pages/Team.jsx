import React, { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import TeamFilters from "../components/team/TeamFilters"
import RoleSection from "../components/team/RoleSection"
import TeamSearch from "../components/team/TeamSearch"
import TeamEmptyState from "../components/team/TeamEmptyState"
import ElementalLoader from "../theme/ElementalLoader"
import useTeamData from "../hooks/useTeamData"
import Layout from "../components/layout/Layout"
import { ThemeProvider, useElement } from "../theme/ThemeProvider"
import { collection, getDocs, query, where } from "firebase/firestore"
import { db } from "@/config/firbaseConfig"
import { toast } from "@/components/ui/sonner"

import {
  Users,
  UserCheck,
  UserCog,
  Home,
  BarChart2,
  ArrowUpCircle,
  Filter,
  XCircle,
  Users2,
  Crown
} from "lucide-react"

// --- Custom Hook: Staff Members Fetching ---
function useStaffMembers(searchQuery = "") {
  const [ceoData, setCeoData] = useState([])
  const [staffData, setStaffData] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchStaff() {
      setLoading(true)
      try {
        const docs = await getDocs(collection(db, "staff"))
        let allStaff = docs.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }))

        // Filter by search query if provided
        if (searchQuery) {
          const q = searchQuery.toLowerCase()
          allStaff = allStaff.filter(s =>
            (s.username || "").toLowerCase().includes(q) ||
            (s.in_role || "").toLowerCase().includes(q) ||
            (s.bio || "").toLowerCase().includes(q) ||
            (s.email || "").toLowerCase().includes(q) ||
            (s.mentorName || "").toLowerCase().includes(q)
          )
        }

        // Separate CEO from other staff
        const ceo = allStaff.filter(s => 
          (s.in_role || "").toLowerCase() === "ceo" || 
          (s.in_role || "").toLowerCase() === "מנכ״ל"
        )
        const otherStaff = allStaff.filter(s => 
          (s.in_role || "").toLowerCase() !== "ceo" && 
          (s.in_role || "").toLowerCase() !== "מנכ״ל"
        )

        setCeoData(ceo)
        setStaffData(otherStaff)
      } catch (error) {
        console.error("Error fetching staff:", error)
        setCeoData([])
        setStaffData([])
        toast.error("שגיאה בטעינת רשימת הצוות")
      }
      setLoading(false)
    }
    fetchStaff()
  }, [searchQuery])

  return { ceoData, staffData, loading }
}

// --- Custom Hook: Mentors Fetching ---
function useMentors(searchQuery = "") {
  const [mentors, setMentors] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchMentors() {
      setLoading(true)
      try {
        // Fetch users with mentor role
        const mentorQuery = query(
          collection(db, "users"),
          where("role", "==", "mentor")
        )
        const mentorDocs = await getDocs(mentorQuery)
        
        let mentorList = mentorDocs.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }))

        // Filter by search query if provided
        if (searchQuery) {
          const q = searchQuery.toLowerCase()
          mentorList = mentorList.filter(m =>
            (m.username || "").toLowerCase().includes(q) ||
            (m.displayName || "").toLowerCase().includes(q) ||
            (m.mentorName || "").toLowerCase().includes(q)
          )
        }

        setMentors(mentorList)
      } catch (error) {
        console.error("Error fetching mentors:", error)
        setMentors([])
        toast.error("שגיאה בטעינת רשימת המנטורים")
      }
      setLoading(false)
    }
    fetchMentors()
  }, [searchQuery])

  return { mentors, loading }
}

export default function Team() {
  const [searchQuery, setSearchQuery] = useState("")
  const [showLoader, setShowLoader] = useState(true)
  const [sectionInView, setSectionInView] = useState(null)
  const element = useElement()

  const {
    regions = [],
    expertises = [],
    locations = [],
    filters = {},
    setFilters = () => {}
  } = useTeamData(searchQuery)

  const { ceoData, staffData, loading: loadingStaff } = useStaffMembers(searchQuery)
  const { mentors, loading: loadingMentors } = useMentors(searchQuery)

  // Stats
  const ceoCount = ceoData.length
  const staffCount = staffData.length
  const mentorCount = mentors.length

  const isLoading = loadingStaff || loadingMentors 

  // Loader staged
  useEffect(() => {
    const timer = setTimeout(() => setShowLoader(false), 900)
    return () => clearTimeout(timer)
  }, [])

  // Section tracking
  const ceoRef = useRef(null)
  const staffRef = useRef(null)
  const mentorRef = useRef(null)

  useEffect(() => {
    const handleScroll = () => {
      const sections = [
        { ref: ceoRef, key: "ceo" },
        { ref: staffRef, key: "staff" },
        { ref: mentorRef, key: "mentors" },
      ]
      const scrollY = window.scrollY + 100
      for (let s of sections) {
        if (s.ref.current) {
          const top = s.ref.current.offsetTop
          const height = s.ref.current.offsetHeight
          if (scrollY >= top && scrollY < top + height) {
            setSectionInView(s.key)
            break
          }
        }
      }
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  if (showLoader) return <ElementalLoader />

  return (
    <ThemeProvider element={element}>
      <Layout>
        <div
          dir="rtl"
          lang="he"
          className="min-h-screen bg-gradient-to-br from-element/5 via-element-soft/40 to-white bg-fixed relative  py-10"
          style={{
            background: "radial-gradient(ellipse at 60% 0,#eef2ff 60%,#a5b4fc12 100%)"
          }}
        >
          <div className="absolute inset-0 pointer-events-none z-0"
            aria-hidden
            style={{
              background: "linear-gradient(120deg,#f0f4ff99 60%,#6366f1 150%)",
              filter: "blur(44px)",
              opacity: 0.20
            }} />
          <div className="max-w-6xl mx-auto pt-8 pb-20 relative z-10 px-4">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-10 text-center space-y-2"
            >
              <h1 className="text-5xl font-extrabold bg-gradient-to-r from-blue-700 to-purple-500 bg-clip-text text-transparent drop-shadow-md tracking-tight mb-2">
                הצוות שלנו
              </h1>
              <p className="text-xl text-gray-700">
                הכירו את הצוות המקצועי, הניהול, המנטורים והסטודנטים שמובילים את הקהילה שלנו.
              </p>
            </motion.div>

            {/* Filters and Search */}
            <div className="sticky top-0 z-20 bg-white/70 backdrop-blur-lg rounded-2xl shadow-lg p-4 border border-element/10 mb-8 flex flex-col md:flex-row gap-6 items-center">
              <TeamSearch
                value={searchQuery}
                onChange={setSearchQuery}
                className="w-full md:w-2/5"
                placeholder="חפש לפי שם, תפקיד, מנטור או תיאור..."
              />
              <TeamFilters
                regions={regions}
                expertises={expertises}
                locations={locations}
                filters={filters}
                onChange={setFilters}
                className="w-full md:flex-1"
              />
            </div>

            {/* CEO Section */}
            <motion.section ref={ceoRef} id="ceo" className="mb-20 scroll-mt-24">
              <motion.div className="flex items-center justify-center gap-3 mb-8">
                <Crown className="w-8 h-8 text-amber-500" />
                <h2 className="text-3xl font-bold text-gray-800 bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                  מנהל
                </h2>
                {ceoCount > 0 && (
                  <span className="bg-amber-100 text-amber-800 text-sm px-3 py-1 rounded-full font-medium">
                    {ceoCount}
                  </span>
                )}
              </motion.div>
              {loadingStaff ? (
                <ElementalLoader />
              ) : ceoData.length === 0 ? (
                <TeamEmptyState
                  onReset={() => setSearchQuery("")}
                  message="לא נמצא מנהל"
                />
              ) : (
                <RoleSection
                  key="ceo"
                  role="מנהל"
                  members={ceoData.map(c => ({
                    ...c,
                    role: "מנהל",
                    username: c.username,
                    photo: c.photo,
                    bio: c.bio,
                    email: c.email,
                    in_role: c.in_role,
                    mentorName: c.mentorName
                  }))}
                  sectionInView={sectionInView}
                  cardProps={{
                    className: "bg-gradient-to-br from-amber-50/80 to-orange-50/80 backdrop-blur-lg border border-amber-200/60 hover:border-amber-300/80"
                  }}
                />
              )}
            </motion.section>

            {/* Staff Section */}
            <motion.section ref={staffRef} id="staff" className="mb-20 scroll-mt-24">
              <motion.div className="flex items-center justify-center gap-3 mb-8">
                <Users2 className="w-8 h-8 text-blue-500" />
                <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-700 to-purple-600 bg-clip-text text-transparent">
                  צוות מקצועי
                </h2>
                {staffCount > 0 && (
                  <span className="bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded-full font-medium">
                    {staffCount}
                  </span>
                )}
              </motion.div>
              {loadingStaff ? (
                <ElementalLoader />
              ) : staffData.length === 0 ? (
                <TeamEmptyState
                  onReset={() => setSearchQuery("")}
                  message="לא נמצאו חברי צוות"
                />
              ) : (
                <RoleSection
                  key="staff"
                  role="צוות"
                  members={staffData.map(s => ({
                    ...s,
                    role: s.in_role || "צוות",
                    username: s.username,
                    photo: s.photo,
                    bio: s.bio,
                    email: s.email,
                    mentorName: s.mentorName
                  }))}
                  sectionInView={sectionInView}
                  cardProps={{
                    className: "bg-white/80 backdrop-blur-lg border border-blue-100/60 hover:border-blue-200/80"
                  }}
                />
              )}
            </motion.section>

            {/* Mentors Section */}
            <motion.section ref={mentorRef} id="mentors" className="mb-20 scroll-mt-24">
              <motion.div className="flex items-center justify-center gap-3 mb-8">
                <UserCheck className="w-8 h-8 text-emerald-500" />
                <h2 className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent">
                  מנטורים
                </h2>
                {mentorCount > 0 && (
                  <span className="bg-emerald-100 text-emerald-800 text-sm px-3 py-1 rounded-full font-medium">
                    {mentorCount}
                  </span>
                )}
              </motion.div>
              {loadingMentors ? (
                <ElementalLoader />
              ) : mentors.length === 0 ? (
                <TeamEmptyState
                  onReset={() => setSearchQuery("")}
                  message="לא נמצאו מנטורים"
                />
              ) : (
                <RoleSection
                  key="mentors"
                  role="מנטורים"
                  members={mentors.map(m => ({
                    ...m,
                    role: "מנטור",
                    username: m.username || m.displayName,
                    photo: m.photoURL || m.photo,
                    mentorName: m.mentorName
                  }))}
                  sectionInView={sectionInView}
                  cardProps={{
                    className: "bg-gradient-to-br from-emerald-50/80 to-green-50/80 backdrop-blur-lg border border-emerald-200/60 hover:border-emerald-300/80"
                  }}
                />
              )}
            </motion.section>

            {/* Call To Action */}
            <motion.div
              className="mt-32 text-center py-12 bg-gradient-to-r from-blue-100/50 via-white/60 to-purple-100/60 rounded-3xl shadow-2xl backdrop-blur-md border border-element/10"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.7 }}
              transition={{ delay: 0.3 }}
            >
              <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-700 to-purple-500 bg-clip-text text-transparent mb-4">
                רוצים להצטרף לצוות שלנו?
              </h3>
              <p className="mb-8 text-gray-700">בואו להיות חלק מהעשייה. לחצו מטה להשארת פרטים או לפנייה ישירה.</p>
              <a
                href="/contact"
                className="inline-block px-8 py-3 rounded-full bg-gradient-to-r from-blue-600 to-purple-500 text-white font-bold shadow-lg hover:from-blue-700 hover:to-purple-700 transition-all text-lg"
              >
                השאר פרטים
              </a>
            </motion.div>
          </div>
        </div>
      </Layout>
    </ThemeProvider>
  )
}