"use client"
import { useEffect, useState, useRef, type FormEvent } from "react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { useLetta } from "@/hooks/use-letta"
import type { Character } from "@/lib/types"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Loader2, User, Brain, ArrowLeft, CornerDownLeft } from "lucide-react"
import type {
  AgentMessage,
  MessageCreate,
  MessageListResponse,
  AgentResponse,
  StreamChunk,
} from "@letta-ai/letta-client"
import { getCharacterByHandleServer } from "@/lib/character-actions"
import { cn } from "@/lib/utils"

interface ChatMessageClient extends Partial<AgentMessage> {
  id: string
  role: "user" | "assistant" | "system" | "tool"
  content?: string | null
  isStreaming?: boolean
  messageType?: AgentMessage["messageType"] | "client_message"
  toolCall?: AgentMessage["toolCall"]
  toolReturn?: AgentMessage["toolReturn"]
  reasoning?: AgentMessage["reasoning"]
  toolEvents?: Array<{ type: "tool_call" | "tool_return" | "reasoning"; data: any; name?: string }>
}

interface TextContentPart {
  type: "text"
  text: string
}
type ContentPart = TextContentPart

const InitialLoadingIndicator = () => {
  const [dots, setDots] = useState("...")
  useEffect(() => {
    const intervalId = setInterval(() => {
      setDots((prevDots) => (prevDots.length < 3 ? prevDots + "." : "."))
    }, 350)
    return () => clearInterval(intervalId)
  }, [])
  return <span className="inline-block w-auto">{dots}</span>
}

