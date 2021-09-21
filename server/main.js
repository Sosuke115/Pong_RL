const path = require("path");
const express = require("express");
const app = express();

app.get("/", (req, res) => {
  res.sendFile(path.resolve(__dirname + "/../client/main.html"));
});

app.use("/public", express.static(path.resolve(__dirname + "/../client/public")));

const isLocal = process.argv.length > 2 && process.argv[2] === "local";
if (isLocal) {
  app.get("/rl/train", (req, res) => {
    res.sendFile(path.resolve(__dirname + "/../client/js/rl/train.html"));
  });
  app.get("/rl/test", (req, res) => {
    res.sendFile(path.resolve(__dirname + "/../client/js/rl/test.html"));
  });
  app.use("/public-rl", express.static(path.resolve(__dirname + "/../client/js/rl/public")));
}

let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}

app.listen(port, () => {
  console.log(`Start server port:${port} isLocal=${isLocal}`);
});
