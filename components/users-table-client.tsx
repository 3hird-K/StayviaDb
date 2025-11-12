"use client"

import { Database } from "@/database.types"
import { DataTable, TableCellViewer } from "./data-table" 
import { getAllLandlordsWithUnverified, Landlords as SupabaseUser } from "@/lib/supabase/userService"
import { useQuery } from "@tanstack/react-query"
import { ColumnDef } from "@tanstack/react-table" 
import { Badge } from "./ui/badge"

// The Landlords type you provided. Since this comes from the 'users' table, 
// we should align the local 'User' type with it.
type LandlordsType = {
    account_type: string | null;
    avatar: string | null;
    contact: number | null;
    created_at: string | null;
    email: string;
    firstname: string | null;
    id: string;
    landlord_proof_id: string | null;
    lastname: string | null;
    online: boolean | null;
    school: string | null;
    student_id: number | null;
    username: string | null;
}

// Ensure 'User' is strictly defined as the row from the 'users' table
// If your Database["public"]["Tables"]["users"]["Row"] is exactly LandlordsType, this is fine.
type User = Database["public"]["Tables"]["users"]["Row"]


export default function UsersTableClient() {
    // FIX 1: The queryFn must be a function that returns a Promise, not the function itself.
    // Also, tell useQuery that the data is of type LandlordsType[] (the expected return of the service function)
    const { data: usersData = [], isLoading, isError } = useQuery<LandlordsType[]>({
        queryKey: ["users", "landlord", "unverified"],
        queryFn: () => getAllLandlordsWithUnverified(), // <-- Corrected function call
    })
    const normalizedUsers: User[] = usersData.map((u) => ({
        ...u, 
        firstname: u.firstname ?? null,
        lastname: u.lastname ?? null,
    })) as User[]

    const columns: ColumnDef<User>[] = [
    {
        accessorKey: "id",
        header: "Id",
        cell: ({ row }) => <TableCellViewer item={row.original} />,
    },
    { accessorKey: "username", header: "Username" },
    { accessorKey: "firstname", header: "First Name" },
    { accessorKey: "lastname", header: "Last Name" },
    { accessorKey: "email", header: "Email" },
    { accessorKey: "contact", header: "Contact" },
    
    { 
        accessorKey: "account_type", 
        header: "Status",
        cell: ({ row }) => {
            const status = row.original.account_type;
            
            let statusText = "N/A";
            let variant: "default" | "secondary" | "destructive" | "outline" = "outline"; // Default variant

            if (status === "landlord") {
                statusText = "Verified";
                variant = "default"; 
            } else if (status === "landlord_unverified") {
                statusText = "Pending";
                variant = "secondary"; 
            } else if (status === "admin" || status === "student") {
                statusText = status.charAt(0).toUpperCase() + status.slice(1);
                variant = "outline";
            }

            return <Badge variant={variant}>{statusText}</Badge>;
        }
    },
    
    // 🎯 CREATED_AT FIX: Format the date string into a readable format
    { 
        accessorKey: "created_at", 
        header: "Created At",
        cell: ({ row }) => {
            const createdAt = row.original.created_at;
            if (!createdAt) {
                return <span className="text-muted-foreground">N/A</span>;
            }

            try {
                // Parse the ISO string and format it
                const date = new Date(createdAt);
                
                // Options for date and time display
                const options: Intl.DateTimeFormatOptions = {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                };

                return (
                    <span className="text-sm">
                        {new Intl.DateTimeFormat('en-US', options).format(date)}
                    </span>
                );

            } catch (e) {
                // Fallback for invalid date string
                return <span className="text-muted-foreground">Invalid Date</span>;
            }
        }
    },
];

    if (isLoading) return <div>Loading users...</div>
    if (isError) return <div>Failed to load users.</div>

    return <DataTable<User> data={normalizedUsers} columns={columns} />
}