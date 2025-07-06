"use client"

import { MessageCircle } from "lucide-react"
import { cn } from "@/lib/utils"

export function Logo({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <MessageCircle className="h-8 w-8 md:h-9 md:w-9 text-emerald-400 animate-pulse-glow" />
      <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-white">StatefulTalk</h1>
    </div>
  )
}
