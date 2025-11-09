"use client"

import { useQuery } from "@tanstack/react-query"
import { getAllCourse } from "@/lib/supabase/course"

export function CoursesList() {
  const { data: views, isLoading, error } = useQuery({
    queryKey: ["courses"],
    queryFn: getAllCourse,
  })

  if (isLoading) return <p>Loading...</p>
  if (error) return <p>Error: {(error as Error).message}</p>

  return (
    <div>
      <h1>Courses</h1>
      <pre>{JSON.stringify(views, null, 2)}</pre>
    </div>
  )
}
