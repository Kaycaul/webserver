const mongodb = require("mongodb");

main().catch((err) => console.log(err));

async function main() {
    let client;
    try {
        // connect
        console.log("connecting to database...");
        client = new mongodb.MongoClient("mongodb://127.0.0.1:27017");
	console.log(client);
        const db = client.db("website");
	console.log(db);
        const misc = db.collection("misc");
	console.log(misc);
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