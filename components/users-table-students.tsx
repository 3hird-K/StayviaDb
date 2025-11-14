"use client"

import { Database } from "@/database.types"
import { DataTable, TableCellViewer } from "./data-table-students" 
import { getAllStudent, Landlords as SupabaseUser } from "@/lib/supabase/userService"
import { useQuery } from "@tanstack/react-query"
import { ColumnDef } from "@tanstack/react-table" 
import { Badge } from "./ui/badge"
import { Skeleton } from "./ui/skeleton"

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

type User = Database["public"]["Tables"]["users"]["Row"]


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
                    {/* ID/Username */}
                    <Skeleton className="h-4 w-24 col-span-2" /> 
                    {/* First Name */}
                    <Skeleton className="h-4 w-20" /> 
                    {/* Last Name */}
                    <Skeleton className="h-4 w-20" />
                    {/* Email/Contact */}
                    <Skeleton className="h-4 w-32 col-span-1" />
                    {/* Status */}
                    <Skeleton className="h-6 w-16" />
                    {/* Created At */}
                    <Skeleton className="h-4 w-24" />
                </div>
            ))}
        </div>
    </div>
);


export default function UsersTableStudents() {

    const { data: usersData = [], isLoading, isError } = useQuery<LandlordsType[]>({
        queryKey: ["users", "students"],
        queryFn: getAllStudent, 
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
    { accessorKey: "student_id", header: "StudentId",
        cell: ({ row }) => (
      <div className="w-32">
        <Badge variant="outline" className="text-muted-foreground px-1.5">
          {row.original.student_id}
        </Badge>
      </div>
    ),
    },
    { accessorKey: "username", header: "Username" },
    { accessorKey: "firstname", header: "First Name" },
    { accessorKey: "lastname", header: "Last Name" },
    { accessorKey: "email", header: "Email" },
    { accessorKey: "contact", header: "Contact" },
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

    return <>
        <DataTable<User> data={normalizedUsers} columns={columns} />
        
    </>
}