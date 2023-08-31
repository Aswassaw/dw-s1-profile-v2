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
      userId: {
        allowNull: false,
        type: Sequelize.INTEGER,
        references: {
          model: "users",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      projectName: {
        allowNull: false,
        type: Sequelize.STRING(100),
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
        allowNull: false,
        type: Sequelize.BOOLEAN,
      },
      golang: {
        allowNull: false,
        type: Sequelize.BOOLEAN,
      },
      php: {
        allowNull: false,
        type: Sequelize.BOOLEAN,
      },
      java: {
        allowNull: false,
        type: Sequelize.BOOLEAN,
      },
      image: {
        type: Sequelize.STRING(255),
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