export default function ChatPage() {
  const router = useRouter()
  const params = useParams()
  const { client, apiKey, sharedUserProfileBlockId } = useLetta()
  const characterHandle = params.characterHandle as string

  const [character, setCharacter] = useState<Character | null>(null)
  const [agentId, setAgentId] = useState<string | null>(null)
  const [messages, setMessages] = useState<ChatMessageClient[]>([])
  const [inputValue, setInputValue] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isSending, setIsSending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const scrollAreaViewportRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollAreaViewportRef.current) {
      scrollAreaViewportRef.current.scrollTop = scrollAreaViewportRef.current.scrollHeight
    }
  }, [messages])

  useEffect(() => {
    if (!apiKey) {
      router.push("/")
      return
    }
    if (!characterHandle || !client) return

    async function initializeChat() {
      setIsLoading(true)
      setError(null)
      try {
        const charData = await getCharacterByHandleServer(characterHandle)
        if (!charData) {
          setError(`Character with handle "${characterHandle}" not found.`)
          setIsLoading(false)
          return
        }
        setCharacter(charData)

        const agentName = `character_${charData.handle}`
        let determinedAgentId: string | null = null
        let agentExistsAndIsValid = false

        const existingAgentsList: AgentResponse[] = await client.agents.list({ name: agentName, limit: 1 })

        if (existingAgentsList && existingAgentsList.length > 0 && existingAgentsList[0].name === agentName) {
          const potentialAgentId = existingAgentsList[0].id
          try {
            const retrievedAgent = await client.agents.retrieve(potentialAgentId)
            if (retrievedAgent && retrievedAgent.id === potentialAgentId) {
              determinedAgentId = retrievedAgent.id
              agentExistsAndIsValid = true
            }
          } catch (retrieveError: any) {
            const status = retrieveError?.status || retrieveError?.error?.statusCode
            if (status !== 404) {
              console.warn(`Error verifying agent ID=${potentialAgentId} (status: ${status}):`, retrieveError)
            }
            agentExistsAndIsValid = false
          }
        }

        if (!agentExistsAndIsValid) {
          if (!sharedUserProfileBlockId) {
            setError(
              "Shared user profile block ID is missing. Cannot create agent. Please check API key and profile setup on home page.",
            )
            setIsLoading(false)
            return
          }
          const newAgent = await client.agents.create({
            name: agentName,
            memoryBlocks: [{ label: "persona", value: charData.bio }],
            blockIds: [sharedUserProfileBlockId],
            tools: ["web_search", "run_code"],
            model: "anthropic/claude-sonnet-4-20250514",
            embedding: "openai/text-embedding-3-small",
          })
          determinedAgentId = newAgent.id
        }

        setAgentId(determinedAgentId)

        if (determinedAgentId) {
          const historyResponse = await client.agents.messages.list(determinedAgentId)
          let messagesFromApi: AgentMessage[]
          if (Array.isArray(historyResponse)) {
            messagesFromApi = historyResponse
          } else if (historyResponse && Array.isArray((historyResponse as MessageListResponse).data)) {
            messagesFromApi = (historyResponse as MessageListResponse).data
          } else if (historyResponse && Array.isArray((historyResponse as any).messages)) {
            messagesFromApi = (historyResponse as any).messages
          } else {
            messagesFromApi = []
          }
          messagesFromApi = Array.isArray(messagesFromApi) ? messagesFromApi : []

          const formattedMessages: ChatMessageClient[] = messagesFromApi
            .filter((msg) => {
              const looksLikeJson = typeof msg.content === "string" && msg.content.trim().startsWith("{")
              return msg.messageType === "assistant_message" || (msg.messageType === "user_message" && !looksLikeJson)
            })
            .map((msg, index) => ({
              id: `hist-${index}-${msg.id || `fallback-${Date.now()}-${index}`}`,
              role: msg.messageType === "user_message" ? "user" : "assistant",
              content: msg.content,
              messageType: msg.messageType,
            }))
          setMessages(formattedMessages)
        } else {
          setMessages([])
        }
      } catch (e: any) {
        const detail = e?.body?.detail || e?.error?.rawBody || e?.message
        setError(detail || "Failed to initialize chat. Check API key and network.")
      } finally {
        setIsLoading(false)
      }
    }
    initializeChat()
  }, [characterHandle, client, apiKey, router, sharedUserProfileBlockId])

  const handleSendMessage = async (e: FormEvent) => {
    e.preventDefault()
    if (!inputValue.trim() || !agentId || !client || isSending) return

    const userMessage: ChatMessageClient = {
      id: `msg-${Date.now()}`,
      role: "user",
      content: inputValue,
      messageType: "client_message",
    }
    setMessages((prev) => [...prev, userMessage])
    setInputValue("")
    setIsSending(true)

    const assistantMessageId = `msg-${Date.now()}-stream`
    const assistantPlaceholder: ChatMessageClient = {
      id: assistantMessageId,
      role: "assistant",
      content: "",
      isStreaming: true,
      messageType: "assistant_message",
      toolEvents: [],
    }
    setMessages((prevMessages) => [...prevMessages, assistantPlaceholder])

    try {
      const stream = await client.agents.messages.createStream(agentId, {
        messages: [{ role: "user", content: userMessage.content } as MessageCreate],
        streamTokens: true,
      })

      let accumulatedAssistantText = ""

      for await (const chunk of stream as AsyncIterable<StreamChunk>) {
        console.log("ChatPage: Received stream chunk:", JSON.parse(JSON.stringify(chunk)))

        if (chunk.messageType === "assistant_message") {
          const contentParts = chunk.content as ContentPart[] | string | null | undefined
          if (Array.isArray(contentParts)) {
            contentParts.forEach((part) => {
              if (part && part.type === "text" && typeof part.text === "string") {
                accumulatedAssistantText += part.text
              } else {
                console.warn("ChatPage: Assistant message chunk part is not text or malformed:", part)
              }
            })
          } else if (typeof contentParts === "string") {
            accumulatedAssistantText += contentParts
          } else if (contentParts !== null && contentParts !== undefined) {
            console.warn(
              "ChatPage: Assistant message chunk.content is neither string nor array of parts:",
              contentParts,
            )
            accumulatedAssistantText += JSON.stringify(contentParts)
          }
          setMessages((prevMessages) =>
            prevMessages.map((msg) =>
              msg.id === assistantMessageId ? { ...msg, content: accumulatedAssistantText, isStreaming: true } : msg,
            ),
          )
        } else if (chunk.messageType === "tool_call_message") {
          setMessages((prevMessages) =>
            prevMessages.map((msg) =>
              msg.id === assistantMessageId
                ? {
                    ...msg,
                    toolEvents: [
                      ...(msg.toolEvents || []),
                      { type: "tool_call", name: chunk.toolCall?.name, data: chunk.toolCall?.arguments },
                    ],
                    isStreaming: true,
                  }
                : msg,
            ),
          )
        } else if (chunk.messageType === "tool_return_message") {
          setMessages((prevMessages) =>
            prevMessages.map((msg) =>
              msg.id === assistantMessageId
                ? {
                    ...msg,
                    toolEvents: [...(msg.toolEvents || []), { type: "tool_return", data: chunk.toolReturn }],
                    isStreaming: true,
                  }
                : msg,
            ),
          )
        } else if (chunk.messageType === "reasoning_message" && chunk.reasoning) {
          setMessages((prevMessages) =>
            prevMessages.map((msg) =>
              msg.id === assistantMessageId
                ? {
                    ...msg,
                    toolEvents: [...(msg.toolEvents || []), { type: "reasoning", data: chunk.reasoning }],
                    isStreaming: true,
                  }
                : msg,
            ),
          )
        } else if (chunk.messageType === "stop_reason") {
          console.log("ChatPage: Stream ended with reason:", chunk.stopReason)
        } else if (chunk.messageType === "usage_statistics") {
          console.log("ChatPage: Usage statistics:", chunk.usage)
        }
      }
      setMessages((prevMessages) =>
        prevMessages.map((msg) =>
          msg.id === assistantMessageId ? { ...msg, content: accumulatedAssistantText, isStreaming: false } : msg,
        ),
      )
    } catch (e: any) {
      console.error("ChatPage: Message sending error:", e)
      setError(e.message || "Failed to send message.")
      setMessages((prevMessages) =>
        prevMessages.map((msg) =>
          msg.id === assistantMessageId
            ? { ...msg, content: "Error: Could not get response.", isStreaming: false }
            : msg,
        ),
      )
    } finally {
      setIsSending(false)
    }
  }

  if (!apiKey) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gradient-to-br from-black via-gray-900 to-emerald-900">
        <Alert variant="destructive" className="max-w-md bg-red-900/20 border-red-600">
          <AlertTitle>API Key Missing</AlertTitle>
          <AlertDescription>
            Letta API Key is not set. Please{" "}
            <a href="/" className="underline text-emerald-400">
              go to the home page
            </a>{" "}
            to set it.
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-black via-gray-900 to-emerald-900">
        <Loader2 className="h-12 w-12 animate-spin text-emerald-400" />
        <p className="mt-4 text-gray-300">Initializing conversation with {character?.name || characterHandle}...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gradient-to-br from-black via-gray-900 to-emerald-900">
        <Alert variant="destructive" className="max-w-md bg-red-900/20 border-red-600">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription className="text-gray-300">{error}</AlertDescription>
        </Alert>
        <Button onClick={() => router.push("/")} className="mt-4 bg-emerald-600 hover:bg-emerald-700">
          Go Home
        </Button>
      </div>
    )
  }

  if (!character) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gradient-to-br from-black via-gray-900 to-emerald-900">
        <Alert variant="destructive" className="max-w-md bg-red-900/20 border-red-600">
          <AlertTitle>Character Not Found</AlertTitle>
          <AlertDescription className="text-gray-300">
            The character you are looking for could not be found.
          </AlertDescription>
        </Alert>
        <Button onClick={() => router.push("/")} className="mt-4 bg-emerald-600 hover:bg-emerald-700">
          Go Home
        </Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-screen max-h-screen bg-gradient-to-br from-black via-gray-900 to-emerald-900 text-white overflow-hidden">
      <header className="sticky top-0 z-10 bg-black/80 backdrop-blur-md border-b border-emerald-800/30">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/characters" passHref>
              <Button
                variant="ghost"
                size="icon"
                aria-label="Back to characters"
                className="text-white hover:bg-emerald-600/20"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <Avatar className="h-10 w-10 border border-emerald-600/30">
              <AvatarImage src={character?.profilePicture || "/placeholder.svg"} alt={character?.name} />
              <AvatarFallback className="bg-emerald-600 text-white">{character?.name.substring(0, 2)}</AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-lg font-semibold text-white">{character?.name}</h1>
              <p className="text-xs text-gray-300 truncate max-w-[200px] sm:max-w-xs md:max-w-sm">
                {character?.shortDescription}
              </p>
            </div>
          </div>
        </div>
      </header>

      <ScrollArea className="flex-1" viewportRef={scrollAreaViewportRef}>
        <div className="container mx-auto max-w-3xl px-4 py-6 flex flex-col gap-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={cn("flex items-start gap-2.5", msg.role === "user" ? "ml-auto flex-row-reverse" : "mr-auto")}
            >
              {msg.role === "assistant" && (
                <Avatar className="h-8 w-8 mt-0.5 border border-emerald-600/30">
                  <AvatarImage src={character?.profilePicture || "/placeholder.svg"} alt={character?.name} />
                  <AvatarFallback className="bg-emerald-600 text-white">
                    {character?.name.substring(0, 1)}
                  </AvatarFallback>
                </Avatar>
              )}
              <div
                className={cn(
                  "max-w-[80%] p-3 shadow-sm",
                  msg.role === "user"
                    ? "bg-emerald-600 text-white rounded-2xl rounded-br-none"
                    : "bg-gray-800/80 border border-emerald-600/20 text-white rounded-2xl rounded-bl-none",
                )}
              >
                <p className="text-sm leading-relaxed whitespace-pre-wrap">
                  {msg.content}
                  {msg.isStreaming && (
                    <>
                      {msg.content ? (
                        <span className="animate-pulse">▍</span>
                      ) : msg.toolEvents && msg.toolEvents.length > 0 ? (
                        <span className="inline-flex items-center text-xs text-gray-400 italic">
                          <Brain className="h-3 w-3 mr-1.5 animate-pulse" />
                          <span>thinking...</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center text-xs text-gray-400 italic">
                          <InitialLoadingIndicator />
                        </span>
                      )}
                    </>
                  )}
                </p>
              </div>
              {msg.role === "user" && (
                <Avatar className="h-8 w-8 mt-0.5 border border-emerald-600/30">
                  <AvatarFallback className="bg-gray-700 text-gray-300">
                    <User size={16} />
                  </AvatarFallback>
                </Avatar>
              )}
            </div>
          ))}
        </div>
        <ScrollBar orientation="vertical" />
      </ScrollArea>

      <footer className="sticky bottom-0 bg-black/80 backdrop-blur-md border-t border-emerald-800/30">
        <div className="container mx-auto max-w-3xl px-4 py-3">
          <form onSubmit={handleSendMessage} className="flex items-center gap-2">
            <div className="relative flex-1">
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder={`Message ${character?.name || "..."}...`}
                className="rounded-full bg-gray-800/60 border-emerald-600/30 focus-visible:ring-1 focus-visible:ring-emerald-400 focus-visible:ring-offset-0 py-2.5 pl-4 pr-12 h-11 text-sm text-white placeholder:text-gray-400"
                disabled={isSending}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault()
                    handleSendMessage(e as unknown as FormEvent)
                  }
                }}
              />
              <Button
                type="submit"
                size="icon"
                variant="ghost"
                className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full text-emerald-400 hover:bg-emerald-600/20 hover:text-emerald-300"
                disabled={isSending || !inputValue.trim()}
                aria-label="Send message"
              >
                {isSending ? <Loader2 className="h-4 w-4 animate-spin" /> : <CornerDownLeft className="h-4 w-4" />}
              </Button>
            </div>
          </form>
        </div>
      </footer>
    </div>
  )
}
