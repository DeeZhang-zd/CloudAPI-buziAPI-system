const router = require('express').Router()
const { validateAgainstSchema, extractValidFields } = require('../lib/validation')
const { Business, Photo, Review } = require("../models/index")

/*
 * Schema describing required/optional fields of a photo object.
 */
const photoSchema = {
  userid: { required: true },
  businessid: { required: true },
  caption: { required: false }
}


/*
 * Route to create a new photo.
 */
router.post('/', async function (req, res, next) {
  if (validateAgainstSchema(req.body, photoSchema)) {
    try {
      const business = await Business.findByPk(req.body.businessid);
      if (!business) {
        return res.status(400).send({
          error: "Invalid businessid. The specified business does not exist."
        });
      }

      const photo = await Photo.create(extractValidFields(req.body, photoSchema))
      res.status(201).send({
        id: photo.id,
        links: {
          photo: `/photos/${photo.id}`,
          business: `/businesses/${photo.businessid}`
        }

      })
    } catch (e) {
      console.log("--Error:", e)
      res.status(500).send({
        error: "error creating photo"
      })
    }
  } else {
    res.status(400).send({
      error: "Request body is not a valid photo object"
    })
  }
})

/*
 * Route to fetch info about a specific photo.
 */
router.get('/:photoID', async function (req, res, next) {
  try {
    const photo = await Photo.findByPk(req.params.photoID)
    if (photo) {
      res.status(200).send(photo)
    } else {
      next()
    }
  } catch (e) {
    console.error(" --error:", e);
    res.status(500).send({
      error: "error fetching photo"
    })
  }
})

/*
 * Route to update a photo.
 */
router.put('/:photoID', async function (req, res, next) {

  if (validateAgainstSchema(req.body, photoSchema)) {
    try {
      const existingPhoto = await Photo.findByPk(req.params.photoID)
      if (existingPhoto) {
        console.log("exisitingphoto", existingPhoto)
        const updatedPhoto = extractValidFields(req.body, photoSchema)
        if (updatedPhoto.businessid === existingPhoto.businessid && updatedPhoto.userid === existingPhoto.userid) {
          await Photo.update(updatedPhoto, { where: { id: req.params.photoID } })
          res.status(200).send({
            links: {
              photo: `/photos/${req.params.photoID}`,
              business: `/businesses/${updatedPhoto.businessid}`
            }
          })
        } else {
          res.status(403).send(
            {
              error: "Updated photo cannot modify businessid or userid"
            }
          )
        }
      } else {
        next()
      }
    } catch (e) {
      console.error(" --Error:", e);
      res.status(500).send({
        error: "Error updating photo"
      });
    }
  } else {
    res.status(400).send({
      error: "Request body is not a valid photo object"
    });
  }
});
/*
 * Make sure the updated photo has the same businessid and userid as
 * the existing photo.
 */
/*
 * Route to delete a photo.
 */
router.delete('/:photoID', async function (req, res, next) {
  try {
    const deleted = await Photo.destroy({
      where: { id: req.params.photoID }
    })
    if (deleted) {
      res.status(204).end()
    } else {
      next()
    }
  } catch (e) {
    console.error(" --error:", e)
    res.status(500).send({
      error: "Error deleting photo"
    })
  }
})

module.exports = { router }