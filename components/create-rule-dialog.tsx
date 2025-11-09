"use client"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "./ui/textarea"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select"
import { getAllCourse } from "@/lib/supabase/course"
import { getUserCourse } from "@/lib/supabase/users"
import { Database } from "@/database.types"
import { toast } from "sonner"
import { createRule } from "@/lib/supabase/posts"

type User = Database["public"]["Tables"]["users"]["Row"]

export function CreateRuleDialog({ children, user }: { children: React.ReactNode; user?: User }) {
  const [open, setOpen] = useState(false)
  const [selectedCourse, setSelectedCourse] = useState<string>("")
  const [ruleName, setRuleName] = useState("")
  const [ruleCondition, setRuleCondition] = useState("")

  const queryClient = useQueryClient()

  if (!user) return null

  const isAdmin = user.role === "Admin" || user.role === "Admin/Instructor"
  const course_id = user.course_id

  const { data: courses, isLoading: coursesLoading } = useQuery({
    queryKey: ["courses"],
    queryFn: getAllCourse,
    enabled: isAdmin,
  })

  const { data: userCourse, isLoading: userCourseLoading } = useQuery({
    queryKey: ["users", course_id],
    queryFn: () => getUserCourse(course_id!),
    enabled: !isAdmin && !!course_id,
  })

  useEffect(() => {
    if (!isAdmin && userCourse?.id) {
      setSelectedCourse(userCourse.id)
    }
  }, [isAdmin, userCourse])

  const createRuleMutation = useMutation({
    mutationFn: () =>
      createRule({
        user_id: user.id,
        name: ruleName,
        description: ruleCondition,
      }),
    onSuccess: () => {
      toast.success("Rule created successfully", { position: "top-center" })
      queryClient.invalidateQueries({ queryKey: ["rules"] })
      setOpen(false)
      setRuleName("")
      setRuleCondition("")
    },
    onError: (err: any) => {
      toast.error("Failed to create rule: " + err.message, { position: "top-center" })
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedCourse || !ruleName || !ruleCondition) {
      toast.warning("Please fill out all fields", { position: "top-center" })
      return
    }

    createRuleMutation.mutate()
  }

  return (
    <Dialog  open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create a New Rule</DialogTitle>
          <DialogDescription>
            Fill out the details below to add a new rule to your system.
          </DialogDescription>
        </DialogHeader>

        <form className="grid gap-4 py-4" onSubmit={handleSubmit}>
          <div>
            <label className="text-sm font-medium">Course</label>
            {(isAdmin && coursesLoading) || (!isAdmin && userCourseLoading) ? (
              <p className="text-sm text-muted-foreground">Loading...</p>
            ) : (
              <Select onValueChange={setSelectedCourse} value={selectedCourse}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a course" />
                </SelectTrigger>
                <SelectContent className="w-full">
                  {isAdmin
                    ? courses?.map((course) => (
                        <SelectItem key={course.id} value={course.id}>
                          {course.name}
                        </SelectItem>
                      ))
                    : userCourse && (
                        <SelectItem value={userCourse.id}>
                          {userCourse.name}
                        </SelectItem>
                      )}
                </SelectContent>
              </Select>
            )}
          </div>

          <Input
            placeholder="Rule name"
            value={ruleName}
            onChange={(e) => setRuleName(e.target.value)}
          />
          <Textarea
            placeholder="Rule Condition here..."
            value={ruleCondition}
            onChange={(e) => setRuleCondition(e.target.value)}
          />

          <DialogFooter className="flex justify-between">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={createRuleMutation.isPending}>
              {createRuleMutation.isPending ? "Posting..." : "Post"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
