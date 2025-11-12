// app/protected/landlords/page.tsx
import { SiteHeader } from "@/components/site-header"
import UsersTableClient from "@/components/users-table-client"

export default function UsersPage() {
  return <>
      {/* <SiteHeader title="Manage Landlord" subtitle="Dashboard" /> */}
      <UsersTableClient />
  </>
}
