    "use client";

import { useQuery } from "@tanstack/react-query";
// 1. Import the new service function and types
import { getPostById, PostWithUserAndRequests } from "@/lib/supabase/postService";
import Image from "next/image";

import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

// Define the expected props from Next.js dynamic routing
interface PropertyDetailPageProps {
  params: {
    id: string; // This matches the folder name: [id]
  };
}

export default function PropertyDetailPage({ params }: PropertyDetailPageProps) {
  const postId = params?.id as string;
  console.log(params)
  console.log("postId:", postId)

  // 2. Use useQuery to fetch the single post data
  const { data: property, isLoading, error } = useQuery<PostWithUserAndRequests | null>({
    queryKey: ["post", postId],
    queryFn: () => getPostById(postId),
    enabled: !!postId, // Only run the query if postId is available
  });

  console.log("Error:", error)
  console.log("Property:", property)
  
  // Custom asset URLs (copy from your Properties component)
  const customAvatar = `https://ptwhyrlrfmpyhkwmljlu.supabase.co/storage/v1/object/public/user-profiles/`;
  const customAvatarPosts = `https://ptwhyrlrfmpyhkwmljlu.supabase.co/storage/v1/object/public/user-posts/`;

  // --- Utility Functions (Copy from Properties component) ---
  const statusVariantMap: Record<string, "default" | "destructive" | "secondary" | "outline"> = {
    Available: "default",
    Pending: "outline",
    Acknowledged: "secondary",
    Occupied: "destructive",
  };

  const getBadge = (requests: any[]) => {
    if (!requests || requests.length === 0) return { text: "Available", variant: statusVariantMap["Available"] };
    const occupied = requests.find((r) => r.confirmed);
    if (occupied) return { text: "Occupied", variant: statusVariantMap["Occupied"] };
    const acknowledged = requests.find((r) => r.requested === true);
    if (acknowledged) return { text: "Acknowledged", variant: statusVariantMap["Acknowledged"] };
    return { text: "Pending", variant: statusVariantMap["Pending"] };
  };
  // -----------------------------------------------------------


  if (isLoading) {
    return (
      <div className="p-6 lg:p-10 max-w-4xl mx-auto">
        <Skeleton className="h-[400px] w-full mb-6" />
        <Skeleton className="h-10 w-3/4 mb-4" />
        <div className="flex gap-4">
          <Skeleton className="h-6 w-20" />
          <Skeleton className="h-6 w-20" />
        </div>
        <Skeleton className="h-40 w-full mt-6" />
        <Skeleton className="h-12 w-48 mt-6" />
      </div>
    );
  }

  if (error) {
    return <div className="p-10 text-destructive">Error loading property details: {error.message}</div>;
  }

  if (!property) {
    return <div className="p-10 text-center text-xl">Property not found.</div>;
  }

  const badge = getBadge(property.requests);

  return (
    <div className="p-6 lg:p-10 max-w-5xl mx-auto">
      {/* 🖼️ Property Image */}
      <div className="relative h-96 w-full mb-8 rounded-xl overflow-hidden shadow-lg">
        <Image
          src={
            property.image
              ? `${customAvatarPosts}/${property.image}`
              : `${customAvatarPosts}/default-image.jpg`
          }
          alt={property.title}
          fill
          className="object-cover"
          priority
        />
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        {/* 📝 Main Content (Col 1 & 2) */}
        <div className="md:col-span-2">
          {/* Title and Status */}
          <h1 className="text-4xl font-extrabold mb-3">{property.title}</h1>
          
          <div className="flex items-center gap-3 mb-6">
            <Badge variant={badge.variant} className="text-md py-1">{badge.text}</Badge>
            <Badge variant="outline" className="text-md py-1">{property.beds} Beds</Badge>
            <p className="text-2xl font-bold text-primary">
              ₱ {property.price_per_night} <span className="text-base font-normal text-muted-foreground">/ month</span>
            </p>
          </div>

          {/* Details */}
          <h2 className="text-2xl font-semibold mt-8 mb-3 border-b pb-2">Description</h2>
          <p className="text-muted-foreground whitespace-pre-line">{property.description}</p>
          
          <h2 className="text-2xl font-semibold mt-8 mb-3 border-b pb-2">Location</h2>
          <p className="text-muted-foreground">{property.location}</p>

          {/* Placeholder for Amenities/Features if you have them */}
          {/* <h2 className="text-2xl font-semibold mt-8 mb-3 border-b pb-2">Features</h2>
          <ul className="list-disc list-inside text-muted-foreground">
             <li>Feature 1</li>
             <li>Feature 2</li>
          </ul> */}

        </div>

        {/* 👤 Landlord/Action Card (Col 3) */}
        <div className="md:col-span-1">
          <div className="sticky top-10 bg-card p-6 border rounded-xl shadow-md">
            <h3 className="text-lg font-semibold mb-4">Posted By</h3>
            
            {property.users ? (
              <div className="flex items-center gap-4">
                <Image
                  src={`${customAvatar}/${property.users.avatar}`}
                  width={60}
                  height={60}
                  alt="Landlord avatar"
                  className="rounded-full border object-cover"
                />
                <div>
                  <p className="text-lg font-bold">
                    {property.users.firstname} {property.users.lastname}
                  </p>
                  <p className="text-sm text-muted-foreground">Landlord</p>
                  {/* You can add a link to the landlord profile here */}
                </div>
              </div>
            ) : (
                <p className="text-sm text-muted-foreground">Landlord information unavailable.</p>
            )}

            <div className="mt-6 space-y-3">
              <Button className="w-full">
                {/* 📞 Replace this with a contact method */}
                Contact Landlord
              </Button>
              <Button variant="outline" className="w-full">
                {/* 📌 Replace this with a Save/Bookmark action */}
                Save Property
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}