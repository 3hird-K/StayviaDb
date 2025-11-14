import { createClient } from "./client";
import { Database } from "@/database.types";

export type Posts = Database["public"]["Tables"]["posts"]["Row"];
export type User = Database["public"]["Tables"]["users"]["Row"];
export type Request = Database["public"]["Tables"]["requests"]["Row"];

export type PostWithUserAndRequests = Posts & {
  users: User | null;
  requests: Request[]; // 👈 include requests for badge/status logic
};

export async function getAllPosts(): Promise<PostWithUserAndRequests[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("posts")
    .select(`
      *,
      users(*),
      requests(*)
    `) // 👈 join users and requests
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);

  return (data as PostWithUserAndRequests[]) ?? [];
}

// Optional: fetch all requests independently if needed elsewhere
export async function getAllRequest(): Promise<Request[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("requests")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);

  return (data as Request[]) ?? [];
}
