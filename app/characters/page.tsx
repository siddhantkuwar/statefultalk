"use client"

import { useState, useEffect, useCallback } from "react"
import type { Character } from "@/lib/types"
import { CharacterCard } from "@/components/character-card"
import { getAllCharacters } from "@/lib/character-actions"
import { useLetta } from "@/hooks/use-letta"
import { getAllAgentsMap } from "@/lib/letta-agent-utils"
import { Loader2, Search, RefreshCw, Settings, UserCircle, AlertTriangle, Github, KeyRound } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DeveloperSettingsDialog } from "@/components/developer-settings-dialog"
import { UserProfileDialog } from "@/components/user-profile-dialog"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Logo } from "@/components/logo"
import Link from "next/link"

export default function CharactersPage() {
  const [allCharacters, setAllCharacters] = useState<Character[]>([])
  const [filteredCharacters, setFilteredCharacters] = useState<Character[]>([])
  const [isLoadingCharacters, setIsLoadingCharacters] = useState(true)
  const [characterLoadingError, setCharacterLoadingError] = useState<string | null>(null)
  const { client, apiKey, isUserProfileLoading, sharedUserProfileBlockId } = useLetta()
  const [existingAgentsMap, setExistingAgentsMap] = useState<Map<string, string>>(new Map())
  const [isLoadingAgents, setIsLoadingAgents] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")

  const fetchCharacters = useCallback(async () => {
    setIsLoadingCharacters(true)
    setCharacterLoadingError(null)
    try {
      const chars = await getAllCharacters()
      if (chars && chars.length > 0) {
        setAllCharacters(chars)
        setFilteredCharacters(chars)
      } else {
        setAllCharacters([])
        setFilteredCharacters([])
        if (!chars) {
          setCharacterLoadingError("Failed to load character data. The character list was unexpectedly empty or null.")
        }
      }
    } catch (error: any) {
      console.error("[CharactersPage] Failed to fetch characters:", error)
      setCharacterLoadingError(error.message || "An unknown error occurred while fetching characters.")
      setAllCharacters([])
      setFilteredCharacters([])
    } finally {
      setIsLoadingCharacters(false)
    }
  }, [])

  const fetchAgents = useCallback(async () => {
    if (!client) return
    setIsLoadingAgents(true)
    try {
      const agentsMap = await getAllAgentsMap(client)
      setExistingAgentsMap(agentsMap)
    } catch (error) {
      console.error("CharactersPage: Failed to fetch agents list:", error)
      setExistingAgentsMap(new Map())
    } finally {
      setIsLoadingAgents(false)
    }
  }, [client])

  useEffect(() => {
    fetchCharacters()
  }, [fetchCharacters])

  useEffect(() => {
    if (apiKey && client) {
      fetchAgents()
    } else {
      setExistingAgentsMap(new Map())
    }
  }, [apiKey, client, fetchAgents])

  useEffect(() => {
    if (searchTerm === "") {
      setFilteredCharacters(allCharacters)
    } else {
      setFilteredCharacters(
        allCharacters.filter(
          (char) =>
            char.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            char.shortDescription.toLowerCase().includes(searchTerm.toLowerCase()),
        ),
      )
    }
  }, [searchTerm, allCharacters])

  const handleAgentReset = useCallback(async () => {
    await fetchAgents()
  }, [fetchAgents])

  if (isLoadingCharacters && allCharacters.length === 0 && !characterLoadingError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-black via-gray-900 to-emerald-900 text-white">
        <Loader2 className="h-16 w-16 animate-spin text-emerald-400" />
        <p className="mt-6 text-xl font-medium">Loading your conversations...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-emerald-900 text-white">
      <header className="py-4 border-b border-emerald-800/30 sticky top-0 bg-black/80 backdrop-blur-md z-50">
        <div className="container mx-auto px-4 md:px-8 flex flex-wrap justify-between items-center gap-x-4 gap-y-2">
          <div className="flex items-baseline gap-2">
            <Link href="/">
              <Logo className="cursor-pointer hover:opacity-80 transition-opacity" />
            </Link>
          </div>
          <div className="flex items-center gap-2">
            <UserProfileDialog>
              <Button
                variant="outline"
                size="sm"
                className="text-xs h-9 border-emerald-600 text-emerald-400 hover:bg-emerald-600/20"
                disabled={!apiKey || !sharedUserProfileBlockId}
                aria-label="Modify Shared Memory"
              >
                <UserCircle className="mr-1.5 h-4 w-4" />
                Modify Shared Memory
              </Button>
            </UserProfileDialog>
            <a
              href="https://github.com/letta-ai/characterai-memory"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="View source on GitHub"
            >
              <Button variant="ghost" size="icon" className="h-9 w-9 text-white hover:bg-emerald-600/20">
                <Github className="h-5 w-5" />
              </Button>
            </a>
            <DeveloperSettingsDialog>
              <Button
                variant="ghost"
                size="icon"
                aria-label="Developer Settings"
                className="h-9 w-9 text-white hover:bg-emerald-600/20"
              >
                <Settings className="h-5 w-5" />
              </Button>
            </DeveloperSettingsDialog>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 md:px-8 py-8">
        {characterLoadingError && (
          <Alert variant="destructive" className="mb-8 bg-red-900/20 border-red-600">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Error Loading Characters</AlertTitle>
            <AlertDescription>{characterLoadingError}</AlertDescription>
          </Alert>
        )}
        <section>
          <div className="mb-8 space-y-4">
            <div className="flex flex-col items-center text-center gap-4">
              <h2 className="text-3xl md:text-5xl font-bold tracking-tight">
                <span className="bg-gradient-to-r from-emerald-400 via-yellow-400 to-emerald-300 bg-clip-text text-transparent">
                  Conversations that remember you!
                </span>
              </h2>
              <p className="text-lg text-gray-300 max-w-2xl">
                Experience AI characters with persistent memory who learn and grow with every interaction.
              </p>
              {!apiKey && (
                <DeveloperSettingsDialog>
                  <Button className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-3 text-lg font-semibold rounded-full">
                    <KeyRound className="mr-2 h-5 w-5" />
                    Get Started
                  </Button>
                </DeveloperSettingsDialog>
              )}
            </div>
            {apiKey && (
              <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-end sm:gap-4 w-full">
                <div className="relative w-full sm:w-auto sm:max-w-xs md:max-w-sm lg:max-w-md flex-grow sm:flex-grow-0">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 z-10" />
                  <Input
                    type="search"
                    placeholder="Discover characters..."
                    className="pl-10 w-full h-12 bg-gray-800/50 border-emerald-600/30 text-white placeholder:text-gray-400 focus:border-emerald-400"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <Button
                  onClick={fetchAgents}
                  disabled={isLoadingAgents || isUserProfileLoading}
                  variant="outline"
                  size="sm"
                  className="h-12 whitespace-nowrap w-full sm:w-auto border-emerald-600 text-emerald-400 hover:bg-emerald-600/20"
                >
                  {isLoadingAgents ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <RefreshCw className="mr-2 h-4 w-4" />
                  )}
                  Refresh Agents
                </Button>
              </div>
            )}
          </div>

          {!isLoadingCharacters && filteredCharacters.length === 0 && !characterLoadingError && (
            <div className="text-center py-10">
              <p className="text-xl text-gray-300">No characters found.</p>
              <p className="text-sm text-gray-400 mt-2">
                It seems the character list is empty. This might be a configuration issue.
              </p>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredCharacters.map((character) => {
              const agentName = `character_${character.handle}`
              const agentId = existingAgentsMap.get(agentName)
              return (
                <CharacterCard
                  key={character.handle}
                  character={character}
                  agentId={agentId}
                  onAgentReset={handleAgentReset}
                  isProfileLoading={isUserProfileLoading}
                  apiKey={apiKey}
                />
              )
            })}
          </div>
        </section>
      </div>
    </div>
  )
}
