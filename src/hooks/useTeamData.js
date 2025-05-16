import { useState, useEffect, useMemo } from 'react'
import { collection, getDocs, getDoc, doc } from 'firebase/firestore'
import { db } from '../config/firbaseConfig'
import { useUser } from './useUser'

export default function useTeamData(searchQuery = '') {
  const [users, setUsers] = useState([])
  const [filters, setFilters] = useState({ region: '', expertise: '', location: '' })
  const [isLoading, setIsLoading] = useState(true)
  const { user: currentUser } = useUser()

  useEffect(() => {
    async function load() {
      setIsLoading(true)
      try {
        const usersSnap = await getDocs(collection(db, 'users'))
        const usersData = await Promise.all(
          usersSnap.docs
            .filter(doc => doc.data().is_active) // Only get active users
            .map(async (userDoc) => {
              const userData = userDoc.data()
              const profileSnap = await getDoc(doc(db, 'profiles', userDoc.id))
              const profileData = profileSnap.exists() ? profileSnap.data() : {}
              
              return {
                id: userDoc.id,
                ...userData,
                ...profileData,
                bio: profileData.bio || "Team member at our organization",
                region: profileData.region || "Global",
                expertise: profileData.expertise || "General",
                location: profileData.location || "Not specified",
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

  const regions = useMemo(
    () => Array.from(new Set(users.map(u => u.region))).sort(),
    [users]
  )

  const expertises = useMemo(
    () => Array.from(new Set(users.map(u => u.expertise))).sort(),
    [users]
  )

  const locations = useMemo(
    () => Array.from(new Set(users.map(u => u.location))).sort(),
    [users]
  )

  const searchTeamMember = (member) => {
    if (!searchQuery) return true
    const query = searchQuery.toLowerCase()
    return (
      (member.displayName || '').toLowerCase().includes(query) || 
      (member.bio || '').toLowerCase().includes(query) || 
      (member.region || '').toLowerCase().includes(query) ||
      (member.expertise || '').toLowerCase().includes(query) ||
      (member.location || '').toLowerCase().includes(query)
    )
  }

  const filteredUsers = users.filter(user =>
    (!filters.region || user.region === filters.region) &&
    (!filters.expertise || user.expertise === filters.expertise) &&
    (!filters.location || user.location === filters.location) &&
    searchTeamMember(user)
  )

  const groupedByRole = useMemo(() => {
    const sections = [
      { role: 'מנהלים', members: filteredUsers.filter(u => u.role === 'admin') },
      { role: 'מנטורים', members: filteredUsers.filter(u => u.role === 'mentor') }
    ]

    if (currentUser?.role === 'admin') {
      sections.push(
        { role: 'משתתפים', members: filteredUsers.filter(u => u.role === 'participant') },
        { role: 'משפחות', members: filteredUsers.filter(u => u.role === 'family') }
      )
    }

    return sections.filter(group => group.members.length > 0)
  }, [filteredUsers, currentUser?.role])

  return { 
    groupedByRole, 
    regions, 
    expertises,
    locations,
    filters, 
    setFilters, 
    isLoading,
    hasResults: groupedByRole.some(group => group.members.length > 0)
  }
}