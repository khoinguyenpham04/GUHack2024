'use client'

import { motion } from "framer-motion"
import { useEffect } from "react"
import confetti from 'canvas-confetti'
import { Trophy } from "lucide-react"

interface WinningAnnouncementProps {
  winner: 'RED' | 'BLUE'
  score?: { red: number; blue: number }
  onPlayAgain?: () => void
  onBackToLobby?: () => void
}

export default function WinningAnnouncement({ 
  winner, 
  score = { red: 0, blue: 0 },
  onPlayAgain,
  onBackToLobby
}: WinningAnnouncementProps) {
  const colors = {
    RED: {
      primary: 'from-rose-500 to-red-600',
      secondary: 'from-rose-400 to-red-500',
      accent: 'bg-red-50',
      text: 'text-red-600',
      confetti: ['#ff0000', '#ff4d4d', '#ff9999']
    },
    BLUE: {
      primary: 'from-blue-500 to-indigo-600',
      secondary: 'from-blue-400 to-indigo-500',
      accent: 'bg-blue-50',
      text: 'text-blue-600',
      confetti: ['#0066ff', '#4d94ff', '#99c2ff']
    }
  }

  useEffect(() => {
    // Fire confetti
    const duration = 3 * 1000
    const animationEnd = Date.now() + duration
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 }

    function randomInRange(min: number, max: number) {
      return Math.random() * (max - min) + min
    }

    const interval: any = setInterval(function() {
      const timeLeft = animationEnd - Date.now()

      if (timeLeft <= 0) {
        return clearInterval(interval)
      }

      const particleCount = 50 * (timeLeft / duration)
      
      confetti({
        ...defaults,
        particleCount,
        colors: colors[winner].confetti,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
      })
      confetti({
        ...defaults,
        particleCount,
        colors: colors[winner].confetti,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
      })
    }, 250)

    return () => clearInterval(interval)
  }, [winner])

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col items-center justify-center p-8">
      <motion.div
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ 
          duration: 0.7,
          type: "spring",
          bounce: 0.4
        }}
        className="relative"
      >
        {/* Trophy Icon with Glow */}
        <div className={`absolute -top-24 left-1/2 -translate-x-1/2 ${colors[winner].text}`}>
          <motion.div
            animate={{ 
              scale: [1, 1.2, 1],
              rotate: [0, 5, -5, 0]
            }}
            transition={{ 
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            <Trophy size={80} className="filter drop-shadow-lg" />
          </motion.div>
        </div>

        {/* Main Card */}
        <motion.div
          className="bg-white rounded-3xl shadow-2xl p-12 w-[480px] text-center relative overflow-hidden"
          initial={{ y: 20 }}
          animate={{ y: 0 }}
          transition={{ delay: 0.2 }}
        >
          {/* Background Gradient Orb */}
          <div className={`absolute -top-32 -left-32 w-96 h-96 bg-gradient-to-br ${colors[winner].primary} rounded-full filter blur-3xl opacity-20`} />
          <div className={`absolute -bottom-32 -right-32 w-96 h-96 bg-gradient-to-br ${colors[winner].secondary} rounded-full filter blur-3xl opacity-20`} />

          {/* Content */}
          <div className="relative z-10">
            <h1 className={`text-6xl font-bold bg-gradient-to-r ${colors[winner].primary} bg-clip-text text-transparent mb-6`}>
              {winner} WINS!
            </h1>
            
            <div className="flex justify-center gap-8 mb-8 font-mono">
              <div className="text-red-500 text-2xl font-bold">{score.red}</div>
              <div className="text-gray-400 text-2xl">-</div>
              <div className="text-blue-500 text-2xl font-bold">{score.blue}</div>
            </div>

            {/* Buttons */}
            <div className="flex flex-col gap-4">
              <button
                onClick={onPlayAgain}
                className={`
                  w-full py-4 px-8 rounded-2xl font-semibold text-white
                  bg-gradient-to-br ${colors[winner].primary}
                  transform transition-all duration-200
                  hover:scale-[1.02] active:scale-[0.98]
                  shadow-[0_4px_0_rgb(0,0,0,0.2)]
                  active:shadow-[0_0px_0_rgb(0,0,0,0.2)]
                  active:translate-y-[4px]
                `}
              >
                Play Again
              </button>
              
              <button
                onClick={onBackToLobby}
                className="
                  w-full py-4 px-8 rounded-2xl font-semibold
                  bg-white text-gray-600
                  transform transition-all duration-200
                  hover:scale-[1.02] active:scale-[0.98]
                  shadow-[0_4px_0_rgb(0,0,0,0.1)]
                  active:shadow-[0_0px_0_rgb(0,0,0,0.1)]
                  active:translate-y-[4px]
                  border border-gray-200
                "
              >
                Back to Lobby
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  )
}

// <WinningAnnouncement 
//   winner="BLUE"
//   score={{ red: 2, blue: 3 }}
//   onPlayAgain={() => console.log('Play again')}
//   onBackToLobby={() => console.log('Back to lobby')}
// />