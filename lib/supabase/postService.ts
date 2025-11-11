import { createClient } from "./client"
import { Database } from "@/database.types"

export type Posts = Database["public"]["Tables"]["users"]["Row"];


// Get All Users
export async function getAllPosts(): Promise<Posts[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("posts")
    .select("*")
    .order("created_at", { ascending: false })

  if (error) throw new Error(error.message)
  return data ?? []
}
