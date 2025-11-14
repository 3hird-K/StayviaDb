"use client"

import * as React from "react"
import { useReactTable, flexRender, ColumnDef, Row, ColumnFiltersState, SortingState, VisibilityState, getCoreRowModel, getFilteredRowModel, getPaginationRowModel, getSortedRowModel, getFacetedRowModel, getFacetedUniqueValues } from "@tanstack/react-table"
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription, DrawerFooter, DrawerClose } from "./ui/drawer"
import { Badge } from "@/components/ui/badge" 
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar" 
import { IconMail, IconPhone, IconUserCircle, IconLicense, IconUserCheck, IconMessage, IconSettings, IconChevronDown, IconSearch } from "@tabler/icons-react"
import { Separator } from "@/components/ui/separator"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog"
import { Textarea } from "./ui/textarea"
import { useMutation, useQueryClient } from "@tanstack/react-query"
// NOTE: Ensure suspendUser is available from userService
import { rejectLandlordProof, updateLandlordStatus, suspendUser } from "@/lib/supabase/userService" 
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "./ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { IconCheck, IconX, IconBan } from "@tabler/icons-react"
import { Loader2 } from "lucide-react"


// --- CONSTANTS ---
const SUSPENSION_OPTIONS = [
    { label: "3 Days", value: "3d" },
    { label: "1 Week", value: "7d" },
    { label: "1 Month", value: "1m" },
    { label: "Forever", value: "forever" },
];

// -----------------------------
// Generic DataTable Props (UNCHANGED)
// -----------------------------
export interface DataTableProps<T> {
  data: T[]
  columns: ColumnDef<T>[]
  title?: string
}

