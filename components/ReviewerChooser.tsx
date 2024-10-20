import React, { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import toast from 'react-hot-toast'

type User = {
  id: string
  name: string
}

type Selection = {
  id: string
  selected_id: string
  count: number
}

type ReviewerChooserProps = {
  currentUser: User
}

const ReviewerChooser: React.FC<ReviewerChooserProps> = ({ currentUser }) => {
  const [users, setUsers] = useState<User[]>([])
  const [selections, setSelections] = useState<Selection[]>([])

  useEffect(() => {
    fetchUsers()
    fetchSelections()
    const usersSubscription = supabase
      .channel('users_channel')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'users' }, fetchUsers)
      .subscribe()
    const selectionsSubscription = supabase
      .channel('selections_channel')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'selections' }, fetchSelections)
      .subscribe()

    return () => {
      supabase.removeChannel(usersSubscription)
      supabase.removeChannel(selectionsSubscription)
    }
  }, [currentUser.id])

  const fetchUsers = async () => {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .neq('id', currentUser.id)
      .eq('is_archived', false)
    if (error) console.error('Error fetching users:', error)
    else setUsers(data || [])
  }

  const fetchSelections = async () => {
    const { data, error } = await supabase
      .from('selections')
      .select('*')
      .eq('selector_id', currentUser.id)
    if (error) console.error('Error fetching selections:', error)
    else setSelections(data || [])
  }

  const chooseReviewer = async () => {
    const sortedUsers = users.sort((a, b) => {
      const countA = selections.find(s => s.selected_id === a.id)?.count || 0
      const countB = selections.find(s => s.selected_id === b.id)?.count || 0
      return countA - countB
    })

    const chosenUser = sortedUsers[0]
    if (!chosenUser) {
      toast.error('No available reviewers')
      return
    }

    const existingSelection = selections.find(s => s.selected_id === chosenUser.id)
    if (existingSelection) {
      const { error } = await supabase
        .from('selections')
        .update({ count: existingSelection.count + 1 })
        .eq('id', existingSelection.id)
      if (error) {
        console.error('Error updating selection:', error)
        toast.error('Failed to choose reviewer')
      } else {
        toast.success(`${chosenUser.name} has been chosen as your reviewer`)
      }
    } else {
      const { error } = await supabase
        .from('selections')
        .insert({ selector_id: currentUser.id, selected_id: chosenUser.id, count: 1 })
      if (error) {
        console.error('Error creating selection:', error)
        toast.error('Failed to choose reviewer')
      } else {
        toast.success(`${chosenUser.name} has been chosen as your reviewer`)
      }
    }
  }

  const updateCount = async (userId: string, increment: number) => {
    const selection = selections.find(s => s.selected_id === userId)
    if (selection) {
      const newCount = Math.max(0, selection.count + increment)
      const { error } = await supabase
        .from('selections')
        .update({ count: newCount })
        .eq('id', selection.id)
      if (error) {
        console.error('Error updating count:', error)
        toast.error('Failed to update count')
      }
    } else if (increment > 0) {
      const { error } = await supabase
        .from('selections')
        .insert({ selector_id: currentUser.id, selected_id: userId, count: 1 })
      if (error) {
        console.error('Error creating selection:', error)
        toast.error('Failed to update count')
      }
    }
  }

  return (
    <div className="space-y-6">
      <button
        onClick={chooseReviewer}
        className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
      >
        Choose a Reviewer
      </button>
      <div className="space-y-4">
        {users.map(user => {
          const count = selections.find(s => s.selected_id === user.id)?.count || 0
          return (
            <div key={user.id} className="flex items-center justify-between">
              <span>{user.name}: {count}</span>
              <div>
                <button
                  onClick={() => updateCount(user.id, -1)}
                  className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded mr-2"
                >
                  -
                </button>
                <button
                  onClick={() => updateCount(user.id, 1)}
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
