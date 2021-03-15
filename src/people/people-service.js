const PeopleService = {
  getAllPeople(knex) {
    return knex.select('*').from('people')
  },
  getPersonById(knex, id) {
    return knex.from('people').select('*').where('id', id).first()
  },
  insertPerson(knex, newPerson) {
    return knex
      .insert(newPerson)
      .into('people')
      .returning('*')
      .then(rows => {
        return rows[0]
      })
  },
  deletePerson(knex, id) {
    return knex('people')
      .where({ id })
      .delete()
  },
  updatePerson(knex, id, updatedPerson) {
    return knex('people')
      .where({ id })
      .update(updatedPerson)
  },
}

module.exports = PeopleService