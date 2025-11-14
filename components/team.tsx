"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import Image from "next/image";
import { useQuery } from "@tanstack/react-query";
import { getAllAdmins } from "@/lib/supabase/userService";

type Admin = {
  avatar: string | null;
  created_at: string;
  email: string | null;
  firstname: string | null;
  id: string;
  lastname: string | null;
  role: string | null;
  user_id: string | null;
};

export function TeamCarousel() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["admins"],
    queryFn: () => getAllAdmins(),
  });

  if (isLoading) return <p>Loading team...</p>;
  if (error) return <p>Failed to load team.</p>;

  return (
    <div className="w-full max-w-6xl mx-auto relative">
      <h2 className="text-3xl font-bold mb-6 text-center">Meet Our Team</h2>

      <div className="relative overflow-hidden">
        <Carousel className="w-full relative">
          <CarouselContent className="-ml-1 flex gap-2">
            {data?.map((member: Admin) => {
              const fullName = `${member.firstname ?? ""} ${member.lastname ?? ""}`;
              // Build public URL for Supabase avatar if exists
              const avatarUrl = member.avatar
                ? `${member.avatar}`
                : "/defaults/default-avatar.png"; // fallback

              return (
                <CarouselItem key={member.id} className="pl-1 md:basis-1/2 lg:basis-1/3">
                  <div className="p-2">
                    <Card className="hover:scale-105 transition-transform duration-300">
                      <CardContent className="flex flex-col items-center p-4">
                        <div className="w-32 h-32 relative rounded-full overflow-hidden mb-4 shadow-lg">
                          <Image
                            src={avatarUrl}
                            alt={fullName}
                            fill
                            className="object-cover"
                          /> 
                        </div>
                        <CardHeader className="text-center p-0">
                          <CardTitle className="text-lg">{fullName}</CardTitle>
                          <CardDescription className="text-sm text-muted-foreground">
                            {member.role}
                          </CardDescription>
                        </CardHeader>
                      </CardContent>
                    </Card>
                  </div>
                </CarouselItem>
              );
            })}
          </CarouselContent>

          <CarouselPrevious className="absolute left-0 top-1/2 -translate-y-1/2 bg-white dark:bg-gray-800 rounded-full p-2 shadow hover:bg-gray-100 dark:hover:bg-gray-700 z-10">
            &#10094;
          </CarouselPrevious>
          <CarouselNext className="absolute right-0 top-1/2 -translate-y-1/2 bg-white dark:bg-gray-800 rounded-full p-2 shadow hover:bg-gray-100 dark:hover:bg-gray-700 z-10">
            &#10095;
          </CarouselNext>
        </Carousel>
      </div>
    </div>
  );
}
