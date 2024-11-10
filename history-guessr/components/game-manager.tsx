"use client";

import usePartySocket from "partysocket/react";
import React, { useState } from "react";
import { ClientGamePage } from "./game-page";
import { TeamSelection } from "./team-selection";
import HostLobby from "./host-lobby";
import ClientWaitForHost from "./waiting-for-host";
import { QuizDisplay } from "./quiz-display";
import ClientResultPage from "./game-result";
import { HistoricEvent, historicEvents } from "@/party/data";


enum GameState {
    CONNECTING = 'CONNECTING',
    TEAM_SELECTION = 'TEAM_SELECTION',
    HOST_WAIT_FOR_START = 'HOST_WAIT_FOR_START',
    CLIENT_WAIT_FOR_START = 'CLIENT_WAIT_FOR_START',
    HOST_QUESTION = 'HOST_QUESTION',
    CLIENT_QUESTION = 'CLIENT_QUESTION',
    DISPLAY_ANSWERS = 'DISPLAY_ANSWERS',
    GAME_OVER = 'GAME_OVER',
}

export function GameManager({ gameId }: { gameId: string }) {
    const [isHost, setHost] = useState<boolean | null>(null);
    const [gameState, setGameState] = useState<GameState>(GameState.CONNECTING);
    const [currentImageUrl, setCurrentImageUrl] = useState(String);
    const [roundNum, setCurrentRound] = useState<number>(0);
    const [hevent, setHEvent] = useState<HistoricEvent>({name: "", desc: "", img: "", year: 1950, long: 0, lat: 0});
    const [yearScore, setYearScore] = useState<number>(0);
    const [locScore, setLocScore] = useState<number>(0);
    const [totScore, setTotScore] = useState<number>(0);
    const [guessLat, setGuessLat] = useState<number>(0);
    const [guessLng, setGuessLng] = useState<number>(0);
    const [guessYear, setGuessYear] = useState<number>(1950);
    
    const handleNextRound = () => {
        setCurrentRound(prevRoundNum => prevRoundNum + 1);
    };

    const gameSocket = usePartySocket({
        host: "localhost:1984",
        room: gameId,

        onMessage(event) {
            const dataReceived = JSON.parse(event.data);
            console.log("Received message:", dataReceived);

            const { type, ...payload } = dataReceived;

            switch (type) {
                case "PLAYER_JOINED":
                

                    if (typeof dataReceived.host === "boolean") {
                        setHost(dataReceived.host); // Update the host status
                    }

                    // Use dataReceived.host directly instead of isHost
                    if (dataReceived.host === true) {
                        console.log("Host");
                        setGameState(GameState.HOST_WAIT_FOR_START);
                    } else {
                        console.log("PLAYER");
                        setGameState(GameState.TEAM_SELECTION);
                    }

                    break;

                case "CLIENT_WAIT_FOR_START":
                    if (!isHost) {
                        setGameState(GameState.CLIENT_WAIT_FOR_START);
                    }
                    break;

                case "GAME_STARTED":
                    setCurrentRound(0);
                    setGameState(GameState.HOST_WAIT_FOR_START);
                    break;

                case "NEW_QUESTION":
                    handleNextRound()

                    if (isHost) {
                        setGameState(GameState.HOST_QUESTION);
                    } else {
                        setGameState(GameState.CLIENT_QUESTION);
                    }
                    break;

                case "QUESTION":
                    if (typeof dataReceived.img === "string") {
                        setCurrentImageUrl(dataReceived.img); // Update the host status
                    }
                    break;

                case "DISPLAY_ANSWERS":
                    const { historicEvent, guessLng, guessLat, guessYear, year, location, total } = dataReceived;
                    setHEvent(historicEvent);
                    setGuessLng(guessLng);
                    setGuessLat(guessLat);
                    setYearScore(year);
                    setLocScore(Math.trunc (location));
                    setTotScore(Math.trunc (total));
                    setGuessYear(guessYear);

                    setGameState(GameState.DISPLAY_ANSWERS);
                    
                    break;


                case "GAME_OVER":
                    setGameState(GameState.GAME_OVER);
                    break;

                case "UPDATE_PROGRESS":
                    break;

                default:
                    console.warn("Unknown message type:", type);
                    break;
            }
        }
    });


    if (gameState === GameState.CONNECTING) {
        return <div>Connecting...</div>;
    }

    if (gameState === GameState.TEAM_SELECTION) {
        return <TeamSelection gameSocket={gameSocket} />;
    }

    if (gameState === GameState.HOST_WAIT_FOR_START) {
        return <HostLobby gameSocket={gameSocket} />;
        // return <ClientGamePage gameSocket={gameSocket} imageUrl={currentImageUrl}/>;
    }

    if (gameState === GameState.CLIENT_WAIT_FOR_START) {
        return <ClientWaitForHost />;
    }

    if (gameState === GameState.DISPLAY_ANSWERS) {
        return <ClientResultPage gameSocket={gameSocket} historicEvent={hevent} guessLng={guessLng} guessLat={guessLat} year={yearScore} location={locScore} total={totScore} />;
    }

    if (gameState === GameState.HOST_QUESTION) {
        return <QuizDisplay gameSocket={gameSocket} imageUrl={currentImageUrl} roundNum={roundNum} />
    }

    if (gameState === GameState.CLIENT_QUESTION) {
        return <ClientGamePage gameSocket={gameSocket} imageUrl={currentImageUrl} />;
    }

    // if (gameState === GameState.DISPLAY_ANSWERS) {
    //     return <ClientResultPage gameSocket={gameSocket} historicEvent={} guessLng={0} guessLat={0} year={0} location={0} total={0} />;
    // }

    if (gameState === GameState.GAME_OVER) {
        return <div>Game Over!</div>;
    }

    return <></>;
}


//     // Conditional rendering based on host status
//     if (isHost === null) {
//         // Show a loading or connecting state if host status is not yet determined
//         return <div>Connecting...</div>;
//     }

//     // Render either HostView or ClientView based on isHost
//     return isHost ? <HostLobby /> : <TeamSelection gameSocket={gameSocket} />;
// }

// // Example Host and Client views
// function HostView() {
//     return (
//         <div>
//             <h1>Host View</h1>
//             {/* Host-specific UI components */}
//         </div>
//     );
// }

