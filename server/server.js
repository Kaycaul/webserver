const sharp = require("sharp");
const mongodb = require("mongodb");
const express = require("express");
const morgan = require("morgan");
const app = express();
const path = require("path");
const fs = require("fs");
const port = 2763;

// connect to database
const client = new mongodb.MongoClient("mongodb://127.0.0.1:27017");
const db = client.db("website");
const miscCollection = db.collection("misc");
const artworksCollection = db.collection("artworks");

// middleware to log all requests before doing anything
app.use(morgan("dev"));

// pug template engine
app.set("view engine", "pug");
app.set("views", path.join(__dirname, "./views"));

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
		// calculate page
		let page = 0;
		const pagesize = 9;
		if (req.query.page) page = parseInt(req.query.page);
		if (!page || page < 0) page = 0;
		// build query
		let dbQuery = {};
		if (req.query.search) {
			// search with OR using the search term
			dbQuery = {
				$or: [
					// check if artist has term
					{ artist: { $regex: `.*${req.query.search}.*`, $options: "i" } },
					// check if filename has term
					{ path: { $regex: `(\/.+)+\/.*${req.query.search}.*`, $options: "i" } },
					// check if tags have term
					{ tags: { $elemMatch: { $regex: `.*${req.query.search}.*`, $options: "i" } } }
				]
			};
		}
		// search with AND using each search term
		if (req.query.artist) dbQuery.artist = { $regex: `.*${req.query.artist}.*`, $options: "i" };
		if (req.query.title) dbQuery.path = { $regex: `(\/.+)+\/.*${req.query.title}.*`, $options: "i" }; // magic fucking spell
		if (req.query.tags) dbQuery.tags = { $all: req.query.tags.split(" ") };
		// get all artwork ids
		let list = await artworksCollection.find(dbQuery).toArray();
		// break if no results
		if (list.length == 0 || page * pagesize > list.length) {
			res.status(404).send("No artworks found");
			return;
		}
		// sort by date
		list = list.sort((a, b) => Date.parse(b.date) - Date.parse(a.date));
		// list.reverse(); // newest first // no?? thats not what this does
		// paginate
		list = list.slice(page * pagesize, (page + 1) * pagesize);
		// map to ids
		list = list.map(artwork => artwork._id.toString());
		res.setHeader("Content-Type", "application/json");
		res.send(list);
	}
});

app.get("/gallery/:id", async (req, res) => {
	if (!mongodb.ObjectId.isValid(req.params.id)) return send404(req, res);
	let id = new mongodb.ObjectId(req.params.id);
	let artworkjson = await artworksCollection.findOne({ "_id": id });
	if (!artworkjson) return send404(req, res);
	delete artworkjson._id;
	res.setHeader("Content-Type", "application/json");
	res.send(artworkjson);
});

app.get("/artwork/:id", async (req, res) => {
	// sanitize id
	if (!mongodb.ObjectId.isValid(req.params.id)) return send404(req, res);
	let id = new mongodb.ObjectId(req.params.id);
	// get document
	let artworkjson = await artworksCollection.findOne({ "_id": id });
	if (!artworkjson) return send404(req, res);
	res.setHeader("Content-Type", "text/html");
	res.render("artwork", {
		title: artworkjson.path.replace(/^.*[\\/]/, ''),
		id: artworkjson._id.toString(),
		path: artworkjson.path
	});
});

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

// optimize pngs if requested
app.get("*.png", (req, res, next) => {
	if (req.query.optimize === undefined) return next();
	// generate the image if needed
	let newFilename = req.path.replace(/\.png$/, "-optimized.jpg");
	// redirect if the image already exists
	if (fs.existsSync(path.join(__dirname, "../public", newFilename))) {
		console.log(`	🚀 Found optimized image`);
		res.redirect(newFilename);
		return;
	}
	console.log(`	🏭 Creating optimized image`);
	sharp(path.join(__dirname, "../public", req.path))
		.jpeg({
			quality: 90,
			progressive: true
		})
		.toFile(path.join(__dirname, "../public", newFilename))
		.then(() => {
			// redirect to the image
			res.redirect(newFilename);
		})
		.catch((reason) => {
			console.log(reason);
		});
});

// send public files
app.use(express.static(path.join(__dirname, "../public"), {
	setHeaders: function (res, path) {
		// add headers for unity gzip
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

// finally, send 404s
app.use(send404);
function send404(req, res) {
	// send 404 page if they want html
	if (req.accepts("html")) {
		res.status(404).sendFile(path.join(__dirname, "../public/404.html"));
		return;
	}
	res.status(404).send("404 Not Found");
}

app.listen(port, () => {
	console.log(`Running server on http://localhost:${port} 🎉`);
});