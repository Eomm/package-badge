'use strict'

const packageJson = require('package-json')
const { validateSupportField } = require('package-compliant')
const { BadgeFactory } = require('gh-badges')
const mem = require('mem')

// TODO evaluate https://shields.io/endpoint

module.exports = function badge (fastify, options, next) {
  const bf = new BadgeFactory()
  const badgeSvg = mem(getPackageBadge, { maxAge: 86400000, cachePromiseRejection: false })

  fastify.get('/:field/:packageName', badgeHandler)
  fastify.get('/:field/:scope/:packageName', badgeHandler)
  fastify.get('/clear-cache', (request, reply) => {
    // utility function per test
    mem.clear(badgeSvg)
    reply.send('Cache cleared')
  })

  next()

  async function badgeHandler (request, reply) {
    request.log.info('Handling badge request with params %o', request.params)
    const { field, scope, packageName } = request.params
    const svg = await badgeSvg(field, scope, packageName)
    reply.header('content-type', 'image/svg+xml')
    reply.send(svg)
  }

  async function getPackageBadge (field, scope, packageName) {
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
      // validation err
    }

    return bf.create(format)
  }
}
