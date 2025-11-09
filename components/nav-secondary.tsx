"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { type Icon } from "@tabler/icons-react"

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

export function NavSecondary({
  items,
  showText = true,
  onItemClick,
  activePath,
  ...props
}: {
  items: { title: string; url: string; icon: Icon }[]
  showText?: boolean
  onItemClick?: (url: string) => void
  activePath?: string
} & React.ComponentPropsWithoutRef<typeof SidebarGroup>) {
  return (
    <SidebarGroup {...props}>
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton
                onClick={() => onItemClick?.(item.url)}
                className={`flex items-center gap-2 ${
                  activePath === item.url ? "bg-accent text-accent-foreground" : ""
                }`}
              >
                <item.icon />
                {showText && <span>{item.title}</span>}
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}

