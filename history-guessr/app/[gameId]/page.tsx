import { GameNotFound } from "@/components/game-not-found";
import { QuizDisplay } from "@/components/quiz-display";
import { TeamSelection } from "@/components/team-selection";


const isValidId = (id: string) => {
    const regex = /^[a-zA-Z0-9]{8}$/;
    return regex.test(id);
  };

export default async function GamePage({
    params: { gameId },
  }: {
    params: { gameId: string},
  }) {
    
    if (!isValidId(gameId)) {
      return <GameNotFound/>;
    }
  
    return <TeamSelection/>;
  }