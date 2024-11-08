const router = require('express').Router()
const { validateAgainstSchema, extractValidFields } = require('../lib/validation')
const { ValidationError } = require("sequelize")
const { Business, Photo, Review } = require("../models/index")

/*
 * Schema describing required/optional fields of a business object.
 */
const businessSchema = {
  ownerid: { required: true },
  name: { required: true },
  address: { required: true },
  city: { required: true },
  state: { required: true },
  zip: { required: true },
  phone: { required: true },
  category: { required: true },
  subcategory: { required: true },
  website: { required: false },
  email: { required: false }
}

/*
 * Route to return a list of businesses.
 */
router.get('/', async function (req, res, next) {
  try {
    let page = parseInt(req.query.page) || 1
    page = page < 1 ? 1 : page
    const pageSize = 10
    const offset = (page - 1) * pageSize
    const result = await Business.findAndCountAll({
      limit: pageSize,
      offset: offset

      /*
       * Compute page number based on optional query string parameter `page`.
       * Make sure page is within allowed bounds.
       */

    })
    const lastPage = Math.ceil(result.count / pageSize)
    /*
     * Generate HATEOAS links for surrounding pages.
     */
    const links = {}
    if (page < lastPage) {
      links.nextPage = `/businesses?page=${page + 1}`
      links.lastPage = `/businesses?page=${lastPage}`
    }
    if (page > 1) {
      links.prevPage = `/businesses?page=${page - 1}`
      links.firstPage = '/businesses?page=1'
    }

    /*
     * Construct and send response.
     */
    res.status(200).send({
      businesses: result.rows,
      count: result.count,
      links: links
    })

  } catch (err) {
    console.error("== Error:", err);
    res.status(500).send({
      error: "Error fetching businesses. Try again later."
    });
  }
});

/*
 * Route to create a new business.
 */
router.post('/', async function (req, res, next) {
  if (validateAgainstSchema(req.body, businessSchema)) {
    try {
      const business = await Business.create(extractValidFields(req.body, businessSchema));
      console.log("business", business)
      res.status(201).send({
        id: business.id,
        links: {
          business: `/businesses/${business.id}`
        }
      });
    } catch (e) {
      console.log(" --Error:", e);
      res.status(500).send({
        error: "Error creating business"
      });
    }
  } else {
    res.status(400).send({
      error: "Request body is not a valid business object"
    })
  }
});

/*
 * Route to fetch info about a specific business.
 */
router.get('/:businessid', async function (req, res, next) {
  try {
    const business = await Business.findByPk(req.params.businessid, {
      include: [Photo, Review]
    })

    if (business) {
      /*
       * Find all reviews and photos for the specified business and create a
       * new object containing all of the business data, including reviews and
       * photos.
       */
      res.status(200).send(business)
    } else {
      next()
    }
  } catch (e) {
    console.error(" --error:", e);
    res.status(500).send({
      error: "Error fetching business"
    })
  }
})

/*
 * Route to replace data for a business.
 */
router.put('/:businessid', async function (req, res, next) {
  if (validateAgainstSchema(req.body, businessSchema)) {
    try {
      const [updated] = await Business.update(extractValidFields(req.body, businessSchema), {
        where: { id: req.params.businessid }
      });
      if (updated) {
        res.status(200).send({
          links: {
            business: `/businesses/${req.params.businessid}`
          }
        });
      } else {
        next();
      }
    } catch (err) {
      console.error("== Error:", err);
      res.status(500).send({
        error: "Error updating business. Try again later."
      });
    }
  } else {
    res.status(400).send({
      error: "Request body is not a valid business object"
    });
  }
});

/*
 * Route to delete a business.
 */
router.delete('/:businessid', async function (req, res, next) {
  try {
    const deleted = await Business.destroy({
      where: { id: req.params.businessid }
    });
    if (deleted) {
      res.status(204).end();
    } else {
      next();
    }
  } catch (err) {
    console.error("== Error:", err);
    res.status(500).send({
      error: "Error deleting business. Try again later."
    });
  }
});

module.exports = { router } 