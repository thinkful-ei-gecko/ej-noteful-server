const path = require('path')
const express = require('express')
const xss = require('xss')
const NoteService = require('./note-service')

const NoteRouter = express.Router()
const jsonParser = express.json()

const serializeNote = note => ({
  id: note.id,
  name: xss(note.name),
  folderid: note.folderid,
  modified: xss(note.modified),
  content: xss(note.content)
})

NoteRouter
  .route('/')
  .get((req, res, next) => {
    const knexInstance = req.app.get('db')
    NoteService.getAllNotes(knexInstance)
      .then(Notes => {
        res.json(Notes.map(serializeNote))
      })
      .catch(next)
  })
  .post(jsonParser, (req, res, next) => {
    const { name, folderid, modified, content} = req.body
    const newNote = { name, folderid, modified, content};

    for(const [key, value] of Object.entries(newNote)){
      if (value == null) {
        return res.status(400).json({
          error: {message: `Missing '${key}' in request body`}
        })
      }
    }

    NoteService.insertNote(
    req.app.get('db'),
    newNote 
    )
    .then(note => {
        res.status(201).location(path.posix.join(req.originalUrl, `/${note.id}`)).json(serializeNote(note))
    })
.catch(next)
})

NoteRouter
  .route('/:id')
  .all((req, res, next) => {
    NoteService.getById(
      req.app.get('db'),
      req.params.id
    )
      .then(Note => {
        if (!Note) {
          return res.status(404).json({
            error: { message: `Note doesn't exist` }
          })
        }
        res.Note = Note
        next()
      })
      .catch(next)
  })
  .get((req, res, next) => {
    res.json(serializeNote(res.Note))
  })
  .delete((req, res, next) => {
    NoteService.deleteNote(
      req.app.get('db'),
      req.params.id
    )
      .then(numRowsAffected => {
        res.status(204).end()
      })
      .catch(next)
  })
  .patch(jsonParser, (req, res, next) => {
    const { text, date_Noteed } = req.body
    const NoteToUpdate = { text, date_Noteed }

    const numberOfValues = Object.values(NoteToUpdate).filter(Boolean).length
    if (numberOfValues === 0)
      return res.status(400).json({
        error: {
          message: `Request body must contain either 'text' or 'date_Noteed'`
        }
      })

    NoteService.updateNote(
      req.app.get('db'),
      req.params.Note_id,
      NoteToUpdate
    )
      .then(numRowsAffected => {
        res.status(204).end()
      })
      .catch(next)
  })

module.exports = NoteRouter