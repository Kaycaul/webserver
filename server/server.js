const mongodb = require("mongodb");
const express = require("express");
const morgan = require("morgan");
const app = express();
const path = require("path");
const port = 2763;

// connect to database
const client = new mongodb.MongoClient("mongodb://localhost:27017");
const db = client.db("website");
const miscCollection = db.collection("misc");

// middleware to log all requests before doing anything
app.use(morgan("dev"));

// send the index when requesting the root
app.get("/", (req, res) => {
	res.sendFile(path.join(__dirname, "../public/index.html"));
});

// send anything in the public folder
app.use(express.static(path.join(__dirname, "../public")));

// get the number of boops
app.get("/boops", async (req, res) => {
	let boops = await miscCollection.findOne({ "boops": { $exists: true } });
	boops = boops ? boops.boops : 0;
	res.send({ "boops": boops });
});

// increment boops by one
app.put("/boops", async (req, res) => {
	let boops = await miscCollection.findOne({ "boops": { $exists: true } });
	boops = boops ? boops.boops : 0;
	await miscCollection.updateOne({ "boops": { $exists: true } }, { $set: { "boops": boops + 1 } });
	res.sendStatus(204);
});

// finally, send 404s
app.use((req, res) => {
	res.status(404).send("404 Not Found");
});

app.listen(port, () => {
	console.log(`Running server on http://localhost:${port} 🎉`);
});