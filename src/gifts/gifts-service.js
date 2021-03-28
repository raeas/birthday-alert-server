const GiftsService = {
  getAllGifts(knex) {
    return knex.select('*').from('gifts').orderBy('gift_name')
  },
  getGiftById(knex, id) {
    return knex.from('gifts').select('*').where('id', id).first()
  },
  insertGift(knex, newGift) {
    return knex
      .insert(newGift)
      .into('gifts')
      .returning('*')
      .then(rows => {
        return rows[0]
      })
  },
  deleteGift(knex, id) {
    return knex('gifts')
      .where({ id })
      .delete()
  },
  updateGift(knex, id, updatedGift) {
    return knex('gifts')
      .where({ id })
      .update(updatedGift)
  },
}

module.exports = GiftsService