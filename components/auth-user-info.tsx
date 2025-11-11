// components/auth-user-info.tsx
"use client";
import { LogoutButton } from "./logout-button";
import { ThemeSwitcher } from "./theme-switcher";

export function AuthUserInfo({ email }: { email: string | null }) {
  return (
    <div className="flex items-center gap-4">
      Hey, {email}!
      <LogoutButton />
      <ThemeSwitcher />
    </div>
  );
}
