const express = require('express');
const router = express.Router();

const Sequelize = require("sequelize");
const db = require("../db/models/index.js");


router.get("/get_ranking", (req, res) => {
  const size = req.query.size || 5;
  const trainingStepList = [0, 20000, 50000, 100000];
  
  const promises = [];
  // Query ranking data
  for (let trainingStep of trainingStepList) {
    promises.push(db.Game.findAll({
      attributes: ["token", "userName", "score"],
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
      [Sequelize.fn("AVG", Sequelize.col("score")), "avgScore"],
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
      ranking: rankingData,
      avg: avgData,
    });
  });
});

module.exports = router;
