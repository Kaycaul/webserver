const express = require("express");
const morgan = require("morgan");
const app = express();
const path = require("path");
const port = 2763;

app.use(morgan("dev")); // log all requests using morgan

app.get("/", (req, res) => {
	res.sendFile(path.join(__dirname, "../public/index.html"));
});

// Middleware to handle 404 errors for resources in the `../public` folder
app.use(express.static(path.join(__dirname, "../public")));
app.use((req, res) => {
	res.status(404).send("404 Not Found");
});

app.listen(port, () => {
	console.log(`Running server on http://localhost:${port}`);
});