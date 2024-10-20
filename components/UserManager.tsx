import React, { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import toast from 'react-hot-toast'

type User = {
  id: string
  name: string
  is_archived: boolean
}

const UserManager: React.FC = () => {
  const [users, setUsers] = useState<User[]>([])
  const [newUserName, setNewUserName] = useState('')

  useEffect(() => {
    fetchUsers()
    const usersSubscription = supabase
      .channel('users_channel')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'users' }, fetchUsers)
      .subscribe()

    return () => {
      supabase.removeChannel(usersSubscription)
    }
  }, [])

  const fetchUsers = async () => {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('is_archived', { ascending: true })
      .order('name', { ascending: true })
    if (error) console.error('Error fetching users:', error)
    else setUsers(data || [])
  }

  const addUser = async () => {
    if (!newUserName.trim()) {
      toast.error('Please enter a name')
      return
    }
    const { error } = await supabase
      .from('users')
      .insert({ name: newUserName.trim(), is_archived: false })
    if (error) {
      console.error('Error adding user:', error)
      toast.error('Failed to add user')
    } else {
      setNewUserName('')
      toast.success('User added successfully')
    }
  }

  const updateUser = async (id: string, name: string) => {
    const { error } = await supabase
      .from('users')
      .update({ name })
      .eq('id', id)
    if (error) {
      console.error('Error updating user:', error)
      toast.error('Failed to update user')
    } else {
      toast.success('User updated successfully')
    }
  }

  const toggleArchiveUser = async (id: string, currentStatus: boolean) => {
    const { error } = await supabase
      .from('users')
      .update({ is_archived: !currentStatus })
      .eq('id', id)
    if (error) {
      console.error('Error toggling user archive status:', error)
      toast.error('Failed to update user status')
    } else {
      toast.success(`User ${currentStatus ? 'unarchived' : 'archived'} successfully`)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex space-x-2">
        <input
          type="text"
          value={newUserName}
          onChange={(e) => setNewUserName(e.target.value)}
          placeholder="New user name"
          className="border rounded px-2 py-1 flex-grow"
        />
        <button
          onClick={addUser}
          className="bg-green-500 hover:bg-green-700 text-white font-bold py-1 px-2 rounded"
        >
          Add User
        </button>
      </div>
      <div className="space-y-4">
        {users.map(user => (
          <div key={user.id} className="flex items-center justify-between">
            <input
              type="text"
              value={user.name}
              onChange={(e) => updateUser(user.id, e.target.value)}
              className={`border rounded px-2 py-1 ${user.is_archived ? 'text-gray-500' : ''}`}
            />
            <button
              onClick={() => toggleArchiveUser(user.id, user.is_archived)}
              className={`${user.is_archived ? 'bg-blue-500 hover:bg-blue-700' : 'bg-red-500 hover:bg-red-700'} text-white font-bold py-1 px-2 rounded ml-2`}
            >
              {user.is_archived ? 'Unarchive' : 'Archive'}
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

export default UserManager
