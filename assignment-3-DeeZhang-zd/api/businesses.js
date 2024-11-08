const { Router } = require('express');
const { ValidationError } = require('sequelize');

const { Business, BusinessClientFields } = require('../models/business');
const { Photo } = require('../models/photo');
const { Review } = require('../models/review');
const { authorize, authorizeUser, authorizeAdmin } = require('../middleware/authorize');

const router = Router();

/*
 * Route to return a list of businesses.
 */
router.get('/', async function (req, res, next) {
  /*
   * Compute page number based on optional query string parameter `page`.
   * Make sure page is within allowed bounds.
   */
  let page = parseInt(req.query.page) || 1;
  page = page < 1 ? 1 : page;
  const numPerPage = 10;
  const offset = (page - 1) * numPerPage;

  try {
    const result = await Business.findAndCountAll({
      limit: numPerPage,
      offset: offset
    });

    /*
     * Generate HATEOAS links for surrounding pages.
     */
    const lastPage = Math.ceil(result.count / numPerPage);
    const links = {};
    if (page < lastPage) {
      links.nextPage = `/businesses?page=${page + 1}`;
      links.lastPage = `/businesses?page=${lastPage}`;
    }
    if (page > 1) {
      links.prevPage = `/businesses?page=${page - 1}`;
      links.firstPage = '/businesses?page=1';
    }

    /*
     * Construct and send response.
     */
    res.status(200).send({
      businesses: result.rows,
      pageNumber: page,
      totalPages: lastPage,
      pageSize: numPerPage,
      totalCount: result.count,
      links: links
    });
  } catch (e) {
    next(e);
  }
});

/*
 * Route to create a new business.
 */
router.post('/', authorize, async function (req, res, next) {
  try {
    if (req.user.id !== req.body.ownerId && !req.user.admin) {
      return res.status(403).json({ error: 'Forbidden: You are not authorized to perform this action' });
    }

    const business = await Business.create(req.body, BusinessClientFields);
    res.status(201).send({ id: business.id });
  } catch (e) {
    if (e instanceof ValidationError) {
      res.status(400).send({ error: e.message });
    } else {
      next(e);
    }
  }
});

/*
 * Route to fetch info about a specific business.
 */
router.get('/:businessId', async function (req, res, next) {
  const businessId = req.params.businessId;
  try {
    const business = await Business.findByPk(businessId, {
      include: [Photo, Review]
    });
    if (business) {
      res.status(200).send(business);
    } else {
      next();
    }
  } catch (e) {
    next(e);
  }
});

/*
 * Route to update data for a business.
 */
router.patch('/:businessId', authorize, async function (req, res, next) {
  const businessId = req.params.businessId;
  try {
    const business = await Business.findByPk(businessId);

    if (!business) {
      return res.status(404).json({ error: 'Business not found' });
    }

    if (req.user.id !== business.ownerId && !req.user.admin) {
      return res.status(403).json({ error: 'Forbidden: You are not authorized to perform this action' });
    }

    await business.update(req.body, { fields: BusinessClientFields });
    res.status(204).send();
  } catch (e) {
    next(e);
  }
});

/*
 * Route to delete a business.
 */
router.delete('/:businessId', authorize, async function (req, res, next) {
  const businessId = req.params.businessId;
  try {
    const business = await Business.findByPk(businessId);

    if (!business) {
      return res.status(404).json({ error: 'Business not found' });
    }

    if (req.user.id !== business.ownerId && !req.user.admin) {
      return res.status(403).json({ error: 'Forbidden: You are not authorized to perform this action' });
    }

    await business.destroy();
    res.status(204).send();
  } catch (e) {
    next(e);
  }
});

module.exports = router;
