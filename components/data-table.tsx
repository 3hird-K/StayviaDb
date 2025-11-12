"use client"

import * as React from "react"
import { useReactTable, flexRender, ColumnDef, Row, ColumnFiltersState, SortingState, VisibilityState, getCoreRowModel, getFilteredRowModel, getPaginationRowModel, getSortedRowModel, getFacetedRowModel, getFacetedUniqueValues } from "@tanstack/react-table"
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
// Removed Dnd-kit imports
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription, DrawerFooter, DrawerClose } from "./ui/drawer"
import { Badge } from "@/components/ui/badge" 
// Assuming these are available from your component library:
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar" 
import { IconMail, IconPhone, IconUserCircle, IconSchool, IconCheck, IconX, IconLicense, IconUserCheck, IconMessage } from "@tabler/icons-react" // For icons
// REMOVED: Card, CardHeader, CardContent, CardTitle imports
import { Separator } from "@/components/ui/separator"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog"
import { Textarea } from "./ui/textarea"
import { SiteHeader } from "./site-header"


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
export function DataTable<T extends { id: string; firstname?: string | null; lastname?: string | null; account_type?: string | null }>({ data = [], columns, title }: DataTableProps<T>) {
 const [rowSelection, setRowSelection] = React.useState({})
 const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
 const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
 const [sorting, setSorting] = React.useState<SortingState>([])
 const [pagination, setPagination] = React.useState({ pageIndex: 0, pageSize: 10 })
 const [statusFilter, setStatusFilter] = React.useState<string>("all") 
 const [selectedUser, setSelectedUser] = React.useState<T | null>(null)

 const table = useReactTable({
  data,
  columns,
  state: { sorting, columnVisibility, rowSelection, columnFilters, pagination },
  getRowId: (row) => row.id,
  enableRowSelection: true,
  onRowSelectionChange: setRowSelection,
  onSortingChange: setSorting,
  onColumnFiltersChange: setColumnFilters,
  onColumnVisibilityChange: setColumnVisibility,
  onPaginationChange: setPagination,
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
   <SiteHeader title="Manage Landlord" subtitle="Dashboard" />

   {/* Status Filter */}
   <div className="flex items-center justify-between gap-4 px-4 lg:px-6">
    <Label htmlFor="view-selector" className="sr-only">Filter by Status</Label>
    <Select value={statusFilter} onValueChange={setStatusFilter}>
     <SelectTrigger className="w-fit" size="sm">
      <SelectValue placeholder="Filter by Status" />
     </SelectTrigger>
     <SelectContent>
      <SelectItem value="all">All Landlords</SelectItem>
      {/* <SelectItem value="landlord">Verified</SelectItem> */}
      <SelectItem value="landlord_unverified">Pending</SelectItem>
     </SelectContent>
    </Select>
   </div>

   {/* Table */}
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
          <StandardRow key={row.id} row={row} onSelectUser={setSelectedUser} />
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

   {/* Drawer */}
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
}: {
 row: Row<T>
 onSelectUser: (user: T) => void
}) {
 return (
  <TableRow
   data-state={row.getIsSelected() && "selected"}
   className="cursor-pointer hover:bg-muted/50 transition-colors"
   onClick={() => onSelectUser(row.original)} // Clicking the row opens the drawer
  >
   {row.getVisibleCells().map((cell) => (
    <TableCell key={cell.id} className="pr-4">
     {flexRender(cell.column.columnDef.cell, cell.getContext())}
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
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);

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

 return (
  <Drawer direction="right" open={true} onOpenChange={(open) => { if (!open) onClose(); }}>
   <DrawerContent className="p-0">
   
    {/* Header Section: Avatar, Name, Status (UNCHANGED) */}
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
          <span>Verification & School</span>
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
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
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
                      {/* Option 1: Request Re-upload/Send Message */}
                      <div className="space-y-2">
                          <h5 className="text-base font-semibold flex items-center space-x-1 text-yellow-600">
                             <IconMessage className="w-4 h-4"/> 
                             <span>Request Re-upload (Message)</span>
                          </h5>
                          <Textarea placeholder="Explain why the proof needs to be re-uploaded..." className="resize-none" />
                          <Button variant="secondary" className="w-full">
                              Send Message & Reject Proof
                          </Button>
                      </div>
                      
                      <Separator />

                      {/* Option 2: Approve Verification */}
                      <div className="space-y-2">
                          <h5 className="text-base font-semibold flex items-center space-x-1 text-green-600">
                             <IconCheck className="w-4 h-4"/> 
                             <span>Approve Verification</span>
                          </h5>
                          <p className="text-sm text-muted-foreground">This will set the user's account status to 'landlord' (Verified).</p>
                      </div>
                  </div>
                  <DialogFooter>
                    <Button variant="default">Verify Landlord</Button>
                    <Button onClick={() => setIsDialogOpen(false)} variant="outline">Cancel</Button>
                  </DialogFooter>
              </DialogContent>
          </Dialog>
      ) : (
          <Button variant="default" className="w-full">Update User</Button> // Or 'Edit User' if not pending
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