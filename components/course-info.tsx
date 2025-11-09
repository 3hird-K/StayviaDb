"use client"

import { useQuery } from "@tanstack/react-query"
import { getUserCourse } from "@/lib/supabase/users"
import { Database } from "@/database.types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"

type User = Database["public"]["Tables"]["users"]["Row"]

export function CourseInfo({ user }: { user: User }) {
  const course_id = user.course_id

  const { data: courses, isLoading, error } = useQuery({
    queryKey: ["userCourse", course_id],
    queryFn: () => getUserCourse(course_id),
    enabled: !!course_id, // only run if course_id exists
  })

  // const course = courses?.[0] // get the first (and only) course

  if (isLoading) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Loading Course...</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Skeleton className="h-4 w-1/3" />
          <Skeleton className="h-4 w-2/3" />
          <Skeleton className="h-4 w-1/2" />
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Error</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-destructive mb-1">
            {(error as Error).message}
          </p>
        </CardContent>
      </Card>
    )
  }

  if (!courses) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>No Course Found</CardTitle>
        </CardHeader>
        <CardContent className="mt-[-1rem]">
          <p className="text-muted-foreground">This user is not enrolled in any course.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Course Info</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 mt-[-1rem]">
        <div>
          <Label className="text-muted-foreground mb-1">Course Name</Label>
          <p className="font-medium">{courses.name}</p>
        </div>
        <div>
          <Label className="text-muted-foreground mb-1">Course ID</Label>
          <p className="font-medium">{courses.id}</p>
        </div>
      </CardContent>
    </Card>
  )
}
