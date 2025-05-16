import { useState, useEffect, useMemo } from 'react'
import { collection, getDocs, query, where } from 'firebase/firestore'
import { db } from '../config/firbaseConfig'

export default function useTeamData(searchQuery = '') {
  const [staff, setStaff] = useState([])
  const [mentors, setMentors] = useState([])
  const [filters, setFilters] = useState({ region: '', expertise: '' })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function load() {
      setIsLoading(true)
      try {
        const staffSnap = await getDocs(collection(db, 'staff'))
        const mentorSnap = await getDocs(collection(db, 'mentors'))
        
        setStaff(staffSnap.docs.map(d => ({ 
          id: d.id, 
          ...d.data(),
          // Ensure these fields exist
          bio: d.data().bio || "Team member at our organization",
          region: d.data().region || "Global",
        })))
        
        setMentors(mentorSnap.docs.map(d => ({ 
          id: d.id, 
          ...d.data(),
          // Ensure these fields exist
          bio: d.data().bio || "Mentor at our organization",
          region: d.data().region || "Global",
          art_expertise: d.data().art_expertise || "Art",
        })))
      } catch (error) {
        console.error("Error loading team data:", error)
      } finally {
        setIsLoading(false)
      }
    }
    load()
  }, [])

  // Get unique regions and expertises
  const regions = useMemo(
    () => Array.from(new Set([...staff, ...mentors].map(u => u.region))).sort(),
    [staff, mentors],
  )

  const expertises = useMemo(
    () => Array.from(new Set(mentors.map(m => m.art_expertise))).sort(),
    [mentors],
  )

  // Search function across name, bio and region
  const searchTeamMember = (member) => {
    if (!searchQuery) return true
    
    const query = searchQuery.toLowerCase()
    const fullName = `${member.first_name} ${member.last_name}`.toLowerCase()
    const bio = (member.bio || '').toLowerCase()
    const region = (member.region || '').toLowerCase()
    const expertise = (member.art_expertise || '').toLowerCase()
    
    return fullName.includes(query) || 
           bio.includes(query) || 
           region.includes(query) ||
           expertise.includes(query)
  }

  // Apply filters and search
  const filteredStaff = staff.filter(s =>
    (!filters.region || s.region === filters.region) &&
    searchTeamMember(s)
  )
  
  const filteredMentors = mentors.filter(m =>
    (!filters.region || m.region === filters.region) &&
    (!filters.expertise || m.art_expertise === filters.expertise) &&
    searchTeamMember(m)
  )

  const groupedByRole = useMemo(() => ([
    { role: 'CEO', members: filteredStaff.filter(s => s.role === 'CEO') },
    { role: 'Employee', members: filteredStaff.filter(s => s.role === 'Employee') },
    { role: 'Volunteer', members: filteredStaff.filter(s => s.role === 'Volunteer') },
    { role: 'Mentor', members: filteredMentors },
  ]).filter(group => group.members.length > 0), [filteredStaff, filteredMentors])

  // Check if there are any results
  const hasResults = groupedByRole.some(group => group.members.length > 0)

  return { 
    groupedByRole, 
    regions, 
    expertises, 
    filters, 
    setFilters, 
    isLoading,
    hasResults
  }
}