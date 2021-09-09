const path = require("path");
const express = require("express");
const app = express();

app.use(express.static(path.resolve(__dirname + "/../client")));

let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}

app.listen(port, () => {
  console.log(`Start server port:${port}`);
});
