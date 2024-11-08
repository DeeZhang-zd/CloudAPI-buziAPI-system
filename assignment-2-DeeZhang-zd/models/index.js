

const sequelize = require('../sequelize');
const Business = require('./business');
const Photo = require('./photo');
const Review = require('./review');

Business.hasMany(Photo, { foreignKey: 'businessid' });
Business.hasMany(Review, { foreignKey: 'businessid' });
Photo.belongsTo(Business, { foreignKey: 'businessid' });
Review.belongsTo(Business, { foreignKey: 'businessid' });

module.exports = { Business, Photo, Review };
