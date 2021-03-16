const { expect } = require('chai')
const knex = require('knex')
const supertest = require('supertest')
const app = require('../src/app')
const { makeGiftsArray } = require('./gifts.fixtures')

describe('Gifts Endpoints', function() {
  let db

  before('make knex instance', () => {
    db = knex({
      client: 'pg',
      connection: process.env.TEST_DB_URL,
    })
    app.set('db', db)
  })

  after('disconnect from db', () => db.destroy())

  before('clean the table', () => db('gifts'))

  afterEach('cleanup', () => db.raw('TRUNCATE gifts RESTART IDENTITY CASCADE'))

//1 DESCRIBE - get gifts endpoint
  describe(' 1 GET /api/gifts', () => {
//1A - CONTEXT to gifts endpoint - given no gifts in the db
        context('1A Given no gifts', () => {
          it('responds with 200 and an empty list', () => {
            return supertest(app)
              .get('/api/gifts')
              .expect(200, [])
      })
    })
//1B - CONTEXT to gifts endpoint - given there are gifts in the db
    context('1B Given there are gifts in the database', () => {
      const testGifts = makeGiftsArray()
      beforeEach('insert gifts', () => {
        return db
          .into('gifts')
          .insert(testGifts)
          .then(() => {
            return db
          })
      })

      it('responds with 200 and all of the gifts', () => {
        return supertest(app)
        .get('/api/gifts')
        .expect(200, testGifts)
      })
    })
  })

//2 DESCRIBE - gifts by id    
describe(` 2 GET /api/gifts/:gift_id`, () => {
  //2A CONTEXT - to gifts by id - given no gift id in db
      context(`2A Given no gifts`, () => {
        it(`responds with 404`, () => {
          const gift_id = 123456
          return supertest(app)
            .get(`/api/gifts/${gift_id}`)
            .expect(404, { error: { message: `Gift not found` } })
         })
      })
//2B CONTEXT - to gifts by id - given there are gifts by id in db
  context('2B Given there are gifts in the database', () => {
    const testGifts = makeGiftsArray()

    beforeEach('insert gifts', () => {
      return db
        .into('gifts')
        .insert(testGifts)
        .then(() => {
          return db
        })
      })
      
    it('responds with 200 and the specified book', () => {
      const giftId = 2
      const expectedGift = testGifts[giftId - 1]
      return supertest(app)
        .get(`/api/gifts/${giftId}`)
        .expect(200, expectedGift)
      })
    })
  })
//3 DESCRIBE - POST gifts by id  
  describe(` 3 POST /api/gifts`, () => {

    it(`creates a gift, responding with 201 and the new gift`,  function() {
      this.retries(3)
      const newGift = {
        gift_name: 'New test Gift',
        person: 1
      }
    return supertest(app)
      .post('/api/gifts')
      .send(newGift)
      .expect(201)
      .expect(res => {
        expect(res.body.gift_name).to.eql(newGift.gift_name)
        expect(res.body).to.have.property('id')
        expect(res.headers.location).to.eql(`/api/gifts/${res.body.id}`)
      })
      .then(postRes =>
        supertest(app)
        .get(`/api/gifts/${postRes.body.id}`)
        .expect(postRes.body)
      )
    })

    const requiredFields = ['gift_name']

    requiredFields.forEach(field => {
    const newGift = {
      gift_name: 'New test gift',
      person: 1
    }

    it(`responds with 400 and an error message when the '${field}' is missing`, () => {
      delete newGift[field]

      return supertest(app)
        .post('/api/gifts')
        .send(newGift)
        .expect(400, {
          error: { message: `Missing '${field}' in request body` }
        })
      })
    })
  })
//4 DESCRIBE - DELETE gifts by id  
  describe(`4 DELETE /api/gifts/:gift_id`, () => {
    //4A CONTEXT - given there are no gifts by id to delete
    context(`4A Given no gifts`, () => {
      it(`responds with 404`, () => {
        const gift_Id = 123456
        return supertest(app)
          .delete(`/api/gifts/${gift_Id}`)
          .expect(404, { error: { message: `Gift not found` } })
        })
      })
    //4B CONTEXT - given there are gifts by id to delete
    context('4B Given there are gifts in the database', () => {
      const testGifts = makeGiftsArray()
  
      beforeEach('insert gift', () => {
        return db
          .into('gifts')
          .insert(testGift)
          .then(() => {
            return db
          })
        })
      
        it('responds with 204 and removes the gift', () => {
          const idToRemove = 2
          const expectedGifts = testGifts.filter(gift => gift.id !== idToRemove)
          return supertest(app)
            .delete(`/api/gifts/${idToRemove}`)
            .expect(204)
            .then(res =>
              supertest(app)
                .get(`/api/gifts`)
                .expect(expectedGifts)
            )
        })
      })
    })
  //5 DESCRIBE - PATCH gift by id 
  describe(`5 PATCH /api/gifts/:gift_id`, () => {
    //5A CONTEXT given there are no gifts by id
    context(`5A Given no gifts`, () => {
      it(`responds with 404`, () => {
        const giftId = 123456
        return supertest(app)
          .patch(`/api/gifts/${giftId}`)
          .expect(404, { error: { message: `Gift not found` } })
      })
    })
    //5B CONTEXT given there are gifts in the database
    context('5B Given there are gifts in the database', () => {
      const testGifts = makeGiftsArray()
        
      beforeEach('insert gifts', () => {
        return db
          .into('gifts')
          .insert(testGifts)
          .then (() => {
            return db
          })
      })
        
      it('responds with 204 and updates the gift', () => {
        const idToUpdate = 2
        const updateGift = {
          gift_name: 'updated gift name',
        }
        const expectedGift = {
          ...testGifts[idToUpdate - 1],
          ...updateGift
        }
        return supertest(app)
          .patch(`/api/gifts/${idToUpdate}`)
          .send(updateGift)
          .expect(204)
          .then(res =>
            supertest(app)
              .get(`/api/gifts/${idToUpdate}`)
              .expect(expectedGift)
            )
        })
      it(`responds with 400 when no required fields supplied`, () => {
        const idToUpdate = 2
        return supertest(app)
          .patch(`/api/gifts/${idToUpdate}`)
          .send({ irrelevantField: 'foo' })
          .expect(400, {
            error: {
              message: `Request body must contain 'gift_name'.`
            }
          })
      })
      it(`responds with 204 when updating only a subset of fields`, () => {
        const idToUpdate = 2
        const updateGift = {
          gift_name: 'updated gift name',
        }
        const expectedGift = {
          ...testGifts[idToUpdate - 1],
          ...updateGift
        }
  
        return supertest(app)
          .patch(`/api/gifts/${idToUpdate}`)
          .send({
            ...updateGift,
              fieldToIgnore: 'should not be in GET response'
          })
          .expect(204)
          .then(res =>
            supertest(app)
              .get(`/api/gifts/${idToUpdate}`)
              .expect(expectedGift)
        )
      })
    })
  })
})