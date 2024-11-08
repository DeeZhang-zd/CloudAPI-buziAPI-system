const { Router } = require('express');
const { ValidationError } = require('sequelize');
const { Review, ReviewClientFields } = require('../models/review');
const { authorize, authorizeUser, authorizeAdmin } = require('../middleware/authorize');

const router = Router();

/*
 * Route to create a new review.
 */
router.post('/', authorize, async function (req, res, next) {
  try {
    if (req.user.id !== req.body.userId && !req.user.admin) {
      return res.status(403).json({ error: 'Forbidden: You are not authorized to perform this action' });
    }

    const review = await Review.create(req.body, ReviewClientFields);
    res.status(201).send({ id: review.id });
  } catch (e) {
    if (e instanceof ValidationError) {
      res.status(400).send({ error: e.message });
    } else {
      next(e);
    }
  }
});

/*
 * Route to fetch info about a specific review.
 */
router.get('/:reviewId', async function (req, res, next) {
  const reviewId = req.params.reviewId;
  try {
    const review = await Review.findByPk(reviewId);
    if (review) {
      res.status(200).send(review);
    } else {
      next();
    }
  } catch (e) {
    next(e);
  }
});

/*
 * Route to update a review.
 */
router.patch('/:reviewId', authorize, async function (req, res, next) {
  const reviewId = req.params.reviewId;
  console.log("reviewid", reviewId)
  try {
    const review = await Review.findByPk(reviewId);
    console.log("review", review)

    if (!review) {
      return res.status(404).json({ error: 'Review not found' });
    }

    if (req.user.id !== review.userId && !req.user.admin) {
      return res.status(403).json({ error: 'Forbidden: You are not authorized to perform this action' });
    }

    /*
     * Update review without allowing client to update businessId or userId.
     */
    await review.update(req.body, {
      fields: ReviewClientFields.filter(
        field => field !== 'businessId' && field !== 'userId'
      )
    });
    res.status(204).send();
  } catch (e) {
    next(e);
  }
});

/*
 * Route to delete a review.
 */
router.delete('/:reviewId', authorize, async function (req, res, next) {
  const reviewId = req.params.reviewId;
  try {
    const review = await Review.findByPk(reviewId);

    if (!review) {
      return res.status(404).json({ error: 'Review not found' });
    }

    if (req.user.id !== review.userId && !req.user.admin) {
      return res.status(403).json({ error: 'Forbidden: You are not authorized to perform this action' });
    }

    await review.destroy();
    res.status(204).send();
  } catch (e) {
    next(e);
  }
});

module.exports = router;
