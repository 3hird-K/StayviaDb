import { createClient } from "./client"

// NOTE: No "departments" table exists in the current database schema.
// This is a stub to satisfy existing component imports.

export type Department = {
  id: string
  name: string
}

export async function getAllDeparments(): Promise<Department[]> {
  return []
}
