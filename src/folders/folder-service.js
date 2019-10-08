const NotefulService = {
    getAllUsers(knex) {
      return knex.select('*').from('folders')
    },
  
    insertUser(knex, newItem) {
      return knex
        .insert(newItem)
        .into('folders')
        .returning('*')
        .then(rows => {
          return rows[0]
        })
    },
  
    getById(knex, id) {
      return knex
        .from('folders')
        .select('*')
        .where('id', id)
        .first()
    },
  
    deleteUser(knex, id) {
      return knex('folders')
        .where({ id })
        .delete()
    },
  
    updateUser(knex, id, newUserFields) {
      return knex('folders')
        .where({ id })
        .update(newUserFields)
    },
  }
  
  module.exports = NotefulService