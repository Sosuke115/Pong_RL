const path = require("path");
const express = require("express");
const app = express();
const sequelize = require("sequelize");
const db = require("./db/models/index.js");

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


app.get("/api/get_ranking", (req, res) => {
  const size = req.query.size || 5;
  const trainingStepList = [0, 20000, 50000, 100000];

  const promises = [];
  // Query ranking data
  for (let trainingStep of trainingStepList) {
    promises.push(db.Game.findAll({
      attributes: ["userName", "score"],
      where: {
        trainingStep: trainingStep,
      },
      order: [
        ["score", "DESC"],
      ],
      limit: size,
    }));
  }
  // Query average scores
  promises.push(db.Game.findAll({
    attributes: [
      "trainingStep",
      [sequelize.fn("AVG", sequelize.col("score")), "avgScore"],
    ],
    group: "trainingStep",
  }));

  Promise.all(promises)
  .then((data) => {
    const rankingData = {};
    for (let i = 0; i < data.length - 1; i++) {
      const trainingStep = trainingStepList[i];
      rankingData[trainingStep] = data[i];
    }

    const avgData = {};
    for (let row of data[data.length-1]) {
      // TODO: Aggregated values cannot be accessed by <model>.<attribute>
      //       There might be a cleaner way
      avgData[row.trainingStep] = row.dataValues.avgScore;
    }

    res.json({
      "ranking": rankingData,
      "avg": avgData,
    });
  });
});


let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}

app.listen(port, () => {
  console.log(`Start server port:${port} isLocal=${isLocal}`);
});
