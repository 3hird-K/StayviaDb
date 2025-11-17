"use client"

import { IconCirclePlus, IconCirclePlusFilled, IconMail, type Icon } from "@tabler/icons-react"
import { Button } from "@/components/ui/button"
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { Database } from "@/database.types"
import { CreateAnnouncement } from "./create-announcement-dialog"

type User = Database["public"]["Tables"]["users"]["Row"]

export function NavMain({
  items,
  showText = true,
  onItemClick,
  activePath,
  // user
}: {
  items: {
    title: string
    url: string
    icon: Icon
  }[]
  showText?: boolean
  onItemClick?: (url: string) => void
  activePath?: string
  // user: User
}) {


  return (
    <SidebarGroup>
      <SidebarGroupContent className="flex flex-col gap-2">
        {/* Top Actions */}
        {/* <SidebarMenu>
          <SidebarMenuItem className="flex items-center gap-2">
              <SidebarMenuButton
                tooltip="Create Rule"
                className="bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground active:bg-primary/90 active:text-primary-foreground min-w-8 duration-200 ease-linear"
              >
                <IconCirclePlus />
                {showText && <span>Create Rule</span>}
              <Button
                size="icon"
                className="size-8 group-data-[collapsible=icon]:opacity-0"
                variant="outline"
              >
                <IconMail />
                <span className="sr-only">Inbox</span>
              </Button>
          </SidebarMenuItem>
        </SidebarMenu> */}

        

        {/* Nav Items */}
        <SidebarMenu>
          {items.map((item) => {
            const isActive = activePath === item.url
            return (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton
                  tooltip={item.title}
                  onClick={() => (onItemClick ? onItemClick(item.url) : null)}
                  className={isActive ? "bg-accent text-accent-foreground" : ""}
                >
                  <item.icon className="mr-2 h-5 w-5" />
                  {showText && <span>{item.title}</span>}
                </SidebarMenuButton>
              </SidebarMenuItem>
            )
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}

