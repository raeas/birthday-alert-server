const express = require('express')
const logger = require('../logger')
const xss = require('xss')
const path = require('path')
const GiftsService = require('./gifts-service')
const { getGiftsValidationError } = require('./gifts-validator')
const giftsRouter = express.Router()
//use the express.json() middleware to parse the body of request
const bodyParser = express.json()

const serializeGift = gift => ({
  id: gift.id,
  gift: xss(gift.gift),
})

giftsRouter
  .route('/api/gifts')
  .get((req, res, next) => {
    GiftsService.getAllGifts(
      req.app.get('db')
    )
      .then(gift => {
        res.json(gift.map(serializeGift))
      })
      .catch(next)
  })
  .post(bodyParser, (req, res, next) => {
    for (const field of ['first_name', 'birthday']) {
      if (!(field in req.body)) {
        logger.error(`${field} is required`)
        return res.status(400).send({
          error: { message: `Missing '${field}' in request body` }
        })
      }
    }
    PeopleService.insertPerson(
      req.app.get('db'),
      req.body
    )
      .then(person => {
        logger.info(`Person with id ${person.id} created.`)
        res
          .status(201)
          .location(path.posix.join(req.originalUrl) + `/${person.id}`)
          .json(serializePerson(person))
      })
      .catch(next)
  })

giftsRouter
  .route('/api/people/:person_id')
  .all((req, res, next) => {
    const { person_id } = req.params
    PeopleService.getPersonById(
      req.app.get('db'),
      person_id
    )
    .then(person => {
      if (!person) {
        logger.error(`Person with id ${person_id} not found`)
        return res.status(404).json({
          error: { message: `Person not found`}
        })
      }
      res.person = person
      next()
    })
    .catch(next)
  })
  .get((req,res, next) => {
    res.json(serializePerson(res.person))
  })

  .patch(bodyParser, (req, res, next) => {
    const { first_name, last_name, birthday } = req.body
    const personToUpdate = { first_name, last_name, birthday }

    const values = Object.values(personToUpdate).filter(Boolean).length

    if (values === 0) {
      logger.error(`Invalid update without required fields`)
      return res.status(400).json({
        error: { message: `Request body must contain either 'first name' or 'birthday'. `}
      })
    }

    const error = getPeopleValidationError
    
    if (error) return res.status(400).send(error)

    PeopleService.updatePerson(
      req.app.get('db'),
      req.params.person_id,
      personToUpdate
    )
      .then(updatedPerson => {
        res.status(204).end()
      })
      // .then(updatedPerson => {
      //   res.status(204).json(serializePerson(updatedPerson[0]))
      // })
      .catch(next)
  })
  .delete((req, res, next) => {
    PeopleService.deletePerson(
      req.app.get('db'),
      req.params.person_id
    )
    .then(() => {
      res.status(204).end()
    })
    .catch(next)
  })
  module.exports = giftsRouter