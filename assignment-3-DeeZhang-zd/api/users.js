const { Router } = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Business } = require('../models/business');
const { Photo } = require('../models/photo');
const { Review } = require('../models/review');
const User = require('../models/user'); // Import the User model
const { authorize, authorizeUser, authorizeAdmin } = require('../middleware/authorize');

const router = Router();

const secretKey = process.env.JWT_SECRET || 'zhangd5';

/*
 * Route to get user details.
 */
router.get('/:userId', authorize, authorizeUser, async (req, res) => {
  try {
    const userId = req.params.userId;
    const user = await User.findByPk(userId, {
      attributes: { exclude: ['password'] }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve user details' });
  }
});

/*
 * Route to list all of a user's businesses.
 */
router.get('/:userId/businesses', authorize, authorizeUser, async function (req, res, next) {
  const userId = req.params.userId;
  try {
    const userBusinesses = await Business.findAll({ where: { ownerId: userId } });
    res.status(200).send({
      businesses: userBusinesses
    });
  } catch (e) {
    next(e);
  }
});

/*
 * Route to list all of a user's reviews.
 */
router.get('/:userId/reviews', authorize, authorizeUser, async function (req, res, next) {
  const userId = req.params.userId;
  try {
    const userReviews = await Review.findAll({ where: { userId: userId } });
    res.status(200).send({
      reviews: userReviews
    });
  } catch (e) {
    next(e);
  }
});

/*
 * Route to list all of a user's photos.
 */
router.get('/:userId/photos', authorize, authorizeUser, async function (req, res, next) {
  const userId = req.params.userId;
  try {
    const userPhotos = await Photo.findAll({ where: { userId: userId } });
    res.status(200).send({
      photos: userPhotos
    });
  } catch (e) {
    next(e);
  }
});

/*
 * Route to register a new user.
 */
router.post('/', async (req, res) => {
  try {
    const { name, email, password, admin } = req.body;

    // Check if the email is already in use
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'Email is already in use' });
    }

    // Hash the password before storing it
    const hashedPassword = await bcrypt.hash(password, 8);
    console.log('Creating user with hashed password:', hashedPassword);

    const user = await User.create({ name, email, password: hashedPassword, admin: admin || false });
    console.log('User created:', user);

    res.status(201).json(user);
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ error: 'Failed to create user' });
  }
});


/*
 * Route to login a user.
 */
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ where: { email } });
    if (!user) {
      console.log('User not found:', email);
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    console.log('User found:', user);

    // Compare the entered password with the hashed password stored in the database
    const isPasswordValid = await bcrypt.compare(password, user.password);
    console.log('Comparing passwords:', {
      enteredPassword: password,
      storedPassword: user.password,
      isValid: isPasswordValid
    });

    // if (!isPasswordValid) {
    //   console.log('Password invalid for user:', email);
    //   return res.status(401).json({ error: 'Invalid email or password' });
    // }

    const token = jwt.sign({ id: user.id, email: user.email, admin: user.admin }, secretKey, { expiresIn: '24h' });
    console.log("token", token)
    res.status(200).json({ token });
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({ error: 'Failed to log in' });
  }
});


module.exports = router;
