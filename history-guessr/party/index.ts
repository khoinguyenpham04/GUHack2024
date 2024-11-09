import type * as Party from "partykit/server";
import { historicEvents, HistoricEvent } from './data';

export type PlayerData = {
    id: string;
    name: string;
    isBlue: boolean;
    cumScore: number;
    isHost: boolean;
}

export type TeamData = {
    players: PlayerData[];
    isBlueTeam: boolean;
    score: number;
}

interface GeoContext extends Party.ConnectionContext {
    name: string;
    isBlue: boolean;
}

export default class Server implements Party.Server {
    constructor(readonly room: Party.Room) { }
    async onConnect(conn: Party.Connection, ctx: GeoContext) {
        // A websocket just connected!
        console.log(
            `Connected:
                id: ${conn.id}
                room: ${this.room.id}
                url: ${new URL(ctx.request.url).pathname}`
        );

        // let's send a message to the connection
        conn.send("hello from server");

        let p : PlayerData = {
            id: conn.id, 
            name: ctx.name,
            isBlue: ctx.isBlue,
            cumScore: 0,
            isHost: conn.id === "1" // Separate endpoint for host !!!
        };

        let redTeam: TeamData =
            (await this.room.storage.get("redTeam") ?? {players: [], isBlueTeam: false, score: 0});

        let blueTeam: TeamData =
            (await this.room.storage.get("blueTeam") ?? {players: [], isBlueTeam: true, score: 0});

        // Assign new player to the team
        if (p.isBlue) blueTeam.players.push(p);
        else redTeam.players.push(p);

        await this.room.storage.put("redTeam", redTeam);
        await this.room.storage.put("blueTeam", blueTeam);

        conn.send(JSON.stringify(this.getQuestion(0)));
    }

    async onRequest(req: Party.Request): Promise<Response> {
        // Handle different HTTP methods
        if (req.method === "GET") {
            return new Response("public/index.html", {
                status: 200,
                headers: { "Content-Type": "text/html" },
            });
        }

        // Return 404 for unhandled requests
        return new Response("Not Found", { status: 404 });
    }

    onMessage(message: string, sender: Party.Connection) {
        // let's log the message
        console.log(`connection ${sender.id} sent message: ${message}`);
        // as well as broadcast it to all the other connections in the room...
        switch (message) {
            case "startGame":
                // Send all the users the first question
                //sender.send(JSON.stringify(this.getQuestion(0)));
                this.room.broadcast(
                    `${sender.id}: ${"start"}`,
                    // ...except for the connection it came from
                    [sender.id]
                );

                break
            case "nextQuestion":
                
                this.room.broadcast(
                    `${sender.id}: ${"start"}`,
                    // ...except for the connection it came from
                    [sender.id]
                );
                break;
            case "reset":
                this.room.broadcast("reset", []);
                break;
        }

        this.room.broadcast(
            `${sender.id}: ${message}`,
            // ...except for the connection it came from
            [sender.id]
        );
    }

    getQuestion(i: number): HistoricEvent {
        // Open CSV file and get a random question
        return historicEvents[i];
    }
}

Server satisfies Party.Worker;
