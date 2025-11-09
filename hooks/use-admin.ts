import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

export async function getAdminUser() {
  const supabase = await createClient()

  // Get current session
  const { data, error } = await supabase.auth.getSession()
  if (error || !data?.session?.user) {
    redirect("/auth/login")
  }


  if (error || !data) {
    redirect("/auth/login")
  }

  const claims = data.session.user
  return { claims }
}
