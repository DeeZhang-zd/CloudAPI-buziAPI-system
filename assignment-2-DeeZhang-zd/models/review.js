

const { DataTypes } = require("sequelize")
const sequelize = require("../sequelize")

const Review = sequelize.define("review", {

    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    userid: { type: DataTypes.INTEGER, allowNull: false },
    businessid: { type: DataTypes.INTEGER, allowNull: false },
    dollars: { type: DataTypes.STRING, allowNull: false },
    stars: { type: DataTypes.STRING, allowNull: false },
    review: { type: DataTypes.STRING, allowNull: false }

})

module.exports = Review
