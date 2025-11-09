"use server";
import { createAdminClient } from "./server";

export async function deleteAuthUser(userId: string) {
  const supabaseAdmin = createAdminClient();

  const { error } = await supabaseAdmin.auth.admin.deleteUser(userId);

  if (error) throw new Error(error.message);

  return { success: true };
}
