import type * as Party from "partykit/server";
import { historicEvents, HistoricEvent } from './data';
import { calculateUserScore } from "./utils";
import { uniqueNamesGenerator, Config, adjectives, colors, animals } from 'unique-names-generator';
import { json } from "stream/consumers";


/*

These define the message types that the server will receive from the client
*/

const NUM_QS = 5;

export enum MessageType {
    HostCommand = "hostCommand",
    Guess = "guess",
    JoinTeam = "joinTeam"
}

export type Answer = {
    lat: number;
    long: number;
    year: number;
}

export enum TeamType {
    Red = "red",
    Blue = "blue"
}

export type Message = {
    type: MessageType;
    // Answer is for Guess, TeamType is for JoinTeam
    content: Answer | TeamType | null;
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

export type Host = {
    id: string;
}

interface GeoContext extends Party.ConnectionContext {
    name: string;
    isBlue: boolean;
    room: string;
}


// When a user first goes to the URL
export default class Server implements Party.Server {
    constructor(readonly room: Party.Room) { }
    async onConnect(conn: Party.Connection, ctx: GeoContext) {
        // If the person is the first person to join the room, make them host
        if (this.room.connections.size === 1) {
            // Set them as host
            let newHost: Host = {id: conn.id}; 
            // Store it
            await this.room.storage.put("host", newHost);
            // If we are the first connection, we are the host and we don't need to do anything else
            // Let them know
            conn.send(JSON.stringify(
                {
                    "type": "PLAYER_JOINED",
                    "host": true

                }));
            // xddd
            return;
        }
        // If we are here, we are adding a player, not a host

        // Get red team, initilaise as empty if not there
        let redTeam: TeamData =
            (await this.room.storage.get("redTeam") ?? { players: [], isBlueTeam: false, score: 0 });

        // Get blue team, initilaise as empty if not there
        let blueTeam: TeamData =
            (await this.room.storage.get("blueTeam") ?? { players: [], isBlueTeam: true, score: 0 });

        // Store them
        await this.room.storage.put("redTeam", redTeam);
        await this.room.storage.put("blueTeam", blueTeam);

        // Send the player to the choose team screen
        conn.send(JSON.stringify(
            {
                "type": "PLAYER_JOINED",
                "host": false 
            }));

    }

    // Not sure what this does tbh
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
        "type": ONE OF: "hostCommand", "guess", "joinTeam"
        "answer": (lat, long, date) | TeamType | null
    }

    This fun handles messages sent from the front end
    */
    async onMessage(message: string, sender: Party.Connection) {
        // We pass messages with class and civility: JSON
        let message_json = JSON.parse(message);
        // Get the Host
        let host: Host = await this.room.storage.get("host") ?? {id: ""};

        // If the message is a host command and the sender id is the host...
        if (message_json.type == "HOST_COMMAND" && sender.id === host.id ) {
            // ... then handle the command
            this.handleHostCommand(message_json.content, sender.id);
        }

        // If we are recieveing a message containing a guess, handle it
        else if (message_json.type == "GUESS") {
            this.room.broadcast(JSON.stringify({"type": "CLIENT_WAIT_FOR_START"}));
            // Get the current question so we can compare to the guess
            let currentQ: HistoricEvent | undefined = await this.room.storage.get("currentQuestion");
            // L OL
            if (currentQ === undefined) return;
            // Break it down
            let cLat: number = currentQ.lat;
            let cLong: number = currentQ.long;
            let cYear: number = currentQ.year;
            // Pass all that to update scores
            this.handleGuess(JSON.stringify(message_json.answer), cLong , cLat, cYear, sender.id);

            let red: TeamData =
                (await this.room.storage.get("redTeam") ?? { players: [], isBlueTeam: false, score: 0 });

            // Get blue team, initilaise as empty if not there
            let blue: TeamData =
                (await this.room.storage.get("blueTeam") ?? { players: [], isBlueTeam: true, score: 0 });


            this.room.broadcast(JSON.stringify(this.calculateProgress(red, blue)));

            this.room.broadcast(JSON.stringify(
                {
                    "type": "TOP_5",
                    "content": this.getNBestPlayers(5)
                }
            ));

        }

        // If we are handling a player joining a team, add them
        else if (message_json.type == "JOIN_TEAM") {
            // Answer contains the team to join as "blue" or "red" (sorry tom no ENUMS)
            let team: string = message_json.answer;
            const rdmName: string = uniqueNamesGenerator({
                dictionaries: [adjectives, colors, animals]
              });
            let thisPlayer: PlayerData= {
                id: sender.id,
                // Place holder ass name
                name: rdmName,
                // readable
                isBlue: team === TeamType.Blue,
                cumScore: 0,
                isHost: false 
            }

            // Add to relevant teamk
            if (team === "blue") {
                // Grab em or make em
                let blues: TeamData = await this.room.storage.get("blueTeam") ?? { players: [], isBlueTeam: true, score: 0 };
                // Push it push it
                blues.players.push(thisPlayer);
                // Store it (inshallah it updates)
                await this.room.storage.put("blueTeam", blues);
            // same here
            } else if (team === "red" ){
                let reds: TeamData = await this.room.storage.get("redTeam") ?? { players: [], isBlueTeam: false, score: 0 };
                reds.players.push(thisPlayer);
                await this.room.storage.put("redTeam", reds);
            }
            // Update the FSM for front end
            this.room.broadcast(JSON.stringify({ "type": "CLIENT_WAIT_FOR_START" }));
        }

    }

    calculateProgress(red: TeamData, blue: TeamData) {
        let redCount: number = red.players.length;
        let blueCount: number = blue.players.length;

        let redScore: number = red.score;
        let blueScore: number = blue.score;

        let redMax: number = 1000 * NUM_QS * redCount;
        let blueMax: number = 1000 * NUM_QS * blueCount;

        return {
            "type": "PROGRESS_UPDATE",
            "redProgress": redMax / redScore,
            "blueProgress": blueMax / blueScore
        };


    }

    // Helper function to handle a host command
    async handleHostCommand(cmd: string, id: string): Promise<void> {
        // cmd contains the body of the JSON
        switch (cmd) {
                // Logic for starting the game
                case "GAME_START":
                    // Set current question to 0
                    await this.room.storage.put("questionNum", 0);
                    // Get the next q? why? 
                    var q = await this.getNextQuestion();
                    // Send updates to front end andys
                    this.room.broadcast(JSON.stringify({ "type": "NEW_QUESTION" }));
                    // Give them the img url
                    this.room.broadcast(JSON.stringify({ "type": "QUESTION", "img": q.img }));
                    break;
                // Put the question in the bag bro
                case "nextQuestion":
                    // Get the next q
                    var q = await this.getNextQuestion();
                    // TOOD
                    this.room.broadcast(
                        `Next Questions" ${q.img}`,
                        // ...except for the connection it came from
                        [id]
                    );
                    break;

                // End the round, show the correct answer
                case "endRound":
                    // Get correct answer
                    let currentQ: HistoricEvent | undefined = await this.room.storage.get("currentQuestion");


                    // Give it to front end boys
                    this.room.broadcast(
                        JSON.stringify(currentQ),
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

    async updateCumScore(id: string, score: number) : Promise<void> {
        let redTeam: TeamData = await this.room.storage.get("redTeam") ?? { players: [], isBlueTeam: false, score: 0 };
        let blueTeam: TeamData = await this.room.storage.get("blueTeam") ?? { players: [], isBlueTeam: true, score: 0 };

        let player: PlayerData | undefined = redTeam.players.find(p => p.id === id);
        if (player === undefined) player = blueTeam.players.find(p => p.id === id);

        if (player === undefined) return;

        player.cumScore += score;
        console.log(player);

        if (player.isBlue) {
            await this.room.storage.put("blueTeam", blueTeam);
            console.log(await this.room.storage.get("blueTeam"));
        } else {
            await this.room.storage.put("redTeam", redTeam);
        }
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
            //console.log(blueTeam);
            // XXX does not update cum score
            this.updateCumScore(id, usrScore);
            //console.log(blueTeam);
            await this.room.storage.put("blueTeam", blueTeam);

        } else {
            let redTeam: TeamData = await this.room.storage.get("redTeam") ?? { players: [], isBlueTeam: true, score: 0};
            redTeam.score += usrScore;
            this.updateCumScore(id, usrScore);
            await this.room.storage.put("redTeam", redTeam);
        }
    }

    async getNBestPlayers(n: number) {
        let blueTeam: TeamData = await this.room.storage.get("blueTeam") ?? { players: [], isBlueTeam: true, score: 0 };
        let redTeam: TeamData = await this.room.storage.get("redTeam") ?? { players: [], isBlueTeam: false, score: 0 };

        let players: PlayerData[] = blueTeam.players.concat(redTeam.players);
        players.sort((a, b) => b.cumScore - a.cumScore);
        return players.slice(0, n);
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