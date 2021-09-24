'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert('Games', [
      {
        token: "token0",
        trainingStep: 0,
        userName: "Ichiro",
        score: 10,
        createdAt: new Date(),
        updatedAt: new Date(),
      }, {
        token: "token1",
        trainingStep: 0,
        userName: "Jiro",
        score: 2,
        createdAt: new Date(),
        updatedAt: new Date(),
      }, {
        token: "token2",
        trainingStep: 0,
        userName: "Saburo",
        score: 5,
        createdAt: new Date(),
        updatedAt: new Date(),
      }, {
        token: "token3",
        trainingStep: 0,
        userName: "Shiro",
        score: -3,
        createdAt: new Date(),
        updatedAt: new Date(),
      }, {
        token: "token4",
        trainingStep: 0,
        userName: "Goro",
        score: -1,
        createdAt: new Date(),
        updatedAt: new Date(),
      },

      {
        token: "token5",
        trainingStep: 20000,
        userName: "Ichiro",
        score: 3,
        createdAt: new Date(),
        updatedAt: new Date(),
      }, {
        token: "token6",
        trainingStep: 20000,
        userName: "Jiro",
        score: 4,
        createdAt: new Date(),
        updatedAt: new Date(),
      }, {
        token: "token7",
        trainingStep: 20000,
        userName: "Saburo",
        score: 8,
        createdAt: new Date(),
        updatedAt: new Date(),
      }, {
        token: "token8",
        trainingStep: 20000,
        userName: "Shiro",
        score: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      }, {
        token: "token9",
        trainingStep: 20000,
        userName: "Goro",
        score: -6,
        createdAt: new Date(),
        updatedAt: new Date(),
      },

      {
        token: "token10",
        trainingStep: 50000,
        userName: "Ichiro",
        score: -2,
        createdAt: new Date(),
        updatedAt: new Date(),
      }, {
        token: "token11",
        trainingStep: 50000,
        userName: "Jiro",
        score: -3,
        createdAt: new Date(),
        updatedAt: new Date(),
      }, {
        token: "token12",
        trainingStep: 50000,
        userName: "Saburo",
        score: 5,
        createdAt: new Date(),
        updatedAt: new Date(),
      }, {
        token: "token13",
        trainingStep: 50000,
        userName: "Shiro",
        score: -1,
        createdAt: new Date(),
        updatedAt: new Date(),
      },

      {
        token: "token14",
        trainingStep: 100000,
        userName: "Ichiro",
        score: -5,
        createdAt: new Date(),
        updatedAt: new Date(),
      }, {
        token: "token15",
        trainingStep: 100000,
        userName: "Jiro",
        score: -4,
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     */
    await queryInterface.bulkDelete('Games', null, {});
  }
};
