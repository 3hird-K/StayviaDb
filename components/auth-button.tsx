// components/auth-button.tsx
import Link from "next/link";
import { Button } from "./ui/button";
import { createClient } from "@/lib/supabase/server";
import { LogoutButton } from "./logout-button";
import { ThemeSwitcher } from "./theme-switcher";
import { AuthUserInfo } from "./auth-user-info";

export async function AuthButton() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getClaims();
  const user = data?.claims;
  const email = user?.email ?? null;

  if (!user) {
    return (
      <div className="flex gap-2">
        <Button asChild size="sm" variant="outline">
          <Link href="/auth/login">Sign in</Link>
        </Button>
        <Button asChild size="sm" variant="default">
          <Link href="/auth/sign-up">Contact</Link>
        </Button>
        <ThemeSwitcher />
      </div>
    );
  }
  
  // console.log(email)
  // Pass the email down to the client component
  return <AuthUserInfo email={email} />;
}
