"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Users } from "lucide-react"
import { cn } from "@/lib/utils"
import PartySocket from "partysocket"
//import { GameResult } from "./game-result"
import { ClientGamePage } from "./game-page"

interface TeamSelectionProps {
  gameSocket: PartySocket
}

export function TeamSelection({ gameSocket }: TeamSelectionProps) {
  const [selectedTeam, setSelectedTeam] = useState<"red" | "blue" | null>(null)

  const handleTeamSelect = (team: "red" | "blue") => {
    setSelectedTeam(team)
    gameSocket.send(JSON.stringify({ type: "JOIN_TEAM", answer: team }))  
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-6">
      <div className="w-full max-w-4xl mx-auto space-y-12 text-center">
        <h1 className="text-5xl font-bold text-gray-800 tracking-tight">
          Choose Your Team
        </h1>
        <div className="grid md:grid-cols-2 gap-8">
          {["red", "blue"].map((team) => (
            <Card
              key={team}
              className={cn(
                "p-8 cursor-pointer transition-all duration-300 hover:scale-105",
                "bg-white/80 backdrop-blur-sm border border-white/20",
                "shadow-lg hover:shadow-xl",
                selectedTeam === team &&
                  `ring-4 ${
                    team === "red" ? "ring-red-500/50" : "ring-blue-500/50"
                  }`
              )}
              onClick={() => handleTeamSelect(team as "red" | "blue")}
            >
              <div
                className={cn(
                  "aspect-square rounded-2xl flex items-center justify-center mb-6",
                  "bg-gradient-to-br",
                  team === "red"
                    ? "from-red-400 to-red-600"
                    : "from-blue-400 to-blue-600"
                )}
              >
                <Users className="h-24 w-24 text-white" />
              </div>
              <h2
                className={cn(
                  "text-2xl font-semibold",
                  team === "red" ? "text-red-600" : "text-blue-600"
                )}
              >
                {team.toUpperCase()} TEAM
              </h2>
            </Card>
          ))}
        </div>
        <Button
          className={cn(
            "mt-8 px-8 py-6 text-lg font-semibold tracking-wide",
            "bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700",
            "border-none rounded-full shadow-lg hover:shadow-xl transition-all duration-300",
            "text-white",
            !selectedTeam && "opacity-50 cursor-not-allowed"
          )}
          disabled={!selectedTeam}
        >
          Join {selectedTeam?.toUpperCase()} Team
        </Button>
      </div>
    </div>
  )
}