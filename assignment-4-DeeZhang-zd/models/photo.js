const { DataTypes } = require("sequelize")
const sequelize = require("../sequelize")

const Photo = sequelize.define("photo", {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },

    userid: { type: DataTypes.INTEGER, allowNull: false },
    businessid: { type: DataTypes.INTEGER, allowNull: false },
    caption: { type: DataTypes.STRING, allowNull: false },
    filename: { type: DataTypes.INTEGER, allowNull: false },
    path: { type: DataTypes.STRING, allowNull: false },
    contentType: { type: DataTypes.STRING, allowNull: false }


})

module.exports = Photo
