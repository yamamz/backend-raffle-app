const bodyParser = require("body-parser")
const cookieParser = require("cookie-parser")
const express = require('express')
const { join } = require('path')
const app = express()


app.use(express.json({ limit: '50000mb' }))
app.use(express.urlencoded({
    extended: true, limit: '50000mb'
}))

app.use(cookieParser())
// "Access-Control-Allow-Headers",
// "x-access-token, Origin, Content-Type, Accept"
app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*")
    res.header("Access-Control-Allow-Methods", "POST, GET, OPTIONS, DELETE, PUT")
    res.header("Access-Control-Allow-Headers", "origin, content-type, authorization, x-access-token, Accept")
    res.header("Content-Type", "application/json")
    if (req.method === "OPTIONS") {
        res.sendStatus(200);
    } else {
        next()
    }
})

// Data route
const dataFolder = join(__dirname, '..', 'data')
app.use("/data", express.static(dataFolder))


// API routes
const apiRoutes = express.Router()
apiRoutes.use('/auth', require('./router/auth.route'))
apiRoutes.use('/payment', require('./router/payment.route'))
apiRoutes.use('/draw', require('./router/draw.route'))
apiRoutes.use('/ticket', require('./router/ticket.route'))
app.use('/api', apiRoutes)

module.exports = {
    path: '/',
    handler: app
}
