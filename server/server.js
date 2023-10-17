const http = require("http");  // include the HTTP module (allows data transfer)
const fs = require("fs");      // fs module allows you to work with the file system (read/write files)
const url = require("url");    // to parse url strings
const ROOT_DIR = "public";     // dir to serve static files from

let requests = 0;

const MIME_TYPES = {
    html: "text/html",
    css: "text/css",
	js: "text/javascript",
    txt: "text/plain",
	json: "application/json",
	png: "image/png",
	ico: "image/x-icon",
	htm: "text/html"
};

function getMime(filename) {
	//Get MIME type based on extension of requested file name
	//e.g. index.html --> text/html
	for (let ext in MIME_TYPES) {
		if (filename.indexOf(ext, filename.length - ext.length) !== -1) {
			return MIME_TYPES[ext];
		}
	}
	return MIME_TYPES["txt"];
}

// create a server which does this
let server = http.createServer((req, res) => {
    // parse the request
    let urlObj = url.parse(req.url, true, false);
	console.log("\n============================");
	console.log(`Request #${++requests}`);
	console.log(`METHOD: ${req.method}`);
	console.log(`PATHNAME: ${urlObj.pathname}`);
	console.log("REQUEST: " + ROOT_DIR + urlObj.pathname);

	// event handler to collect message data
	var receivedData = "";
	req.on("data", function (chunk) {
		receivedData += chunk;
	});

    res.on("end", () => {
        if (res.method === "GET") {
            let filepath = ROOT_DIR + urlObj.pathname;
            fs.readFile(filepath, (err, data) => {
                // stop if we have an error
                if (err) {
                    console.log(`ERROR: ${JSON.stringify(err)}`);
                    res.writeHead(404);
                    res.end("404 Not Found");
                    return;
                }
                // otherwise send the data
                res.writeHead(200, {"Content-Type": getMime(filepath)});
                res.end(data);
            });
        } else {
            // bad request
            let returnObj = {text: "bad request"};
            res.writeHead(400, {"Content-Type": "application/json"});
            res.end(JSON.stringify(returnObj));
        }
    });

});

server.listen(3000); // listen on port 3000
console.log("Server running at http://127.0.0.1:3000/");