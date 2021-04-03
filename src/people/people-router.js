const express = require('express');
const logger = require('../logger');
const xss = require('xss');
const path = require('path');
const PeopleService = require('./people-service');
const { getPeopleValidationError } = require('./people-validator');
const peopleRouter = express.Router();
const bodyParser = express.json();
const moment = require('moment');

const serializePerson = person => ({
  id: person.id,
  first_name: xss(person.first_name),
  last_name: xss(person.last_name),
  birthday: moment(person.birthday).format('M/D/YYYY')
})

peopleRouter
  .route('/api/people')
  .get((req, res, next) => {
    PeopleService.getAllPeople(
      req.app.get('db')
    )
      .then(person => {
        res.json(person.map(serializePerson))
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

peopleRouter
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
        error: { message: `Request body must contain either 'first name' or 'birthday'.`}
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
  module.exports = peopleRouter