const api = require('./').handler

const db = require('./models')

const port = process.env.PORT || 3001

// Listen the server
db.sequelize.sync().then(() => {
    api.listen(port)
    console.log(`API listening on Port ${port}`)
})