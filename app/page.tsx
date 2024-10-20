'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import UserSelector from '../components/UserSelector'
import Header from '../components/Header'
import { supabase } from '../lib/supabase'

export default function Home() {
  const [users, setUsers] = useState([])
  const [selectedUser, setSelectedUser] = useState(null)
  const router = useRouter()

  useEffect(() => {
    const storedUser = localStorage.getItem('currentUser')
    if (storedUser) {
      setSelectedUser(JSON.parse(storedUser))
      router.push('/choose-reviewer')
    }
    fetchUsers()
  }, [router])

  const fetchUsers = async () => {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('is_archived', false)
    if (error) console.error('Error fetching users:', error)
    else setUsers(data)
  }

  const handleUserSelect = (user) => {
    localStorage.setItem('currentUser', JSON.stringify(user))
    setSelectedUser(user)
    router.push('/choose-reviewer')
  }

  const handleSignOut = () => {
    localStorage.removeItem('currentUser')
    setSelectedUser(null)
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header currentUser={selectedUser} onSignOut={handleSignOut} />
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto">
          <h1 className="text-4xl font-bold mb-8 text-center">Round Robin Chooser</h1>
          <UserSelector users={users} onSelect={handleUserSelect} />
        </div>
      </main>
    </div>
  )
}
