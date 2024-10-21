import React from "react"
import Link from "next/link"

type HeaderProps = {
  currentUser: { name: string } | null
  onSignOut: () => void
}

const Header: React.FC<HeaderProps> = ({ currentUser, onSignOut }) => {
  return (
    <header className="bg-white dark:bg-gray-800 shadow-md">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link href="/" className="text-xl font-bold text-blue-600 dark:text-blue-400">
          Round Robin Chooser
        </Link>
        {currentUser && (
          <div className="flex items-center space-x-4">
            <span className="dark:text-gray-300">Welcome, {currentUser.name}</span>
            <button
              onClick={onSignOut}
              className="bg-red-500 hover:bg-red-700 dark:bg-red-600 dark:hover:bg-red-800 text-white font-bold py-2 px-4 rounded"
            >
              Sign Out
            </button>
          </div>
        )}
      </div>
    </header>
  )
}

export default Header
