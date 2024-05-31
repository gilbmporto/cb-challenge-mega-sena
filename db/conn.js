const { Sequelize } = require("sequelize")
require("dotenv").config()

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.MYSQL_ROOT_PASSWORD,
  {
    host: "localhost",
    dialect: "mysql",
    port: 3306,
    pool: {
      max: 10,
      min: 0,
    },
  }
)

try {
  sequelize.authenticate()
  console.log("Connection has been established successfully.")
} catch (error) {
  console.log("Unable to connect to the database:", error.message)
}

module.exports = sequelize
