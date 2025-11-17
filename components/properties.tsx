"use client";

import Image from "next/image";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getAllPosts, deletePost, getPostById, PostWithUserAndRequests } from "@/lib/supabase/postService";
import { useState, useMemo } from "react";
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

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
import {
   AlertDialog,
   AlertDialogAction,
   AlertDialogCancel,
   AlertDialogContent,
   AlertDialogDescription,
   AlertDialogFooter,
   AlertDialogHeader,
   AlertDialogTitle,
   AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
// 🚨 New Dialog Imports for View Property 🚨
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { IconPhone } from "@tabler/icons-react"; // Only need IconPhone, IconPhoneFilled was redundant


// ====================================================================
// 🔍 Property Details Dialog Component (for View Property action)
// ====================================================================

interface PropertyDetailsDialogProps {
   postId: string | null;
   onClose: () => void;
}

const PropertyDetailsDialog = ({ postId, onClose }: PropertyDetailsDialogProps) => {
   const { data: property, isLoading, error } = useQuery<PostWithUserAndRequests | null>({
     queryKey: ["post-dialog", postId],
     queryFn: () => getPostById(postId!),
     enabled: !!postId, // Only run the query if postId is available
   });

   const customAvatar = `https://ptwhyrlrfmpyhkwmljlu.supabase.co/storage/v1/object/public/user-profiles/`;
   const customAvatarPosts = `https://ptwhyrlrfmpyhkwmljlu.supabase.co/storage/v1/object/public/user-posts/`;

   // Status mapping (copied from main component)
   const statusVariantMap: Record<string, "default" | "destructive" | "secondary" | "outline"> = {
     Available: "default", Pending: "outline", Acknowledged: "secondary", Occupied: "destructive",
   };
   const getBadge = (requests: any[]) => {
     if (!requests || requests.length === 0) return { text: "Available", variant: statusVariantMap["Available"] };
     const occupied = requests.find((r) => r.confirmed);
     if (occupied) return { text: "Occupied", variant: statusVariantMap["Occupied"] };
     const acknowledged = requests.find((r) => r.requested === true);
     if (acknowledged) return { text: "Acknowledged", variant: statusVariantMap["Acknowledged"] };
     return { text: "Pending", variant: statusVariantMap["Pending"] };
   };

   if (!postId) return null;

   let content;

   if (isLoading) {
     content = (
        <div className="space-y-4 p-4">
          <Skeleton className="h-60 w-full" />
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-20 w-full" />
        </div>
     );
   } else if (error) {
     content = <div className="text-destructive p-4">Error loading details: {error.message}</div>;
   } else if (!property) {
     content = <div className="p-4">Property details could not be found.</div>;
   } else {
     const badge = getBadge(property.requests);
    
    // 🚨 UPDATED LOGIC TO HANDLE FILTERS ARRAY 🚨
    const filtersArray = Array.isArray(property.filters)
        ? property.filters
        : (typeof property.filters === 'string' && property.filters.trim())
            ? property.filters.split(',').map(f => f.trim()) // Try splitting a comma-separated string
            : [];

     content = (
        <div className="grid md:grid-cols-2 gap-6 p-4">
          {/* Left: Image & Main Info */}
          <div className="space-y-6">
             <div className="relative h-60 w-full mb-4 rounded-lg overflow-hidden">
               <Image
                  src={property.image ? `${customAvatarPosts}/${property.image}` : `${customAvatarPosts}/default-image.jpg`}
                  alt={property.title}
                  fill
                  className="object-cover"
               />
             </div>

             <div className="flex items-center gap-3 mb-4">
               <Badge variant={badge.variant}>{badge.text}</Badge>
               <Badge variant="outline">{property.beds} Beds</Badge>
             </div>

             <p className="text-2xl font-bold text-primary mb-4">
               ₱ {property.price_per_night} <span className="text-base font-normal text-muted-foreground">/ month</span>
             </p>

             <h4 className="font-semibold text-lg border-b pb-1">Description</h4>
             <p className="text-sm text-muted-foreground whitespace-pre-line">{property.description}</p>
          </div>

          {/* Right: Filters, Location, & Landlord */}
          <div className="space-y-6 mt-0 pt-0">
            <div>
              <p className="text-sm text-muted-foreground mb-2">{property.location}</p>
              
              {(property.latitude && property.longitude) ? (
                  <>
                      <div className="text-xs text-muted-foreground/80 space-y-1 mt-2 mb-4">
                      </div>
                      <div className="overflow-hidden rounded-lg shadow-md border">
                          <iframe
                              width="100%"
                              height="250"
                              frameBorder="0"
                              style={{ border: 0 }}
                              referrerPolicy="no-referrer-when-downgrade"
                              allowFullScreen
                              title="Property Location Map"
                              src={`https://maps.google.com/maps?q=${property.latitude},${property.longitude}&z=15&output=embed`}
                          />
                      </div>
                      <a 
                          href={`https://www.google.com/maps/search/?api=1&query=${property.latitude},${property.longitude}`} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-xs text-primary hover:underline block mt-2 text-right"
                      >
                          Open in Google Maps
                      </a>
                  </>
                    ) : (
                        <p className="text-sm text-muted-foreground/80">
                            Coordinates (latitude/longitude) are not available for this property.
                        </p>
                    )}
              </div>            
            {/* --- Filters/Amenities Section --- */}
            <div>
                <h4 className="font-semibold text-lg border-b pb-1 mb-3">Amenities / Filters</h4>
                <div className="flex flex-wrap gap-2">
                    {filtersArray.length > 0 ? (
                        filtersArray.map((filter, index) => (
                            <Badge key={index} variant="secondary" className="px-3 py-1 text-sm font-normal">
                                {String(filter)} 
                            </Badge>
                        ))
                    ) : (
                        <p className="text-sm text-muted-foreground">No specific amenities listed.</p>
                    )}
                </div>
            </div>
                    
             {property.users && (
               <div>
                  <h4 className="font-semibold text-lg border-b pb-1 mb-3">Landlord</h4>
                  <div className="flex items-center gap-3">
                    <Image
                       src={`${customAvatar}/${property.users.avatar}`}
                       width={40}
                       height={40}
                       alt="Owner avatar"
                       className="rounded-full border object-fill"
                       quality={100}
                    />
                    <div>
                       <p className="text-sm font-medium">{property.users.firstname} {property.users.lastname}</p>
                       <p className="text-xs text-muted-foreground">Landlord Contact</p>
                    </div>
                  </div>
               </div>
             )}
            
             <Button className="w-full mt-4">
                <IconPhone className="w-4 h-4 mr-2"/>
                +63{property.users?.contact}
            </Button>
          </div>
        </div>
     );
   }

   return (
     <Dialog open={!!postId} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
             <DialogTitle>{property?.title || "Property Details"}</DialogTitle>
             <DialogDescription>
               {isLoading ? "Loading property details..." : "Full listing information."}
             </DialogDescription>
          </DialogHeader>
          {content}
        </DialogContent>
     </Dialog>
   );
};


// ====================================================================
// 🏠 Main Properties Component (unchanged)
// ====================================================================

export default function Properties() {
   const router = useRouter();
   const queryClient = useQueryClient();

   const { data, isLoading } = useQuery({
     queryKey: ["posts"],
     queryFn: () => getAllPosts(),
   });

   const [search, setSearch] = useState("");
   const [availabilityFilter, setAvailabilityFilter] = useState("all");
   const [propertyToDelete, setPropertyToDelete] = useState<string | null>(null);
   // 🚨 NEW STATE FOR VIEW DIALOG 🚨
   const [viewingPropertyId, setViewingPropertyId] = useState<string | null>(null); 

   const customAvatar = `https://ptwhyrlrfmpyhkwmljlu.supabase.co/storage/v1/object/public/user-profiles/`;
   const customAvatarPosts = `https://ptwhyrlrfmpyhkwmljlu.supabase.co/storage/v1/object/public/user-posts/`;

   // Map status to allowed Badge variants
   const statusVariantMap: Record<string, "default" | "destructive" | "secondary" | "outline"> = {
     Available: "default", Pending: "outline", Acknowledged: "secondary", Occupied: "destructive",
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

   // Use Mutation for Deletion
   const deleteMutation = useMutation({
     mutationFn: (postId: string) => deletePost(postId),
     onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["posts"] });
    
        toast.success("Property Removed 👋", {
             description: "The property has been successfully deleted from the listing.",
        });

        setPropertyToDelete(null); // Close the AlertDialog on success
     },
     onError: (error) => {
        console.error("Error deleting post:", error);
        toast.error("Deletion Failed", {
          description: `Could not remove property: ${error.message}`,
        });
     },
   });

   // Handlers
   const handleViewProperty = (id: string) => {
     setViewingPropertyId(id); // 🚨 Opens the new Dialog 🚨
   };

   const handleCloseViewDialog = () => {
     setViewingPropertyId(null);
   };

   const handleRemoveClick = (id: string) => {
     setPropertyToDelete(id); // Opens the AlertDialog
   };

   const handleConfirmDelete = () => {
        if (propertyToDelete) {
             deleteMutation.mutate(propertyToDelete);
        }
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
        {/* --- Controls and Filters --- */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <h1 className="text-2xl font-bold">
             Properties ({filteredPosts.length})
          </h1>

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

        {/* --- Loading State --- */}
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


        {/* --- Properties List --- */}
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
                       {/* CardFooter with View and Delete Dialog Triggers */}
                       <div className="flex w-full gap-3">
                         <Button
                            onClick={() => handleViewProperty(property.id)} // 🚨 Triggers Dialog 🚨
                            className="flex-1"
                         >
                            View Property
                         </Button>

                         {/* DIALOG TRIGGER for Delete */}
                         <AlertDialog open={propertyToDelete === property.id} onOpenChange={(open) => !open && setPropertyToDelete(null)}>
                            <AlertDialogTrigger asChild>
                              <Button
                                   onClick={() => handleRemoveClick(property.id)} 
                                   variant="destructive"
                                   className="flex-1"
                                   disabled={deleteMutation.isPending}
                              >
                                 Remove Property
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                 <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                 <AlertDialogDescription>
                                   This action cannot be undone. This will permanently remove the property titled **"{property.title}"** and all associated data from the server.
                                 </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                 <AlertDialogCancel disabled={deleteMutation.isPending}>Cancel</AlertDialogCancel>
                                 <AlertDialogAction 
                                   onClick={handleConfirmDelete} 
                                   disabled={deleteMutation.isPending}
                                   className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
                                 >
                                   {deleteMutation.isPending ? "Deleting..." : "Confirm Removal"}
                                 </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                         </AlertDialog>
                       </div>
                    </CardFooter>
                  </Card>
               );
             })}
          </div>
        )}

        {/* 🚨 RENDER THE PROPERTY DETAILS DIALOG HERE 🚨 */}
        <PropertyDetailsDialog 
          postId={viewingPropertyId} 
          onClose={handleCloseViewDialog} 
        />
     </div>
   );
}