const { makeFoldersArray } = require('./folders.fixtures.js')

function makeNotesArray() {
    return [
      {
        id: 1,
        name: "Dogs",
        modified: "2019-01-03T00:00:00.000Z",
        folderid: 1,
        content: "Corporis accusamus placeat quas non voluptas. Harum fugit molestias qui. "
      },
      {
        id: 2,
        name: "Cats",
        modified: "2019-01-03T00:00:00.000Z",
        folderid: 2,
        content: "Eos laudantium quia ab blanditiis temporibus necessitatibus. Culpa et voluptas"
      }
    ]
  }
  
  module.exports = {
    makeNotesArray
  }