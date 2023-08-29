"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("projects", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      name: {
        allowNull: false,
        type: Sequelize.STRING,
      },
      startDate: {
        allowNull: false,
        type: Sequelize.DATEONLY,
      },
      endDate: {
        allowNull: false,
        type: Sequelize.DATEONLY,
      },
      description: {
        allowNull: false,
        type: Sequelize.TEXT,
      },
      javascript: {
        type: Sequelize.BOOLEAN,
      },
      golang: {
        type: Sequelize.BOOLEAN,
      },
      php: {
        type: Sequelize.BOOLEAN,
      },
      java: {
        type: Sequelize.BOOLEAN,
      },
      image: {
        type: Sequelize.STRING,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("projects");
  },
};
