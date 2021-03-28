const { expect } = require('chai')
const knex = require('knex')
const supertest = require('supertest')
const app = require('../src/app')
const { makePeopleArray } = require('./people.fixtures')

describe('People Endpoints', function() {
  let db

  before('make knex instance', () => {
    db = knex({
      client: 'pg',
      connection: process.env.TEST_DATABASE_URL,
    })
    app.set('db', db)
  })

  after('disconnect from db', () => db.destroy())

  before('clean the table', () => db.raw('TRUNCATE people RESTART IDENTITY CASCADE'))

  afterEach('cleanup', () => db.raw('TRUNCATE people RESTART IDENTITY CASCADE'))

//1 DESCRIBE - get people endpoint
  describe(' 1 GET /api/people', () => {
//1A - CONTEXT to people endpoint - given no people in the db
        context('1A Given no people', () => {
          it('responds with 200 and an empty list', () => {
            return supertest(app)
              .get('/api/people')
              .expect(200, [])
      })
    })
//1B - CONTEXT to people endpoint - given there are people in the db
    context('1B Given there are people in the database', () => {
      const testPeople = makePeopleArray()
      beforeEach('insert people', () => {
        return db
          .into('people')
          .insert(testPeople)
          .then(() => {
            return db
          })
      })

      it('responds with 200 and all of the people', () => {
        return supertest(app)
        .get('/api/people')
        .expect(200, testPeople)
      })
    })
  })

//2 DESCRIBE - person by id    
describe(` 2 GET /api/people/:person_id`, () => {
  //2A CONTEXT - to person by id - given no person id in db
      context(`2A Given no person`, () => {
        it(`responds with 404`, () => {
          const person_id = 123456
          return supertest(app)
            .get(`/api/people/${person_id}`)
            .expect(404, { error: { message: `Person not found` } })
         })
      })
//2B CONTEXT - to person by id - given there are people by id in db
  context('2B Given there are people in the database', () => {
    const testPeople = makePeopleArray()

    beforeEach('insert person', () => {
      return db
        .into('people')
        .insert(testPeople)
        .then(() => {
          return db
        })
      })
      
    it('responds with 200 and the specified person', () => {
      const personId = 2
      const expectedPerson = testPeople[personId - 1]
      return supertest(app)
        .get(`/api/people/${personId}`)
        .expect(200, expectedPerson)
      })
    })
  })
//3 DESCRIBE - POST person by id  
  describe(` 3 POST /api/people`, () => {

    it(`creates a person, responding with 201 and the new person`,  function() {
      this.retries(3)
      const newPerson = {
        first_name: 'New Person FN',
        last_name: 'New Person LN',
        birthday: new Date('2000-01-31').toISOString()
      }
    return supertest(app)
      .post('/api/people')
      .send(newPerson)
      .expect(201)
      .expect(res => {
        expect(res.body.first_name).to.eql(newPerson.first_name)
        expect(res.body.last_name).to.eql(newPerson.last_name)
        expect(res.body.birthday).to.eql(newPerson.birthday)
        expect(res.body).to.have.property('id')
        expect(res.headers.location).to.eql(`/api/people/${res.body.id}`)
        // const expected = new Date().toISOString()
        // const actual = new Date(res.body.birthday).toUTCString()
        // expect(actual).to.eql(expected)
      })
      .then(postRes =>
        supertest(app)
        .get(`/api/people/${postRes.body.id}`)
        .expect(postRes.body)
      )
    })

    const requiredFields = ['first_name', 'birthday']

    requiredFields.forEach(field => {
    const newPerson = {
      first_name: 'New Person FN',
      last_name: 'New Person LN',
      birthday: new Date('2000-01-31')
    }

    it(`responds with 400 and an error message when the '${field}' is missing`, () => {
      delete newPerson[field]

      return supertest(app)
        .post('/api/people')
        .send(newPerson)
        .expect(400, {
          error: { message: `Missing '${field}' in request body` }
        })
      })
    })
  })
//4 DESCRIBE - DELETE person by id  
  describe(`4 DELETE /api/people/:person_id`, () => {
    //4A CONTEXT - given there are no people by id to delete
    context(`4A Given no person`, () => {
      it(`responds with 404`, () => {
        const person_Id = 123456
        return supertest(app)
          .delete(`/api/people/${person_Id}`)
          .expect(404, { error: { message: `Person not found` } })
        })
      })
    //4B CONTEXT - given there are people by id to delete
    context('4B Given there are people in the database', () => {
      const testPeople = makePeopleArray()
  
      beforeEach('insert people', () => {
        return db
          .into('people')
          .insert(testPeople)
          .then(() => {
            return db
          })
        })
      
        it('responds with 204 and removes the person', () => {
          const idToRemove = 2
          const expectedPeople = testPeople.filter(person => person.id !== idToRemove)
          return supertest(app)
            .delete(`/api/people/${idToRemove}`)
            .expect(204)
            .then(res =>
              supertest(app)
                .get(`/api/people`)
                .expect(expectedPeople)
            )
        })
      })
    })
  //5 DESCRIBE - PATCH person by id 
  describe(`5 PATCH /api/people/:person_id`, () => {
    //5A CONTEXT given there are no people by id
    context(`5A Given no person`, () => {
      it(`responds with 404`, () => {
        const personId = 123456
        return supertest(app)
          .patch(`/api/people/${personId}`)
          .expect(404, { error: { message: `Person not found` } })
      })
    })
    //5B CONTEXT given there are people in the database
    context('5B Given there are people in the database', () => {
      const testPeople = makePeopleArray()
        
      beforeEach('insert people', () => {
        return db
          .into('people')
          .insert(testPeople)
          .then (() => {
            return db
          })
      })
        
      it('responds with 204 and updates the person', () => {
        const idToUpdate = 2
        const updatePerson = {
          first_name: 'updated person name',
          last_name: 'Bryant',
          birthday: new Date('1975-09-25').toISOString()
        }
        const expectedPerson = {
          ...testPeople[idToUpdate - 1],
          ...updatePerson
        }
        return supertest(app)
          .patch(`/api/people/${idToUpdate}`)
          .send(updatePerson)
          .expect(204)
          .then(res =>
            supertest(app)
              .get(`/api/people/${idToUpdate}`)
              .expect(expectedPerson)
            )
        })
      it(`responds with 400 when no required fields supplied`, () => {
        const idToUpdate = 2
        return supertest(app)
          .patch(`/api/people/${idToUpdate}`)
          .send({ irrelevantField: 'foo' })
          .expect(400, {
            error: {
              message: `Request body must contain either 'first name' or 'birthday'.`
            }
          })
      })
      it(`responds with 204 when updating only a subset of fields`, () => {
        const idToUpdate = 2
        const updatePerson = {
          first_name: 'updated first name',
        }
        const expectedPerson = {
          ...testPeople[idToUpdate - 1],
          ...updatePerson
        }
  
        return supertest(app)
          .patch(`/api/people/${idToUpdate}`)
          .send({
            ...updatePerson,
              fieldToIgnore: 'should not be in GET response'
          })
          .expect(204)
          .then(res =>
            supertest(app)
              .get(`/api/people/${idToUpdate}`)
              .expect(expectedPerson)
        )
      })
    })
  })
})