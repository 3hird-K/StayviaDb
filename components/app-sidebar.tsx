"use client"

import * as React from "react"
import {
  IconDashboard,
  IconActivity,
  IconNotes,
  IconUsers,
  IconSettings,
  IconHelp,
  IconSearch,
  IconDatabase,
  IconFileWord,
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
    { title: "Dashboard", url: "/protected", icon: IconDashboard },
    { title: "Manage Landlords", url: "/protected/landlords", icon: IconActivity },
    { title: "Manage Students", url: "/protected/students", icon: IconNotes },
    { title: "Manage Properties", url: "/protected/properties", icon: IconActivity },
    { title: "Rentai Requests", url: "/protected/rules", icon: IconNotes },
    { title: "Team", url: "/protected/team", icon: IconUsers },
  ]

  const navSecondary = [
    { title: "Settings", url: "/protected", icon: IconSettings },
    { title: "Get Help", url: "/protected", icon: IconHelp },
    { title: "Search", url: "/protected", icon: IconSearch },
  ]

  const documents = [
    { name: "Reviews & Feedbacks", url: "/protected", icon: IconDatabase },
    { name: "Word Assistant", url: "/protected", icon: IconFileWord },
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
