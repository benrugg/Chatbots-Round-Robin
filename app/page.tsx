"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import UserSelector from "../components/UserSelector"
import Header from "../components/Header"
import { supabase } from "../lib/supabase"
import { useAuth } from "../hooks/useAuth"

export default function Home() {
  const [users, setUsers] = useState([])
  const { user, loading, signIn, signOut } = useAuth(false) // Don't redirect from home page
  const router = useRouter()

  useEffect(() => {
    if (!loading && user) {
      router.push("/choose-reviewer")
    }
    fetchUsers()
  }, [user, loading, router])

  const fetchUsers = async () => {
    const { data, error } = await supabase.from("users").select("*").eq("is_archived", false)
    if (error) console.error("Error fetching users:", error)
    else setUsers(data)
  }

  const handleUserSelect = (selectedUser) => {
    signIn(selectedUser)
  }

  if (loading) return <div>Loading...</div>

  return (
    <div className="min-h-screen flex flex-col">
      <Header currentUser={user} onSignOut={signOut} />
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto">
          <h1 className="text-4xl font-bold mb-8 text-center">Round Robin Chooser</h1>
          <UserSelector users={users} onSelect={handleUserSelect} />
        </div>
      </main>
    </div>
  )
}
