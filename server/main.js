const port = 3000,
  path = require("path"),
  express = require("express"),
  app = express();

app.use(express.static(path.resolve(__dirname + "/../client")));

app.listen(3000, () => {
  console.log("Start server port:3000");
});
