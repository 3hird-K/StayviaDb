"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import React from "react";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea"; 
import { Label } from "@/components/ui/label"; 
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog"; 
import {
  Mail,
  Phone,
  Home,
  User,
  Calendar,
  MessageSquare,
  Ban,
  Loader2,
  Send,
} from "lucide-react";
import { getAllRequest } from "@/lib/supabase/requestService";
import { sendMessageToUser, suspendUser } from "@/lib/supabase/userService"; // Import suspendUser
import { Skeleton } from "@/components/ui/skeleton";


// --- Custom Type Placeholder (for strong typing the selected renter) ---
interface RenterData {
  id: string; // request ID
  user_id: string; // user's actual ID
  users: {
    id: string;
    firstname?: string | null;
    lastname?: string | null;
    username?: string | null;
  } | null;
}

const SUSPENSION_OPTIONS = [
    { label: "3 Days", value: "3d" },
    { label: "1 Week", value: "7d" },
    { label: "1 Month", value: "1m" },
    { label: "Forever", value: "forever" },
];

// --- Helper Functions (assuming they are defined elsewhere or imported) ---
// const formatContact = (num: number | string | null | undefined): string => ...
// const formatDate = (dateString: string | null | undefined): string => ...

export default function ActiveRenters() {
  const queryClient = useQueryClient();

  // State for Message Dialog
  const [isMessageDialogOpen, setIsMessageDialogOpen] = React.useState(false);
  const [messageContent, setMessageContent] = React.useState("");

  // State for SUSPENSION Dialog
  const [isSuspendDialogOpen, setIsSuspendDialogOpen] = React.useState(false);
  const [selectedRenter, setSelectedRenter] = React.useState<RenterData | null>(null);
  const [suspensionDuration, setSuspensionDuration] = React.useState("3d");

  // --- MUTATIONS ---

  // 1. Message Mutation (Existing)
  const sentMsgMutation = useMutation({
    mutationFn: ({ userId, message }: { userId: string; message: string }) =>
      sendMessageToUser(userId, message),

    onSuccess: () => {
      toast.success("Message Sent", { description: `To ${selectedRenter?.users?.firstname || 'the user'}.` });
      setMessageContent("");
      setIsMessageDialogOpen(false);
      setSelectedRenter(null);
    },

    onError: (error: any) => {
      toast.error("Send Failed", { description: error.message });
    },
  });

  // 2. Suspension Mutation (NEW)
  const suspendMutation = useMutation({
    mutationFn: ({ userId, duration }: { userId: string; duration: string }) =>
      suspendUser(userId, duration),

    onSuccess: () => {
      toast.success("User Suspended", { 
          description: `${selectedRenter?.users?.firstname} has been suspended for ${suspensionDuration}.` 
      });
      setIsSuspendDialogOpen(false);
      setSelectedRenter(null);
      // Invalidate the activeRenters query to refresh the list/status
      queryClient.invalidateQueries({ queryKey: ["activeRenters"] });
    },

    onError: (error: any) => {
      toast.error("Suspension Failed", { description: error.message });
    },
  });

  // --- DATA FETCH ---
  const { data: renters, isLoading, error } = useQuery({
    queryKey: ["activeRenters"],
    queryFn: getAllRequest,
  });

  // --- HANDLERS ---

  const handleOpenMessageDialog = (renter: RenterData) => {
    setSelectedRenter(renter);
    setIsMessageDialogOpen(true);
  };
  
  const handleOpenSuspendDialog = (renter: RenterData) => {
    setSelectedRenter(renter);
    setIsSuspendDialogOpen(true);
    setSuspensionDuration("3d"); // Reset to default when opening
  };

  const handleSendMessage = () => {
    if (!selectedRenter || !messageContent.trim()) return;
    sentMsgMutation.mutate({ 
      userId: selectedRenter.user_id, 
      message: messageContent.trim() 
    });
  };

  const handleConfirmSuspension = () => {
      if (!selectedRenter || !suspensionDuration) return;
      
      suspendMutation.mutate({
          userId: selectedRenter.user_id,
          duration: suspensionDuration,
      });
  };

  // --- RENDERING CONDITIONAL STATES (Unchanged for brevity) ---
  // --- Skeleton Loading State ---
if (isLoading)
  return (
    <div className="p-2 sm:p-6 lg:p-8">
      <h1 className="text-2xl font-bold mb-8">Pending Rental Contracts</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="border shadow-sm bg-card/60">
            <CardHeader className="flex flex-row items-center gap-4">
              <Skeleton className="h-14 w-14 rounded-full" />

              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-20" />
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-2/3" />
              </div>

              <Separator />

              <div className="space-y-2">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-3/4" />
              </div>

              <Separator />

              <Skeleton className="h-3 w-32" />

              <Separator />

              <div className="space-y-2">
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            </CardContent>

            <CardFooter className="flex gap-3">
              <Skeleton className="h-10 w-full rounded-md" />
              <Skeleton className="h-10 w-full rounded-md" />
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );

  if (error) return (
      <Card className="p-6 border-destructive/50 bg-destructive/10 mt-4">
          <CardHeader>
              <CardTitle className="text-destructive-foreground">Error loading data</CardTitle>
              <CardDescription>{error.message}</CardDescription>
          </CardHeader>
      </Card>
  );
  if (!renters || renters.length === 0) return (
      <div className="rounded-xl border p-10 text-center mt-6 bg-secondary/50">
          <h2 className="text-xl font-semibold">No Active Renters</h2>
          <p className="text-muted-foreground mt-1">Everything looks clear.</p>
      </div>
  );

  // --- Main Render ---
  return (
      <div className="p-2 sm:p-6 lg:p-8">
        <h1 className="text-2xl font-bold mb-8">Pending Rental Contracts ({renters.length})</h1>
  
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
          {renters.map((renter) => {
            const student = renter.users
            const post = renter.posts
            const landlord = post?.users
  
            const studentName = `${student?.firstname ?? ""} ${student?.lastname ?? ""}`.trim()
            const landlordName = `${landlord?.firstname ?? ""} ${landlord?.lastname ?? ""}`.trim()
            const customAvatar = `https://ptwhyrlrfmpyhkwmljlu.supabase.co/storage/v1/object/public/user-profiles/${student?.avatar}`
  
            const status = student?.online ? "Online" : "Offline"
  
            return (
              <Card
                key={renter.id}
                className="border shadow-sm hover:shadow-md transition-all bg-card/60"
              >
                {/* HEADER */}
                <CardHeader className="flex flex-row items-center gap-4">
                  <div className="relative h-14 w-14">
                      <Avatar className="h-14 w-14">
                          <AvatarImage
                          src={
                              customAvatar ||
                              `https://ui-avatars.com/api/?name=${encodeURIComponent(studentName)}`
                          }
                          />
                          <AvatarFallback>{studentName.charAt(0)}</AvatarFallback>
                      </Avatar>
  
                  <span
                      className={`
                      absolute bottom-0 right-0 h-4 w-4 rounded-full border-2 border-white
                      ${student?.online ? "bg-green-500" : "bg-gray-400"}
                      `}
                  ></span>
                  </div>
  
  
                  <div className="flex-1">
                    <CardTitle className="text-lg font-semibold">{studentName}</CardTitle>
                    <CardDescription>{`ID: ${renter.users?.student_id  ?? "Landlord Account"}`}</CardDescription>
                  </div>
  
                  {/* <Badge
                    variant={student?.online ? "default" : "secondary"}
                    className="flex items-center gap-1"
                  >
                    <UserCheck className="w-3 h-3" /> {status}
                  </Badge> */}
                </CardHeader>
  
                {/* CONTENT */}
                <CardContent className="space-y-4">
                  {/* Contact */}
                  <div>
                    <h3 className="text-sm font-semibold mb-2">Contact</h3>
  
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground flex items-center gap-2">
                        <Mail className="w-4 h-4" /> Email
                      </span>
                      <span>{student?.email || "N/A"}</span>
                    </div>
  
                    <div className="flex justify-between text-sm mt-1">
                      <span className="text-muted-foreground flex items-center gap-2">
                        <Phone className="w-4 h-4" /> Phone
                      </span>
                      <span>{student?.contact ?? "N/A"}</span>
                    </div>
                  </div>
  
                  <Separator />
  
                  {/* Property */}
                  <div>
                    <h3 className="text-sm font-semibold mb-2">Property</h3>
  
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground flex items-center gap-2">
                        <Home className="w-4 h-4" /> Title
                      </span>
                      <span className="font-medium">{post?.title || "N/A"}</span>
                    </div>
  
                    <div className="flex justify-between text-sm mt-1">
                      <span className="text-muted-foreground flex items-center gap-2">
                        <User className="w-4 h-4" /> Landlord
                      </span>
                      <span>{landlordName || "N/A"}</span>
                    </div>
                  </div>
  
  
                  <Separator />
  
                  <div className="flex justify-between text-sm mt-1">
                      <span className="text-muted-foreground flex items-center gap-2">
                          Monthly Rent
                      </span>
                      <span className="font-medium">
                          {post?.price_per_night ? `₱${post.price_per_night}` : "N/A"}
                      </span>
                  </div>
  
  
                  <Separator />
  
  
  
                  {/* Timeline */}
                  <div>
                    <h3 className="text-sm font-semibold mb-2">Timeline</h3>
  
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground flex items-center gap-2">
                        <Calendar className="w-4 h-4" /> Submitted
                      </span>
                      <span>{format(new Date(renter.created_at), "MMM d, yyyy")}</span>
                    </div>
  
                    <div className="flex justify-between text-sm mt-1">
                      <span className="text-muted-foreground flex items-center gap-2">
                          <Calendar className="w-4 h-4" /> Approved
                      </span>
                      <span>
                          {renter.updated_at
                          ? format(new Date(renter.updated_at), "MMM d, yyyy")
                          : "N/A"}
                      </span>
                    </div>
  
                  </div>
  
                  <p className="text-xs italic text-muted-foreground mt-4">
                    Payments are managed directly between renter and landlord.
                  </p>
                </CardContent>

              {/* FOOTER - Action Buttons */}
              <CardFooter className="flex gap-3">
                <Button 
                    className="flex-1 bg-primary hover:bg-primary/90"
                    onClick={() => handleOpenMessageDialog(renter as RenterData)}
                >
                  <MessageSquare className="w-4 h-4" />
                  Message
                </Button>
                
                {/* SUSPEND BUTTON */}
                <Button 
                    variant="destructive" 
                    className="flex-1"
                    onClick={() => handleOpenSuspendDialog(renter as RenterData)}
                >
                  <Ban className="w-4 h-4" />
                  Suspend
                </Button>
              </CardFooter>
            </Card>
          );
        })}
      </div>
      
      {/* 📩 MESSAGE DIALOG (Existing) */}
      <Dialog open={isMessageDialogOpen} onOpenChange={setIsMessageDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Send Message to {selectedRenter?.users?.firstname || 'Renter'}</DialogTitle>
            <DialogDescription>
              This message will be sent to the user's dedicated inbox.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="message">Write Message</Label>
              <Textarea
                id="message"
                placeholder="Type your communication here..."
                rows={5}
                value={messageContent}
                onChange={(e) => setMessageContent(e.target.value)}
                disabled={sentMsgMutation.isPending}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              type="submit" 
              onClick={handleSendMessage} 
              disabled={sentMsgMutation.isPending || !messageContent.trim()}
            >
              {sentMsgMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" /> Sending...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" /> Send Message
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* 🚫 SUSPENSION DIALOG (NEW) */}
      <Dialog open={isSuspendDialogOpen} onOpenChange={setIsSuspendDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-destructive">Confirm Suspension</DialogTitle>
            <DialogDescription>
              You are about to suspend the account of **{selectedRenter?.users?.firstname}**. Select the duration below.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <Label>Select Suspension Duration:</Label>
            <div className="grid grid-cols-2 gap-3">
              {SUSPENSION_OPTIONS.map((option) => (
                <Button
                  key={option.value}
                  variant={suspensionDuration === option.value ? "default" : "outline"}
                  className={suspensionDuration === option.value ? "bg-red-500 hover:bg-red-600 text-white" : "border-destructive/50"}
                  onClick={() => setSuspensionDuration(option.value)}
                  disabled={suspendMutation.isPending}
                >
                  {option.label}
                </Button>
              ))}
            </div>
            {suspensionDuration === 'forever' && (
                <p className="text-xs text-destructive mt-2">
                    Warning: 'Forever' will permanently block access until manually lifted.
                </p>
            )}
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsSuspendDialogOpen(false)} 
              disabled={suspendMutation.isPending}
            >
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleConfirmSuspension}
              disabled={suspendMutation.isPending}
            >
              {suspendMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" /> Suspending...
                </>
              ) : (
                <>
                  <Ban className="h-4 w-4 mr-2" /> Suspend Account
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}