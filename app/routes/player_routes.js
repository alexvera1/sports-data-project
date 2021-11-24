// Express docs: http://expressjs.com/en/api.html
const express = require('express')
// Passport docs: http://www.passportjs.org/docs/
const passport = require('passport')

// pull in Mongoose model for examples
const Player = require('../models/player')

// this is a collection of methods that help us detect situations when we need
// to throw a custom error
const customErrors = require('../../lib/custom_errors')

// we'll use this function to send 404 when non-existant document is requested
const handle404 = customErrors.handle404
// we'll use this function to send 401 when a user tries to modify a resource
// that's owned by someone else
const requireOwnership = customErrors.requireOwnership

// this is middleware that will remove blank fields from `req.body`, e.g.
// { example: { title: '', text: 'foo' } } -> { example: { text: 'foo' } }
const removeBlanks = require('../../lib/remove_blank_fields')
// passing this as a second argument to `router.<verb>` will make it
// so that a token MUST be passed for that route to be available
// it will also set `req.user`
const requireToken = passport.authenticate('bearer', { session: false })

// instantiate a router (mini app that only handles routes)
const router = express.Router()

// INDEX
// GET /examples
router.get('/players', requireToken, (req, res, next) => {
  Player.find()
    .populate('owner')
    // respond with status 200 and JSON of the examples
    .then(players => res.status(200).json({ players: players }))
    // if an error occurs, pass it to the handler
    .catch(next)
})

// SHOW
// GET /examples/5a7db6c74d55bc51bdf39793
router.get('/players/:id', requireToken, (req, res, next) => {
  // req.params.id will be set based on the `:id` in the route
  Player.findById(req.params.id)
    .then(handle404)
    // if `findById` is succesful, respond with 200 and "example" JSON
    .then(player => res.status(200).json({ player: player }))
    // if an error occurs, pass it to the handler
    .catch(next)
})

// CREATE
// POST /examples
router.post('/players', requireToken, (req, res, next) => {
  // set owner of new example to be current user
  req.body.player.owner = req.user.id

  Player.create(req.body.player)
    // respond to succesful `create` with status 201 and JSON of new "example"
    .then(player => {
      res.status(201).json({ player })
    })
    // if an error occurs, pass it off to our error handler
    // the error handler needs the error message and the `res` object so that it
    // can send an error message back to the client
    .catch(next)
})

// UPDATE
// PATCH /examples/5a7db6c74d55bc51bdf39793
router.patch('/players/:id', requireToken, removeBlanks, (req, res, next) => {
  // if the client attempts to change the `owner` property by including a new
  // owner, prevent that by deleting that key/value pair
  delete req.body.player.owner

  Player.findById(req.params.id)
    .then(handle404)
    // ensure the signed in user (req.user.id) is the same as the example's owner (example.owner)
    .then(player => requireOwnership(req, player))
    // updating example object with exampleData
    .then(player => player.updateOne(req.body.player))
    // if that succeeded, return 204 and no JSON
    .then(() => res.sendStatus(204))
    // if an error occurs, pass it to the handler
    .catch(next)
})

// DESTROY
// DELETE /examples/5a7db6c74d55bc51bdf39793
router.delete('/players/:id', requireToken, (req, res, next) => {
  Player.findById(req.params.id)
    .then(handle404)
     // ensure the signed in user (req.user.id) is the same as the example's owner (example.owner)
    .then(player => requireOwnership(req, player))
    // delete example from mongodb
    .then(player => player.deleteOne())
    // send back 204 and no content if the deletion succeeded
    .then(() => res.sendStatus(204))
    // if an error occurs, pass it to the handler
    .catch(next)
})

module.exports = router