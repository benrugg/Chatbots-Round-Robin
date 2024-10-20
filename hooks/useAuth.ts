import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"

type User = {
  id: string
  name: string
}

export function useAuth(shouldRedirect = true) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const storedUser = localStorage.getItem("currentUser")
    if (storedUser) {
      setUser(JSON.parse(storedUser))
    } else if (shouldRedirect) {
      router.push("/")
    }
    setLoading(false)
  }, [router, shouldRedirect])

  const signIn = (userData: User) => {
    localStorage.setItem("currentUser", JSON.stringify(userData))
    setUser(userData)
    router.push("/choose-reviewer")
  }

  const signOut = () => {
    localStorage.removeItem("currentUser")
    setUser(null)
    router.push("/")
  }

  return { user, loading, signIn, signOut }
}
