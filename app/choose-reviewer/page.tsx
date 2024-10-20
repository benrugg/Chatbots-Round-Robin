"use client"

import Link from "next/link"
import ReviewerChooser from "../../components/ReviewerChooser"
import Header from "../../components/Header"
import { useAuth } from "../../hooks/useAuth"

export default function ChooseReviewer() {
  const { user, loading, signOut } = useAuth()

  if (loading) return <div>Loading...</div>
  if (!user) return null

  return (
    <div className="min-h-screen flex flex-col">
      <Header currentUser={user} onSignOut={signOut} />
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">Choose a Reviewer</h1>
          <ReviewerChooser currentUser={user} />
          <div className="mt-8 flex justify-between">
            <Link href="/manage-team" className="text-blue-500 hover:text-blue-700">
              Manage Team
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}
