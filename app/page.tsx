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
  // ... (previous code remains the same)

  return (
    <div className="min-h-screen flex flex-col">
      <Header currentUser={user} onSignOut={signOut} />
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-4xl font-bold mb-4 text-gray-900 dark:text-white">Round Robin Chooser</h1>
          <p className="text-xl mb-8 text-gray-700 dark:text-gray-300">Select your name to get started</p>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">Who are you?</h2>
            <p className="mb-6 text-gray-600 dark:text-gray-400">
              Choose your name from the list below. If you don't see your name, ask your team administrator to add you to the system.
            </p>
            <UserSelector users={users} onSelect={handleUserSelect} />
          </div>
          <p className="mt-6 text-sm text-gray-500 dark:text-gray-400">
            This app helps distribute code review tasks fairly among team members. After selecting your name, you'll be able to choose a reviewer for
            your code.
          </p>
        </div>
      </main>
    </div>
  )
}
