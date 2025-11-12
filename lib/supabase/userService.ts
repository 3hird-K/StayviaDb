import { createClient } from "./client"
import { Database } from "@/database.types"

export type User = Database["public"]["Tables"]["admins"]["Row"];
export type Landlords = Database["public"]["Tables"]["users"]["Row"]


//  Get User by ID
export async function getUserByEmail(email: string): Promise<User | null> {
  const supabase = createClient()
  const { data, error } = await supabase
  .from("admins")
  .select("*")
  .eq("email", email)
  .maybeSingle()
  
  if (error) throw new Error(error.message)
  return data ?? null
}


// Get All User Landlords
export async function getAllLandlords(accountType: string): Promise<User[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("account_type", accountType)

    if (error) throw new Error(error.message)
      return data ?? []
  }


export async function getAllLandlordsWithUnverified(): Promise<Landlords[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .in("account_type", ["landlord", "landlord_unverified"])
    
    if (error) throw new Error(error.message)
      return data as Landlords[] ?? []
  }

// Get All Students where student_id is not null
export async function getAllStudent(): Promise<User[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .not("student_id", "is", null) 

  if (error) throw new Error(error.message)
  return data ?? []
}



// Get All Users
export async function getAllAdmins(): Promise<User[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("admins")
    .select("*")
    .order("created_at", { ascending: false })

    if (error) throw new Error(error.message)
      return data ?? []
  }


  // Update Admin Profile
export async function updateAdminProfile(id: string, updates: Partial<User>): Promise<User | null> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("admins")
    .update(updates)
    .eq("id", id)
    .select()
    .single()

  if (error) throw new Error(error.message)
  return data
}

