import type * as Party from "partykit/server";

export default class Server implements Party.Server {
    constructor(readonly room: Party.Room) { }

    async onConnect(conn: Party.Connection, ctx: Party.ConnectionContext) {
        // A websocket just connected!
        console.log(
            `Connected:
                id: ${conn.id}
                room: ${this.room.id}
                url: ${new URL(ctx.request.url).pathname}`
        );

        // let's send a message to the connection
        conn.send("hello from server");

        let redTeamIds: string[] =
            (await this.room.storage.get("redTeamIds") ?? []);

        let blueTeamIds: string[] =
            (await this.room.storage.get("blueTeamIds") ?? []);

        const connections = this.room.getConnections();

    }

    async onRequest(req: Party.Request): Promise<Response> {
        // Handle different HTTP methods
        if (req.method === "GET") {
            return new Response("i", {
                status: 200,
                headers: { "Content-Type": "text/plain" },
            });
        }

        // Return 404 for unhandled requests
        return new Response("Not Found", { status: 404 });
    }

    onMessage(message: string, sender: Party.Connection) {
        // let's log the message
        console.log(`connection ${sender.id} sent message: ${message}`);
        // as well as broadcast it to all the other connections in the room...
        this.room.broadcast(
            `${sender.id}: ${message}`,
            // ...except for the connection it came from
            [sender.id]
        );
    }
}

Server satisfies Party.Worker;
