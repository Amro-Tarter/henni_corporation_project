import { useState, useEffect, useMemo } from 'react'
import { collection, getDocs, query, where, getDoc, doc } from 'firebase/firestore'
import { db } from '../config/firbaseConfig'

export default function useTeamData(searchQuery = '') {
  const [users, setUsers] = useState([])
  const [filters, setFilters] = useState({ region: '', expertise: '' })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function load() {
      setIsLoading(true)
      try {
        // Fetch all users
        const usersSnap = await getDocs(collection(db, 'users'))
        const usersData = await Promise.all(
          usersSnap.docs.map(async (userDoc) => {
            const userData = userDoc.data()
            // Fetch corresponding profile
            const profileSnap = await getDoc(doc(db, 'profiles', userDoc.id))
            const profileData = profileSnap.exists() ? profileSnap.data() : {}
            
            return {
              id: userDoc.id,
              ...userData,
              ...profileData,
              // Ensure these fields exist
              bio: profileData.bio || "Team member at our organization",
              region: profileData.region || "Global",
              expertise: profileData.expertise || "General",
              displayName: profileData.displayName || userData.username,
              photoURL: profileData.photoURL || `https://ui-avatars.com/api/?name=${userData.username}&background=random`
            }
          })
        )
        
        setUsers(usersData)
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
    () => Array.from(new Set(users.map(u => u.region))).sort(),
    [users]
  )

  const expertises = useMemo(
    () => Array.from(new Set(users.map(u => u.expertise))).sort(),
    [users]
  )

  // Search function across name, bio and region
  const searchTeamMember = (member) => {
    if (!searchQuery) return true
    
    const query = searchQuery.toLowerCase()
    const displayName = (member.displayName || '').toLowerCase()
    const bio = (member.bio || '').toLowerCase()
    const region = (member.region || '').toLowerCase()
    const expertise = (member.expertise || '').toLowerCase()
    
    return displayName.includes(query) || 
           bio.includes(query) || 
           region.includes(query) ||
           expertise.includes(query)
  }

  // Apply filters and search
  const filteredUsers = users.filter(user =>
    (!filters.region || user.region === filters.region) &&
    (!filters.expertise || user.expertise === filters.expertise) &&
    searchTeamMember(user)
  )

  const groupedByRole = useMemo(() => {
    const groups = [
      { role: 'מנהל', members: filteredUsers.filter(u => u.role === 'admin') },
      { role: 'עורך', members: filteredUsers.filter(u => u.role === 'editor') },
      { role: 'משתמש', members: filteredUsers.filter(u => u.role === 'user') }
    ]
    return groups.filter(group => group.members.length > 0)
  }, [filteredUsers])

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