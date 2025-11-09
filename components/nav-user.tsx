"use client"

import {
  IconDotsVertical,
  IconLogout,
  IconUserCircle,
} from "@tabler/icons-react"

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { Database } from "@/database.types"
// import { getUserById } from "@/lib/supabase/users"
import { useQuery } from "@tanstack/react-query"
// import avatarUrl from "@/assets/icon.jpg"

type User = Database["public"]["Tables"]["users"]["Row"]

export function NavUser(
  // { user }: { user: User }
) {
  const router = useRouter()
  const { open, isMobile } = useSidebar()

  // const userId = user.id;
  // const { data: userDb, isLoading, isError } = useQuery({
  //   queryKey: ["users", userId],
  //   queryFn: () => getUserById(userId),
  //   enabled: !!userId,
  // })


  // console.log(userDb?.id)
  const logout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/auth/login")
  }

  // if (isLoading) {
  //   return <div className="p-2 text-sm text-muted-foreground">Loading...</div>
  // }

  // if (isError || !userDb) {
  //   return <div className="p-2 text-sm text-destructive">Failed to load user</div>
  // }

  const avatarUrl = "../assets/icon.jpg"
  // (userDb as any).avatar ||
   

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <Avatar className="h-8 w-8 rounded-lg grayscale">
                <AvatarImage src={
                  avatarUrl
                  }
                   alt={
                    // userDb.firstname ||
                     "User"} />
                <AvatarFallback className="rounded-sm text-sm">
                  {
                  // userDb.firstname?.charAt(0) ||
                   "U"}
                  {
                  // userDb.lastname?.charAt(0) || 
                  ""}
                </AvatarFallback>
              </Avatar>

              {open && (
                <div className="grid flex-1 text-left text-sm leading-tight ml-2">
                  <span className="truncate font-medium">
                    {/* {userDb.firstname} {userDb.lastname} */}
                  </span>
                  <span className="text-muted-foreground truncate text-xs">
                    {/* {userDb.role} */}
                  </span>
                </div>
              )}

              {open && <IconDotsVertical className="ml-auto size-4" />}
            </SidebarMenuButton>
          </DropdownMenuTrigger>

          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarImage src={avatarUrl} alt={
                    // userDb.firstname || 
                    "User"} />
                  <AvatarFallback className="rounded-lg">
                    {
                    // userDb.firstname?.charAt(0) ||
                     "U"}
                    {
                    // userDb.lastname?.charAt(0) || 
                    ""}
                  </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">
                    {/* {userDb.firstname} {userDb.lastname} */}
                  </span>
                  <span className="text-muted-foreground truncate text-xs">
                    {/* {userDb.email} */}
                  </span>
                </div>
              </div>
            </DropdownMenuLabel>

            <DropdownMenuSeparator />

            <DropdownMenuGroup>
              <DropdownMenuItem>
                <IconUserCircle />
                Account
              </DropdownMenuItem>
            </DropdownMenuGroup>

            <DropdownMenuSeparator />

            <DropdownMenuItem onClick={logout}>
              <IconLogout />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
