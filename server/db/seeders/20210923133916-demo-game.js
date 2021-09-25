'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert("Games", [
      {
        token: "seed-token0",
        trainingStep: 0,
        userName: "Ichiro",
        score: 10,
        createdAt: new Date(),
        updatedAt: new Date(),
      }, {
        token: "seed-token1",
        trainingStep: 0,
        userName: "Jiro",
        score: 2,
        createdAt: new Date(),
        updatedAt: new Date(),
      }, {
        token: "seed-token2",
        trainingStep: 0,
        userName: "Saburo",
        score: 5,
        createdAt: new Date(),
        updatedAt: new Date(),
      }, {
        token: "seed-token3",
        trainingStep: 0,
        userName: "Shiro",
        score: -3,
        createdAt: new Date(),
        updatedAt: new Date(),
      }, {
        token: "seed-token4",
        trainingStep: 0,
        userName: "Goro",
        score: -1,
        createdAt: new Date(),
        updatedAt: new Date(),
      },

      {
        token: "seed-token5",
        trainingStep: 20000,
        userName: "Ichiro",
        score: 3,
        createdAt: new Date(),
        updatedAt: new Date(),
      }, {
        token: "seed-token6",
        trainingStep: 20000,
        userName: "Jiro",
        score: 4,
        createdAt: new Date(),
        updatedAt: new Date(),
      }, {
        token: "seed-token7",
        trainingStep: 20000,
        userName: "Saburo",
        score: 8,
        createdAt: new Date(),
        updatedAt: new Date(),
      }, {
        token: "seed-token8",
        trainingStep: 20000,
        userName: "Shiro",
        score: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      }, {
        token: "seed-token9",
        trainingStep: 20000,
        userName: "Goro",
        score: -6,
        createdAt: new Date(),
        updatedAt: new Date(),
      },

      {
        token: "seed-token10",
        trainingStep: 50000,
        userName: "Ichiro",
        score: -2,
        createdAt: new Date(),
        updatedAt: new Date(),
      }, {
        token: "seed-token11",
        trainingStep: 50000,
        userName: "Jiro",
        score: -3,
        createdAt: new Date(),
        updatedAt: new Date(),
      }, {
        token: "seed-token12",
        trainingStep: 50000,
        userName: "Saburo",
        score: 5,
        createdAt: new Date(),
        updatedAt: new Date(),
      }, {
        token: "seed-token13",
        trainingStep: 50000,
        userName: "Shiro",
        score: -1,
        createdAt: new Date(),
        updatedAt: new Date(),
      },

      {
        token: "seed-token14",
        trainingStep: 100000,
        userName: "Ichiro",
        score: -5,
        createdAt: new Date(),
        updatedAt: new Date(),
      }, {
        token: "seed-token15",
        trainingStep: 100000,
        userName: "Jiro",
        score: -4,
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete("Games", {
      token: {
        [Sequelize.Op.startsWith]: "seed-"
      }
    });
  }
};
