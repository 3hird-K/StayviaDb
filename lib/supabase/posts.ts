import { createClient } from "./client"
import { Database } from "@/database.types"

export type Post = Database["public"]["Tables"]["posts"]["Row"]

export async function createAnnouncement(data: {
  user_id: string
  name: string
  description: string
}): Promise<Post> {
  const supabase = createClient()
  const { data: post, error } = await supabase
    .from("posts")
    .insert({
      user_id: data.user_id,
      title: data.name,
      description: data.description,
    })
    .select()
    .single()

  if (error) throw new Error(error.message)
  return post
}

export async function getUnreadAnnouncements(params: {
  user_id?: string
}): Promise<Post[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("posts")
    .select("*")
    .order("created_at", { ascending: false })

  if (error) throw new Error(error.message)
  return data ?? []
}
