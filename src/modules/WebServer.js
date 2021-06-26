const express = require('express')
const logger = require('morgan')
const session = require('express-session')
const app = express()

module.exports = async (client, PORT) => {
  app.use(logger('dev'))
  app.use(express.json())
  app.use(express.urlencoded({extended: false}))
  app.use(session({secret: process.env.SESSION_SECRET,resave: false,saveUninitialized: true,}))

  require('../router/main')(app, client)
  app.listen(PORT, () => console.log(client.color('magenta', '[  Web  ]'), `Server listening on port ${PORT}`))
}