const path = require('path')
const express = require('express')
const xss = require('xss')
const FolderService = require('./folder-service')

const folderRouter = express.Router()
const jsonParser = express.json()

const serializeUser = user => ({
  id: user.id,
  name: xss(user.name)
})

//ROUTES TO ALL NOTES AND FOLDERS

folderRouter
  .route('/')
  .get((req, res, next) => {
    const knexInstance = req.app.get('db')
    FolderService.getAllUsers(knexInstance)
      .then(users => {
        res.json(users.map(serializeUser))
      })
      .catch(next)
  })
  .post(jsonParser, (req, res, next) => {
    const { name } = req.body
    const newFolder = { name }

    for (const [key, value] of Object.entries(newFolder)) {
      if (value == null) {
        return res.status(400).json({
          error: { message: `Missing '${key}' in request body` }
        })
      }
    }

    FolderService.insertUser(
      req.app.get('db'),
      newFolder
    )
      .then(user => {
        res
          .status(201)
          .location(path.posix.join(req.originalUrl, `/${user.id}`))
          .json(serializeUser(user))
      })
      .catch(next)
  })

//SPECIFC FOLDER

folderRouter
  .route('/:id')
  .all((req, res, next) => {
    FolderService.getById(
      req.app.get('db'),
      req.params.id
    )
      .then(user => {
        if (!user) {
          return res.status(404).json({
            error: { message: `Folder doesn't exist` }
          })
        }
        res.user = user
        next()
      })
      .catch(next)
  })
  .get((req, res, next) => {
    res.json(serializeUser(res.user))
  })
  .delete((req, res, next) => {
    FolderService.deleteUser(
      req.app.get('db'),
      req.params.id
    )
      .then(numRowsAffected => {
        res.status(204).end()
      })
      .catch(next)
  })
  .patch(jsonParser, (req, res, next) => {
    const {  name, note_name, note_content } = req.body
    const userToUpdate = {  name, note_name, note_content }

    const numberOfValues = Object.values(userToUpdate).filter(Boolean).length
    if (numberOfValues === 0)
      return res.status(400).json({
        error: {
          message: `Request body must contain 'name'`
        }
      })

    FolderService.updateUser(
      req.app.get('db'),
      req.params.id,
      userToUpdate
    )
      .then(numRowsAffected => {
        res.status(204).end()
      })
      .catch(next)
  })

module.exports = folderRouter