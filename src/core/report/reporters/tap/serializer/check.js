'use strict'

const { isObject } = require('../../../../../utils')

// Check input arguments
const checkArgument = function(value, type) {
  const isValid = TYPES[type](value)
  if (isValid) {
    return
  }

  throw new Error(`tap function argument must be ${type} not ${value}`)
}

const TYPES = {
  string: value => typeof value === 'string',

  integer: Number.isInteger,

  boolean: value => typeof value === 'boolean',

  object: isObject,
}

module.exports = {
  checkArgument,
}
