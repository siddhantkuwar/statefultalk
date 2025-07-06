"use client"

import type React from "react"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { cn } from "@/lib/utils"

interface AnimatedLinkProps {
  href: string
  children: React.ReactNode
  className?: string
  transitionText?: string
  onClick?: () => void
}

export function AnimatedLink({ href, children, className, transitionText = "Loading...", onClick }: AnimatedLinkProps) {
  const router = useRouter()
  const [isClicked, setIsClicked] = useState(false)

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault()

    if (onClick) {
      onClick()
    }

    setIsClicked(true)

    // Start the page transition
    if ((window as any).startPageTransition) {
      ;(window as any).startPageTransition(transitionText)
    }

    // Navigate after a short delay to show the animation
    setTimeout(() => {
      router.push(href)
    }, 300)
  }

  return (
    <Link
      href={href}
      onClick={handleClick}
      className={cn("transition-all duration-300", isClicked && "scale-95 opacity-80", className)}
    >
      {children}
    </Link>
  )
}
