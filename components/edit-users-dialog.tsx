"use client"

import * as React from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { updateUser, deleteUser, getAllCourse } from "@/lib/supabase/users"
import { deleteAuthUser } from "@/lib/supabase/server-api"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog"
import { Input } from "./ui/input"
import { Label } from "./ui/label"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "./ui/select"
import { Button } from "./ui/button"
import { toast } from "sonner"
import { Database } from "@/database.types"


type User = Database["public"]["Tables"]["users"]["Row"]


export function EditUserDialog({ user }: { user: User }) {
  const queryClient = useQueryClient()
  const [openEdit, setOpenEdit] = React.useState(false)
  const [openDelete, setOpenDelete] = React.useState(false)
  const [firstname, setFirstname] = React.useState(user.firstname || "")
  const [lastname, setLastname] = React.useState(user.lastname || "")
  const [role, setRole] = React.useState(user.role || "")
  const [selectedCourse, setSelectedCourse] = React.useState(user.course_id || "")
  const [error, setError] = React.useState<string | null>(null)

  // ✅ Fetch courses
  const { data: courses = [], isLoading: coursesLoading } = useQuery({
    queryKey: ["courses"],
    queryFn: getAllCourse,
  })

  // ✅ Update mutation
  const updateMutation = useMutation({
    mutationFn: async () => updateUser(user.id, {
      firstname,
      lastname,
      role,
      course_id: selectedCourse,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] })
      queryClient.invalidateQueries({ queryKey: ["users", user.id] })
      setOpenEdit(false)
      toast.success("User updated successfully", {
        description: `${firstname} ${lastname} has been updated.`,
        position: "top-center"
      })
    },
    onError: (err: any) => {
      setError(err.message || "Failed to update user")
      toast.error("Failed to update user", {
        description: err.message || "Something went wrong.",
        position: "top-center",
      })
    },
  })

  // ✅ Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async () => {
      await deleteUser(user.id)
      await deleteAuthUser(user.id)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] })
      queryClient.invalidateQueries({ queryKey: ["courses"] })
      setOpenDelete(false)
      toast.success("User deleted successfully", {
        description: `${firstname} ${lastname} has been removed.`,
        position: "top-center"
      })
    },
    onError: (err: any) => {
      setError(err.message || "Failed to delete user")
      toast.error("Failed to delete user", {
        description: err.message || "Something went wrong.",
        position: "top-center"
      })
    },
  })

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    updateMutation.mutate()
  }

  return (
    <>
      {/* Edit Dialog */}
      <Dialog open={openEdit} onOpenChange={setOpenEdit}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit profile</DialogTitle>
            <DialogDescription>Update the account details below.</DialogDescription>
          </DialogHeader>

          <form onSubmit={handleUpdate} className="grid gap-4">
            <div className="flex flex-row justify-between gap-2">
              <div className="grid gap-3">
                <Label htmlFor="firstname">Firstname</Label>
                <Input
                  id="firstname"
                  value={firstname}
                  onChange={(e) => setFirstname(e.target.value)}
                  required
                />
              </div>
              <div className="grid gap-3">
                <Label htmlFor="lastname">Lastname</Label>
                <Input
                  id="lastname"
                  value={lastname}
                  onChange={(e) => setLastname(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="role">Role</Label>
              <Select value={role} onValueChange={setRole} required>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Account type</SelectLabel>
                    <SelectItem value="Student">Student</SelectItem>
                    <SelectItem value="Instructor">Instructor</SelectItem>
                    <SelectItem value="Admin">Administrator</SelectItem>
                    <SelectItem value="Admin/Instructor">Admin/Instructor</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="course">Course</Label>
              <Select
                value={selectedCourse}
                onValueChange={(value) => setSelectedCourse(value)}
                required
                disabled={coursesLoading}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder={coursesLoading ? "Loading..." : "Select Course"} />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Course</SelectLabel>
                    {courses.map((course) => (
                      <SelectItem key={course.id} value={course.id}>
                        {course.name}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>

            {error && (
              <p className="text-sm text-red-500 bg-red-50 border border-red-200 rounded-lg p-2">
                {error}
              </p>
            )}

            <DialogFooter className="flex justify-between">
              <DialogClose asChild>
                <Button variant="outline">Cancel</Button>
              </DialogClose>
              <Button type="submit" disabled={updateMutation.isPending}>
                {updateMutation.isPending ? "Updating..." : "Save changes"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={openDelete} onOpenChange={setOpenDelete}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Delete User</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete <span className="font-medium">{firstname} {lastname}</span>? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex justify-between">
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button
              variant="destructive"
              onClick={() => deleteMutation.mutate()}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Buttons to open dialogs */}
      <div className="flex gap-2">
        <Button variant="outline" size="sm" onClick={() => setOpenEdit(true)}>
          Edit
        </Button>
        <Button variant="destructive" size="sm" onClick={() => setOpenDelete(true)}>
          Delete
        </Button>
      </div>
    </>
  )
}
