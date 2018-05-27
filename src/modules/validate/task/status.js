'use strict'

const { TestOpenApiError } = require('../../../errors')
const { validateFromSchema } = require('../../../utils')

// Validates response status code against OpenAPI specification
const validateStatus = function({ validate: { status: schema }, response: { status } }) {
  const { error } = validateFromSchema({ schema, value: status })

  if (error === undefined) {
    return
  }

  const property = 'call.response.status'
  throw new TestOpenApiError(`Status code${error}.`, { property, schema, actual: status })
}

module.exports = {
  validateStatus,
}
