import type * as Party from "partykit/server";
import { historicEvents, HistoricEvent } from './data';
import { calculateUserScore } from "./utils";

/*
These define the message types that the server will receive from the client
*/

export enum MessageType {
    HostCommand = "hostCommand",
    Guess = "guess"
}

export type Answer = {
    questionNumber: number;
    lat: number;
    long: number;
    year: number;
}

export type Message = {
    type: MessageType;
    content: Answer | null;
}

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

        let p: PlayerData = {
            id: conn.id,
            name: ctx.name,
            isBlue: ctx.isBlue,
            cumScore: 0,
            isHost: conn.id === "1" // Separate endpoint for host !!!
        };

        let redTeam: TeamData =
            (await this.room.storage.get("redTeam") ?? { players: [], isBlueTeam: false, score: 0 });

        let blueTeam: TeamData =
            (await this.room.storage.get("blueTeam") ?? { players: [], isBlueTeam: true, score: 0 });

        let questionNum =
            (await this.room.storage.get("questionNum") ?? 0);

        // Assign new player to the team
        if (p.isBlue) blueTeam.players.push(p);
        else redTeam.players.push(p);

        await this.room.storage.put("redTeam", redTeam);
        await this.room.storage.put("blueTeam", blueTeam);

        conn.send(JSON.stringify(this.getNextQuestion()));
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

    /*
    Messages expected format:
    {
        "type": ONE OF: "hostCommand", "guess"
        "answer": (lat, long, date)
    }
    */
    async onMessage(message: string, sender: Party.Connection) {
        // let's log the message
        // console.log(`connection ${sender.id} sent message: ${message}`);

        let message_json = JSON.parse(message);
        if (message_json.type == "hostCommand") {
            this.handleHostCommand(message_json.content, sender.id);
        }
        else if (message_json == "guess") {
            let currentQ: HistoricEvent | undefined = await this.room.storage.get("currentQuestion");
            if (currentQ === undefined) return;
            let cLat: number = currentQ.lat;
            let cLong: number = currentQ.long;
            let cYear: number = currentQ.year;
            this.handleGuess(JSON.stringify(message_json.answer), cLong , cLat, cYear, sender.id);
        }

        this.room.broadcast(
            `${sender.id}: ${message}`,
            // ...except for the connection it came from
            [sender.id]
        );
    }

    async handleHostCommand(cmd: string, id: string): Promise<void>{
        switch (cmd) {
                case "startGame":
                    await this.room.storage.put("questionNum", 0);
                    var q = await this.getNextQuestion();
                    this.room.broadcast(
                        `Next Questions" ${q.img}`,
                        // ...except for the connection it came from
                        [id]
                    );
                    break;
                case "nextQuestion":
                    var q = await this.getNextQuestion();
                    this.room.broadcast(
                        `Next Questions" ${q.img}`,
                        // ...except for the connection it came from
                        [id]
                    );
                    break;
            }
    }
    
    async getTeamOfPlayer(id: string): Promise<Boolean | undefined>  {
        let redTeam: TeamData | undefined = await this.room.storage.get("redTeam");
        let blueTeam: TeamData | undefined = await this.room.storage.get("blueTeam");

        if (redTeam === undefined || blueTeam === undefined) return undefined;

        let player: PlayerData | undefined = redTeam.players.find(p => p.id === id);
        if (player === undefined) player = blueTeam.players.find(p => p.id === id);

        return player === undefined ? undefined : player.isBlue;
    }

    async handleGuess(guess: string, correctLong: number, correctLat: number, correctDate: number, id: string): Promise<void> {
        // Check if the answer is correct
        let guessJSON = JSON.parse(guess);
        let usrScore: number = calculateUserScore(correctLat, correctLong, correctDate, guessJSON.lat, guessJSON.long, guessJSON.year);
        // Defaults to red team
        let usrTeam  = await this.getTeamOfPlayer(id) ?? false;

        // Update the score
        if (usrTeam) {
            let blueTeam: TeamData = await this.room.storage.get("blueTeam") ?? { players: [], isBlueTeam: true, score: 0 };
            blueTeam.score += usrScore;
            await this.room.storage.put("blueTeam", blueTeam);
        }
        else {
            let redTeam: TeamData = await this.room.storage.get("redTeam") ?? { players: [], isBlueTeam: true, score: 0};
            redTeam.score += usrScore;
            await this.room.storage.put("redTeam", redTeam);
        }
        // Send the next question
    }

    async getNextQuestion(): Promise<HistoricEvent> {
        let i: number | undefined = await this.room.storage.get("questionNum");
        if (i === undefined) i = 0;
        let q = historicEvents[i];
        i++;
        this.room.storage.put("questionNum", i);
        this.room.storage.put("currentQuestion", q);
        return q;
    }
}

Server satisfies Party.Worker;