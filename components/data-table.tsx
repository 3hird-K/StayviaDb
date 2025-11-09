"use client"

import * as React from "react"
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/ui/tabs"
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu"
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"

import {
  IconChevronDown,
  IconLayoutColumns,
  IconChevronsLeft,
  IconChevronLeft,
  IconChevronRight,
  IconChevronsRight,
  IconGripVertical,
} from "@tabler/icons-react"

import {
  DndContext,
  closestCenter,
  DragEndEvent,
} from "@dnd-kit/core"
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import {
  restrictToVerticalAxis,
} from "@dnd-kit/modifiers"

import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  ColumnDef,
  Row,
} from "@tanstack/react-table"
import z from "zod"

import { MouseSensor, TouchSensor, KeyboardSensor, useSensors, useSensor } from "@dnd-kit/core"
import { UniqueIdentifier } from "@dnd-kit/core"
import { EditUserDialog } from "./edit-users-dialog"
import { AdminRegisterDialog } from "./admin-register"
import { useQuery } from "@tanstack/react-query"
import { getAllCourse } from "@/lib/supabase/course"
import { CSS } from "@dnd-kit/utilities"
import { useIsMobile } from "@/hooks/use-mobile"
import { Drawer, DrawerClose, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle, DrawerTrigger } from "./ui/drawer"
import { ChartViewer } from "./chart-viewer"
import { ChartConfig } from "./ui/chart"
import { CourseInfo } from "./course-info"
import { Database } from "@/database.types"

export const schema = z.object({
    id: z.string(),
    firstname: z.string(),
    lastname: z.string(),
    role: z.string(),
    email: z.string(),
    created_at: z.string().nullable(),
    course_id: z.string().nullable(),
    avatar_url: z.string().nullable(),
    updated_at: z.string().nullable(),
  })
export type User = z.infer<typeof schema>

type Users = Database["public"]["Tables"]["users"]["Row"]


const chartData = [
  { month: "January", desktop: 186, mobile: 80 },
  { month: "February", desktop: 305, mobile: 200 },
  { month: "March", desktop: 237, mobile: 120 },
  { month: "April", desktop: 73, mobile: 190 },
  { month: "May", desktop: 209, mobile: 130 },
  { month: "June", desktop: 214, mobile: 140 },
]

const chartConfig = {
  desktop: {
    label: "Desktop",
    color: "var(--primary)",
  },
  mobile: {
    label: "Mobile",
    color: "var(--primary)",
  },
} satisfies ChartConfig

