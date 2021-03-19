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
  gift_name: xss(gift.gift_name),
  person: gift.person
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
    for (const field of ['gift_name', 'person']) {
      if (!(field in req.body)) {
        logger.error(`${field} is required`)
        return res.status(400).send({
          error: { message: `Missing '${field}' in request body` }
        })
      }
    }
    GiftsService.insertGift(
      req.app.get('db'),
      req.body
    )
      .then(gift => {
        logger.info(`Person with id ${gift.id} created.`)
        res
          .status(201)
          .location(path.posix.join(req.originalUrl) + `/${gift.id}`)
          .json(serializeGift(gift))
      })
      .catch(next)
  })

giftsRouter
  .route('/api/gifts/:gift_id')
  .all((req, res, next) => {
    const { gift_id } = req.params
    GiftsService.getGiftById(
      req.app.get('db'),
      gift_id
    )
    .then(gift => {
      if (!gift) {
        logger.error(`Gift with id ${gift_id} not found`)
        return res.status(404).json({
          error: { message: `Gift not found`}
        })
      }
      res.gift = gift
      next()
    })
    .catch(next)
  })
  .get((req,res, next) => {
    res.json(serializeGift(res.gift))
  })

  .patch(bodyParser, (req, res, next) => {
    const { gift_name } = req.body
    const giftToUpdate = { gift_name }

    const values = Object.values(giftToUpdate).filter(Boolean).length

    if (values === 0) {
      logger.error(`Invalid update without required fields`)
      return res.status(400).json({
        error: { message: `Request body must contain 'gift name'.`}
      })
    }

    const error = getGiftsValidationError
    
    if (error) return res.status(400).send(error)

    GiftsService.updateGift(
      req.app.get('db'),
      req.params.gift_id,
      giftToUpdate
    )
      .then(updatedGift => {
        res.status(204).end()
      })
      // .then(updatedPerson => {
      //   res.status(204).json(serializePerson(updatedPerson[0]))
      // })
      .catch(next)
  })
  .delete((req, res, next) => {
    GiftsService.deleteGift(
      req.app.get('db'),
      req.params.gift_id
    )
    .then(() => {
      res.status(204).end()
    })
    .catch(next)
  })
  module.exports = giftsRouter