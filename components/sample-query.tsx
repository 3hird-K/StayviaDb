"use client"

import { useQuery } from "@tanstack/react-query"
// import { getMyAnnouncements } from "@/lib/supabase/posts" // ✅ updated import
import { useCurrentUser } from "@/hooks/use-current-user"
import { Database } from "@/database.types"
import { getAllLandlords, getUserByEmail, User } from "@/lib/supabase/userService"
import { getAllPosts } from "@/lib/supabase/postService"


export function Samples() {
  const { user } = useCurrentUser()

  const email = user?.email

  console.log("userId: ",email)
  // const {
  //   data,
  //   isLoading,
  //   error,
  // } = useQuery<User[]>({
  //   queryKey: ["admins"
  //       // , email
  //   ],
  //   queryFn: () => getAllUsers(),
  //   // enabled: !!email,
  // })

  const accountType = "landlord"

  const {data, isLoading, error} = useQuery({
    queryKey: ["userslandlord"],
    queryFn: () => getAllLandlords(accountType)
  })

  console.log(data)

  if (isLoading) return <p>Loading...</p>
  if (error) return <p>Error: {(error as Error).message}</p>

  // ✅ Explicitly handle empty or missing data
  if (!data) {
    return <p>No Users Found</p>
  }

  return (
    <div>
      <h1 className="text-lg font-semibold mb-2">My Announcements</h1>
      <pre className="bg-muted p-4 rounded-md text-sm overflow-auto">
        {data.length}
        {JSON.stringify(data, null, 2)}
      </pre>
    </div>
  )
}