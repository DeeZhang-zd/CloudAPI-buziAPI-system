const router = require('express').Router()
const { validateAgainstSchema, extractValidFields } = require('../lib/validation')
const { Business, Photo, Review } = require("../models/index")
const multer = require("multer")

const path = require('path');
const crypto = require("node:crypto")
const amqp = require("amqplib")


const port = process.env.PORT || 8000

const imageTypes = {
  "image/jpeg": "jpg",
  "image/gif": "gif",
  "image/png": "png"
}

const upload = multer({
  storage: multer.diskStorage({
    destination: path.join(__dirname, '../uploads/'),
    filename: (req, file, callback) => {
      const filename = crypto.pseudoRandomBytes(16).toString("hex")
      const extention = imageTypes[file.mimetype]
      callback(null, `${filename}.${extention}`)
    }
  }),

});
// const upload = multer({
//   dest: `${__dirname}/uploads`
// })

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

router.post("/",
  upload.single("image"),
  async (req, res, next) => {
    console.log("==req.file", req.file)
    console.log("==req.body", req.body)
    const requiredFields = ["userid", "businessid"];
    const missingFields = requiredFields.filter(field => !req.body[field]);

    if (missingFields.length > 0) {
      res.status(400).send({ error: `Missing fields: ${missingFields.join(", ")}` });
      return;
    }

    if (!req.file) {
      res.status(400).send({ error: "Image file is required." });
      return;
    }

    const photo = {
      userid: req.body.userid,
      businessid: req.body.businessid,
      caption: req.body.caption || '',
      filename: req.file.filename,
      path: req.file.path,
      contentType: req.file.mimetype
    };

    try {
      const savedPhoto = await Photo.create(photo);

      const connection = await amqp.connect('amqp://localhost');
      const channel = await connection.createChannel();
      const queue = 'thumbnail_queue';

      await channel.assertQueue(queue, { durable: true });
      const message = {
        photoId: savedPhoto.id,
        filename: savedPhoto.filename,
        path: savedPhoto.path
      };

      channel.sendToQueue(queue, Buffer.from(JSON.stringify(message)), { persistent: true });
      console.log(" [x] Sent %s", message);

      res.status(201).send({
        id: savedPhoto.id,
        links: {
          photo: `/photos/${savedPhoto.id}`,
          business: `/businesses/${photo.businessid}`,
          user: `/users/${photo.userid}`
        }
      });
    } catch (err) {
      console.error("Error saving photo:", err);
      res.status(500).send({
        error: "Error saving photo information to the database."
      });
    }
  });

// module.exports = router;


//     res.status(200).send()
//   } else {
//     res.status(400).send({
//       error: "thereis an error"
//     })
//   }
// })
// router.post('/', async function (req, res, next) {
//   if (validateAgainstSchema(req.body, photoSchema)) {
//     try {
//       const business = await Business.findByPk(req.body.businessid);
//       if (!business) {
//         return res.status(400).send({
//           error: "Invalid businessid. The specified business does not exist."
//         });
//       }

//       const photo = await Photo.create(extractValidFields(req.body, photoSchema))
//       res.status(201).send({
//         id: photo.id,
//         links: {
//           photo: `/photos/${photo.id}`,
//           business: `/businesses/${photo.businessid}`
//         }

//       })
//     } catch (e) {
//       console.log("--Error:", e)
//       res.status(500).send({
//         error: "error creating photo"
//       })
//     }
//   } else {
//     res.status(400).send({
//       error: "Request body is not a valid photo object"
//     })
//   }
// })

/*
 * Route to fetch info about a specific photo.
 */
router.get('/:photoID', async function (req, res, next) {
  const photoID = req.params.photoID;
  console.log("id", photoID)
  try {
    const photo = await Photo.findByPk(photoID);
    if (photo) {
      res.status(200).send({
        id: photo.id,
        userid: photo.userid,
        businessid: photo.businessid,
        caption: photo.caption,
        url: `/media/photos/${photo.filename}`,
        thumbnailUrl: `/media/thumbnails/thumbnail_${photo.filename}`,
        links: {
          business: `/businesses/${photo.businessid}`,
          user: `/users/${photo.userid}`
        }
      });
    } else {
      res.status(404).send({
        error: `Photo with ID ${id} not found`
      });
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