// ===============================
// Reusable DataTable Component
// ===============================
export function DataTable({ data }: { data: User[] }) {
  // Table states
  const [rowSelection, setRowSelection] = React.useState({})
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [pagination, setPagination] = React.useState({ pageIndex: 0, pageSize: 10 })

  const sortableId = React.useId()
  const sensors = useSensors(
    useSensor(MouseSensor),
    useSensor(TouchSensor),
    useSensor(KeyboardSensor)
  )

  const dataIds = React.useMemo<UniqueIdentifier[]>(() => data?.map(({ id }) => id) || [], [data])

  const [roleFilter, setRoleFilter] = React.useState<string>("all")

  const table = useReactTable({
    data,
    columns,
    state: { sorting, columnVisibility, rowSelection, columnFilters, pagination },
    getRowId: (row) => row.id.toString(),
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
  })

  // Role filter effect
  React.useEffect(() => {
    if (roleFilter === "all") {
      table.setColumnFilters([])
    } else {
      table.setColumnFilters([{ id: "role", value: roleFilter }])
    }
  }, [roleFilter])

  // Drag & Drop reorder handler
  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) return
    // ⚡ Add reordering logic if needed
  }

  return (
    <Tabs defaultValue="instructor" className="w-full flex-col justify-start gap-6">
      {/* Header Controls */}
      <div className="flex items-center justify-between px-4 lg:px-6">
        <Label htmlFor="view-selector" className="sr-only">View</Label>

        {/* Mobile role filter */}
        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger className="flex w-fit @4xl/main:hidden" size="sm">
            <SelectValue placeholder="Select a role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="instructor">Instructor</SelectItem>
            <SelectItem value="student">Student</SelectItem>
            <SelectItem value="admin">Admin</SelectItem>
            <SelectItem value="admin/instructor">Admin/Instructor</SelectItem>
          </SelectContent>
        </Select>

        {/* Desktop tabs */}
        <TabsList className="hidden @4xl/main:flex">
          <TabsTrigger value="instructor">Instructor</TabsTrigger>
          <TabsTrigger value="student">Student</TabsTrigger>
          <TabsTrigger value="key-personnel">Admin</TabsTrigger>
        </TabsList>

        {/* Column filter + Admin register */}
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <IconLayoutColumns />
                <span className="hidden lg:inline">Filter Columns</span>
                <span className="lg:hidden">Columns</span>
                <IconChevronDown />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              {table.getAllColumns()
                .filter((col) => typeof col.accessorFn !== "undefined" && col.getCanHide())
                .map((col) => (
                  <DropdownMenuCheckboxItem
                    key={col.id}
                    checked={col.getIsVisible()}
                    onCheckedChange={(val) => col.toggleVisibility(!!val)}
                  >
                    {col.id}
                  </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <AdminRegisterDialog />
        </div>
      </div>

      {/* Table Content */}
      <TabsContent value="instructor" className="relative flex flex-col gap-4 overflow-auto px-4 lg:px-6">
        <div className="overflow-hidden rounded-lg border">
          <DndContext
            collisionDetection={closestCenter}
            modifiers={[restrictToVerticalAxis]}
            onDragEnd={handleDragEnd}
            sensors={sensors}
            id={sortableId}
          >
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
                  <SortableContext items={dataIds} strategy={verticalListSortingStrategy}>
                    {table.getRowModel().rows.map((row) => (
                      <DraggableRow key={row.id} row={row} />
                    ))}
                  </SortableContext>
                ) : (
                  <TableRow>
                    <TableCell colSpan={columns.length} className="h-24 text-center">
                      No data found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </DndContext>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-4">
          <div className="text-muted-foreground hidden flex-1 text-sm lg:flex">
            {table.getFilteredSelectedRowModel().rows.length} of {table.getFilteredRowModel().rows.length} row(s) selected.
          </div>
          <div className="flex w-full items-center gap-8 lg:w-fit">
            {/* Rows per page */}
            <div className="hidden items-center gap-2 lg:flex">
              <Label htmlFor="rows-per-page" className="text-sm font-medium">Rows per page</Label>
              <Select value={`${table.getState().pagination.pageSize}`} onValueChange={(val) => table.setPageSize(Number(val))}>
                <SelectTrigger size="sm" className="w-20" id="rows-per-page">
                  <SelectValue placeholder={table.getState().pagination.pageSize} />
                </SelectTrigger>
                <SelectContent side="top">
                  {[10, 20, 30, 40, 50].map((pageSize) => (
                    <SelectItem key={pageSize} value={`${pageSize}`}>{pageSize}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Page info */}
            <div className="flex items-center justify-center text-sm font-medium">
              Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
            </div>

            {/* Page controls */}
            <div className="ml-auto flex items-center gap-2 lg:ml-0">
              <Button variant="outline" size="icon" onClick={() => table.setPageIndex(0)} disabled={!table.getCanPreviousPage()}>
                <IconChevronsLeft />
              </Button>
              <Button variant="outline" size="icon" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>
                <IconChevronLeft />
              </Button>
              <Button variant="outline" size="icon" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
                <IconChevronRight />
              </Button>
              <Button variant="outline" size="icon" onClick={() => table.setPageIndex(table.getPageCount() - 1)} disabled={!table.getCanNextPage()}>
                <IconChevronsRight />
              </Button>
            </div>
          </div>
        </div>
      </TabsContent>

      {/* Other tabs (placeholders for now) */}
      {/* <TabsContent value="student" className="px-4 lg:px-6">Student view</TabsContent>
      <TabsContent value="key-personnel" className="px-4 lg:px-6">Admin view</TabsContent> */}
    </Tabs>
  )
}


const columns: ColumnDef<User>[] = [
  {
    id: "drag",
    header: () => null,
    cell: ({ row }) => <DragHandle id={row.original.id} />,
  },
  {
    accessorKey: "id",
    header: "Account #",
    cell: ({ row }) => {
      return <TableCellViewer item={row.original} />
    },
    enableHiding: false,
  },
  {
    accessorKey: "course_id",
    header: "Course",
    enableHiding: true,
    cell: ({ row }) => {
      const courseId = row.original.course_id

      const { data: courses = [], isLoading } = useQuery({
        queryKey: ["courses"],
        queryFn: getAllCourse,
      })

      if (isLoading) return <span>Loading...</span>

      const course = courses.find((c) => c.id === courseId)
      return course ? course.name : "Not Enrolled"
    },
  },

  {
    accessorKey: "role",
    header: "Type",
    enableHiding: true,
  },
  {
    accessorKey: "firstname",
    header: "Firstname",
    enableHiding: true,
  },
  {
    accessorKey: "lastname",
    header: "Lastname",
    enableHiding: true,
  },
  {
    accessorKey: "email",
    header: "Email",
    enableHiding: true,
  },
  {
  accessorKey: "created_at",
  header: "Created At",
  enableHiding: true,
  cell: ({ row }) => {
    const rawDate = row.original.created_at
    if (!rawDate) return "N/A"

    const date = new Date(rawDate)
    return date.toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  },
},
{
  id: "actions",
  cell: ({ row }) => {
    return <EditUserDialog user={row.original} />
  },
}
]

function DraggableRow({ row }: { row: Row<User> }) {
  const { transform, transition, setNodeRef, isDragging } = useSortable({
    id: row.original.id,
  })

  return (
    <TableRow
      data-state={row.getIsSelected() && "selected"}
      data-dragging={isDragging}
      ref={setNodeRef}
      className="relative z-0 data-[dragging=true]:z-10 data-[dragging=true]:opacity-80"
      style={{
        transform: CSS.Transform.toString(transform),
        transition: transition,
      }}
    >
      {row.getVisibleCells().map((cell, index) => (
        <TableCell
          key={cell.id}
          className={index === 0 ? "sticky left-0 z-10 bg-background" : ""}
        >
          {flexRender(cell.column.columnDef.cell, cell.getContext())}
        </TableCell>
      ))}

    </TableRow>
  )
}



function DragHandle({ id }: { id: string }) {
  const { attributes, listeners } = useSortable({
    id,
  })

  return (
    <Button
    {...attributes}
    {...listeners}
      variant="ghost"
      size="icon"
      className="text-muted-foreground size-7 hover:bg-transparent"
    >
      <IconGripVertical className="text-muted-foreground size-3" />
      <span className="sr-only">Drag to reorder</span>
    </Button>
  )
}


function TableCellViewer({ item }: { item: User }) {
  const isMobile = useIsMobile()
  function toCapitalize(str?: string) {
    if (!str) return ""
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
  }

  return (
    <Drawer direction={isMobile ? "bottom" : "right"}>
      <DrawerTrigger asChild>
        <Button variant="link" className="text-foreground w-fit px-0 text-left">
          {item.id}
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader className="gap-1">
          <DrawerTitle>
            {toCapitalize(item.lastname)} {toCapitalize(item.firstname)}
          </DrawerTitle>
          <DrawerDescription>Showing Account Info</DrawerDescription>
        </DrawerHeader>

        <div className="flex flex-col gap-4 overflow-y-auto px-4 text-sm">
          {!isMobile && (
            <ChartViewer
              data={chartData}
              config={chartConfig}
              title="GoogleMeet Attendance"
              description="Student log and activeness on online class meetings."
            />
          )}

          {/* Account Info Display */}
          <div className="grid gap-5">
            <div>
              <Label className="mb-1 text-muted-foreground">Account Type</Label>
              <p className="font-medium capitalize">{item.role}</p>
            </div>
            <div>
                  <CourseInfo user={item}/>
            </div>
          </div>
        </div>

        <DrawerFooter>
          <DrawerClose asChild>
            <Button variant="outline">Back</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}