'use client'

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Flag } from "lucide-react"
import PartySocket from "partysocket"
import { Button } from "./ui/button"

interface Player {
  id: string
  name: string
  score: number
  team: 'red' | 'blue'
}

interface QuizDisplayProps {
  gameSocket: PartySocket,
  imageUrl?: string | null
  roundNum?: number
}



export function QuizDisplay({
  gameSocket,
  imageUrl,
  roundNum
}: QuizDisplayProps) {
  const totalRounds = 5
  const [players, setPlayers] = useState<Player[]>([]);


  const [redProgress, setRedProgress] = useState(0)
  const [blueProgress, setBlueProgress] = useState(0)
  const maxProgress = Math.max(redProgress, blueProgress)
  const progressColor = redProgress > blueProgress ? 'from-red-500 to-red-600' : 'from-blue-500 to-blue-600'
  const validImageUrl = typeof imageUrl === "string" && imageUrl.trim() !== "";

  const onNextQuestion = () => gameSocket.send(JSON.stringify({ type: "HOST_COMMAND", content: "NEXT_QUESTION" }))

  useEffect(() => {
    const handleWebSocketMessage = (event: MessageEvent) => {
      const message = JSON.parse(event.data);

      if (message.type === "PROGRESS_UPDATE") {
        console.log(message);

        // Update the progress state
        setRedProgress(message.redProgress);
        setBlueProgress(message.blueProgress);
      }

      if (message.type === "PLAYER_SCORE_UPDATE") {
        const updatedPlayer = message.player

        setPlayers(prevPlayers => {
          // Check if the player already exists
          const playerExists = prevPlayers.some(player => player.id === updatedPlayer.id);

          // Update the existing player's score or add new player
          const newPlayers = playerExists
            ? prevPlayers.map(player =>
              player.id === updatedPlayer.id ? { ...player, score: updatedPlayer.score } : player
            )
            : [...prevPlayers, updatedPlayer];

          // Sort by score and keep only the top 5 players
          return newPlayers
            .sort((a, b) => b.score - a.score)
            .slice(0, 5);
        });
      }
    };

    // Attach the WebSocket event listener
    gameSocket.addEventListener("message", handleWebSocketMessage);

    // Clean up the event listener on component unmount
    return () => {
      gameSocket.removeEventListener("message", handleWebSocketMessage);
    };
  }, [gameSocket,roundNum]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Round Counter */}
        <div className="flex justify-center">
          <div className="bg-white bg-opacity-80 backdrop-blur-md rounded-full px-8 py-3 text-3xl font-bold text-gray-800 shadow-lg">
            Round {roundNum} / {totalRounds}
          </div>
          <Button
            size="lg"
            className="ml-8 bg-gradient-to-r from-green-400 to-green-600 hover:from-green-500 hover:to-green-700 text-white rounded-full px-10 py-6 text-lg font-semibold shadow-lg transition-all duration-300 ease-in-out"
            onClick={onNextQuestion}
          >
            Next Question
          </Button>
        </div>


        <div className="grid md:grid-cols-2 gap-8">
          {/* Image Section */}
          <Card className="overflow-hidden rounded-2xl shadow-2xl transform transition-all duration-300 hover:scale-105">
            <div className="aspect-video bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center p-6">
              {validImageUrl ? (
                <img
                  src={imageUrl}
                  alt="Quiz question image"
                  className="rounded-lg object-cover shadow-md"
                  width={600}
                  height={400}
                />
              ) : (
                <p className="text-gray-500">Image not available</p>
              )}
            </div>
          </Card>

          {/* Leaderboard Section */}
          <Card className="overflow-hidden rounded-2xl shadow-2xl bg-white bg-opacity-80 backdrop-blur-md">
            <div className="p-6">
              <h2 className="text-3xl font-bold text-gray-800 mb-6">Top Scores</h2>
              <div className="space-y-3">
                {players && players.length > 0 ? (
                  players.map((player, index) => (
                    <div
                      key={player.id}
                      className={`p-4 rounded-xl text-white font-semibold flex justify-between items-center shadow-md transition-transform duration-300 ${player.team === 'blue'
                        ? 'bg-gradient-to-r from-blue-500 to-blue-600'
                        : 'bg-gradient-to-r from-red-500 to-red-600'
                        }`}
                      style={{ transform: `translateY(${index * 10}px)` }}
                    >
                      <span className="text-lg">{player.name}</span>
                      <span className="text-2xl">{player.score.toLocaleString()}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-gray-500 text-lg">No players available</p>
                )}
              </div>
            </div>
          </Card>
        </div>

        {/* Progress Bars */}
        <Card className="overflow-hidden rounded-2xl shadow-2xl bg-white bg-opacity-80 backdrop-blur-md">
          <div className="p-8 pt-16">
            <div className="relative">
              <Progress
                value={100}
                className={`h-8 rounded-full overflow-hidden bg-gradient-to-r ${progressColor}`}
              />
              <div className="absolute inset-0 flex">
                <div
                  className="h-full bg-red-600 opacity-50 transition-all duration-300"
                  style={{ width: `${redProgress}%` }}
                />
                <div
                  className="h-full bg-blue-600 opacity-50 transition-all duration-300"
                  style={{ width: `${blueProgress}%` }}
                />
              </div>
              {/* Red Team Flag */}
              <div
                className="absolute bottom-full left-0 mb-2 transition-all duration-300"
                style={{
                  left: `${redProgress}%`,
                  transform: 'translateX(-50%)',
                }}
              >
                <div className="relative flex flex-col items-center">
                  <div className="bg-white rounded-full p-2 shadow-lg">
                    <Flag className="h-6 w-6 text-red-600" />
                  </div>
                  <span className="mt-1 text-sm font-semibold text-red-600 bg-white px-2 py-1 rounded-full shadow-sm">
                    Red
                  </span>
                </div>
              </div>
              {/* Blue Team Flag */}
              <div
                className="absolute bottom-full left-0 mb-2 transition-all duration-300"
                style={{
                  left: `${blueProgress}%`,
                  transform: 'translateX(-50%)',
                }}
              >
                <div className="relative flex flex-col items-center">
                  <div className="bg-white rounded-full p-2 shadow-lg">
                    <Flag className="h-6 w-6 text-blue-600" />
                  </div>
                  <span className="mt-1 text-sm font-semibold text-blue-600 bg-white px-2 py-1 rounded-full shadow-sm">
                    Blue
                  </span>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}