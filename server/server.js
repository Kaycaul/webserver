const express = require("express");
const morgan = require("morgan");
const app = express();
const path = require("path");
const port = 2763;

// middleware to log all requests before doing anything
app.use(morgan("dev"));

// send the index when requesting the root
app.get("/", (req, res) => {
	res.sendFile(path.join(__dirname, "../public/index.html"));
});

// send anything in the public folder
app.use(express.static(path.join(__dirname, "../public")));
// finally, send 404s
app.use((req, res) => {
	res.status(404).send("404 Not Found");
});

app.listen(port, () => {
	console.log(`Running server on http://localhost:${port}`);
});