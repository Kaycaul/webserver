const mongodb = require("mongodb");

main().catch((err) => console.log(err));

async function main() {
    let client;
    try {
        // connect
        console.log("connecting to database...");
        client = new mongodb.MongoClient("mongodb://localhost:27017");
        const db = client.db("website");
        const misc = db.collection("misc");
        console.log("connected");
        // delete everything
        await misc.deleteMany();
        console.log("database cleared");
        // initialize
        await misc.insertOne({ "boops": 0 }); // reset boop counter
        console.log("database initialized");
    } finally {
        // close
        console.log("disconnecting from database...");
        await client.close();
        console.log("disconnected");
    }
}