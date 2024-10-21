import React, { useState, useEffect, KeyboardEvent } from "react"
import { twMerge } from "tailwind-merge"
import { supabase } from "../lib/supabase"
import toast from "react-hot-toast"

type TeamMember = {
  id: string
  name: string
  is_archived: boolean
}

const UserManager: React.FC = () => {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([])
  const [newMemberName, setNewMemberName] = useState("")

  useEffect(() => {
    fetchTeamMembers()
    const teamMembersSubscription = supabase
      .channel("team_members_channel")
      .on("postgres_changes", { event: "*", schema: "public", table: "users" }, fetchTeamMembers)
      .subscribe()

    return () => {
      supabase.removeChannel(teamMembersSubscription)
    }
  }, [])

  const fetchTeamMembers = async () => {
    const { data, error } = await supabase.from("users").select("*").order("is_archived", { ascending: true }).order("name", { ascending: true })
    if (error) console.error("Error fetching team members:", error)
    else setTeamMembers(data || [])
  }

  const addTeamMember = async () => {
    if (!newMemberName.trim()) {
      toast.error("Please enter a name")
      return
    }
    const { error } = await supabase.from("users").insert({ name: newMemberName.trim(), is_archived: false })
    if (error) {
      console.error("Error adding team member:", error)
      toast.error("Failed to add team member")
    } else {
      setNewMemberName("")
      toast.success("Team member added successfully")
    }
  }

  const updateTeamMember = async (id: string, name: string) => {
    const { error } = await supabase.from("users").update({ name }).eq("id", id)
    if (error) {
      console.error("Error updating team member:", error)
      toast.error("Failed to update team member")
    } else {
      toast.success("Team member updated successfully")
    }
  }

  const toggleArchiveTeamMember = async (id: string, currentStatus: boolean) => {
    const { error } = await supabase.from("users").update({ is_archived: !currentStatus }).eq("id", id)
    if (error) {
      console.error("Error toggling team member archive status:", error)
      toast.error("Failed to update team member status")
    } else {
      toast.success(`Team member ${currentStatus ? "unarchived" : "archived"} successfully`)
    }
  }

  const handleKeyPress = (event: KeyboardEvent<HTMLInputElement>, action: () => void) => {
    if (event.key === "Enter") {
      action()
    }
  }

  const activeMembers = teamMembers.filter((member) => !member.is_archived)
  const archivedMembers = teamMembers.filter((member) => member.is_archived)

  return (
    <div className="space-y-6">
      <div className="flex space-x-2">
        <input
          type="text"
          value={newMemberName}
          onChange={(e) => setNewMemberName(e.target.value)}
          onKeyPress={(e) => handleKeyPress(e, addTeamMember)}
          placeholder="New team member name"
          className="border rounded px-2 py-1 flex-grow dark:bg-gray-700 dark:border-gray-600 dark:text-white"
        />
        <button
          onClick={addTeamMember}
          className="bg-green-500 hover:bg-green-700 dark:bg-green-600 dark:hover:bg-green-800 text-white font-bold py-1 px-2 rounded"
        >
          Add Team Member
        </button>
      </div>
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Active Team Members</h2>
        {activeMembers.map((member) => (
          <div key={member.id} className="flex items-center justify-between">
            <input
              type="text"
              defaultValue={member.name}
              onBlur={(e) => updateTeamMember(member.id, e.target.value)}
              onKeyPress={(e) => handleKeyPress(e, () => updateTeamMember(member.id, (e.target as HTMLInputElement).value))}
              className="border rounded px-2 py-1 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
            <button
              onClick={() => toggleArchiveTeamMember(member.id, member.is_archived)}
              className="bg-red-500 hover:bg-red-700 dark:bg-red-600 dark:hover:bg-red-800 text-white font-bold py-1 px-2 rounded ml-2"
            >
              Archive
            </button>
          </div>
        ))}
      </div>
      {archivedMembers.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-gray-600 dark:text-gray-400">Archived Team Members</h2>
          {archivedMembers.map((member) => (
            <div key={member.id} className="flex items-center justify-between opacity-60">
              <input
                type="text"
                value={member.name}
                className="border rounded px-2 py-1 bg-gray-100 dark:bg-gray-600 dark:border-gray-500 dark:text-gray-300"
                readOnly
              />
              <button
                onClick={() => toggleArchiveTeamMember(member.id, member.is_archived)}
                className="bg-blue-500 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-800 text-white font-bold py-1 px-2 rounded ml-2"
              >
                Unarchive
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default UserManager
