'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import ReviewerChooser from '../../components/ReviewerChooser'
import Header from '../../components/Header'

export default function ChooseReviewer() {
  const [currentUser, setCurrentUser] = useState(null)
  const router = useRouter()

  useEffect(() => {
    const storedUser = localStorage.getItem('currentUser')
    if (storedUser) {
      setCurrentUser(JSON.parse(storedUser))
    } else {
      router.push('/')
    }
  }, [router])

  const handleSignOut = () => {
    localStorage.removeItem('currentUser')
    router.push('/')
  }

  if (!currentUser) return null

  return (
    <div className="min-h-screen flex flex-col">
      <Header currentUser={currentUser} onSignOut={handleSignOut} />
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">Choose a Reviewer</h1>
          <ReviewerChooser currentUser={currentUser} />
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
