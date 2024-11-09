'use client'

import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Flag } from "lucide-react";
import { useState } from "react";

interface Player {
  name: string;
  score: number;
  team: 'red' | 'blue';
}

export function QuizDisplay() {

  const [currentRound, setCurrentRound] = useState(0);
  const totalRounds = 5;
  const [players, setPlayers] = useState<Player[]>([

    { name: "player 1", score: 5000, team: 'blue' },
    { name: "player 2", score: 5000, team: 'red' },
    { name: "player 3", score: 0, team: 'red' },
    { name: "player 4", score: 4, team: 'red' },
    { name: "player 5", score: 0, team: 'red' },
    { name: "player 5", score: 2, team: 'red' },
    { name: "player 5", score: 0, team: 'red' },
  ]);

  // Team progress values (0-100)
  const [redProgress, setRedProgress] = useState(90);
  const [blueProgress, setBlueProgress] = useState(40);
  // Determine max progress and team color based on the higher progress
  const maxProgress = Math.max(redProgress, blueProgress);
  const progressColor = maxProgress === redProgress ? 'bg-red-600' : 'bg-blue-600';

  return (
    <div className="container mx-auto p-4 space-y-6">
      {/* Round Counter */}
      <div className="flex justify-center">
        <div className="bg-blue-100 rounded-full px-6 py-2 text-2xl font-bold text-blue-900">
          {currentRound} / {totalRounds}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Image Section */}
        <Card className="aspect-video bg-blue-50 flex items-center justify-center">
          <img
            src="/placeholder.svg?height=400&width=600"
            alt="Quiz question image"
            className="rounded-lg object-cover"
            width={600}
            height={400}
          />
        </Card>

        {/* Leaderboard Section */}
        <Card className="p-4 bg-blue-50">
          <h2 className="text-2xl font-bold text-blue-900 mb-4">Top Score</h2>
          <div className="space-y-2">
            {players
              .sort((a, b) => b.score - a.score) // Sort by score in descending order
              .slice(0, 5) // Take only the top 5 scores
              .map((player, index) => (
                <div
                  key={index}
                  className={`p-3 rounded-lg text-white font-semibold flex justify-between ${player.team === 'blue' ? 'bg-blue-600' : 'bg-red-600'
                    }`}
                >
                  <span>{player.name}</span>
                  <span>{player.score}</span>
                </div>
              ))}
          </div>
        </Card>
      </div>

      {/* Progress Bars */}
      <Card className="p-12 bg-blue-50">
        <div className="space-y-4">
          {/* Red and Blue Team Progress */}
          <div className="relative flex items-center">
            {/* Centered Progress Bar */}
            <Progress value={maxProgress} className={`h-4 ${progressColor} w-full`} />

            {/* Red Team Flag */}
            <div
              className="absolute"
              style={{
                top: '-80%', // Center vertically
                left: `${redProgress}%`,
                transform: 'translate(-20%, -60%)', // Center horizontally, adjust vertically
              }}
            >
              <Flag className="h-8 w-8 text-red-600" />
            </div>

            {/* Blue Team Flag */}
            <div
              className="absolute"
              style={{
                top: '-80%', // Center vertically
                left: `${blueProgress}%`,
                transform: 'translate(-20%, -60%)', // Center horizontally, adjust vertically
              }}
            >
              <Flag className="h-8 w-8 text-blue-600" />
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}