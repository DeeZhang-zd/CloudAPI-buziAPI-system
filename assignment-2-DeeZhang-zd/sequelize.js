const { Sequelize } = require("sequelize")

const sequelize = new Sequelize({
    dialect: "mysql", // what kind of flavor talking with
    host: process.env.MYSQL_HOST || "localhost",
    port: process.env.MYSQL_PORT || "3306",
    database: process.env.MYSQL_DB || "my_database",
    username: process.env.MYSQL_USER || "zhangd5",
    password: process.env.MYSQL_PASSWORD || "zhangd"

})

//export MYSQL
// nmp run dev


module.exports = sequelize