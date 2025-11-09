"use client"

import { useQuery } from "@tanstack/react-query"
import { getAllDeparments } from "@/lib/supabase/departments"

export function DepartmentList() {
  const { data: views, isLoading, error } = useQuery({
    queryKey: ["departments"],
    queryFn: getAllDeparments,
  })

  if (isLoading) return <p>Loading...</p>
  if (error) return <p>Error: {(error as Error).message}</p>

  return (
    <div>
      <h1>Departments</h1>
      <pre>{JSON.stringify(views, null, 2)}</pre>
    </div>
  )
}
