// components/CourseSelect.tsx
"use client"

import * as React from "react"
import { useQuery } from "@tanstack/react-query"

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { getAllCourse } from "@/lib/supabase/users"

interface CourseSelectProps {
  value: string
  onChange: (value: string) => void
  required?: boolean
}

export function CourseSelect({ value, onChange, required }: CourseSelectProps) {
  const { data: courses = [], isLoading } = useQuery({
    queryKey: ["courses"],
    queryFn: getAllCourse,
  })

  return (
    <Select
      value={value}
      onValueChange={onChange}
      required={required}
      disabled={isLoading}
    >
      <SelectTrigger className="w-full">
        <SelectValue placeholder={isLoading ? "Loading..." : "Select Course"} />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>Course</SelectLabel>
          {courses.map((course: any) => (
            <SelectItem key={course.id} value={course.id}>
              {course.name}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  )
}
