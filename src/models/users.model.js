import { DataTypes } from "sequelize";
import db from "../configs/db.config.js";

export const Users = db.define(
  "users",
  {
    id: {
      type: DataTypes.STRING,
      primaryKey: true,
      allowNull: false,
    },
    username: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    birthdate: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    gender: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    height: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    weight: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    cholesterol: {
      type: DataTypes.INTEGER,
    },
    glucose: {
      type: DataTypes.INTEGER,
    },
    smoke: {
      type: DataTypes.INTEGER,
    },
    alcho: {
      type: DataTypes.INTEGER,
    },
    active: {
      type: DataTypes.INTEGER,
    },
    cardiovascular: {
      type: DataTypes.STRING,
    },
    fatneed: {
      type: DataTypes.FLOAT,
    },
    proteinneed: {
      type: DataTypes.FLOAT,
    },
    caloryneed: {
      type: DataTypes.FLOAT,
    },
    fiberneed: {
      type: DataTypes.FLOAT,
    },
    carbohidrateneed: {
      type: DataTypes.FLOAT,
    },
    refresh_token: {
      type: DataTypes.STRING,
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },

  {
    freezeTableName: true,
  }
);
