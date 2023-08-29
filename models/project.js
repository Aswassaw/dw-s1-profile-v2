"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class project extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  project.init(
    {
      name: DataTypes.STRING,
      startDate: DataTypes.DATEONLY,
      endDate: DataTypes.DATEONLY,
      description: DataTypes.TEXT,
      javascript: DataTypes.BOOLEAN,
      golang: DataTypes.BOOLEAN,
      php: DataTypes.BOOLEAN,
      java: DataTypes.BOOLEAN,
      image: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "project",
      timestamps: true,
      createdAt: true,
      updatedAt: "updateTimestamp",
    }
  );
  return project;
};