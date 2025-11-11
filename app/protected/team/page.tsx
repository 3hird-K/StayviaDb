"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { IconEdit, IconTrash } from "@tabler/icons-react"
import { SiteHeader } from "@/components/site-header"
import { useQuery } from "@tanstack/react-query"
import { getAllAdmins } from "@/lib/supabase/userService"
import { Database } from "@/database.types"

// Type from your Supabase admins table
type User = Database["public"]["Tables"]["admins"]["Row"]

export default function TeamPage() {
  const [search, setSearch] = useState("")

  const { data, isLoading, error } = useQuery({
    queryKey: ["admins"],
    queryFn: () => getAllAdmins(),
  })

  // console.log(data)

  // Filter members based on search input
  const filteredTeam = (data || []).filter((member: User) =>
    `${member.firstname || ""} ${member.lastname || ""}`
      .toLowerCase()
      .includes(search.toLowerCase())
  )

  if (isLoading) return <p className="text-center py-8">Loading team members...</p>
  if (error) return <p className="text-center text-red-500 py-8">Failed to load team members.</p>

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
          // Generate avatar initials from first and last name
          const initials = `${member.firstname?.[0] || ""}${member.lastname?.[0] || ""}`.toUpperCase()

          return (
            <motion.div
              key={member.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="group hover:shadow-lg transition-all duration-300 border-border/50 rounded-2xl">
                <CardHeader className="flex flex-row items-center gap-4 pb-2">
                  <Avatar className="h-12 w-12">
                    <AvatarFallback>{initials}</AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-base font-semibold">
                      {member.firstname} {member.lastname}
                    </CardTitle>
                    <CardDescription className="text-sm text-muted-foreground">
                      {"Team Member"}
                    </CardDescription>
                  </div>
                </CardHeader>

                <CardContent className="flex flex-col gap-2">
                  <p className="text-sm text-muted-foreground">{member.email}</p>
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
    </div>
  )
}
