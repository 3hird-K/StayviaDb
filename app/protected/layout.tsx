import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { QueryProvider } from "@/provider/query-provider"
import ProtectedLayoutClient from "./protected-layout-client"

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()

  const { data: claimsData, error: claimsError } = await supabase.auth.getClaims()
  if (claimsError || !claimsData?.claims) redirect("/auth/login")

  return (
    <QueryProvider>
      <ProtectedLayoutClient>{children}</ProtectedLayoutClient>
    </QueryProvider>
  )
}
