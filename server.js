'use strict'

const Fastify = require('fastify')
const path = require('path')
const packageJson = require('package-json')
const { validateSupportField } = require('package-compliant')
const { BadgeFactory } = require('gh-badges')

const app = Fastify({ logger: true })
const bf = new BadgeFactory()

app.register(require('fastify-static'), {
  root: path.join(__dirname, 'public')
})

// TODO evaluate https://shields.io/endpoint

async function badgeHandler (request, reply) {
  request.log.info('Handling badge request with params %o', request.params)

  const { field, scope, packageName } = request.params

  const theJson = await packageJson(`${scope ? scope + '/' : ''}${packageName}`, { fullMetadata: true })

  const format = {
    text: ['support', 'not defined'],
    format: 'svg',
    colorscheme: 'lightgray',
    template: 'flat'
  }

  try {
    validateSupportField(theJson.support)
    format.text = [field.toLowerCase(), theJson.support[field]]
    format.colorscheme = 'green'
  } catch (error) {
    app.log.error(error)
  }

  const svg = bf.create(format)
  reply.header('content-type', 'image/svg+xml')
  reply.send(svg)
}

app.get('/:field/:packageName', badgeHandler)
app.get('/:field/:scope/:packageName', badgeHandler)

app.listen(process.env.PORT || 3000, '0.0.0.0', function (err) {
  if (err) throw err
  console.log(`server listening on ${app.server.address().port}`)
})
