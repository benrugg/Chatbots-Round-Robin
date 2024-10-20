"use client"

import Link from "next/link"
import UserManager from "../../components/UserManager"
import Header from "../../components/Header"
import { useAuth } from "../../hooks/useAuth"

export default function ManageTeam() {
  const { user, loading, signOut } = useAuth()

  if (loading) return <div>Loading...</div>
  if (!user) return null

  return (
    <div className="min-h-screen flex flex-col">
      <Header currentUser={user} onSignOut={signOut} />
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">Manage Team</h1>
          <UserManager />
          <div className="mt-8 flex justify-between">
            <Link href="/choose-reviewer" className="text-blue-500 hover:text-blue-700">
              Choose a Reviewer
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}
