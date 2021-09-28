const express = require('express');
const router = express.Router();

const Sequelize = require("sequelize");
const db = require("../db/models/index.js");

const { uniqueNamesGenerator, adjectives, colors, animals } = require('unique-names-generator');


// Settings to receive POST body
router.use(express.json());
router.use(express.urlencoded({ extended: true }));

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

router.post("/register_game", (req, res) => {
  // Generate a random name using adjectives, colors, and animals (e.g. big-red-donkey)
  // Other dictionaries can also be used
  // cf. https://github.com/andreasonny83/unique-names-generator#dictionaries-available
  const tempName = uniqueNamesGenerator({
    dictionaries: [adjectives, colors, animals],
    separator: "-",
  });

  db.Game.create({
    token: req.body.token,
    trainingStep: req.body.trainingStep,
    score: req.body.score,
    userName: tempName,
  })
  .then((game) => {
    res.json({
      "userName": tempName,
    });
  });
});

router.post("/update_name", async (req, res) => {
  const game = await db.Game.findOne({
    where: {
      token: req.body.token,
    }
  });
  game.userName = req.body.userName;
  await game.save();
  res.json({

  });
});

module.exports = router;