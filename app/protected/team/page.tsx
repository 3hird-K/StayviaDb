"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import Image from "next/image"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { IconEdit } from "@tabler/icons-react"
import { SiteHeader } from "@/components/site-header"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { getAllAdmins, updateAdminProfile } from "@/lib/supabase/userService"
import { Database } from "@/database.types"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"

// Type from your Supabase admins table
type User = Database["public"]["Tables"]["admins"]["Row"]

export default function TeamPage() {
  const [search, setSearch] = useState("")
  const [editingUser, setEditingUser] = useState<User | null>(null)

  const queryClient = useQueryClient()

  const { data, isLoading, error } = useQuery({
    queryKey: ["admins"],
    queryFn: () => getAllAdmins(),
  })

  // Mutation to update user
  const updateMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<User> }) =>
      updateAdminProfile(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: ["admins"]})
      setEditingUser(null) // close modal
    },
  })

  // Filter members based on search input
  const filteredTeam = (data || []).filter((member: User) =>
    `${member.firstname || ""} ${member.lastname || ""}`
      .toLowerCase()
      .includes(search.toLowerCase())
  )

  if (isLoading) {
    return (
      <div className="space-y-8">
        <SiteHeader
          title="Team Members"
          subtitle="Manage your organization’s collaborators and roles."
        />

        <div className="max-w-sm">
          <Skeleton className="h-10 w-full" />
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card
              key={i}
              className="border-border/50 rounded-2xl overflow-hidden p-4 flex flex-col items-center"
            >
              <Skeleton className="h-24 w-24 rounded-full mb-3" />
              <Skeleton className="h-4 w-32 mb-2" />
              <Skeleton className="h-3 w-24 mb-4" />
              <Skeleton className="h-8 w-28 rounded-md" />
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (error)
    return (
      <p className="text-center text-red-500 py-8">
        Failed to load team members.
      </p>
    )

  return (
    <div className="space-y-8">
      <SiteHeader
        title="Team Members"
        subtitle="Manage your organization’s collaborators and roles."
      />

      {/* Search */}
      <div className="max-w-sm">
        <Input
          placeholder="Search members..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Team Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filteredTeam.map((member: User) => {
          const fullName = `${member.firstname ?? ""} ${member.lastname ?? ""}`
          const avatarUrl = member.avatar
            ? `${member.avatar}`
            : "/defaults/default-avatar.png" // fallback

          return (
            <motion.div
              key={member.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="group hover:shadow-lg hover:scale-[1.02] transition-all duration-300 border-border/50 rounded-2xl overflow-hidden">
                <CardHeader className="flex flex-col items-center pb-2">
                  <div className="w-24 h-24 relative rounded-full overflow-hidden mb-3 shadow-md">
                    <Image
                      src={avatarUrl}
                      alt={fullName}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="text-center">
                    <CardTitle className="text-base font-semibold">
                      {fullName}
                    </CardTitle>
                    <CardDescription className="text-sm text-muted-foreground">
                      {member.role || "Team Member"}
                    </CardDescription>
                  </div>
                </CardHeader>

                <CardContent className="text-center space-y-2">
                  <p className="text-sm text-muted-foreground">
                    {member.email || "No email provided"}
                  </p>

                  {/* Edit Profile button only */}
                  <div className="flex justify-center pt-3 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="outline"
                      className="flex items-center gap-2 text-sm"
                      onClick={() => setEditingUser(member)}
                    >
                      <IconEdit className="h-4 w-4" />
                      Edit Profile
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )
        })}
      </div>

      {filteredTeam.length === 0 && (
        <p className="text-center text-muted-foreground py-8">
          No team members found.
        </p>
      )}

      {/* Edit Profile Modal */}
      {/* Edit Profile Modal */}
{editingUser && (
  <Dialog open={!!editingUser} onOpenChange={() => setEditingUser(null)}>
    <DialogContent className="sm:max-w-lg">
      <DialogHeader>
        <DialogTitle>Edit Profile</DialogTitle>
      </DialogHeader>

      <div className="space-y-4 mt-2">
        {/* First + Last Name side by side with labels */}
        <div className="flex gap-2">
          <div className="flex-1 flex flex-col">
            <label className="text-sm font-medium mb-1">First Name</label>
            <Input
              placeholder="First Name"
              value={editingUser.firstname || ""}
              onChange={(e) =>
                setEditingUser({ ...editingUser, firstname: e.target.value })
              }
            />
          </div>

          <div className="flex-1 flex flex-col">
            <label className="text-sm font-medium mb-1">Last Name</label>
            <Input
              placeholder="Last Name"
              value={editingUser.lastname || ""}
              onChange={(e) =>
                setEditingUser({ ...editingUser, lastname: e.target.value })
              }
            />
          </div>
        </div>

        {/* Role with label */}
        <div className="flex flex-col">
          <label className="text-sm font-medium mb-1">Contribution</label>
          <Input
            placeholder="Role"
            value={editingUser.role || ""}
            onChange={(e) =>
              setEditingUser({ ...editingUser, role: e.target.value })
            }
          />
        </div>
      </div>

      <DialogFooter>
        <Button
          onClick={() =>
            editingUser &&
            updateMutation.mutate({
              id: editingUser.id,
              updates: {
                firstname: editingUser.firstname,
                lastname: editingUser.lastname,
                role: editingUser.role, // email removed
              },
            })
          }
          disabled={updateMutation.status === "pending"} // disable while saving
        >
          {updateMutation.status === "pending" ? "Saving..." : "Save Changes"}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
)}

    </div>
  )
}
