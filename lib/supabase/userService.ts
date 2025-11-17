import { createClient } from "./client"
import { Database } from "@/database.types"
import { addDays, addMonths } from "date-fns";

export type User = Database["public"]["Tables"]["admins"]["Row"];
export type Landlords = Database["public"]["Tables"]["users"]["Row"]
export type Students = Database["public"]["Tables"]["users"]["Row"]


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
export async function getAllLandlords(accountType: string): Promise<Landlords[]> {
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
export async function getAllStudent(): Promise<Students[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .not("student_id", "is", null) 

  if (error) throw new Error(error.message)
  return data as Students[] ?? []
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

// Update Landlord Status
export async function updateLandlordStatus(userId: string): Promise<void> {
    const supabase = createClient();
    const { error } = await supabase
        .from("users") // Assuming 'users' is the correct table
        .update({ account_type: "landlord" })
        .eq("id", userId);

    if (error) {
        throw new Error(`Failed to verify landlord: ${error.message}`);
    }
}

export async function rejectLandlordProof(userId: string, message: string): Promise<void> {
    const supabase = createClient();
    
    const { error: insertError } = await supabase
        .from("verify_account")
        .insert({
            user_id: userId,
            reject_msg: message,
        });

    if (insertError) {
        throw new Error(`Failed to record rejection: ${insertError.message}`);
    }
  }

export async function sendMessageToUser(userId: string, message: string): Promise<void> {
    const supabase = createClient();
    
    const { error: insertError } = await supabase
        .from("verify_account")
        .insert({
            user_id: userId,
            reject_msg: message,
        });

    if (insertError) {
        throw new Error(`Failed to record rejection: ${insertError.message}`);
    }
  }


  // ACCOUNT SUSPENSION FUNCTION
  export async function suspendUser(userId: string, duration: string): Promise<void> {
    const supabase = createClient();
    let suspensionEndTime: string | null = null;
    const now = new Date();

    switch (duration) {
        case '3d':
            suspensionEndTime = addDays(now, 3).toISOString();
            break;
        case '7d':
            suspensionEndTime = addDays(now, 7).toISOString();
            break;
        case '1m':
            suspensionEndTime = addMonths(now, 1).toISOString();
            break;
        case 'forever':
            // Use a very distant future date or a specific key/value defined in your schema 
            // to represent permanent suspension. Here, we use a very distant date.
            suspensionEndTime = addMonths(now, 1200).toISOString(); // 100 years
            break;
        default:
            throw new Error("Invalid suspension duration.");
    }

    const { error } = await supabase
        .from("users") 
        // Assuming your 'users' table has a 'suspended' column of type timestamp/timestamptz
        .update({ suspended: suspensionEndTime })
        .eq("id", userId); 

    if (error) {
        throw new Error(`Failed to suspend user: ${error.message}`);
    }
}