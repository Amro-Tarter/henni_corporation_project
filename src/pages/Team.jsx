import React, { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import RoleSection from "../components/team/RoleSection"
import TeamEmptyState from "../components/team/TeamEmptyState"
import ElementalLoader from "../theme/ElementalLoader"
import Layout from "../components/layout/Layout"
import { ThemeProvider, useElement } from "../theme/ThemeProvider"
import { collection, getDocs, query, where } from "firebase/firestore"
import { db } from "@/config/firbaseConfig"
import { toast } from "@/components/ui/sonner"

import {
  UserCheck,
  Users2,
  Crown
} from "lucide-react"

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
  const { ceoData, staffData, loading: loadingStaff } = useStaffMembers(searchQuery)
  const { mentors, loading: loadingMentors } = useMentors(searchQuery)
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
              className="mb-10 text-right space-y-2"
            >
             <h1 className="text-5xl font-extrabold bg-gradient-to-r from-blue-700 to-purple-500 bg-clip-text text-transparent mb-2 leading-[1.5]">
              הצוות שלנו
            </h1>

              <p className="text-xl text-gray-700">
                הכירו את הצוות המקצועי, הניהול, המנטורים שמובילים את הקהילה שלנו.
              </p>
            </motion.div>

            {/* Staff Section */}
            <motion.section ref={staffRef} id="staff" className="mb-20 scroll-mt-24">
              <motion.div className="flex items-center justify-right gap-3 mb-8">
                <Users2 className="w-8 h-8 text-blue-500" />
                <h2 className="px-4 text-3xl font-bold bg-gradient-to-r from-blue-700 to-purple-600 bg-clip-text text-transparent leading-[1.5]">
                  הצוות שלנו
                </h2>
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
                members={[...ceoData, ...staffData]
                  .map(s => ({
                    ...s,
                    in_role: /(ceo|מנכ״ל|מנכ״לית)/i.test(s.in_role || "") ? 'מייסדת ומנכ״לית' : s.in_role || "צוות",
                    role: /(ceo|מנכ״ל|מנכ״לית)/i.test(s.in_role || "") ? "מנכ״לית" : "צוות",
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
              <motion.div className="flex items-center justify-right gap-3 mb-8">
                <UserCheck className="w-8 h-8 text-emerald-500" />
                <h2 className="px-4 text-3xl font-bold bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent leading-[1.5]">
                 המנטורים
                </h2>
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
                    className: "bg-white/80 backdrop-blur-lg border border-blue-100/60 hover:border-blue-200/80"
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