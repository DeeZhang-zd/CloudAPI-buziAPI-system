const express = require('express')
const morgan = require('morgan')

const api = require('./api')
const sequelize = require('./sequelize')
const multer = require("multer")
const path = require("path")


const app = express()
const port = process.env.PORT || 8000


const upload = multer({
  dest: `${__dirname}/uploads`
})

/*
 * Morgan is a popular request logger.
 */
app.use(morgan('dev'))

app.use(express.json())
app.use(express.static('public'))

app.use('/media/photos', express.static(path.join(__dirname, 'uploads')));
app.use('/media/thumbnails', express.static(path.join(__dirname, 'thumbnails')));

/*
 * All routes for the API are written in modules in the api/ directory.  The
 * top-level router lives in api/index.js.  That's what we include here, and
 * it provides all of the routes.
 */
app.use('/', api)

app.use('*', function (req, res, next) {
  res.status(404).send({
    error: `Requested resource "${req.originalUrl}" does not exist`
  })
})

/*
 * This route will catch any errors thrown from our API endpoints and return
 * a response with a 500 status to the client.
 */
app.use('*', function (err, req, res, next) {
  console.error("== Error:", err)
  res.status(500).send({
    error: "Server error.  Please try again later."
  })
})


// sequelize.sync().then(function () {
//   app.listen(port, function () {
//     console.log("== Server is listening on port:", port)
//   })
// });


// app.listen(port, function () {
//   console.log("== Server is listening on port:", port)
// });

sequelize.sync().then(function () {
  app.listen(port, function () {
    console.log("== Server is listening on port", port);
  });
}).catch(err => {
  console.error("Failed to sync database:", err);
});
