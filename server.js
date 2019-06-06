'use strict'

const Fastify = require('fastify')
const path = require('path')

const app = Fastify({ logger: true })

app.register(require('fastify-static'), {
  root: path.join(__dirname, 'public')
})

app.register(require('./routes/badges'))

app.listen(process.env.PORT || 3000, '0.0.0.0', function (err) {
  if (err) throw err
  console.log(`server listening on ${app.server.address().port}`)
})
