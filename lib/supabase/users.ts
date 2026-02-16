import { createClient } from "./client"
import { Database } from "@/database.types"

export type User = Database["public"]["Tables"]["users"]["Row"]
export type Course = {
  id: string
  name: string
}

export async function updateUser(
  userId: string,
  updates: Partial<User> & { course_id?: string }
): Promise<User | null> {
  const supabase = createClient()
  // Remove course_id since it doesn't exist in the users table
  const { course_id, ...validUpdates } = updates
  const { data, error } = await supabase
    .from("users")
    .update(validUpdates)
    .eq("id", userId)
    .select()
    .single()

  if (error) throw new Error(error.message)
  return data
}

export async function deleteUser(userId: string): Promise<void> {
  const supabase = createClient()
  const { error } = await supabase
    .from("users")
    .delete()
    .eq("id", userId)

  if (error) throw new Error(error.message)
}

// NOTE: No "courses" table in the current schema — stub implementation.
export async function getAllCourse(): Promise<Course[]> {
  return []
}

export async function getUserCourse(courseId: string): Promise<Course | null> {
  return null
}
