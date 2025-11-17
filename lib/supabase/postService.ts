import { createClient } from "./client";
import { Database } from "@/database.types";

export type Posts = Database["public"]["Tables"]["posts"]["Row"];
export type User = Database["public"]["Tables"]["users"]["Row"];
export type Request = Database["public"]["Tables"]["requests"]["Row"];

export type PostWithUserAndRequests = Posts & {
  users: User | null;
  requests: Request[]; 
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

// 🆕 NEW FUNCTION TO GET A SINGLE POST BY ID 
export async function getPostById(postId: string): Promise<PostWithUserAndRequests | null> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("posts")
    .select(`
      *,
      users(*),
      requests(*)
    `) 
    .eq('id', postId)
    .single(); 

  if (error && error.code !== 'PGRST116') { 
    throw new Error(error.message);
  }

  // If data is null, or no rows were found, return null
  if (!data) return null;

  return data as PostWithUserAndRequests;
}

// 🆕 NEW FUNCTION TO DELETE A POST 
export async function deletePost(postId: string): Promise<void> {
  const supabase = createClient();

  const { error } = await supabase
    .from("posts")
    .delete()
    .eq("id", postId);

  if (error) throw new Error(`Failed to delete post with ID ${postId}: ${error.message}`);
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