"use client"

import Link from "next/link"
import ReviewerChooser from "../../components/ReviewerChooser"
import Header from "../../components/Header"
import { useAuth } from "../../hooks/useAuth"
import { randomIntFromInterval } from "../../utils/randomNumber"
import ReactConfetti from "react-confetti"
import { useState } from "react"

export default function ChooseReviewer() {
  const { user, loading, signOut } = useAuth()
  const [showConfetti, setShowConfetti] = useState(false)
  let confettiTimeoutId = null

  if (loading) return <div>Loading...</div>
  if (!user) return null

  const doConfettiBlast = () => {
    if (confettiTimeoutId) {
      clearTimeout(confettiTimeoutId)
    }

    setShowConfetti(true)
    confettiTimeoutId = setTimeout(() => setShowConfetti(false), 5000)
  }

  return (
    <div className="min-h-screen flex flex-col">
      {showConfetti && <ReactConfetti recycle={false} numberOfPieces={randomIntFromInterval(225, 450)} />}
      <Header currentUser={user} onSignOut={signOut} />
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">Choose a Reviewer</h1>
          <ReviewerChooser currentUser={user} onUserChosen={doConfettiBlast} />
          <div className="mt-8 flex justify-between">
            <Link href="/manage-team" className="text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300">
              Manage Team
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}
