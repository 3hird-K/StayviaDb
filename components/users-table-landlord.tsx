"use client"

import { Database } from "@/database.types"
import { DataTable, TableCellViewer } from "./data-table-landlords" 
import { getAllLandlordsWithUnverified, Landlords, Landlords as SupabaseUser } from "@/lib/supabase/userService"
import { useQuery } from "@tanstack/react-query"
import { ColumnDef } from "@tanstack/react-table" 
import { Badge } from "./ui/badge"
import { IconCircleCheckFilled, IconLoader } from "@tabler/icons-react"
import { Skeleton } from "./ui/skeleton"

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


const DataTableSkeleton = () => (
    <div className="flex flex-col space-y-3 p-4 border rounded-lg">
        {/* Header/Filter placeholder */}
        <div className="flex justify-between items-center">
            <Skeleton className="h-8 w-40" />
            <div className="flex space-x-2">
                <Skeleton className="h-8 w-32" />
                <Skeleton className="h-8 w-24" />
            </div>
        </div>

        {/* Table Body rows */}
        <div className="space-y-3">
            {[...Array(10)].map((_, i) => ( // 10 rows of skeleton data
                <div key={i} className="grid grid-cols-7 gap-4 items-center p-3 border-b last:border-b-0">
                    <Skeleton className="h-4 w-24 col-span-2" /> 
                    <Skeleton className="h-4 w-20" /> 
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-4 w-32 col-span-1" />
                    <Skeleton className="h-6 w-16" />
                    <Skeleton className="h-4 w-24" />
                </div>
            ))}
        </div>
    </div>
);


export default function UsersTableLandlord() {
    const { data: usersData = [], isLoading, isError } = useQuery<LandlordsType[]>({
        queryKey: ["users", "landlord", "unverified"],
        queryFn: () => getAllLandlordsWithUnverified(), 
    })
    const normalizedUsers: Landlords[] = usersData.map((u) => ({
        ...u, 
        firstname: u.firstname ?? null,
        lastname: u.lastname ?? null,
    })) as Landlords[]

    const columns: ColumnDef<Landlords>[] = [
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
    
    // 🎯 UPDATED STATUS CELL WITH ICONS
    { 
        accessorKey: "account_type", 
        header: "Status",
        cell: ({ row }) => {
            const status = row.original.account_type;
            
            let statusText = "N/A";
            let variant: "default" | "secondary" | "destructive" | "outline" = "outline"; 
            let IconComponent = null;

            if (status === "landlord") {
                statusText = "Verified";
                variant = "default"; 
                // Green checkmark for verified
                IconComponent = <IconCircleCheckFilled className="w-4 h-4 mr-1.5" />;
            } else if (status === "landlord_unverified") {
                statusText = "Pending";
                variant = "secondary"; 
                // Spinning loader for pending
                IconComponent = <IconLoader className="w-4 h-4 mr-1.5 animate-spin" />;
            } else if (status) {
                statusText = status.charAt(0).toUpperCase() + status.slice(1);
                variant = "outline";
            }

            // Render a single Badge containing the icon and text
            return (
                <Badge variant={variant} className="space-x-1">
                    {IconComponent}
                    <span>{statusText}</span>
                </Badge>
            );
        }
    },
    
    { 
        accessorKey: "created_at", 
        header: "Created At",
        cell: ({ row }) => {
            const createdAt = row.original.created_at;
            if (!createdAt) {
                return <span className="text-muted-foreground">N/A</span>;
            }

            try {
                const date = new Date(createdAt);
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
                return <span className="text-muted-foreground">Invalid Date</span>;
            }
        }
    },
];

    if (isLoading) return <DataTableSkeleton />;
    if (isError) return <div>Failed to load users.</div>

    return <DataTable<Landlords> data={normalizedUsers} columns={columns} />
}