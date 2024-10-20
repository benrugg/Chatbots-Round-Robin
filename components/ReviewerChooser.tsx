import React, { useState, useEffect } from "react"
import { supabase } from "../lib/supabase"
import toast from "react-hot-toast"
import { User, Selection, fetchUsers, fetchSelections, chooseReviewer, updateSelection } from "../utils/reviewerUtils"

type ReviewerChooserProps = {
  currentUser: User
}

const ReviewerChooser: React.FC<ReviewerChooserProps> = ({ currentUser }) => {
  const [users, setUsers] = useState<User[]>([])
  const [selections, setSelections] = useState<Selection[]>([])

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
      <button onClick={handleChooseReviewer} className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded">
        Choose a Random Reviewer
      </button>
      <div className="space-y-4">
        {users.map((user) => {
          const count = selections.find((s) => s.selected_id === user.id)?.count || 0
          return (
            <div key={user.id} className="flex items-center justify-between">
              <span>
                {user.name}: {count}
              </span>
              <div>
                <button
                  onClick={() => handleUpdateCount(user.id, -1)}
                  className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded mr-2"
                >
                  -
                </button>
                <button
                  onClick={() => handleUpdateCount(user.id, 1)}
                  className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-2 rounded"
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
