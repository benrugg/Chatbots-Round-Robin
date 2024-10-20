import { supabase } from "../lib/supabase"

export type User = {
  id: string
  name: string
}

export type Selection = {
  id: string
  selected_id: string
  count: number
}

export async function fetchUsers(currentUserId: string): Promise<User[]> {
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .neq("id", currentUserId)
    .eq("is_archived", false)
    .order("name", { ascending: true })

  if (error) {
    console.error("Error fetching users:", error)
    return []
  }
  return data || []
}

export async function fetchSelections(currentUserId: string): Promise<Selection[]> {
  const { data, error } = await supabase.from("selections").select("*").eq("selector_id", currentUserId)

  if (error) {
    console.error("Error fetching selections:", error)
    return []
  }
  return data || []
}

export function chooseReviewer(users: User[], selections: Selection[]): User | null {
  if (users.length === 0) return null

  // Group users by their selection count
  const userGroups = users.reduce((groups, user) => {
    const count = selections.find((s) => s.selected_id === user.id)?.count || 0
    if (!groups[count]) groups[count] = []
    groups[count].push(user)
    return groups
  }, {} as Record<number, User[]>)

  // Find the group with the lowest selection count
  const lowestCount = Math.min(...Object.keys(userGroups).map(Number))
  const candidateGroup = userGroups[lowestCount]

  // Randomly select a user from the candidate group
  const randomIndex = Math.floor(Math.random() * candidateGroup.length)
  return candidateGroup[randomIndex]
}

export async function updateSelection(currentUserId: string, selectedUserId: string, increment: number): Promise<boolean> {
  const { data: existingSelections } = await supabase
    .from("selections")
    .select("*")
    .eq("selector_id", currentUserId)
    .eq("selected_id", selectedUserId)

  const existingSelection = existingSelections?.[0]

  if (existingSelection) {
    const newCount = Math.max(0, existingSelection.count + increment)
    const { error } = await supabase.from("selections").update({ count: newCount }).eq("id", existingSelection.id)

    if (error) {
      console.error("Error updating selection:", error)
      return false
    }
  } else if (increment > 0) {
    const { error } = await supabase.from("selections").insert({ selector_id: currentUserId, selected_id: selectedUserId, count: 1 })

    if (error) {
      console.error("Error creating selection:", error)
      return false
    }
  }

  return true
}
