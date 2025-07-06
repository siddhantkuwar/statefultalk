"use client"

import type React from "react"
import Link from "next/link"
import Image from "next/image"
import { CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import type { Character } from "@/lib/types"
import { useLetta } from "@/hooks/use-letta"
import { useToast } from "@/components/ui/use-toast"
import { RefreshCw, Loader2, MessageSquarePlus, BrainCircuit, Lock } from "lucide-react"
import { useState } from "react"
import { cn } from "@/lib/utils"

interface CharacterCardProps {
  character: Character
  agentId: string | undefined
  onAgentReset: () => Promise<void>
  isProfileLoading: boolean
  apiKey: string | null
}

export function CharacterCard({ character, agentId, onAgentReset, isProfileLoading, apiKey }: CharacterCardProps) {
  const { client } = useLetta()
  const { toast } = useToast()
  const [isResetting, setIsResetting] = useState(false)
  const isInteractive = !!apiKey

  const handleResetAgent = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (!agentId || !client) {
      toast({
        title: "Cannot Reset",
        description: "Agent ID or Letta client is not available.",
        variant: "destructive",
      })
      return
    }
    setIsResetting(true)
    try {
      await client.agents.delete(agentId)
      toast({ title: "Agent Reset", description: `${character.name}'s agent has been deleted.` })
      await onAgentReset()
    } catch (error: any) {
      toast({
        title: "Reset Failed",
        description: error.message || "Could not reset the agent.",
        variant: "destructive",
      })
    } finally {
      setIsResetting(false)
    }
  }

  const CardBody = ({ children }: { children: React.ReactNode }) => (
    <div
      className={cn(
        "relative flex flex-col bg-gray-800/60 backdrop-blur-sm border border-emerald-600/20 shadow-xl rounded-xl overflow-hidden group h-full cursor-pointer",
        "transform-gpu will-change-transform transition-transform duration-300 ease-out",
        isInteractive ? "hover:scale-[1.02] hover:-translate-y-1" : "cursor-not-allowed saturate-50 opacity-70",
      )}
      style={{
        backfaceVisibility: "hidden",
        perspective: "1000px",
      }}
    >
      {children}
    </div>
  )

  return (
    <CardBody>
      {/* Main Image Container */}
      <div className="relative overflow-hidden h-64 transform-gpu will-change-transform">
        <Image
          src={character.profilePicture || `/placeholder.svg?width=400&height=300&query=${character.name}+portrait`}
          alt={character.name}
          width={400}
          height={300}
          className={cn(
            "w-full h-full object-cover transform-gpu will-change-transform transition-transform duration-300 ease-out",
            isInteractive ? "group-hover:scale-105" : "grayscale-[85%]",
          )}
          style={{ backfaceVisibility: "hidden" }}
        />

        {/* Optimized gradient overlay */}
        <div
          className="absolute inset-0 transition-opacity duration-300 ease-out"
          style={{
            background: "linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.1) 50%, transparent 100%)",
            willChange: "opacity",
          }}
        />
        <div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 ease-out"
          style={{
            background: "linear-gradient(to top, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.6) 70%, rgba(0,0,0,0.3) 100%)",
            willChange: "opacity",
          }}
        />

        {/* Reset button - GPU accelerated */}
        {isInteractive && agentId && (
          <Button
            variant="ghost"
            size="icon"
            onClick={handleResetAgent}
            disabled={isResetting || isProfileLoading}
            className="absolute top-2 right-2 z-20 h-7 w-7 bg-black/40 hover:bg-red-600/80 text-white rounded-full transform-gpu will-change-transform transition-all duration-200 ease-out opacity-0 group-hover:opacity-100 hover:scale-110"
            aria-label="Reset Agent"
            style={{ backfaceVisibility: "hidden" }}
          >
            {isResetting ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
          </Button>
        )}

        {/* Status badge - GPU accelerated */}
        {isInteractive && (
          <div
            className="absolute top-2 left-2 z-20 transform-gpu will-change-transform transition-all duration-200 ease-out opacity-0 group-hover:opacity-100"
            style={{ backfaceVisibility: "hidden" }}
          >
            {agentId ? (
              <Badge
                variant="outline"
                className="text-xs border-emerald-500/70 text-emerald-400 bg-emerald-500/20 backdrop-blur-sm"
              >
                <BrainCircuit className="mr-1 h-3 w-3" /> Active
              </Badge>
            ) : (
              <Badge
                variant="outline"
                className="text-xs border-yellow-500/70 text-yellow-400 bg-yellow-500/20 backdrop-blur-sm"
              >
                <MessageSquarePlus className="mr-1 h-3 w-3" /> New
              </Badge>
            )}
          </div>
        )}

        {/* Character Name - Moves from bottom-left to middle-left with better spacing */}
        <div
          className="absolute left-4 z-10 transform-gpu will-change-transform transition-all duration-400 ease-out group-hover:top-1/3 group-hover:-translate-y-1/2"
          style={{
            bottom: "1rem",
            transform: "translate3d(0, 0, 0)",
            backfaceVisibility: "hidden",
          }}
        >
          <CardTitle
            className="text-xl font-bold text-white drop-shadow-lg transition-colors duration-400 ease-out group-hover:text-emerald-300"
            style={{
              transform: "translate3d(0, 0, 0)",
              willChange: "color",
            }}
          >
            {character.name}
          </CardTitle>
        </div>

        {/* Description and Button Container - Slides up from bottom with better spacing */}
        <div
          className="absolute bottom-0 left-0 right-0 p-4 pt-16 z-10 transform-gpu will-change-transform transition-all duration-400 ease-out translate-y-full opacity-0 group-hover:translate-y-0 group-hover:opacity-100"
          style={{
            backfaceVisibility: "hidden",
          }}
        >
          <div className="space-y-3">
            <p className="text-sm text-gray-200 leading-relaxed" style={{ willChange: "opacity" }}>
              {character.shortDescription}
            </p>

            {/* Action Button */}
            {isInteractive ? (
              <Link
                href={`/chat/${character.handle}`}
                className="block"
                aria-disabled={isProfileLoading}
                onClick={(e) => {
                  if (isProfileLoading) e.preventDefault()
                }}
              >
                <Button
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold transform-gpu will-change-transform transition-all duration-200 ease-out hover:shadow-lg hover:shadow-emerald-500/25"
                  disabled={isProfileLoading}
                  style={{ backfaceVisibility: "hidden" }}
                >
                  {isProfileLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  Start Conversation
                </Button>
              </Link>
            ) : (
              <Button
                className="w-full bg-gray-700 text-gray-400"
                disabled={true}
                style={{ backfaceVisibility: "hidden" }}
              >
                <Lock className="mr-2 h-4 w-4" />
                Start Conversation
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Hover border effect - separate layer for better performance */}
      <div
        className="absolute inset-0 rounded-xl pointer-events-none transition-opacity duration-300 ease-out opacity-0 group-hover:opacity-100"
        style={{
          background:
            "linear-gradient(45deg, rgba(16, 185, 129, 0.1) 0%, rgba(245, 158, 11, 0.1) 50%, rgba(16, 185, 129, 0.1) 100%)",
          willChange: "opacity",
        }}
      />
    </CardBody>
  )
}
