"use client";

import Image from "next/image";
import { useQuery } from "@tanstack/react-query";
import { getAllPosts } from "@/lib/supabase/postService";
import { useState, useMemo } from "react";

import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";

export default function Properties() {
  const { data, isLoading } = useQuery({
    queryKey: ["posts"],
    queryFn: () => getAllPosts(),
  });

  const [search, setSearch] = useState("");
  const [availabilityFilter, setAvailabilityFilter] = useState("all");

  const customAvatar = `https://ptwhyrlrfmpyhkwmljlu.supabase.co/storage/v1/object/public/user-profiles/`;
  const customAvatarPosts = `https://ptwhyrlrfmpyhkwmljlu.supabase.co/storage/v1/object/public/user-posts/`;

  // Map status to allowed Badge variants
  const statusVariantMap: Record<string, "default" | "destructive" | "secondary" | "outline"> = {
    Available: "default",
    Pending: "outline",
    Acknowledged: "secondary",
    Occupied: "destructive",
  };

  // Determine badge text and variant
  const getBadge = (requests: any[]) => {
    if (!requests || requests.length === 0) return { text: "Available", variant: statusVariantMap["Available"] };

    const occupied = requests.find((r) => r.confirmed);
    if (occupied) return { text: "Occupied", variant: statusVariantMap["Occupied"] };

    const acknowledged = requests.find((r) => r.requested === true);
    if (acknowledged) return { text: "Acknowledged", variant: statusVariantMap["Acknowledged"] };

    return { text: "Pending", variant: statusVariantMap["Pending"] };
  };

  // FILTERED DATA
  const filteredPosts = useMemo(() => {
    if (!data) return [];

    return data.filter((post) => {
      const badge = getBadge(post.requests);

      // Availability filter
      if (availabilityFilter !== "all" && badge.text.toLowerCase() !== availabilityFilter) return false;

      // Search filter
      if (search.trim()) {
        const text = search.toLowerCase();
        const match =
          post.title?.toLowerCase().includes(text) ||
          post.users?.firstname?.toLowerCase().includes(text) ||
          post.users?.lastname?.toLowerCase().includes(text);

        if (!match) return false;
      }

      return true;
    });
  }, [data, search, availabilityFilter]);

  return (
    <div className="p-6 lg:p-10">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold">
          Properties ({filteredPosts.length})
        </h1>

        {/* SEARCH + FILTER CONTROLS */}
        <div className="flex items-center gap-3">
          <Input
            placeholder="Search by title or landlord..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-[200px] md:w-[250px]"
          />

          <Select
            value={availabilityFilter}
            onValueChange={(value) => setAvailabilityFilter(value)}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter status" />
            </SelectTrigger>

            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="available">Available</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="acknowledged">Acknowledged</SelectItem>
              <SelectItem value="occupied">Occupied</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* LOADING */}
      {isLoading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="overflow-hidden shadow-sm">
              <Skeleton className="h-48 w-full" />
              <CardHeader>
                <Skeleton className="h-5 w-40" />
                <Skeleton className="h-4 w-28 mt-2" />
              </CardHeader>
              <CardContent className="space-y-3">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </CardContent>
              <CardFooter>
                <Skeleton className="h-10 w-full" />
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {/* PROPERTIES */}
      {!isLoading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredPosts.map((property) => {
            const badge = getBadge(property.requests);

            return (
              <Card
                key={property.id}
                className="overflow-hidden transition hover:shadow-lg border rounded-xl bg-card/70 backdrop-blur pt-0"
              >
                <div className="relative h-48 w-full">
                  <Image
                    src={
                      property.image
                        ? `${customAvatarPosts}/${property.image}`
                        : `${customAvatarPosts}/default-image.jpg`
                    }
                    alt={property.title}
                    fill
                    className="object-cover"
                  />
                </div>

                <CardHeader>
                  <CardTitle className="text-lg font-semibold">
                    {property.title}
                  </CardTitle>

                  <div className="flex items-center gap-2 mt-3">
                    <Badge variant={badge.variant}>{badge.text}</Badge>
                    <Badge variant="outline">{property.beds}</Badge>
                  </div>
                </CardHeader>

                <CardContent>
                  <p className="text-xl font-bold">
                    ₱ {property.price_per_night}{" "}
                    <span className="text-sm font-normal">/ month</span>
                  </p>

                  {property.users && (
                    <div className="flex items-center gap-3 mt-4">
                      <Image
                        src={`${customAvatar}/${property.users.avatar}`}
                        width={40}
                        height={40}
                        alt="Owner avatar"
                        className="rounded-full border object-fill"
                        quality={100}
                      />
                      <div>
                        <p className="text-sm font-medium">
                          {property.users.firstname} {property.users.lastname}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Landlord
                        </p>
                      </div>
                    </div>
                  )}
                </CardContent>

                <CardFooter>
                  <Button className="w-full">View Property</Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
