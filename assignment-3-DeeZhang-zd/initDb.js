require("dotenv").config()
const sequelize = require('./lib/sequelize')
const { Business, BusinessClientFields } = require('./models/business')
const { Photo, PhotoClientFields } = require('./models/photo')
const { Review, ReviewClientFields } = require('./models/review')
const User = require('./models/user')
const bcrypt = require('bcryptjs');

const businessData = require('./data/businesses.json')
const photoData = require('./data/photos.json')
const reviewData = require('./data/reviews.json')
const userData = require('./data/users.json')

// Function to hash passwords for initial user data
const hashPassword = (password) => {
  const salt = bcrypt.genSaltSync(8);
  return bcrypt.hashSync(password, salt);
}

// Preprocess user data to hash passwords and set admin to false
const processedUserData = userData.map(user => ({
  ...user,
  password: hashPassword(user.password),
  admin: false
}));

sequelize.sync().then(async function () {
  try {
    await Business.bulkCreate(businessData, { fields: BusinessClientFields })
    await Photo.bulkCreate(photoData, { fields: PhotoClientFields })
    await Review.bulkCreate(reviewData, { fields: ReviewClientFields })
    await User.bulkCreate(processedUserData) // Add this line to bulk create users
    console.log('Database initialized!')
  } catch (err) {
    console.error('Failed to initialize database:', err);
  }
}).catch(err => {
  console.error('Failed to sync database:', err);
});
