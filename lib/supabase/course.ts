import { createClient } from "./client"

export type Course = {
  id: string
  name: string
}

// NOTE: No "courses" table exists in the current database schema.
// These are stubs to satisfy existing component imports.

export async function getAllCourse(): Promise<Course[]> {
  return []
}

export async function getCourseById(courseId: string): Promise<Course | null> {
  return null
}
