const mongodb = require("mongodb");
const express = require("express");
const morgan = require("morgan");
const app = express();
const path = require("path");
const port = 2763;

// connect to database
const client = new mongodb.MongoClient("mongodb://127.0.0.1:27017");
const db = client.db("website");
const miscCollection = db.collection("misc");
const artworksCollection = db.collection("artworks");

// middleware to log all requests before doing anything
app.use(morgan("dev"));

// send the index when requesting the root
app.get("/", (req, res) => {
	res.sendFile(path.join(__dirname, "../public/index.html"));
});

// minecraft page
app.get("/minecraft", (req, res) => {
	res.sendFile(path.join(__dirname, "../public/minecraft.html"));
});

// games
app.get("/games", (req, res) => {
	res.sendFile(path.join(__dirname, "../public/games/index.html"));
});

app.get("/games/sneaks-game", (req, res) => {
	res.sendFile(path.join(__dirname, "../public/games/sneaks.html"));
});

app.get("/games/task-manager", (req, res) => {
	res.sendFile(path.join(__dirname, "../public/games/taskmanager.html"));
});

app.get("/games/cart-game", (req, res) => {
	res.sendFile(path.join(__dirname, "../public/games/cartbuild/cartgame.html"));
});

// gallery
app.get("/gallery", async (req, res) => {
	// html page
	if (req.accepts("text/html")) {
		res.sendFile(path.join(__dirname, "../public/gallery.html"));
	} else if (req.accepts("application/json")) {
		// parse query params
		let dbQuery = {};
		if (req.query.artist) dbQuery.artist = req.query.artist;
		if (req.query.title) dbQuery.path = {$regex: `(\/.+)+\/.*${req.query.title}.*`, $options: "i"}; // magic fucking spell
		if (req.query.tags) dbQuery.tags = {$all: req.query.tags.split(" ")};
		// get all artwork ids
		let list = (await artworksCollection.find(dbQuery).toArray());
		// sort by date
		list = list.sort((a, b) => Date.parse(b.date) - Date.parse(a.date));
		list.reverse(); // newest first
		// map to ids
		list = list.map(artwork => artwork._id.toString());
		res.setHeader("Content-Type", "application/json");
		res.send(list);
	}
});

app.get("/gallery/:id", async (req, res) => {
	let id = new mongodb.ObjectId(req.params.id);
	let artworkjson = await artworksCollection.findOne({ "_id": id });
	// remove the id
	if (!artworkjson) {
		res.status(404).send("Artwork not found");
		return;
	}
	delete artworkjson._id;
	res.setHeader("Content-Type", "application/json");
	res.send(artworkjson);
});

// send public files
app.use(express.static(path.join(__dirname, "../public"), {
	// add headers for unity gzip
	setHeaders: function(res, path) {
		if (path.endsWith(".gz")) {
			res.set("Content-Encoding", "gzip");
		}
		if (path.endsWith(".wasm.gz") || path.endsWith(".wasm")) {
			res.set("Content-Type", "application/wasm");
		}
		if (path.endsWith(".pck.gz") || path.endsWith(".pck")) {
			res.set("Content-Type", "application/octet-stream");
		}
	}
}));

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
	// send 404 page if they want html
	if (req.accepts("html")) {
		res.status(404).sendFile(path.join(__dirname, "../public/404.html"));
		return;
	}
	res.status(404).send("404 Not Found");
});

app.listen(port, () => {
	console.log(`Running server on http://localhost:${port} 🎉`);
});