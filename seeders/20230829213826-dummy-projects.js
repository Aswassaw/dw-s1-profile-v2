"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const seedData = [];
    for (let i = 0; i < 10; i++) {
      seedData.push({
        name: `Project ${i + 1}`,
        startDate: new Date(),
        endDate: new Date(),
        description:
          "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Fugiat atque dolorum at soluta dicta sit explicabo quaerat nam dolorem id.",
        javascript: i % 2 === 0 ? true : false,
        golang: i % 2 !== 0 ? true : false,
        php: i % 2 === 0 ? true : false,
        java: i % 2 !== 0 ? true : false,
        image:
          "https://avatars.githubusercontent.com/u/72940944?s=400&u=b442002ccd7471fc6b9d66c55346b65e2fe43976&v=4",
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }

    return queryInterface.bulkInsert("projects", seedData);
  },

  async down(queryInterface, Sequelize) {
    return queryInterface.bulkDelete("projects", null, {});
  },
};
