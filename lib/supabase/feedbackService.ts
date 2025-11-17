import { createClient } from "./client";
import { Database } from "@/database.types";

export type Feeds = Database["public"]["Tables"]["contact_support"]["Row"];
export type User = Database["public"]["Tables"]["users"]["Row"];


export type Feedbacks = Feeds & {
  users: User | null;
};

export async function getAllFeedbacks(): Promise<Feedbacks[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("contact_support")
    .select(`
      *,
      users(*)
`)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);

  return (data as Feedbacks[]) ?? [];
}
