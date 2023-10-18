const express = require("express");
const app = express();
const path = require("path");
const port = 2763;

app.use((req, res, next) => {
	res.set("ngrok-skip-browser-warning", "yes please!!");
	next();
});

app.get("/", (req, res) => {
	res.sendFile(path.join(__dirname, "../public/index.html"));
});

// Middleware to handle 404 errors for resources in the `../public` folder
app.use(express.static(path.join(__dirname, "../public")));
app.use((req, res) => {
	res.set("ngrok-skip-browser-warning", "yes please!!");
	res.status(404).send("404 Not Found");
});

app.listen(port, () => {
	console.log(`Running server on http://localhost:${port}`);
});