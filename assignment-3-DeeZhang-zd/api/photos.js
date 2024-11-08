const { Router } = require('express');
const { ValidationError } = require('sequelize');
const { Photo, PhotoClientFields } = require('../models/photo');
const { authorize, authorizeUser, authorizeAdmin } = require('../middleware/authorize');

const router = Router();

/*
 * Route to create a new photo.
 */
router.post('/', authorize, async function (req, res, next) {
  try {
    if (req.user.id !== req.body.userId && !req.user.admin) {
      return res.status(403).json({ error: 'Forbidden: You are not authorized to perform this action' });
    }

    const photo = await Photo.create(req.body, PhotoClientFields);
    res.status(201).send({ id: photo.id });
  } catch (e) {
    if (e instanceof ValidationError) {
      res.status(400).send({ error: e.message });
    } else {
      next(e);
    }
  }
});

/*
 * Route to fetch info about a specific photo.
 */
router.get('/:photoId', async function (req, res, next) {
  const photoId = req.params.photoId;
  try {
    const photo = await Photo.findByPk(photoId);
    if (photo) {
      res.status(200).send(photo);
    } else {
      next();
    }
  } catch (e) {
    next(e);
  }
});

/*
 * Route to update a photo.
 */
router.patch('/:photoId', authorize, async function (req, res, next) {
  const photoId = req.params.photoId;
  try {
    const photo = await Photo.findByPk(photoId);

    if (!photo) {
      return res.status(404).json({ error: 'Photo not found' });
    }

    if (req.user.id !== photo.userId && !req.user.admin) {
      return res.status(403).json({ error: 'Forbidden: You are not authorized to perform this action' });
    }

    /*
     * Update photo without allowing client to update businessId or userId.
     */
    await photo.update(req.body, {
      fields: PhotoClientFields.filter(
        field => field !== 'businessId' && field !== 'userId'
      )
    });
    res.status(204).send();
  } catch (e) {
    next(e);
  }
});

/*
 * Route to delete a photo.
 */
router.delete('/:photoId', authorize, async function (req, res, next) {
  const photoId = req.params.photoId;
  try {
    const photo = await Photo.findByPk(photoId);

    if (!photo) {
      return res.status(404).json({ error: 'Photo not found' });
    }

    if (req.user.id !== photo.userId && !req.user.admin) {
      return res.status(403).json({ error: 'Forbidden: You are not authorized to perform this action' });
    }

    await photo.destroy();
    res.status(204).send();
  } catch (e) {
    next(e);
  }
});

module.exports = router;
