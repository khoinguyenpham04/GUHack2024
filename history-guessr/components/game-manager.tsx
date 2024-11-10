"use client";

import usePartySocket from "partysocket/react";
import React, { useEffect, useState } from "react";
import { GamePage } from "./game-page";
import { TeamSelection } from "./team-selection";
import HostLobby from "./host-lobby";

export function GameManager({ gameId }: { gameId: string }) {
    const [isHost, setHost] = useState<boolean | null>(null); // null indicates no data received yet

    const gameSocket = usePartySocket({
        host: "localhost:1984",
        room: gameId,

        onMessage(event) {
            const dataReceived = JSON.parse(event.data);
            console.log("Received message:", dataReceived);
        
            const { type, ...payload } = dataReceived; // Extract type and remaining data as payload
        
            switch (type) {
                case "PLAYER_JOINED":
                    // Handle connection initialization or status update
                    if (typeof dataReceived.host === "boolean") {
                        setHost(dataReceived.host); // Update the host status
                    }
                    break;
        
                default:
                    console.warn("Unknown message type:", type);
                    break;
            }
        }
    });

    // Conditional rendering based on host status
    if (isHost === null) {
        // Show a loading or connecting state if host status is not yet determined
        return <div>Connecting...</div>;
    }

    // Render either HostView or ClientView based on isHost
    return isHost ? <HostLobby/> : <TeamSelection/>;
}

// Example Host and Client views
function HostView() {
    return (
        <div>
            <h1>Host View</h1>
            {/* Host-specific UI components */}
        </div>
    );
}

