// MY ANNOUNCMENTS
// "use client"

// import { useQuery } from "@tanstack/react-query"
// import { getMyAnnouncements } from "@/lib/supabase/posts" // ✅ updated import
// import { useCurrentUser } from "@/hooks/use-current-user"
// import { Database } from "@/database.types"

// export type User = Database["public"]["Tables"]["users"]["Row"]
// export type Announcements = Database["public"]["Tables"]["announcements"]["Row"]
// export type AnnouncementWithRead = Announcements & { read: boolean; user?: User }

// export function MyAnnouncements() {
//   const { user } = useCurrentUser()
//   const user_id = user?.id

//   const {
//     data: announcements,
//     isLoading,
//     error,
//   } = useQuery<AnnouncementWithRead[]>({
//     queryKey: ["announcements-unread", user_id],
//     queryFn: () => getMyAnnouncements({ user_id }),
//     enabled: !!user_id,
//   })

//   if (isLoading) return <p>Loading...</p>
//   if (error) return <p>Error: {(error as Error).message}</p>

//   // ✅ Explicitly handle empty or missing data
//   if (!announcements) {
//     return <p>No unread announcements</p>
//   }

//   return (
//     <div>
//       <h1 className="text-lg font-semibold mb-2">My Announcements</h1>
//       <pre className="bg-muted p-4 rounded-md text-sm overflow-auto">
//         {announcements.length}
//         {JSON.stringify(announcements, null, 2)}
//       </pre>
//     </div>
//   )
// }



// UNREAD ANNOUNCEMENTS

// "use client"

// import { useQuery } from "@tanstack/react-query"
// import { UnreadAnnouncements } from "@/lib/supabase/posts" // ✅ updated import
// import { useCurrentUser } from "@/hooks/use-current-user"
// import { Database } from "@/database.types"

// export type User = Database["public"]["Tables"]["users"]["Row"]
// export type Announcements = Database["public"]["Tables"]["announcements"]["Row"]
// export type AnnouncementWithRead = Announcements & { read: boolean; user?: User }

// export function UnreadItems() {
//   const { user } = useCurrentUser()
//   const user_id = user?.id

//   const {
//     data: announcements,
//     isLoading,
//     error,
//   } = useQuery<AnnouncementWithRead[]>({
//     queryKey: ["announcements-unread", user_id],
//     queryFn: () => UnreadAnnouncements({ user_id }),
//     enabled: !!user_id,
//   })

//   if (isLoading) return <p>Loading...</p>
//   if (error) return <p>Error: {(error as Error).message}</p>

//   // ✅ Explicitly handle empty or missing data
//   if (!announcements || announcements.length === 0) {
//     return <p>No unread announcements</p>
//   }

//   return (
//     <div>
//       <h1 className="text-lg font-semibold mb-2">Unread Announcements</h1>
//       <pre className="bg-muted p-4 rounded-md text-sm overflow-auto">
//         {JSON.stringify(announcements, null, 2)}
//       </pre>
//     </div>
//   )
// }


// READ ANNOUNCEMENTS


"use client"

import { useQuery } from "@tanstack/react-query"
import { getUnreadAnnouncements } from "@/lib/supabase/posts"
import { useCurrentUser } from "@/hooks/use-current-user"
import { Database } from "@/database.types"

export type User = Database["public"]["Tables"]["users"]["Row"]
export type Announcements = Database["public"]["Tables"]["announcements"]["Row"]
export type AnnouncementReads = Database["public"]["Tables"]["announcement_reads"]["Row"]
export type AnnouncementWithRead = Announcements & { read: boolean; user?: User }

export function ReadAnnouncements() {
  const { user } = useCurrentUser()
  const user_id = user?.id

  const {
    data: announcements,
    isLoading,
    error,
  // } = useQuery<AnnouncementWithRead[]>({
  } = useQuery<(Announcements & { read: AnnouncementReads[]; user?: User })[]>({
    queryKey: ["announcements", user_id],
    queryFn: () => getUnreadAnnouncements({ user_id }),
    enabled: !!user_id,
  })

  if (isLoading) return <p>Loading...</p>
  if (error) return <p>Error: {(error as Error).message}</p>

  if (!announcements) {
    return <p>No unread announcements (read = false)</p>
  }

  return (
    <div>
      <h1 className="text-lg font-semibold mb-2">Unread (read = false)</h1>
      <pre className="bg-muted p-4 rounded-md text-sm overflow-auto">
        {announcements.length}
        {JSON.stringify(announcements, null, 2)}
      </pre>
    </div>
  )
}
