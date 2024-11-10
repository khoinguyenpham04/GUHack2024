'use client'

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { useEffect, useRef, useState } from "react"

interface Player {
  id: number
  name: string
}

interface GameLobbyProps {
  roomCode?: string
  blueTeam?: Player[]
  redTeam?: Player[]
  onStart?: () => void
}

export default function HostLobby({
  roomCode = "aBc83kLd",
  blueTeam = Array(12).fill({ id: 1, name: "player 1" }),
  redTeam = Array(12).fill({ id: 1, name: "player 1" }),
  onStart = () => console.log("Game started!"),
}: GameLobbyProps) {
  return (
    <div className="w-full max-w-4xl mx-auto p-4">
      <div className="flex items-center justify-between mb-8">
        <div className="flex-1" />
        <div className="bg-muted px-6 py-2 rounded-full">
          <h1 className="text-xl font-semibold">Code: {roomCode}</h1>
        </div>
        <div className="flex-1 flex justify-end">
          <Button
            size="lg"
            className="bg-green-500 hover:bg-green-600 text-white rounded-full px-8"
            onClick={onStart}
          >
            Start!
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <TeamSection team={blueTeam} color="blue" />
        <TeamSection team={redTeam} color="red" />
      </div>
    </div>
  )
}

function TeamSection({
  team,
  color,
}: {
  team: Player[]
  color: "red" | "blue"
}) {
  return (
    <Card className={`p-4 ${color === "blue" ? "bg-sky-100" : "bg-red-100"}`}>
      <div className="grid grid-cols-2 gap-2">
        {team.map((player, index) => (
          <PlayerName
            key={index}
            name={player.name}
            color={color}
          />
        ))}
      </div>
    </Card>
  )
}

function PlayerName({
  name,
  color,
}: {
  name: string
  color: "red" | "blue"
}) {
  const [scale, setScale] = useState(1)
  const spanRef = useRef<HTMLSpanElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (spanRef.current && containerRef.current) {
      const container = containerRef.current
      const span = spanRef.current
      const containerWidth = container.offsetWidth
      const spanWidth = span.offsetWidth

      if (spanWidth > containerWidth) {
        setScale(containerWidth / spanWidth)
      } else {
        setScale(1)
      }
    }
  }, [name])

  return (
    <div
      ref={containerRef}
      className={`
        h-12 px-4 rounded-lg flex items-center justify-center overflow-hidden
        ${color === "blue" ? "bg-sky-500" : "bg-red-500"}
      `}
    >
      <span
        ref={spanRef}
        className="text-white font-medium whitespace-nowrap"
        style={{
          transform: `scale(${scale})`,
          transformOrigin: "center",
        }}
      >
        {name}
      </span>
    </div>
  )
}