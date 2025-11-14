"use client"

import * as React from "react"
import {
  IconDashboard,
  IconActivity, // Retaining original imports, but selecting new ones below
  IconNotes,
  IconUsers,
  IconSettings,
  IconHelp,
  IconSearch,
  IconDatabase,
  IconFileWord,
    // 🎯 NEW/BETTER ICONS FOR CONTEXT:
    IconHome2, // For Dashboard
    IconBuildingLighthouse, // For Landlords (representing property/owner management)
    IconSchool, // For Students
    IconBuilding, // For Properties
    IconCalendar, // For Requests/Rules
    IconUsersGroup, // For Team
    IconMessageCircle,
    IconLogicNot,
    IconBan, // For Reviews/Feedback
} from "@tabler/icons-react"

import { NavDocuments } from "@/components/nav-documents"
import { NavMain } from "@/components/nav-main"
import { NavSecondary } from "@/components/nav-secondary"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar"

import darkLogo from "@/assets/icon.png"
import lightLogo from "@/assets/icon.png"
import Image from "next/image"
import { useTheme } from "next-themes"
import { useRouter, usePathname } from "next/navigation"
import { User } from "@/lib/supabase/userService"


interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  user: User | null
}

export function AppSidebar({ user, ...props }: AppSidebarProps) {
  const { open, toggleSidebar } = useSidebar()
  const { theme } = useTheme()
  const router = useRouter()
  const pathname = usePathname()

  const logoSrc = theme === "light" ? lightLogo : darkLogo

  const navMain = [
    { title: "Dashboard", url: "/protected", icon: IconHome2 },
    { title: "Manage Landlords", url: "/protected/landlords", icon: IconBuildingLighthouse }, 
    { title: "Manage Students", url: "/protected/students", icon: IconSchool }, 
    { title: "Manage Properties", url: "/protected/properties", icon: IconBuilding }, 
    { title: "Account Suspension", url: "/protected/accounts", icon: IconBan }, 
    { title: "Team", url: "/protected/team", icon: IconUsersGroup },
  ]

  
  const navSecondary = [
    { title: "Settings", url: "/protected", icon: IconSettings },
    { title: "Get Help", url: "/protected", icon: IconHelp }, 
    { title: "Search", url: "/protected", icon: IconSearch }, 
  ]

  // 🎯 UPDATED: Documents/Reviews Icons
  const documents = [
    { name: "Reviews & Feedbacks", url: "/protected", icon: IconMessageCircle }, // Message/Chat Icon for feedback
    { name: "Word Assistant", url: "/protected", icon: IconFileWord }, // Document/Word Icon (Appropriate)
  ]

  return (
    <Sidebar collapsible="icon" variant="inset" {...props}>
      {/* Header */}
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <div className="flex items-center justify-start w-full">
                {open ? (
                  <>
                    <Image
                      src={logoSrc}
                      alt="Logo"
                      height={70}
                      width={70}
                      onClick={() => router.push("/")}
                    />
                    <SidebarTrigger
                      onClick={toggleSidebar}
                      className="text-5xl ml-auto mr-[-0.5rem]"
                    />
                  </>
                ) : (
                  <SidebarTrigger
                    onClick={toggleSidebar}
                    className="text-5xl ml-[-0.5rem]"
                  />
                )}
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      {/* Content */}
      <SidebarContent>
        <NavMain
          items={navMain}
          showText={open}
          onItemClick={(url) => router.push(url)}
          activePath={pathname}
        />
        <NavDocuments
          items={documents}
          showText={open}
          onItemClick={(url) => router.push(url)}
          activePath={pathname}
        />
        <NavSecondary
          items={navSecondary}
          showText={open}
          onItemClick={(url) => router.push(url)}
          activePath={pathname}
          className="mt-auto"
        />
      </SidebarContent>

      {/* Footer (User info) */}
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
    </Sidebar>
  )
}