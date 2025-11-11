"use client"

import { Separator } from "@/components/ui/separator"

interface SiteHeaderProps {
  title: string
  subtitle?: string
}

export function SiteHeader({ title, subtitle }: SiteHeaderProps) {
  return (
    <header className="flex h-16 items-center border-b bg-background/80 backdrop-blur-sm supports-[backdrop-filter]:bg-background/60 transition-all">
      <div className="flex w-full items-center gap-3 px-4 lg:px-6">
        {/* Vertical divider */}
        <Separator
          orientation="vertical"
          className="h-6 bg-muted-foreground/30"
        />

        {/* Title + Subtitle */}
       <h1 className="text-lg font-semibold tracking-tight">
              {title}
             <span className="hidden sm:inline text-muted-foreground font-normal">
               {" "}
               — {subtitle}
             </span>
           </h1>
      </div>
    </header>
  )
}