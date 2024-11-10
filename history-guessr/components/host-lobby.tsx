'use client'

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { useEffect, useRef, useState } from "react"
import { motion } from "framer-motion"
import PartySocket from "partysocket"
import { uniqueNamesGenerator, Config, adjectives, colors, animals } from 'unique-names-generator';

interface Player {
  id: number
  name: string
}

interface GameLobbyProps {
  gameSocket: PartySocket,
  roomCode?: string
  blueTeam?: Player[]
  redTeam?: Player[]
  onStart?: () => void
}

export default function HostLobby({
  roomCode = "...",
  gameSocket,
}: GameLobbyProps) {
  const [redTeam, setRedTeam] = useState<Player[]>([]);
  const [blueTeam, setBlueTeam] = useState<Player[]>([]);
  const onStart = () => gameSocket.send(JSON.stringify({ type: "HOST_COMMAND", content: "GAME_START"}));
  
  const rdmName: string = uniqueNamesGenerator({
    dictionaries: [adjectives, colors, animals]
  });
  // Randomly add a player to red or blue team

  const getRandomInt = (max: number): number => {
    return Math.floor(Math.random() * max);
  }

  function addTeam() {
    console.log("Adding player to team");
    if (getRandomInt(2) === 0) {
      setRedTeam([...redTeam, { id: 1, name: rdmName }]);
    } else {  
      setBlueTeam([...blueTeam, { id: 1, name: rdmName }]);
    }
  }

  setTimeout(addTeam, getRandomInt(5) * 2000);
  

  

  
  return (
    <div className="w-full max-w-4xl mx-auto p-8 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
      <div className="flex items-center justify-between mb-12">
        <div className="flex-1" />
        <motion.div 
          className="bg-white px-8 py-3 rounded-full shadow-lg"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-2xl font-semibold bg-gradient-to-r from-blue-600 to-red-600 bg-clip-text text-transparent">
            Code: {roomCode}
          </h1>
        </motion.div>
        <div className="flex-1 flex justify-end">
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button
              size="lg"
              className="bg-gradient-to-r from-green-400 to-green-600 hover:from-green-500 hover:to-green-700 text-white rounded-full px-10 py-6 text-lg font-semibold shadow-lg transition-all duration-300 ease-in-out"
              onClick={onStart}
            >
              Start Game
            </Button>
          </motion.div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
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
    <Card className={`p-6 ${color === "blue" ? "bg-gradient-to-br from-blue-100 to-blue-200" : "bg-gradient-to-br from-red-100 to-red-200"} rounded-2xl shadow-xl`}>
      <h2 className={`text-2xl font-bold mb-4 ${color === "blue" ? "text-blue-800" : "text-red-800"}`}>
        {color === "blue" ? "Blue Team" : "Red Team"}
      </h2>
      <div className="grid grid-cols-2 gap-4">
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
    <motion.div
      ref={containerRef}
      className={`
        h-14 px-4 rounded-xl flex items-center justify-center overflow-hidden
        ${color === "blue" ? "bg-gradient-to-r from-blue-500 to-blue-600" : "bg-gradient-to-r from-red-500 to-red-600"}
        shadow-md hover:shadow-lg transition-shadow duration-300 ease-in-out
      `}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
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
    </motion.div>
  )
}