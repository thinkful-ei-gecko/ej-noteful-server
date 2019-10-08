const NoteService = {
    getAllNotes(knex) {
      return knex.select('*').from('notes')
    },
  
    insertNote(knex, newNote) {
      return knex.insert(newNote).into('notes').returning('*')
        .then(rows => {
          return rows[0]
        })
    },
  
    getById(knex, id) {
      return knex
        .from('notes')
        .select('*')
        .where('id', id)
        .first()
    },
  
    deleteNote(knex, id) {
      return knex('notes')
        .where('id', id)
        .delete()
    },
  
    updateNote(knex, id, newNoteFields) {
      return knex('notes')
        .where('id', id)
        .update(newNoteFields)
    },
  }
  
  module.exports = NoteService