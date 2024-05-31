const { DataTypes } = require("sequelize")
const sequelize = require("../db/conn")

const Result = sequelize.define("Result", {
  concurso: {
    type: DataTypes.INTEGER,
    primaryKey: true,
  },
  data: {
    type: DataTypes.DATE,
  },
  numero1: {
    type: DataTypes.INTEGER,
  },
  numero2: {
    type: DataTypes.INTEGER,
  },
  numero3: {
    type: DataTypes.INTEGER,
  },
  numero4: {
    type: DataTypes.INTEGER,
  },
  numero5: {
    type: DataTypes.INTEGER,
  },
  numero6: {
    type: DataTypes.INTEGER,
  },
})

module.exports = Result
