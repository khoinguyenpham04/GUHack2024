import { GameResult } from "./game-result"

export default function GamePage() {
    const historicalEvent = {
      title: "President Barack Obama signing a bill to award a Congressional Gold Medal to Women Airforce Service Pilots",
      year: 2009,
      description: "Obama White House Archived from Washington, DC, Public domain, via Wikimedia Commons",
      imageUrl: "",
      location: [-77.0365, 38.8977] as [number, number]
    }
  
    const userGuess = [-87.6298, 41.8781] as [number, number]
  
    const scores = {
      year: 1000,
      location: 1827,
      total: 2827
    }
  
    const handleNextRound = () => {
      // Implement your logic for moving to the next round
      console.log("Moving to next round")
    }
  
    return (
      <GameResult
        historicalEvent={historicalEvent}
        guess={userGuess}
        scores={scores}
        onNextRound={handleNextRound}
      />
    )
  }