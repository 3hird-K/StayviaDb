"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Database } from "@/database.types"

type User = Database["public"]["Tables"]["users"]["Row"]

export function useCurrentUser() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const supabase = createClient()

    const fetchUser = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession()

        if (!session?.user) {
          setError("Not logged in")
          setLoading(false)
          return
        }

        const { data: userData, error: userError } = await supabase
          .from("admins")
          .select("*")
          .eq("user_id", session.user.id)
          .single()

        if (userError || !userData) {
          setError(userError?.message || "User not found")
        } else {
          setUser(userData)
        }
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchUser()
  }, [])

  // const isAdmin = user?.role === "Admin" || user?.role === "Admin/Instructor"
  // const isInstructor = user?.role === "Instructor"
  // const isStudent = user?.role === "Student"

  return { user, loading, error }
}
