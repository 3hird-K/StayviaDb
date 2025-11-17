"use client";

import Image from "next/image";
import { useQuery } from "@tanstack/react-query";
import { getAllFeedbacks } from "@/lib/supabase/feedbackService";

import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

export default function Feedbacks() {
  const { data, isLoading } = useQuery({
    queryKey: ["contact_support"],
    queryFn: getAllFeedbacks,
  });

  const avatarUrl =
    "https://ptwhyrlrfmpyhkwmljlu.supabase.co/storage/v1/object/public/user-profiles/";

  return (
    <div className="p-6 lg:p-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold">
          Users Feedbacks ({data?.length ?? 0})
        </h1>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="shadow-sm rounded-xl">
              <CardHeader className="flex flex-row gap-4 items-center">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="space-y-2 w-full">
                  <Skeleton className="h-4 w-2/3" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              </CardHeader>

              <CardContent className="space-y-3">
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-5/6" />
                <Skeleton className="h-3 w-2/3" />
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Feedback Cards */}
      {!isLoading && data && (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
          {data.map((fb) => (
            <Card
              key={fb.id}
              className="rounded-xl border bg-card/60 backdrop-blur-sm hover:shadow-lg transition"
            >
              <CardHeader className="flex flex-row gap-4 items-center">
                <Image
                  src={
                    fb.users?.avatar
                      ? `${avatarUrl}${fb.users.avatar}`
                      : "/default-avatar.png"
                  }
                  alt="User avatar"
                  width={48}
                  height={48}
                  className="rounded-full border object-cover"
                />

                <div>
                  <CardTitle className="text-lg">
                    {fb.users
                      ? `${fb.users.firstname ?? ""} ${
                          fb.users.lastname ?? ""
                        }`
                      : "Unknown User"}
                  </CardTitle>

                  <p className="text-sm text-muted-foreground">
                    {fb.email}
                  </p>
                </div>
              </CardHeader>

              <CardContent>
                <p className="text-sm text-muted-foreground line-clamp-3 mb-3">
                  {fb.message}
                </p>

                <Badge variant="outline" className="text-xs">
                  {new Date(fb.created_at).toLocaleDateString()}
                </Badge>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
