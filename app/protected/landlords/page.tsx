// app/protected/landlords/page.tsx
import { SiteHeader } from "@/components/site-header"
import UsersTableLandlord from "@/components/users-table-landlord"

export default function LandlordsPage() {
  return <>
      <SiteHeader title="Manage Landlord" subtitle="Dashboard" />
      <UsersTableLandlord />
  </>
}
