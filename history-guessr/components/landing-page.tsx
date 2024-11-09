"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Image from "next/image"

export function LandingPage() {
  const [gameId, setGameId] = useState("")

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <div className="w-full max-w-6xl grid md:grid-cols-2 gap-8 items-center">
        <div className="relative aspect-square bg-muted rounded-lg overflow-hidden">
          <Image
            src="/placeholder.svg"
            alt="Quiz game illustration"
            fill
            className="object-cover"
            priority
          />
        </div>
        <div className="flex flex-col items-center space-y-8">
          <h1 className="text-4xl md:text-5xl font-bold text-center bg-gradient-to-r from-purple-600 to-purple-800 text-transparent bg-clip-text">
            A Race Through Time
          </h1>
          
          <div className="w-full max-w-md space-y-4">
            <div className="flex gap-2">
              <Input
                type="text"
                placeholder="Enter Game ID"
                value={gameId}
                onChange={(e) => setGameId(e.target.value)}
                className="rounded-full bg-muted/80"
              />
              <Button 
                className="rounded-full px-8 bg-purple-600 hover:bg-purple-700"
                disabled={!gameId}
              >
                Join Game
              </Button>
            </div>
            
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-4 text-muted-foreground font-medium">
                  or
                </span>
              </div>
            </div>

            <Button 
              variant="secondary"
              className="w-full rounded-full text-lg font-medium hover:bg-muted/80"
            >
              New Game
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}