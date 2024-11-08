const router = require('express').Router()

exports.router = router

const { User, Business, Review, Photo } = require("../models/index")


/*
 * Route to list all of a user's businesses.
 */
router.get('/:userid/businesses', async function (req, res, next) {
  try {
    const userBusinesses = await Business.findAll({ where: { ownerid: req.params.userid } })
    res.status(200).send({
      business: userBusinesses
    })
  } catch (e) {
    console.error(" --error:", e)
    res.status(500).send({
      error: "erorr fetching user's businesses"
    })
  }
})

/*
 * Route to list all of a user's reviews.
 */
router.get('/:userid/reviews', async function (req, res, next) {
  try {
    const userReviews = await Review.findAll({ where: { userid: req.params.userid } })
    res.status(200).send({
      reviews: userReviews
    })
  } catch (e) {
    console.error("== Error:", err);
    res.status(500).send({
      error: "Error fetching user's reviews"
    });
  }
})

/*
 * Route to list all of a user's photos.
 */
router.get('/:userid/photos', async function (req, res, next) {
  try {
    const userPhotos = await Photo.findAll({ where: { userid: req.params.userid } });
    res.status(200).send({
      photos: userPhotos
    });
  } catch (err) {
    console.error("== Error:", err);
    res.status(500).send({
      error: "Error fetching user's photos"
    });
  }
});

module.exports = { router }