import { createClient } from "./client"
import { Database } from "@/database.types"

export type Request = Database["public"]["Tables"]["requests"]["Row"];

export type RequestWithDetails = Request & {
    users: Database["public"]["Tables"]["users"]["Row"] | null; 
    posts: (Database["public"]["Tables"]["posts"]["Row"] & { 
        users: Database["public"]["Tables"]["users"]["Row"] | null; 
    }) | null; 
};


// Get All Request where confirmed is true
export async function getAllRequest(): Promise<RequestWithDetails[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("requests")
    .select("*, users(*), posts(*, users(*))") 
    .eq("confirmed", true)
    .order("created_at", { ascending: false })

  if (error) throw new Error(error.message)
  return (data as RequestWithDetails[]) ?? []
}

export async function getAllRequestUnverified(): Promise<RequestWithDetails[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("requests")
    .select("*, users(*), posts(*, users(*))") 
    .eq("confirmed", false)
    .order("created_at", { ascending: false })

  if (error) throw new Error(error.message)
  return (data as RequestWithDetails[]) ?? []
}