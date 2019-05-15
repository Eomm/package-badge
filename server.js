'use strict'

const Fastify = require('fastify')
const { BadgeFactory } = require('gh-badges')

const app = Fastify({ logger: true })
const bf = new BadgeFactory()

app.get('/', (request, reply) => {
  const format = {
    text: ['hello', 'world'],
    color: 'green',
    template: 'flat'
  }

  const svg = bf.create(format)
  reply.header('content-type', 'image/svg+xml')
  reply.send(svg)
})

app.listen(process.env.PORT || 3000, function (err) {
  if (err) throw err
  console.log(`server listening on ${app.server.address().port}`)
})
