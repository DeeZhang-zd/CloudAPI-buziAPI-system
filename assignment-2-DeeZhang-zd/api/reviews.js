const router = require('express').Router()
const { validateAgainstSchema, extractValidFields } = require('../lib/validation')

const { Business, Photo, Review } = require("../models/index")
/*
 * Schema describing required/optional fields of a review object.
 */
const reviewSchema = {
  userid: { required: true },
  businessid: { required: true },
  dollars: { required: true },
  stars: { required: true },
  review: { required: false }
}


/*
 * Route to create a new review.
 */
router.post('/', async function (req, res, next) {
  if (validateAgainstSchema(req.body, reviewSchema)) {
    try {
      const review = extractValidFields(req.body, reviewSchema)
      const userReviewedThisBusinessAlready = await Review.findOne({
        where: {
          userid: review.userid,
          businessid: review.businessid
        }
      })
      if (userReviewedThisBusinessAlready) {
        res.status(403).send({
          error: "user has already posted a review of this business"
        })
      } else {
        const createdReview = await Review.create(review)
        res.status(201).send({
          id: createdReview.id,
          links: {
            review: `/reviews/${createdReview.id}`,
            business: `/businesses/${createdReview.businessid}`
          }
        })
      }

    } catch (e) {
      console.log("--Error:", e);
      res.status(500).send({
        error: "Error creating review"
      });
    }
  } else {
    res.status(400).send({
      error: "Request body is not a valid review object"
    });
  }
});

/*
 * Route to fetch info about a specific review.
 */
router.get('/:reviewID', async function (req, res, next) {
  try {
    const review = await Review.findByPk(req.params.reviewID)
    if (review) {
      res.status(200).send(review)
    } else {
      next()
    }
  } catch (e) {

    console.error(" --Error:", e);
    res.status(500).send({
      error: "Error fetching review"
    });
  }
});


/*
 * Route to update a review.
 */
router.put('/:reviewID', async function (req, res, next) {
  if (validateAgainstSchema(req.body, reviewSchema)) {
    try {
      const existingReview = await Review.findByPk(req.params.reviewID)
      if (existingReview) {
        const updatedReview = extractValidFields(req.body, reviewSchema)
        if (updatedReview.businessid === existingReview.businessid && updatedReview.userid === existingReview.userid) {
          await Review.update(updatedReview, { where: { id: req.params.reviewID } })
          res.status(200).send({
            links: {
              review: `/reviews/${req.params.reviewID}`,
              business: `/businesses/${updatedReview.businessid}`
            }
          })
        } else {
          res.status(403).send({
            error: "Updated review cannot modify businessid or userid"
          });
        }
      } else {
        next();
      }
    } catch (e) {
      console.error(" --Error:", e);
      res.status(500).send({
        error: "Error updating review"
      });
    }
  } else {
    res.status(400).send({
      error: "Request body is not a valid review object"
    });
  }
});

/*
 * Route to delete a review.
 */
router.delete('/:reviewID', async function (req, res, next) {
  try {
    const deleted = await Review.destroy({
      where: { id: req.params.reviewID }
    })
    if (deleted) {
      res.status(204).end()
    } else {
      next()
    }
  } catch (e) {
    console.error(" --error:", e)
    res.status(500).send({
      error: "error deleting review"
    })
  }
})
module.exports = { router }