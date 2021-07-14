const api = require('./').handler
require('./db/connection')
// const db = require('./models')

const port = process.env.PORT || 3001
// Listen the server
api.listen(port)
console.log(`API listening on Port ${port}`)
