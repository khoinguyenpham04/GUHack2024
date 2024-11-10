'use client'

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Image from "next/image"
import Link from "next/link"
import { joinGame, createGame } from "./actions/landingPageActions"
import { AnimatedTestimonialsDemo } from "@/components/sliding-images"

export default function Home() {
  const [gameId, setGameId] = useState("")

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-900 text-gray-100">
      <div className="w-full max-w-6xl grid md:grid-cols-2 gap-8 items-center">
        <div className="relative aspect-square bg-gray-800 rounded-lg overflow-hidden">
          <AnimatedTestimonialsDemo />
        </div>
        <div className="flex flex-col items-center space-y-8">
          <h1 className="text-4xl md:text-5xl font-bold text-center bg-gradient-to-r from-purple-400 to-pink-600 text-transparent bg-clip-text">
            Yesterday's Stories, Today's Challenge.
          </h1>
          <p className="text-xl text-center text-gray-300 mt-4 mb-8">
            Travel Through Time, Test Your Knowledge, Challenge Your Friends!
          </p>

          <div className="w-full max-w-md space-y-6">
            <div className="flex gap-2">
              <Input
                type="text"
                placeholder="Enter Game ID"
                value={gameId}
                onChange={(e) => setGameId(e.target.value)}
                className="rounded-full bg-gray-800 text-gray-100 border-gray-700 focus:border-purple-500 focus:ring-purple-500"
              />
              <Button
                className="relative inline-flex h-12 overflow-hidden rounded-full p-[3px] focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-offset-2 focus:ring-offset-gray-900"
                onClick={() => joinGame(gameId)}
                disabled={!gameId}
              >
                <span className="absolute inset-[-1000%] animate-[spin_2s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#8B5CF6_0%,#EC4899_50%,#8B5CF6_100%)]" />
                <span className="inline-flex h-full w-full cursor-pointer items-center justify-center rounded-full bg-gray-900 px-8 py-1 text-lg font-bold text-gray-100 backdrop-blur-3xl">
                  Join Game
                </span>
              </Button>
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-gray-700" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-gray-900 px-4 text-gray-500 font-medium">
                  or
                </span>
              </div>
            </div>

            <Button
              className="relative inline-flex w-full h-12 overflow-hidden rounded-full p-[3px] focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-offset-2 focus:ring-offset-gray-900"
              onClick={createGame}
            >
              <span className="absolute inset-[-1000%] animate-[spin_2s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#8B5CF6_0%,#EC4899_50%,#8B5CF6_100%)]" />
              <span className="inline-flex h-full w-full cursor-pointer items-center justify-center rounded-full bg-gray-900 px-8 py-1 text-lg font-bold text-gray-100 backdrop-blur-3xl">
                New Game
              </span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}