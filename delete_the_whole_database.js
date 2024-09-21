const mongodb = require("mongodb");

main().catch((err) => console.log(err));

async function main() {
    let client;
    try {
        // connect
        console.log("connecting to database...");
        client = new mongodb.MongoClient("mongodb://127.0.0.1:27017");
        const db = client.db("website");
        const misc = db.collection("misc");
        const artworks = db.collection("artworks");
        console.log("connected");
        // delete everything
        await misc.deleteMany();
        console.log("database cleared");
        // initialize
        await misc.insertOne({ "boops": 0 }); // reset boop counter
        console.log("database initialized");

        // clear artworks
        await artworks.deleteMany();
        console.log("artworks cleared");
        // add sample artworks for testing
        await artworks.insertOne({
            path: "/assets/umbrela.png",
            artist: "Lenixtt",
            tags: ["sneaks", "sneaks-game", "liquid-skies"],
            date: new Date()
        });
        // infestation
        for (let i = 0; i < 30; i++) {
            await artworks.insertOne({
                path: "/assets/sneakers.png",
                artist: `Doeball${i}`,
                tags: ["sneaks", "sneaks-game", "liquid-skies"],
                date: new Date()
            });
        }
        await artworks.insertOne({
            path: "/assets/verity_with_9_trillion_effects.png",
            artist: "Doeball",
            tags: ["verity", "liquid-skies"],
            date: new Date()
        });
        console.log("artworks initialized");
    } finally {
        // close
        console.log("disconnecting from database...");
        await client.close();
        console.log("disconnected");
    }
}