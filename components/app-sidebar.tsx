"use client"

import * as React from "react"
import {
  IconDashboard,
  IconChartBar,
  IconFolder,
  IconUsers,
  IconSettings,
  IconHelp,
  IconSearch,
  IconDatabase,
  IconReport,
  IconFileWord,
  IconActivity,
  IconNotes,
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
import { Database } from "@/database.types"
import { useRouter, usePathname } from "next/navigation"

type User = Database["public"]["Tables"]["users"]["Row"]

// interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
//   user: User
// }

export function AppSidebar({ 
  // user,
   ...props }
  //  : AppSidebarProps
  ) {
  const { open, toggleSidebar } = useSidebar()
  const { theme } = useTheme()
  const router = useRouter()
  const pathname = usePathname()

  const logoSrc = theme === "light" ? lightLogo : darkLogo



  const navMain = [
    { title: "Dashboard", url: "/protected", icon: IconDashboard },
    { title: "Activities", url: "/protected/announcements", icon: IconActivity },
    { title: "Rules", url: "/protected/rules", icon: IconNotes },
  ]
    navMain.push({ title: "Team", url: "/protected/team", icon: IconUsers })
  

  const navSecondary = [
    { title: "Theme", url: "/protected", icon: IconSettings },
    { title: "Get Help", url: "/protected", icon: IconHelp },
    { title: "Search", url: "/protected", icon: IconSearch },
  ]

  const documents = [
    { name: "Data Library", url: "/protected", icon: IconDatabase },
    { name: "Reports", url: "/protected", icon: IconReport },
    { name: "Word Assistant", url: "/protected", icon: IconFileWord },
  ]


  return (
    <Sidebar collapsible="icon" variant="inset" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <div className="flex items-center justify-start w-full">
                {open ? (
                  <>
                    <Image src={logoSrc} alt="Logo" height={70} width={70} />
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

      {/* Sidebar Content */}
      <SidebarContent>
        <NavMain
          items={navMain}
          showText={open}
          onItemClick={(url) => router.push(url)}
          activePath={pathname}
          // user={user}
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

      {/* Footer with user info */}
      <SidebarFooter>
        <NavUser 
        // user={user} 
        />
      </SidebarFooter>
    </Sidebar>
  )
}
