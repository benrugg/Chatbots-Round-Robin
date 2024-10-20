import React from "react"

type User = {
  id: string
  name: string
}

type UserSelectorProps = {
  users: User[]
  onSelect: (user: User) => void
}

const UserSelector: React.FC<UserSelectorProps> = ({ users, onSelect }) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
      {users.map((user) => (
        <button key={user.id} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded" onClick={() => onSelect(user)}>
          {user.name}
        </button>
      ))}
    </div>
  )
}

export default UserSelector
