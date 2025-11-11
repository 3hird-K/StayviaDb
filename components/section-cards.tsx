"use client"

import {
  IconTrendingDown,
  IconTrendingUp,
  IconUserCheck,
  IconHome,
  IconClock,
  IconUser,
} from "@tabler/icons-react"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { useQuery } from "@tanstack/react-query"
import { getAllPosts } from "@/lib/supabase/postService"
import { getAllLandlords, getAllStudent } from "@/lib/supabase/userService"
import { format, subDays, isAfter } from "date-fns"
import { cn } from "@/lib/utils"

export function SectionCards() {
  const today = new Date()
  const weekAgo = subDays(today, 7)
  const monthAgo = subDays(today, 30)

  // 🏠 Posts
  const { data: posts, isLoading: postsLoading, error: postsError } = useQuery({
    queryKey: ["posts"],
    queryFn: () => getAllPosts(),
  })

  // 👤 Landlords
  const { data: landlords, isLoading: landlordsLoading, error: landlordsError } =
    useQuery({
      queryKey: ["users", "landlords"],
      queryFn: () => getAllLandlords("landlord"),
    })

  // 🎓 Students
  const { data: students, isLoading: studentsLoading, error: studentsError } =
    useQuery({
      queryKey: ["users", "students"],
      queryFn: () => getAllStudent(),
    })

  // ⏳ Pending Landlords
  const {
    data: pendingLandlords,
    isLoading: pendingLoading,
    error: pendingError,
  } = useQuery({
    queryKey: ["users", "pendingLandlords"],
    queryFn: () => getAllLandlords("landlord_unverified"),
  })

  const loading =
    postsLoading || landlordsLoading || studentsLoading || pendingLoading

  if (loading)
    return (
      <div className="grid gap-6 px-4 sm:px-6 md:px-8 lg:px-10 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <Card
            key={i}
            className="relative overflow-hidden border border-border/60 bg-gradient-to-b from-background to-muted/30 shadow-sm p-4"
          >
            <CardHeader className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <Skeleton className="h-4 w-32" />
              </div>
              <Skeleton className="h-8 w-20 mt-2" />
              <Skeleton className="h-5 w-28 mt-3 rounded-md" />
            </CardHeader>
            <CardFooter className="flex flex-col items-start gap-2 mt-2">
              <Skeleton className="h-4 w-36" />
              <Skeleton className="h-4 w-28" />
            </CardFooter>
          </Card>
        ))}
      </div>
    )

  if (postsError || landlordsError || studentsError || pendingError)
    return (
      <p className="text-center text-red-500 py-4">
        Failed to load data:{" "}
        {(postsError as Error)?.message ||
          (landlordsError as Error)?.message ||
          (studentsError as Error)?.message ||
          (pendingError as Error)?.message}
      </p>
    )

  // --- Compute Stats ---
  const totalProps = posts?.length || 0
  const addedThisWeek = posts?.filter(
    (p) => p.created_at && isAfter(new Date(p.created_at), weekAgo)
  ).length || 0

  const totalLandlords = landlords?.length || 0
  const newLandlords = landlords?.filter(
    (l) => l.created_at && isAfter(new Date(l.created_at), weekAgo)
  ).length || 0

  const totalPendingLandlords = pendingLandlords?.length || 0
  const newPendingLandlords = pendingLandlords?.filter(
    (p) => p.created_at && isAfter(new Date(p.created_at), weekAgo)
  ).length || 0

  const totalStudents = students?.length || 0
  const newStudents = students?.filter(
    (s) => s.created_at && isAfter(new Date(s.created_at), monthAgo)
  ).length || 0

  return (
    <div className="grid gap-6 px-4 sm:px-6 md:px-8 lg:px-10 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      <StatsCard
        title="Total Properties"
        icon={<IconHome className="size-5 text-primary" />}
        total={totalProps}
        trendCount={addedThisWeek}
        trendUp={addedThisWeek >= 0}
        updated={today}
        period="week"
      />

      <StatsCard
        title="Pending Verifications"
        icon={<IconClock className="size-5 text-yellow-500" />}
        total={totalPendingLandlords}
        trendCount={newPendingLandlords}
        trendUp={newPendingLandlords >= 0}
        updated={today}
        period="week"
      />

      <StatsCard
        title="Verified Landlords"
        icon={<IconUserCheck className="size-5 text-blue-500" />}
        total={totalLandlords}
        trendCount={newLandlords}
        trendUp={newLandlords >= 0}
        updated={today}
        period="week"
      />

      <StatsCard
        title="Registered Students"
        icon={<IconUser className="size-5 text-green-500" />}
        total={totalStudents}
        trendCount={newStudents}
        trendUp={newStudents >= 0}
        updated={today}
        period="month"
      />
    </div>
  )
}

function StatsCard({
  title,
  total,
  trendCount,
  trendUp,
  updated,
  icon,
  period = "week",
}: {
  title: string
  total: number
  trendCount: number
  trendUp: boolean
  updated: Date
  icon: React.ReactNode
  period?: "week" | "month"
}) {
  return (
    <Card className="group relative overflow-hidden border border-border/60 bg-gradient-to-b from-background to-muted/30 shadow-sm transition-all duration-300 hover:shadow-md hover:border-primary/40">
      <div className="absolute inset-0 opacity-0 group-hover:opacity-10 bg-gradient-to-r from-primary via-primary/50 to-primary blur-2xl transition-opacity duration-700" />

      <CardHeader className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between">
          <CardDescription className="text-muted-foreground text-sm flex items-center gap-2">
            {icon}
            {title}
          </CardDescription>
        </div>

        <CardTitle className="text-3xl font-semibold">{total.toLocaleString()}</CardTitle>

        <Badge
          variant="outline"
          className={cn(
            "mt-2 w-fit flex items-center gap-1.5 border-transparent text-xs px-2 py-1.5 transition-colors",
            trendUp
              ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300"
              : "bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300"
          )}
        >
          {trendUp ? <IconTrendingUp className="size-4" /> : <IconTrendingDown className="size-4" />}
          +{trendCount} this {period}
        </Badge>
      </CardHeader>

      <CardFooter className="flex flex-col items-start gap-1 text-sm mt-1">
        <div
          className={cn(
            "flex items-center gap-2 font-medium",
            trendUp ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"
          )}
        >
          {trendUp ? `Growth this ${period}` : `Decrease this ${period}`}
          {trendUp ? <IconTrendingUp className="size-4" /> : <IconTrendingDown className="size-4" />}
        </div>
        <div className="text-muted-foreground">Updated {format(updated, "MMM d, yyyy")}</div>
      </CardFooter>
    </Card>
  )
}
