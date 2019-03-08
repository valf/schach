const http = require("http");
var ecec = require("child_process").exec;
var fs = require("fs");

const hostname = "0.0.0.0";
const port = 8080;

const server = http.createServer((req, res) => {
    console.log("req.url", req.url);
    if (/^\/image/.test(req.url)) {
        res.setHeader("Content-Type", "text/plain");
        var body = "";

        req.on("data", function(chunk) {
            body += chunk.toString();
        });

        req.on("end", function() {
            var writeableimage = decodeURIComponent(body).replace("data=data:image/png;base64,", "");

            fs.writeFileSync("./out/out.png", writeableimage, "base64", function(err) {
                console.log("body", body);
                console.log("writeableimage", writeableimage);
                req.status = err ? 500 : 200;
                res.end(err ? "NOTOK" : "OK");
            });
        });
    } else if (/^\/src\/.*\.jpg$/.test(req.url)) {
        res.statusCode = 200;
        res.setHeader("Content-Type", "image/jpeg");
        res.end(fs.readFileSync(req.url.replace("/src", "src")));
    } else if (/^\/index\.html$/.test(req.url) || /^\/$/.test(req.url)) {
        res.statusCode = 200;
        res.setHeader("Content-Type", "text/html");
        res.end(fs.readFileSync("./index.html"));
    } else if (/^\/pixelmatch\.js$/.test(req.url)) {
        res.statusCode = 200;
        res.setHeader("Content-Type", "text/javascript");
        res.end(fs.readFileSync("./pixelmatch.js"));
    }
});

server.listen(port, hostname, () => {
    console.log(`Server running at http://${hostname}:${port}/`);
});
