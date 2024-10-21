import React, { useState, useEffect } from "react"
import { twMerge } from "tailwind-merge"
import { supabase } from "../lib/supabase"
import toast from "react-hot-toast"
import { User, Selection, fetchUsers, fetchSelections, chooseReviewer, updateSelection } from "../utils/reviewerUtils"

type ReviewerChooserProps = {
  currentUser: User
}

const ReviewerChooser: React.FC<ReviewerChooserProps> = ({ currentUser }) => {
  const [users, setUsers] = useState<User[]>([])
  const [selections, setSelections] = useState<Selection[]>([])
  const [lastChosenReviewer, setLastChosenReviewer] = useState<string | null>(null)

  useEffect(() => {
    const loadData = async () => {
      const [fetchedUsers, fetchedSelections] = await Promise.all([fetchUsers(currentUser.id), fetchSelections(currentUser.id)])
      setUsers(fetchedUsers)
      setSelections(fetchedSelections)
    }
    loadData()

    const usersSubscription = supabase
      .channel("users_channel")
      .on("postgres_changes", { event: "*", schema: "public", table: "users" }, () => loadData())
      .subscribe()
    const selectionsSubscription = supabase
      .channel("selections_channel")
      .on("postgres_changes", { event: "*", schema: "public", table: "selections" }, () => loadData())
      .subscribe()

    return () => {
      supabase.removeChannel(usersSubscription)
      supabase.removeChannel(selectionsSubscription)
    }
  }, [currentUser.id])

  const handleChooseReviewer = async () => {
    const chosenUser = chooseReviewer(users, selections)
    if (!chosenUser) {
      toast.error("No available reviewers")
      return
    }

    const success = await updateSelection(currentUser.id, chosenUser.id, 1)
    if (success) {
      toast.success(`${chosenUser.name} has been randomly chosen as your reviewer`)
      setSelections(await fetchSelections(currentUser.id))
      setLastChosenReviewer(chosenUser.id)
    } else {
      toast.error("Failed to choose reviewer")
    }
  }

  const handleUpdateCount = async (userId: string, increment: number) => {
    const success = await updateSelection(currentUser.id, userId, increment)
    if (success) {
      setSelections(await fetchSelections(currentUser.id))
    } else {
      toast.error("Failed to update count")
    }
  }

  return (
    <div className="space-y-6">
      <button
        onClick={handleChooseReviewer}
        className="bg-green-500 hover:bg-green-700 dark:bg-green-600 dark:hover:bg-green-800 text-white font-bold py-2 px-4 rounded"
      >
        Choose a Random Reviewer
      </button>
      <div className="space-y-4">
        {users.map((user) => {
          const count = selections.find((s) => s.selected_id === user.id)?.count || 0
          const isLastChosen = user.id === lastChosenReviewer
          return (
            <div
              key={user.id}
              className={twMerge(
                "flex items-center justify-between p-2 rounded",
                isLastChosen ? "bg-yellow-100 dark:bg-yellow-900 border-2 border-yellow-300 dark:border-yellow-700" : "",
              )}
            >
              <span className={twMerge("text-gray-900 dark:text-gray-100", isLastChosen && "font-bold")}>
                {user.name}: {count}
                {isLastChosen && <span className="ml-2 text-sm text-yellow-600 dark:text-yellow-400">(Last chosen)</span>}
              </span>
              <div>
                <button
                  onClick={() => handleUpdateCount(user.id, -1)}
                  className="bg-red-500 hover:bg-red-700 dark:bg-red-600 dark:hover:bg-red-800 text-white font-bold py-1 px-2 rounded mr-2"
                >
                  -
                </button>
                <button
                  onClick={() => handleUpdateCount(user.id, 1)}
                  className="bg-blue-500 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-800 text-white font-bold py-1 px-2 rounded"
                >
                  +
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default ReviewerChooser
