// app/protected/landlords/page.tsx
import { SiteHeader } from "@/components/site-header"
import UsersTableStudents from "@/components/users-table-students"

export default function UsersPage() {
  return <>
      <SiteHeader title="Manage Accounts" subtitle="Dashboard" />
      <UsersTableStudents />
  </>
}