// -----------------------------
// DataTable Component (UNCHANGED)
// -----------------------------
export function DataTable<T extends { id: string; firstname?: string | null; lastname?: string | null; username?: string | null; email?: string | null; account_type?: string | null }>({ data = [], columns, title }: DataTableProps<T>) {
  const [rowSelection, setRowSelection] = React.useState({})
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [pagination, setPagination] = React.useState({ pageIndex: 0, pageSize: 10 })
  const [statusFilter, setStatusFilter] = React.useState<string>("all") 
  const [selectedUser, setSelectedUser] = React.useState<T | null>(null)
  const [globalFilter, setGlobalFilter] = React.useState<string>('') 

  const table = useReactTable({
   data,
   columns,
   state: { 
     sorting, 
     columnVisibility, 
     rowSelection, 
     columnFilters, 
     pagination,
     globalFilter,
   },
   getRowId: (row) => row.id,
   enableRowSelection: false, 
   onRowSelectionChange: setRowSelection,
   onSortingChange: setSorting,
   onColumnFiltersChange: setColumnFilters,
   onColumnVisibilityChange: setColumnVisibility,
   onPaginationChange: setPagination,
   onGlobalFilterChange: setGlobalFilter,
   getCoreRowModel: getCoreRowModel(),
   getFilteredRowModel: getFilteredRowModel(),
   getPaginationRowModel: getPaginationRowModel(),
   getSortedRowModel: getSortedRowModel(),
   getFacetedRowModel: getFacetedRowModel(),
   getFacetedUniqueValues: getFacetedUniqueValues(),
   globalFilterFn: "includesString",
  })

  React.useEffect(() => {
   if (statusFilter === "all") {
    table.setColumnFilters([])
   } else {
    table.setColumnFilters([{ 
     id: "account_type", 
     value: statusFilter,
    }])
   }
  }, [statusFilter, table])

  return (
          <div className="w-full flex flex-col gap-4">

               <div className="flex items-center justify-between gap-4 lg:px-2 mt-8">
                    
                    <div className="flex items-center gap-4">
                    <Label htmlFor="view-selector" className="sr-only">Filter by Status</Label>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="w-fit border-none shadow-none h-auto p-3 text-sm font-medium" size="sm">
                            <SelectValue placeholder="All Landlords" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Landlords</SelectItem>
                            <SelectItem value="landlord_unverified">Pending</SelectItem>
                        </SelectContent>
                    </Select>



                    </div>

                    <div className="flex items-center space-x-2">

                         <div className="relative w-full max-w-sm">
                              <IconSearch className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                              <Input
                                   placeholder="Search landlords"
                                   value={globalFilter ?? ''}
                                   onChange={(event) => setGlobalFilter(event.target.value)}
                                   className="h-8 pl-10 w-64 text-sm"
                              />
                         </div>
                         <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                   <Button variant="outline" className="ml-auto text-sm h-8 px-3 space-x-2">
                                        <IconSettings className="w-4 h-4" />
                                        <span>Customize</span>
                                        <IconChevronDown className="ml-1 h-4 w-4" />
                                   </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-[180px]">
                                   <DropdownMenuLabel>Hide Columns</DropdownMenuLabel>
                                   <DropdownMenuSeparator />
                                   {table
                                        .getAllColumns()
                                        .filter((column) => column.getCanHide())
                                        .map((column) => {
                                             return (
                                                  <DropdownMenuCheckboxItem
                                                       key={column.id}
                                                       className="capitalize"
                                                       checked={column.getIsVisible()}
                                                       onCheckedChange={(value) =>
                                                            column.toggleVisibility(!!value)
                                                       }
                                                  >
                                                       {column.id.replace(/_/g, ' ')}
                                                  </DropdownMenuCheckboxItem>
                                             )
                                        })}
                              </DropdownMenuContent>
                         </DropdownMenu>

                    </div>
               </div>

               <div className="overflow-hidden rounded-lg border">
                    <Table>
                         <TableHeader className="bg-muted sticky top-0 z-10">
                              {table.getHeaderGroups().map((headerGroup) => (
                                   <TableRow key={headerGroup.id}>
                                        {headerGroup.headers.map((header) => (
                                             <TableHead key={header.id}>
                                                  {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                                             </TableHead>
                                        ))}
                                   </TableRow>
                              ))}
                         </TableHeader>
            
                         <TableBody>
                              {table.getRowModel().rows?.length ? (
                                   table.getRowModel().rows.map((row) => (
                                        <StandardRow 
                                             key={row.id} 
                                             row={row} 
                                             onSelectUser={setSelectedUser} 
                                             table={table} 
                                        />
                                   ))
                              ) : (
                                   <TableRow>
                                        <TableCell colSpan={columns.length} className="h-24 text-center">
                                             No data found.
                                        </TableCell>
                                   </TableRow>
                              )}
                         </TableBody>
                    </Table>
               </div>
            
               <div className="flex items-center justify-between space-x-2 py-4 px-4 lg:px-0">
                    <div className="flex-1 text-sm text-muted-foreground">
                         {table.getFilteredSelectedRowModel().rows.length} of{" "}
                         {table.getFilteredRowModel().rows.length} row(s) selected.
                    </div>
                    <div className="flex items-center space-x-6 lg:space-x-8">
                       <div className="flex items-center space-x-2">
                         <p className="text-sm font-medium text-muted-foreground">Rows per page</p>
                         <Select
                            value={`${table.getState().pagination.pageSize}`}
                            onValueChange={(value) => {
                              table.setPageSize(Number(value))
                            }}
                         >
                            <SelectTrigger className="h-8 w-[70px]">
                              <SelectValue placeholder={table.getState().pagination.pageSize} />
                            </SelectTrigger>
                            <SelectContent side="top">
                              {[10, 20, 30, 40, 50].map((pageSize) => (
                                 <SelectItem key={pageSize} value={`${pageSize}`}>
                                   {pageSize}
                                 </SelectItem>
                              ))}
                            </SelectContent>
                         </Select>
                       </div>
                       <div className="flex w-[100px] items-center justify-center text-sm font-medium text-muted-foreground">
                         Page {table.getState().pagination.pageIndex + 1} of{" "}
                         {table.getPageCount()}
                       </div>
                       <div className="flex items-center space-x-1">
                         <Button
                            variant="outline"
                            className="h-8 w-8 p-0"
                            onClick={() => table.previousPage()}
                            disabled={!table.getCanPreviousPage()}
                         >
                            <span className="sr-only">Go to previous page</span>
                            {"<"}
                         </Button>
                         <Button
                            variant="outline"
                            className="h-8 w-8 p-0"
                            onClick={() => table.nextPage()}
                            disabled={!table.getCanNextPage()}
                         >
                            <span className="sr-only">Go to next page</span>
                            {">"}
                         </Button>
                       </div>
                    </div>
               </div>


              {selectedUser && <UserDrawer user={selectedUser} onClose={() => setSelectedUser(null)} />}
          </div>
)
}


// -----------------------------
// Standard Table Row (UNCHANGED)
// -----------------------------
function StandardRow<T extends { id: string; firstname?: string | null; lastname?: string | null; account_type?: string | null }>({
   row,
   onSelectUser,
   table
}: {
   row: Row<T>
   onSelectUser: (user: T) => void
   table: ReturnType<typeof useReactTable<T>>
}) {
  return (
   <TableRow
    data-state={row.getIsSelected() && "selected"}
    className="cursor-pointer hover:bg-muted/50 transition-colors"
   >
    {row.getVisibleCells().map((cell, index) => (
     <TableCell 
          key={cell.id} 
          className={cn(
               "pr-4 py-3",
               index === 0 && "font-semibold text-foreground"
          )} 
          onClick={() => onSelectUser(row.original)}
     >
          {index === 0 ? ( 
               <span className="font-mono text-sm text-muted-foreground transition-colors hover:underline hover:text-primary">
                    {row.original.id}
               </span>
          ) : (
               flexRender(cell.column.columnDef.cell, cell.getContext())
          )}
     </TableCell>
    ))}
   </TableRow>
  )
}

function UserDrawer<T extends { 
     id: string;
     username?: string | null;
     firstname?: string | null; 
     lastname?: string | null; 
     account_type?: string | null;
     avatar?: string | null; 
     email?: string | null; 
     contact?: number | null; 
     online?: boolean | null; 
     school?: string | null; 
     student_id?: number | null; 
     landlord_proof_id?: string | null; 
     created_at?: string | null; 
}>({
  user,
  onClose,
}: {
  user: T
  onClose: () => void
}) {
   // State for managing the verification dialog
   const [isVerificationDialogOpen, setIsVerificationDialogOpen] = React.useState(false);
   const [rejectMessage, setRejectMessage] = React.useState('');
  
   // State for suspension dialog (NEW)
   const [isSuspendDialogOpen, setIsSuspendDialogOpen] = React.useState(false);
   const [suspensionDuration, setSuspensionDuration] = React.useState("3d"); // Default suspension duration


   const firstName = user.firstname ?? ""
   const lastName = user.lastname ?? ""
   const fullName = `${firstName} ${lastName}`.trim() || user?.username || user.id
   const initials = (firstName.charAt(0) + lastName.charAt(0)).toUpperCase()
   const accountType = user.account_type ?? "N/A"
   const contact = user.contact ? user.contact.toString() : "N/A"
   const email = user.email ?? "N/A"
   const school = user.school ?? "N/A"
   const isOnline = user.online ?? false
   const statusBadgeVariant = accountType === "landlord" ? "default" : accountType === "landlord_unverified" ? "secondary" : "outline";
   const statusBadgeText = accountType === "landlord" ? "Verified" : accountType === "landlord_unverified" ? "Pending" : accountType;
   const createdAtFormatted = user.created_at ? new Intl.DateTimeFormat('en-US', { dateStyle: 'medium' }).format(new Date(user.created_at)) : 'N/A';
   const customAvatar = `https://ptwhyrlrfmpyhkwmljlu.supabase.co/storage/v1/object/public/user-profiles/${user.avatar}`
   const customLandlordProof = user.landlord_proof_id ? `https://ptwhyrlrfmpyhkwmljlu.supabase.co/storage/v1/object/public/user-profiles/${user.landlord_proof_id}` : null;
   const isPending = accountType === "landlord_unverified";

   const queryClient = useQueryClient();
  
 // --- MUTATIONS ---
  const verifyMutation = useMutation({
          mutationFn: updateLandlordStatus, 
          onSuccess: () => {
               queryClient.invalidateQueries({ queryKey: ["users", "landlord"] });
               setIsVerificationDialogOpen(false);
               onClose();
               toast.success("Landlord Verified", {
                    description: `${fullName} has been successfully verified as a Landlord.`,
               });
          },
          onError: (error: any) => {
               toast.error("Verification Failed", {
                    description: `Could not verify ${fullName}. Error: ${error.message}`,
               });
          },
     });

   const rejectMutation = useMutation({
          mutationFn: ({ userId, message }: { userId: string, message: string }) => rejectLandlordProof (userId, message),
          onSuccess: () => {
               queryClient.invalidateQueries({ queryKey: ["users", "landlord"] });
               setIsVerificationDialogOpen(false);
               onClose();
               toast.warning("Proof Rejected", {
                    description: `Rejection message sent to ${fullName}. Status remains Pending.`,
               });
          },
          onError: (error: any) => { 
               toast.error("Rejection Failed", {
                    description: `Could not send rejection message. Error: ${error.message}`,
               });
             },
     });

   // NEW: Suspension Mutation
   const suspendMutation = useMutation({
    mutationFn: ({ userId, duration }: { userId: string; duration: string }) =>
        // NOTE: Make sure you import suspendUser from your service file
        suspendUser(userId, duration), 
    onSuccess: () => {
        toast.success("User Suspended", { 
            description: `${fullName} has been suspended for ${suspensionDuration}.` 
        });
        setIsSuspendDialogOpen(false);
        queryClient.invalidateQueries({ queryKey: ["users"] });
        onClose(); 
    },
    onError: (error: any) => {
        toast.error("Suspension Failed", { description: error.message });
    },
  });
  
  // --- HANDLERS ---
  const handleVerifyLandlord = () => {
          if (user.id) {
               verifyMutation.mutate(user.id);
          }
     };
   const handleRejectProof = () => {
        if (user.id && rejectMessage.trim()) {
             rejectMutation.mutate({ userId: user.id, message: rejectMessage.trim() });
        }
   };
  
  const handleConfirmSuspension = () => {
      if (!user.id || !suspensionDuration) return;
      
      suspendMutation.mutate({
          userId: user.id,
          duration: suspensionDuration,
      });
  };

  return (
   <Drawer direction="right" open={true} onOpenChange={(open) => { if (!open) onClose(); }}>
    <DrawerContent className="p-0">
  
     <div className="flex flex-col items-center p-6 bg-muted/30 border-b">
        <Avatar className="h-24 w-24 mb-4 border-4 border-primary/20">
          <AvatarImage src={customAvatar ?? undefined} alt={fullName} />
          <AvatarFallback className="text-xl">{initials || <IconUserCircle size={32} />}</AvatarFallback>
        </Avatar>
        <DrawerTitle className="text-2xl font-bold">{fullName}</DrawerTitle>
        <DrawerDescription className="flex items-center space-x-2 mt-1">
          <Badge variant={statusBadgeVariant} className="h-6 text-sm">{statusBadgeText}</Badge>
          <Badge variant={isOnline ? "default" : "outline"} className="h-6 text-xs">
             {isOnline ? "Online" : "Offline"}
          </Badge>
        </DrawerDescription>
     </div>

     {/* Content: User Details (UNCHANGED) */}
     <div className="p-6 overflow-y-auto space-y-8 flex-grow">
        {/* Contact Information */}
        <div className="space-y-3">
          <h4 className="flex items-center text-lg font-semibold space-x-2 text-primary border-b pb-2 mb-3">
             <IconMail className="w-5 h-5" />
             <span>Contact Info</span>
          </h4>
          <div className="space-y-3 text-sm">
             <p className="flex justify-between items-center">
               <span className="font-medium text-muted-foreground">Email:</span> 
               <span>{email}</span>
             </p>
             <p className="flex justify-between items-center">
               <span className="font-medium text-muted-foreground">Contact No:</span> 
               <span>{contact}</span>
             </p>
             <p className="flex justify-between items-center">
               <span className="font-medium text-muted-foreground">Joined:</span> 
               <span>{createdAtFormatted}</span>
             </p>
          </div>
        </div>

        {/* Verification & Academic Info */}
        <div className="space-y-3">
          <h4 className="flex items-center text-lg font-semibold space-x-2 text-primary border-b pb-2 mb-3">
             <IconLicense className="w-5 h-5" />
             <span>Verification & Proof</span>
          </h4>
          <div className="space-y-3 text-sm">

               {/* Landlord ID Proof Status */}
             <p className="flex justify-between items-center">
               <span className="font-medium text-muted-foreground">Landlord ID Proof:</span> 
               {customLandlordProof ? (
                    <Badge variant="default" className="space-x-1"><IconCheck className="w-3 h-3"/> <span>Submitted</span></Badge>
               ) : (
                    <Badge variant="secondary" className="space-x-1"><IconX className="w-3 h-3"/> <span>Not Submitted</span></Badge>
               )}
             </p>

               {/* Conditionally Display Proof Image */}
               {customLandlordProof && (
                    <div className="pt-2">
                         <h5 className="font-semibold text-sm mb-2">Proof Document:</h5>
                         <div className="border rounded-lg overflow-hidden max-h-60">
                              <img 
                                  src={customLandlordProof} 
                                  alt={`Landlord Proof for ${fullName}`} 
                                  className="w-full h-auto object-cover max-h-60" 
                              />
                         </div>
                    </div>
               )}
               <Separator className="my-3"/>


             {/* <p className="flex justify-between items-center">
               <span className="font-medium text-muted-foreground">School/University:</span> 
               <span>{school}</span>
             </p>
             <p className="flex justify-between items-center">
               <span className="font-medium text-muted-foreground">Student ID:</span> 
               <span>{user.student_id ?? 'N/A'}</span>
             </p> */}
          </div>
      
        </div>

     </div>

     <DrawerFooter className="border-t p-4">
        {isPending ? (
             <Dialog open={isVerificationDialogOpen} onOpenChange={setIsVerificationDialogOpen}>
                  <DialogTrigger asChild>
                       <Button variant="default" className="w-full space-x-2">
                            <IconUserCheck className="w-4 h-4" /> 
                            <span>Verify Landlord</span>
                       </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px]">
                       <DialogHeader>
                            <DialogTitle>Verification Action for {fullName}</DialogTitle>
                            <DialogDescription>
                                 Choose to Approve the landlord's verification or request re-submission of proof.
                            </DialogDescription>
                       </DialogHeader>
                       <div className="grid gap-4 py-4">
                            <div className="space-y-2">
                                 <h5 className="text-base font-semibold flex items-center space-x-1 text-yellow-600">
                                     <IconMessage className="w-4 h-4"/> 
                                     <span>Request Re-upload (Message)</span>
                                 </h5>
                                 <Textarea 
                                        placeholder="Explain why the proof needs to be re-uploaded..." 
                                        className="resize-none" 
                                        value={rejectMessage}
                                        onChange={(e) => setRejectMessage(e.target.value)}
                                   />
                                   <Button 
                                        variant="secondary" 
                                        className="w-full"
                                        onClick={handleRejectProof}
                                        disabled={rejectMutation.isPending || !rejectMessage.trim()}
                                   >
                                      {rejectMutation.isPending ? 'Sending...' : 'Send Message & Reject Proof'}
                                 </Button>
                            </div>

                            <Separator />

                            <div className="space-y-2">
                                 <h5 className="text-base font-semibold flex items-center space-x-1 text-green-600">
                                     <IconCheck className="w-4 h-4"/> 
                                     <span>Approve Verification</span>
                                 </h5>

                                 <p className="text-sm text-muted-foreground">This will set the user's account status to 'landlord' (Verified).</p>
                            </div>
                       </div>
                       <DialogFooter>
                         <Button 
                                        onClick={handleVerifyLandlord}
                                        disabled={verifyMutation.isPending}
                                        variant="default"
                                        className="text-center"
                                   >
                                        {verifyMutation.isPending ? 'Verifying...' : 'Verify Landlord'}
                 </Button>
                         <Button onClick={() => setIsVerificationDialogOpen(false)} variant="outline">Cancel</Button>
                       </DialogFooter>
                  </DialogContent>
             </Dialog>
        ) : (
        // Action for Verified or other users (Suspend)
        <Dialog open={isSuspendDialogOpen} onOpenChange={setIsSuspendDialogOpen}>
            <DialogTrigger asChild>
                <Button variant="destructive" className="w-full space-x-2">
                    <IconBan className="w-4 h-4" />
                    <span>Suspend Account</span>
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle className="text-destructive">Confirm Suspension</DialogTitle>
                    <DialogDescription>
                        You are about to suspend the account of **{fullName}**. Select the duration below.
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
                            **Warning:** 'Forever' will permanently block access until manually lifted.
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
                        disabled={suspendMutation.isPending || !suspensionDuration}
                    >
                        {suspendMutation.isPending ? (
                            <>
                                <Loader2 className="h-4 w-4 animate-spin mr-2" /> Suspending...
                            </>
                        ) : (
                            <>
                                <IconBan className="w-4 h-4 mr-2" /> Suspend Account
                            </>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
        )}
       <DrawerClose asChild><Button variant="outline" className="w-full">Close Profile</Button></DrawerClose>
     </DrawerFooter>
    </DrawerContent>
   </Drawer>
  )
}

// ... (rest of the file remains unchanged below this point)
// -----------------------------
// Table Cell Viewer Component (UNCHANGED)
// -----------------------------
export function TableCellViewer<T extends { id: string }>({ item }: { item: T }) {
 return <span className="font-mono text-xs text-muted-foreground transition-colors hover:underline hover:text-primary">{item.id}</span>
}