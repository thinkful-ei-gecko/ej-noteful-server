const knex = require('knex')
const app = require('../src/App/app')
const { makeFoldersArray } = require('./folders.fixtures')
const { makeNotesArray } = require('./notes.fixtures')

describe('Folders Endpoints', function() {
    let db

    before('make knex instance', () => {

    db = knex({
        client: 'pg',
        connection: process.env.TEST_DB_URL,
    })
    app.set('db', db)

    })

    after('disconnect from db', () => db.destroy())

    before('clean the table', () => db.raw('TRUNCATE folders, notes RESTART IDENTITY CASCADE'))

    afterEach('cleanup',() => db.raw('TRUNCATE folders, notes RESTART IDENTITY CASCADE'))

    //PASSED THE TEST
    describe(`GET /api/Folders`, () => {
    context(`Given no Folders`, () => {
        it(`responds with 200 and an empty list`, () => {
        return supertest(app)
            .get('/api/Folders')
            .expect(200, [])
        })
    })

    context('Given there are Folders in the database', () => {
        const testFolders = makeFoldersArray();
        const testNotes = makeNotesArray();

        beforeEach('insert Folders', () => {
        return db
            .into('folders')
            .insert(testFolders)
            .then(() => {
            return db
                .into('notes')
                .insert(testNotes)
            })
        })

        it('responds with 200 and all of the Folders', () => {
        return supertest(app)
            .get('/api/Folders')
            .expect(200, testFolders)
        })
    })

    // context(`Given an XSS attack Folder`, () => {
    //     // const { maliciousFolder, expectedFolder } = makeMaliciousNote()
    //     const testNotes = makeNotesArray();

    //     beforeEach('insert malicious Folder', () => {
    //     return db
    //         .into('notes')
    //         .insert(testNotes)
    //         .then(() => {
    //         return db
    //             .into('folders')
    //             .insert([ maliciousFolder ])
    //         })
    //     })

    //     it('removes XSS attack content', () => {
    //     return supertest(app)
    //         .get(`/api/Folders`)
    //         .expect(200)
    //         .expect(res => {
    //         expect(res.body[0].title).to.eql(expectedFolder.title)
    //         expect(res.body[0].content).to.eql(expectedFolder.content)
    //         })
    //     })
    // })

    })

    describe(`GET /api/Folders/:folderid`, () => {
    context(`Given no Folders`, () => {
        it(`responds with 404`, () => {
        const folderid = 123456
        return supertest(app)
            .get(`/api/Folders/${folderid}`)
            .expect(404, {error: {message: `Folder doesn't exist`}})
        })
    })

    context('Given there are Folders in the database', () => {
        const testFolders = makeFoldersArray()
        const testNotes = makeNotesArray();

        beforeEach('insert Folders', () => {
        return db
            .into('folders')
            .insert(testFolders)
            .then(() => {
            return db
                .into('notes')
                .insert(testNotes)
            })
        })

        it('responds with 200 and the specified folder', () => {
        const folderid = 2
        const expectedFolder = testFolders[folderid - 1]
        return supertest(app)
            .get(`/api/Folders/${folderid}`)
            .expect(200, expectedFolder)
        })
    })

    // context(`Given an XSS attack Folder`, () => {
    //     // const { maliciousFolder, expectedFolder } = makeMaliciousNote()
    //     const testNotes = makeNotesArray();

    //     beforeEach('insert malicious Folder', () => {
    //     return db
    //         .into('notes')
    //         .insert(testNotes)
    //         .then(() => {
    //         return db
    //             .into('folders')
    //             .insert([ maliciousFolder ])
    //         })
    //     })

    //     it('removes XSS attack content', () => {
    //     return supertest(app)
    //         .get(`/api/Folders/${maliciousFolder.id}`)
    //         .expect(200)
    //         .expect(res => {
    //         expect(res.body.title).to.eql(expectedFolder.title)
    //         expect(res.body.content).to.eql(expectedFolder.content)
    //         })
    //     })
    // })
    })

    describe(`POST /api/folders`, () => {
    const testFolders = makeFoldersArray();
    beforeEach('insert folders', () => {
        return db
        .into('folders')
        .insert(testFolders)
    })

    // it.only(`creates a folder, responding with 201 and the new folder`, () => {
    //     const newFolder = {
    //     name: 'Test new folder'
    //     }
    //     return supertest(app)
    //     .post('/api/folders')
    //     .send(newFolder)
    //     .expect(201)
    //     .expect(res => {
    //         expect(res.body.name).to.eql(newFolder.name)
    //         expect(res.body).to.have.property('id')
    //         expect(res.headers.location).to.eql(`/api/Folders/${res.body.id}`)
    //         const expected = new Intl.DateTimeFormat('en-US').format(new Date())
    //         const actual = new Intl.DateTimeFormat('en-US').format(new Date(res.body.date_published))
    //         expect(actual).to.eql(expected)
    //     })
    //     .then(res =>
    //         supertest(app)
    //         .get(`/api/folders/${res.body.id}`)
    //         .expect(res.body)
    //     )
    // })

    const requiredFields = ['name']

    requiredFields.forEach(field => {
        const newFolder = {
        name: 'Test new folder',
        }

        it(`responds with 400 and an error message when the '${field}' is missing`, () => {
        delete newFolder[field]

        return supertest(app)
            .post('/api/Folders')
            .send(newFolder)
            .expect(400, {
            error: { message: `Missing '${field}' in request body` }
            })
        })
    })

    // it('removes XSS attack content from response', () => {
    //     // const { maliciousFolder, expectedFolder } = makeMaliciousNote()
    //     return supertest(app)
    //     .post(`/api/Folders`)
    //     .send(maliciousFolder)
    //     .expect(201)
    //     .expect(res => {
    //         expect(res.body.title).to.eql(expectedFolder.title)
    //         expect(res.body.content).to.eql(expectedFolder.content)
    //     })
    // })
    })

    describe(`DELETE /api/Folders/:folderid`, () => {
    context(`Given no Folders`, () => {
        it(`responds with 404`, () => {
        const folderid = 123456
        return supertest(app)
            .delete(`/api/Folders/${folderid}`)
            .expect(404, { error: { message: `Folder doesn't exist` } })
        })
    })

    context('Given there are Folders in the database', () => {
        const testFolders = makeFoldersArray()
        const testNotes = makeNotesArray();

        beforeEach('insert Folders', () => {
        return db
            .into('folders')
            .insert(testFolders)
            .then(() => {
            return db
                .into('notes')
                .insert(testNotes)
            })
        })

        it('responds with 204 and removes the folder', () => {
        const idToRemove = 2
        const expectedFolders = testFolders.filter(folder => folder.id !== idToRemove)
        return supertest(app)
            .delete(`/api/folders/${idToRemove}`)
            .expect(204)
            .then(res =>
            supertest(app)
                .get(`/api/folders`)
                .expect(expectedFolders)
            )
        })
    })
    })

    describe(`PATCH /api/Folders/:folderid`, () => {
    context(`Given no Folders`, () => {
        it(`responds with 404`, () => {
        const folderid = 123456
        return supertest(app)
            .delete(`/api/Folders/${folderid}`)
            .expect(404, { error: { message: `Folder doesn't exist` } })
        })
    })

    context('Given there are Folders in the database', () => {
        const testFolders = makeFoldersArray()
        const testNotes = makeNotesArray();

        beforeEach('insert Folders', () => {
        return db
            .into('folders')
            .insert(testFolders)
            .then(() => {
            return db
                .into('notes')
                .insert(testNotes)
            })
        })

        it('responds with 204 and updates the folder', () => {
        const idToUpdate = 2
        const updateFolder = {
            name: 'updated Folder title'
        }
        const expectedFolder = {
            ...testFolders[idToUpdate - 1],
            ...updateFolder
        }
        return supertest(app)
            .patch(`/api/folders/${idToUpdate}`)
            .send(updateFolder)
            .expect(204)
            .then(res =>
            supertest(app)
                .get(`/api/folders/${idToUpdate}`)
                .expect(expectedFolder)
            )
        })

        it(`responds with 400 when no required fields supplied`, () => {
        const idToUpdate = 2
        return supertest(app)
            .patch(`/api/Folders/${idToUpdate}`)
            .send({ irrelevantField: 'foo' })
            .expect(400, {
            error: {
                message: `Request body must contain 'name'`
            }
            })
        })

            it(`responds with 204 when updating only a subset of fields`, () => {
            const idToUpdate = 2
            const updateFolder = {
                name: 'updated Folder name',
            }
            const expectedFolder = {
                ...testFolders[idToUpdate - 1],
                ...updateFolder
            }

            return supertest(app)
                .patch(`/api/Folders/${idToUpdate}`)
                .send({
                ...updateFolder,
                fieldToIgnore: 'should not be in GET response'
                })
                .expect(204)
                .then(res =>
                supertest(app)
                    .get(`/api/Folders/${idToUpdate}`)
                    .expect(expectedFolder)
                )
            })
        })
    })
})