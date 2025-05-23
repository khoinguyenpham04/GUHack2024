import type * as Party from "partykit/server";
import { historicEvents, HistoricEvent } from './data';
import { calculateUserScore, haversineDistance, dateDifference } from "./utils";
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
    mostRecentGuessScore: number;
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
            let newHost: Host = { id: conn.id };
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
        let host: Host = await this.room.storage.get("host") ?? { id: "" };

        // If the message is a host command and the sender id is the host...
        if (message_json.type == "HOST_COMMAND" && sender.id === host.id) {
            // ... then handle the command
            this.handleHostCommand(message_json.content, sender.id);
        }

        // If we are recieveing a message containing a guess, handle it
        else if (message_json.type == "GUESS") {
            // Get the current question so we can compare to the guess
            let currentQ: HistoricEvent | undefined = await this.room.storage.get("currentQuestion");
            // L OL
            if (currentQ === undefined) return;
            // Break it down
            let cLat: number = currentQ.lat;
            let cLong: number = currentQ.long;
            let cYear: number = currentQ.year;
            // Pass all that to update scores
            this.handleGuess(JSON.stringify(message_json.answer), cLong, cLat, cYear, sender.id);
            const guessLong = message_json.answer.long;
            const guessLat = message_json.answer.lat;
            const guessDate = message_json.answer.year;

            const MAX_SCORE = 5000;
            const distance = haversineDistance(cLat, cLong, guessLat, guessLong);
            const maxDistance = 20020; // Maximum distance between two points on Earth
            // const distanceScore = MAX_SCORE * Math.exp((-distance / maxDistance));
            const DISTANCE_SCALING_FACTOR = 4000; // Adjust this as needed
            const dateDiff = dateDifference(cYear, guessDate);

            function calculateDistanceScore(distance: number): number {
                return Math.round(MAX_SCORE * Math.exp(-distance / DISTANCE_SCALING_FACTOR));
            }

            const DATE_SCALING_FACTOR =2 ; // Adjust based on typical date ranges

            function calculateDateScore(dateDiff: number): number {
                return Math.round(MAX_SCORE * Math.exp(-dateDiff / DATE_SCALING_FACTOR));
            }
            const distanceScore = calculateDistanceScore(distance);
            const dateScore = calculateDateScore(dateDiff);

            
            const maxDateDiff = 100;
            // const dateScore = MAX_SCORE * Math.exp((-dateDiff / maxDateDiff));


            sender.send(JSON.stringify(
                {
                    "type": "DISPLAY_ANSWERS",
                    "historicEvent": currentQ,
                    "guessLng": message_json.answer.long,
                    "guessLat": message_json.answer.lat,
                    "guessYear": message_json.answer.year,
                    "year": dateScore,
                    "location": distanceScore,
                    "total": dateScore + distanceScore
                }
            ));

            let red: TeamData =
                (await this.room.storage.get("redTeam") ?? { players: [], isBlueTeam: false, score: 0 });

            // Get blue team, initilaise as empty if not there
            let blue: TeamData =
                (await this.room.storage.get("blueTeam") ?? { players: [], isBlueTeam: true, score: 0 });


            const { redTeamScore, blueTeamScore, redTeamPlayerCount, blueTeamPlayerCount } = await this.getTeamCumulativeScores();
            console.log("Red Team Score:", redTeamScore);
            console.log("Blue Team Score:", blueTeamScore);

            this.room.broadcast(JSON.stringify(this.calculateProgress(redTeamScore, blueTeamScore, redTeamPlayerCount, blueTeamPlayerCount)));

            // const top5Players = await this.getNBestPlayers(5);
            // this.room.broadcast(JSON.stringify({
            //     "type": "TOP_5",
            //     "data": {
            //         "topPlayers": top5Players
            //     }
            // }));
            const playerDetails = await this.getCurrentPlayerDetails(sender.id);
            this.room.broadcast(JSON.stringify({
                "type": "PLAYER_SCORE_UPDATE",
                "player": playerDetails
            }));
        }

        // If we are handling a player joining a team, add them
        else if (message_json.type == "JOIN_TEAM") {
            // Answer contains the team to join as "blue" or "red" (sorry tom no ENUMS)
            let team: string = message_json.answer;
            const rdmName: string = uniqueNamesGenerator({
                dictionaries: [adjectives, colors, animals]
            });
            let thisPlayer: PlayerData = {
                id: sender.id,
                // Place holder ass name
                name: rdmName,
                // readable
                isBlue: team === "blue",
                cumScore: 0,
                mostRecentGuessScore: 0,
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
            } else if (team === "red") {
                let reds: TeamData = await this.room.storage.get("redTeam") ?? { players: [], isBlueTeam: false, score: 0 };
                reds.players.push(thisPlayer);
                await this.room.storage.put("redTeam", reds);
            }
            // Update the FSM for front end
            sender.send(JSON.stringify({ "type": "CLIENT_WAIT_FOR_START" }));
        }

        else if (message_json.type == "GET_TEAMS") {

        }

        else if (message_json.type == "DISPLAY_ANSWERS") {

        }

    }

    async getCurrentPlayerDetails(id: string): Promise<object> {
        // Retrieve teams from storage
        let redTeam: TeamData = await this.room.storage.get("redTeam") ?? { players: [], isBlueTeam: false, score: 0 };
        let blueTeam: TeamData = await this.room.storage.get("blueTeam") ?? { players: [], isBlueTeam: true, score: 0 };

        // Find the player in the red team or blue team
        let player = redTeam.players.find(p => p.id === id) || blueTeam.players.find(p => p.id === id);

        // If player is found, return their details as a JSON string
        if (player) {
            return {
                id: player.id,
                name: player.name,
                team: player.isBlue ? "blue" : "red",
                score: player.cumScore ?? null // Default to null if undefined
            };
        }

        // Return JSON string with null values if the player is not found
        return {
            id: null,
            name: "Unknown",
            team: "unknown",
            cumscore: null
        };
    }

    calculateProgress(red: number, blue: number, redPlayer: number, bluePlayers: number) {
        let redCount: number = redPlayer
        let blueCount: number = bluePlayers
        console.log(redCount)

        let redScore: number = red;
        let blueScore: number = blue;
        console.log(redScore)

        let adjustedRedCount = redCount === 0 ? 1 : redCount;
        let adjustedBlueCount = blueCount === 0 ? 1 : blueCount;

        let redMax: number = 1000 * NUM_QS * adjustedRedCount;
        let blueMax: number = 1000 * NUM_QS * adjustedBlueCount;

        let redProgress: number = redScore !== 0 ? Math.round((redScore / redMax)) : 0;
        let blueProgress: number = blueScore !== 0 ? Math.round((blueScore / blueMax)) : 0;


        console.log(redProgress)

        return {
            "type": "PROGRESS_UPDATE",
            "redProgress": redProgress,
            "blueProgress": blueProgress
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
            case "NEXT_QUESTION":

                // Get the next q
                var q = await this.getNextQuestion();
                // Send updates to front end andys
                this.room.broadcast(JSON.stringify({ "type": "NEW_QUESTION" }));
                // Give them the img url
                this.room.broadcast(JSON.stringify({ "type": "QUESTION", "img": q.img }));
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

    async getTeamOfPlayer(id: string): Promise<Boolean | undefined> {
        let redTeam: TeamData | undefined = await this.room.storage.get("redTeam");
        let blueTeam: TeamData | undefined = await this.room.storage.get("blueTeam");

        if (redTeam === undefined || blueTeam === undefined) return undefined;

        let player: PlayerData | undefined = redTeam.players.find(p => p.id === id);
        if (player === undefined) player = blueTeam.players.find(p => p.id === id);

        return player === undefined ? undefined : player.isBlue;
    }

    async updateCumScore(id: string, score: number): Promise<void> {
        let redTeam: TeamData = await this.room.storage.get("redTeam") ?? { players: [], isBlueTeam: false, score: 0 };
        let blueTeam: TeamData = await this.room.storage.get("blueTeam") ?? { players: [], isBlueTeam: true, score: 0 };

        let player: PlayerData | undefined = redTeam.players.find(p => p.id === id);
        if (player === undefined) player = blueTeam.players.find(p => p.id === id);

        if (player === undefined) return;

        player.cumScore += score;
        player.mostRecentGuessScore = score;
        console.log(player);

        if (player.isBlue) {
            await this.room.storage.put("blueTeam", blueTeam);
            console.log(await this.room.storage.get("blueTeam"));
        } else {
            await this.room.storage.put("redTeam", redTeam);
        }
    }

    async getTeamCumulativeScores(): Promise<{ redTeamScore: number; blueTeamScore: number; redTeamPlayerCount: number; blueTeamPlayerCount: number }> {
        // Retrieve the teams from storage
        let redTeam: TeamData = await this.room.storage.get("redTeam") ?? { players: [], isBlueTeam: false, score: 0 };
        let blueTeam: TeamData = await this.room.storage.get("blueTeam") ?? { players: [], isBlueTeam: true, score: 0 };

        // Calculate cumulative scores by summing up each player's cumScore
        const redTeamScore = redTeam.players.reduce((total, player) => total + player.cumScore, 0);
        const blueTeamScore = blueTeam.players.reduce((total, player) => total + player.cumScore, 0);

        // Get the number of players in each team
        const redTeamPlayerCount = redTeam.players.length;
        const blueTeamPlayerCount = blueTeam.players.length;

        return { redTeamScore, blueTeamScore, redTeamPlayerCount, blueTeamPlayerCount };
    }


    async handleGuess(guess: string, correctLong: number, correctLat: number, correctDate: number, id: string): Promise<void> {
        // Check if the answer is correct
        let guessJSON = JSON.parse(guess);
        let usrScore: number = calculateUserScore(correctLat, correctLong, correctDate, guessJSON.lat, guessJSON.long, guessJSON.year);
        // Defaults to red team
        let usrTeam = await this.getTeamOfPlayer(id) ?? false;

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
            let redTeam: TeamData = await this.room.storage.get("redTeam") ?? { players: [], isBlueTeam: true, score: 0 };
            redTeam.score += usrScore;
            this.updateCumScore(id, usrScore);
            await this.room.storage.put("redTeam", redTeam);
        }
    }

    async getNBestPlayers(n: number) {
        let blueTeam: TeamData = await this.room.storage.get("blueTeam") ?? { players: [], isBlueTeam: true, score: 0 };
        let redTeam: TeamData = await this.room.storage.get("redTeam") ?? { players: [], isBlueTeam: false, score: 0 };

        // Combine players from both teams
        let players: PlayerData[] = blueTeam.players.concat(redTeam.players);

        // Sort players by cumulative score in descending order and slice to get top `n` players
        players.sort((a, b) => b.cumScore - a.cumScore);
        const topPlayers = players.slice(0, n).map(player => ({
            name: player.name,
            score: player.cumScore,
            team: player.isBlue ? "blue" : "red"
        }));

        return topPlayers;
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