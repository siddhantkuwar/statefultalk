"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { MessageCircle, Sparkles } from "lucide-react"

interface PageTransitionProps {
  children: React.ReactNode
}

export function PageTransition({ children }: PageTransitionProps) {
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [transitionText, setTransitionText] = useState("")
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    const handleRouteChange = () => {
      setIsTransitioning(false)
    }

    // Listen for route changes
    handleRouteChange()
  }, [pathname])

  const startTransition = (text = "Loading...") => {
    setTransitionText(text)
    setIsTransitioning(true)
  }

  // Expose the startTransition function globally
  useEffect(() => {
    ;(window as any).startPageTransition = startTransition
  }, [])

  return (
    <>
      {children}

      {/* Transition Overlay */}
      <div
        className={cn(
          "fixed inset-0 z-[9999] flex items-center justify-center transition-all duration-700 ease-in-out",
          "bg-gradient-to-br from-black via-gray-900 to-emerald-900",
          isTransitioning ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none",
        )}
      >
        {/* Animated Background */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 via-yellow-500/10 to-emerald-500/10 animate-gradient-shift" />

          {/* Floating Particles */}
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 bg-emerald-400/30 rounded-full animate-float"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${3 + Math.random() * 4}s`,
              }}
            />
          ))}
        </div>

        {/* Content */}
        <div className="relative z-10 text-center space-y-8">
          {/* Logo Animation */}
          <div className="flex items-center justify-center gap-4">
            <MessageCircle className="h-16 w-16 text-emerald-400 animate-pulse-glow" />
            <div className="text-4xl font-bold text-white">
              <span className="bg-gradient-to-r from-emerald-400 via-yellow-400 to-emerald-300 bg-clip-text text-transparent">
                StatefulTalk
              </span>
            </div>
          </div>

          {/* Loading Animation */}
          <div className="space-y-4">
            <div className="flex items-center justify-center gap-2">
              <Sparkles className="h-6 w-6 text-yellow-400 animate-spin" />
              <span className="text-xl text-gray-300">{transitionText}</span>
              <Sparkles className="h-6 w-6 text-emerald-400 animate-spin" style={{ animationDirection: "reverse" }} />
            </div>

            {/* Progress Bar */}
            <div className="w-64 h-1 bg-gray-800 rounded-full overflow-hidden mx-auto">
              <div className="h-full bg-gradient-to-r from-emerald-400 to-yellow-400 rounded-full animate-pulse origin-left transform scale-x-0 animate-[scale-x_1.5s_ease-in-out_forwards]" />
            </div>
          </div>

          {/* Subtitle */}
          <p className="text-gray-400 text-lg animate-pulse">Preparing your AI companions...</p>
        </div>

        {/* Ripple Effect */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-32 h-32 border-2 border-emerald-400/30 rounded-full animate-ping" />
          <div
            className="absolute w-48 h-48 border-2 border-yellow-400/20 rounded-full animate-ping"
            style={{ animationDelay: "0.5s" }}
          />
          <div
            className="absolute w-64 h-64 border-2 border-emerald-400/10 rounded-full animate-ping"
            style={{ animationDelay: "1s" }}
          />
        </div>
      </div>
    </>
  )
}
