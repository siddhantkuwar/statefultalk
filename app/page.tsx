"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Logo } from "@/components/logo"
import { Brain, Users, Zap } from "lucide-react"
import { AnimatedLink } from "@/components/animated-link"
import { cn } from "@/lib/utils"

export default function HomePage() {
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY
      const logoHeight = 200 // Approximate height where we want the banner to appear
      setIsScrolled(scrollPosition > logoHeight)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-emerald-900 text-white">
      {/* Sticky Banner - appears when scrolled */}
      <header
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-300 ease-in-out",
          isScrolled
            ? "translate-y-0 bg-black/80 backdrop-blur-md border-b border-emerald-800/30"
            : "-translate-y-full opacity-0",
        )}
      >
        <div className="container mx-auto px-4 md:px-8 py-4 flex justify-between items-center">
          <Logo />
          <AnimatedLink href="/characters" transitionText="Loading your AI companions...">
            <Button className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2 font-semibold transition-all duration-300 hover:scale-105">
              Get Started
            </Button>
          </AnimatedLink>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 md:px-8">
        {/* Hero Section */}
        <section className="min-h-screen flex flex-col items-center justify-center text-center space-y-8">
          <div className="mb-8">
            <Logo className="justify-center" />
          </div>

          <div className="max-w-4xl space-y-6">
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold leading-tight">
              <span className="block">Welcome to</span>
              <span className="bg-gradient-to-r from-emerald-400 via-yellow-400 to-emerald-300 bg-clip-text text-transparent">
                StatefulTalk
              </span>
            </h1>

            <p className="text-xl md:text-2xl text-gray-300 leading-relaxed max-w-3xl mx-auto">
              Experience the future of AI conversations with characters that truly remember you. Every interaction
              builds upon the last, creating deeper, more meaningful relationships with AI personalities.
            </p>

            <div className="pt-8">
              <AnimatedLink href="/characters" transitionText="Preparing your AI companions...">
                <Button className="bg-emerald-600 hover:bg-emerald-700 text-white px-12 py-4 text-xl font-semibold rounded-full transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-emerald-500/25">
                  Get Started
                </Button>
              </AnimatedLink>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 space-y-16">
          <div className="text-center space-y-4">
            <h2 className="text-3xl md:text-4xl font-bold">
              <span className="bg-gradient-to-r from-emerald-400 to-yellow-400 bg-clip-text text-transparent">
                Why StatefulTalk?
              </span>
            </h2>
            <p className="text-lg text-gray-300 max-w-2xl mx-auto">
              Unlike traditional chatbots, our AI characters maintain persistent memory across all conversations,
              creating truly personalized experiences.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <div className="bg-gray-800/60 backdrop-blur-sm border border-emerald-600/20 rounded-xl p-8 text-center space-y-4 hover:border-emerald-400/40 transition-all duration-300">
              <div className="w-16 h-16 bg-emerald-600/20 rounded-full flex items-center justify-center mx-auto">
                <Brain className="w-8 h-8 text-emerald-400" />
              </div>
              <h3 className="text-xl font-semibold text-white">Persistent Memory</h3>
              <p className="text-gray-300">
                Characters remember your conversations, preferences, and relationship history across all interactions.
              </p>
            </div>

            <div className="bg-gray-800/60 backdrop-blur-sm border border-emerald-600/20 rounded-xl p-8 text-center space-y-4 hover:border-emerald-400/40 transition-all duration-300">
              <div className="w-16 h-16 bg-yellow-600/20 rounded-full flex items-center justify-center mx-auto">
                <Users className="w-8 h-8 text-yellow-400" />
              </div>
              <h3 className="text-xl font-semibold text-white">Diverse Characters</h3>
              <p className="text-gray-300">
                Chat with a variety of AI personalities, from helpful professionals to entertaining fictional
                characters.
              </p>
            </div>

            <div className="bg-gray-800/60 backdrop-blur-sm border border-emerald-600/20 rounded-xl p-8 text-center space-y-4 hover:border-emerald-400/40 transition-all duration-300">
              <div className="w-16 h-16 bg-emerald-600/20 rounded-full flex items-center justify-center mx-auto">
                <Zap className="w-8 h-8 text-emerald-400" />
              </div>
              <h3 className="text-xl font-semibold text-white">Evolving Relationships</h3>
              <p className="text-gray-300">
                Watch as your relationships with AI characters deepen and evolve through continued conversations.
              </p>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="py-20 space-y-16">
          <div className="text-center space-y-4">
            <h2 className="text-3xl md:text-4xl font-bold">
              <span className="bg-gradient-to-r from-yellow-400 to-emerald-400 bg-clip-text text-transparent">
                How It Works
              </span>
            </h2>
          </div>

          <div className="max-w-4xl mx-auto space-y-12">
            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="w-16 h-16 bg-emerald-600 rounded-full flex items-center justify-center text-white font-bold text-xl flex-shrink-0">
                1
              </div>
              <div className="text-center md:text-left">
                <h3 className="text-xl font-semibold text-white mb-2">Choose Your Character</h3>
                <p className="text-gray-300">
                  Select from our diverse roster of AI personalities, each with unique backgrounds and expertise.
                </p>
              </div>
            </div>

            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="w-16 h-16 bg-yellow-600 rounded-full flex items-center justify-center text-white font-bold text-xl flex-shrink-0">
                2
              </div>
              <div className="text-center md:text-left">
                <h3 className="text-xl font-semibold text-white mb-2">Start Conversing</h3>
                <p className="text-gray-300">
                  Begin chatting naturally. The AI will learn about you and remember important details for future
                  conversations.
                </p>
              </div>
            </div>

            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="w-16 h-16 bg-emerald-600 rounded-full flex items-center justify-center text-white font-bold text-xl flex-shrink-0">
                3
              </div>
              <div className="text-center md:text-left">
                <h3 className="text-xl font-semibold text-white mb-2">Build Relationships</h3>
                <p className="text-gray-300">
                  Return anytime to continue where you left off. Your AI companions will remember you and your shared
                  history.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 text-center">
          <div className="max-w-3xl mx-auto space-y-16">
            <h2 className="text-3xl md:text-4xl font-bold">
              <span className="bg-gradient-to-r from-emerald-400 via-yellow-400 to-emerald-300 bg-clip-text text-transparent">
                Ready to Experience Conversations That Remember?
              </span>
            </h2>
            <p className="text-lg text-gray-300">
              Join StatefulTalk today and discover the difference that persistent memory makes in AI interactions.
            </p>
            <div className="pt-8">
              <AnimatedLink href="/characters" transitionText="Launching StatefulTalk...">
                <Button className="bg-emerald-600 hover:bg-emerald-700 text-white px-12 py-4 text-xl font-semibold rounded-full transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-emerald-500/25">
                  Get Started Now
                </Button>
              </AnimatedLink>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
