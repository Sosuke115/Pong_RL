const express = require("express");
const router = express.Router();

const Sequelize = require("sequelize");
const db = require("../db/models/index.js");
const Op = Sequelize.Op;

const {
  uniqueNamesGenerator,
  animals,
  NumberDictionary,
} = require("unique-names-generator");

// Settings to receive POST body
router.use(express.json());
router.use(express.urlencoded({ extended: true }));

router.get("/get_ranking", (req, res) => {
  const size = req.query.size || 5;
  const trainingStepList = [0, 20000, 50000, 100000];

  const promises = [];
  // Query ranking data
  for (let trainingStep of trainingStepList) {
    promises.push(
      db.Game.findAll({
        attributes: ["token", "userName", "score"],
        where: {
          trainingStep: trainingStep,
        },
        order: [
          ["score", "DESC"],
          ["createdAt", "DESC"],
        ],
        limit: size,
      })
    );
  }
  // Query average scores and count
  promises.push(
    db.Game.findAll({
      attributes: [
        "trainingStep",
        [Sequelize.fn("AVG", Sequelize.col("score")), "avgScore"],
        [Sequelize.fn("COUNT", Sequelize.col("score")), "count"],
      ],
      group: "trainingStep",
    })
  );

  Promise.all(promises)
    .then((data) => {
      // console.log("data", data[data.length-1])
      const rankingData = {};
      for (let i = 0; i < data.length - 1; i++) {
        const trainingStep = trainingStepList[i];
        rankingData[trainingStep] = data[i];
      }

      const avgData = {};
      const countData = {};
      for (let row of data[data.length - 1]) {
        // TODO: Aggregated values cannot be accessed by <model>.<attribute>
        //       There might be a cleaner way
        avgData[row.trainingStep] = row.dataValues.avgScore;
        countData[row.trainingStep] = row.dataValues.count;
      }

      res.json({
        error: null,
        ranking: rankingData,
        avg: avgData,
        count: countData,
      });
    })
    .catch((error) => {
      res.json({
        error: error.toString(),
      });
    });
});

router.get("/get_my_rank", async (req, res) => {
  // same score => same rank
  db.Game.count({
    where: {
      score: {
        [Op.gt]: req.query.score,
      },
      trainingStep: req.query.trainingStep,
    },
  })
    .then((superiorNum) => {
      res.json({
        error: null,
        rank: superiorNum + 1,
      });
    })
    .catch((error) => {
      res.json({
        error: error.toString(),
      });
    });
});

router.post("/register_game", (req, res) => {
  // Generate a random name using animals and numbers (e.g. donkey100)
  // Other dictionaries can also be used
  // cf. https://github.com/andreasonny83/unique-names-generator#dictionaries-available
  const numbers = NumberDictionary.generate({ min: 100, max: 999 });
  const tempName = uniqueNamesGenerator({
    dictionaries: [animals, numbers],
    length: 2,
    separator: "",
  });
  db.Game.create({
    token: req.body.token,
    trainingStep: req.body.trainingStep,
    score: req.body.score,
    userName: tempName,
  })
    .then((game) => {
      res.json({
        error: null,
        userName: tempName,
      });
    })
    .catch((error) => {
      res.json({
        error: error.toString(),
      });
    });
});

router.post("/update_name", async (req, res) => {
  let game;
  try {
    game = await db.Game.findOne({
      where: {
        token: req.body.token,
      },
    });
  } catch (error) {
    res.json({
      error: error.toString(),
    });
    return;
  }

  game.userName = req.body.userName;
  game.save()
    .then((game) => {
      res.json({
        error: null,
      });
    })
    .catch((error) => {
      res.json({
        error: error.toString(),
      });
    });
});

module.exports = router;
