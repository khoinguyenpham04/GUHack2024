"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, Image as ImageIcon } from "lucide-react"
import { cn } from "@/lib/utils"

export function TeamSelection() {
  const [selectedTeam, setSelectedTeam] = useState<"red" | "blue" | null>(null)
  const [playerName, setPlayerName] = useState("")

  return (
    <div className="w-full max-w-4xl mx-auto p-6 space-y-8">
      <div className="w-full max-w-md mx-auto">
        <Input
          type="text"
          placeholder="Enter your name"
          value={playerName}
          onChange={(e) => setPlayerName(e.target.value)}
          className="h-12 text-center text-lg rounded-full bg-gray-100 border-0"
        />
      </div>

      <h1 className="text-3xl font-bold text-center text-black-600">CHOOSE YOUR TEAM</h1>

      <div className="grid md:grid-cols-2 gap-6">
        <Card
          className={cn(
            "p-6 cursor-pointer transition-all hover:scale-105",
            selectedTeam === "red" && "ring-2 ring-red-500"
          )}
          onClick={() => setSelectedTeam("red")}
        >
          <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center mb-4">
            <ImageIcon className="h-24 w-24 text-gray-400" />
          </div>
          <h2 className="text-xl font-semibold text-center text-black-600">RED TEAM</h2>
        </Card>

        <Card
          className={cn(
            "p-6 cursor-pointer transition-all hover:scale-105",
            selectedTeam === "blue" && "ring-2 ring-blue-500"
          )}
          onClick={() => setSelectedTeam("blue")}
        >
          <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center mb-4">
            <ImageIcon className="h-24 w-24 text-gray-400" />
          </div>
          <h2 className="text-xl font-semibold text-center text-black-600">BLUE TEAM</h2>
        </Card>
      </div>

      <div className="flex justify-end gap-2">
        <Button variant="outline" size="icon" className="rounded-full">
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <Button variant="outline" size="icon" className="rounded-full">
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}