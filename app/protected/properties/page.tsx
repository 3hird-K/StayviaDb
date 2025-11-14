// app/protected/landlords/page.tsx
import Properties from "@/components/properties"
import { SiteHeader } from "@/components/site-header"

export default function UsersPage() {
  return <>
      <SiteHeader title="Manage Properties" subtitle="Dashboard" />
      <Properties />
  </>
}
