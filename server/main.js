const port = 3000;
const path = require("path");
const express = require("express");
const app = express();

app.use(express.static(path.resolve(__dirname + "/../client")));

app.listen(port, () => {
  console.log("Start server port:3000");
});
