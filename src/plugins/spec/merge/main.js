'use strict'

const { merge } = require('lodash')

const { mergeParams, mergeHeaders } = require('../../../utils')

const { getOperation } = require('./operation')
const { mergeInvalidSchema, isInvalidSchema } = require('./invalid')

// Merge `task.parameters.*` to specification
const mergeSpecParams = function({ taskKey, config: { spec }, params }) {
  const operation = getOperation({ taskKey, spec })
  const paramsA = mergeParams([...operation.params, ...params], mergeSpec)
  return { params: paramsA }
}

// Merge `task.validate.*` to specification
const mergeSpecValidate = function({
  taskKey,
  config: { spec },
  validate: { status, headers, body },
  rawResponse,
}) {
  const operation = getOperation({ taskKey, spec })
  const { responses } = operation

  // Find the specification response matching both the current operation and
  // the received status code
  const specResponse = responses[String(rawResponse.status)] || responses.default
  if (specResponse === undefined) {
    return
  }

  const headersA = mergeHeaders([...specResponse.headers, ...headers], mergeSpec)
  const bodyA = mergeSpecSchema(specResponse.body, body)

  return { validate: { status, headers: headersA, body: bodyA } }
}

// Merge a `task.*.*` value with the specification value
const mergeSpec = function({ schema: specSchema, ...specValue }, { schema, ...value }) {
  const schemaA = mergeSpecSchema(specSchema, schema)
  return { ...specValue, ...value, schema: schemaA }
}

// Deep merge the JSON schemas
// Both `specSchema` and `schema` might be `undefined`
const mergeSpecSchema = function(specSchema, schema) {
  if (isInvalidSchema({ schema })) {
    return mergeInvalidSchema({ specSchema })
  }

  return merge({}, specSchema, schema)
}

module.exports = {
  mergeSpecParams,
  mergeSpecValidate,
}
