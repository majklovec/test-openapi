'use strict'

// Concatenate parts into a single JavaScript part, e.g. `object.name[index]`
const getPath = function(parts) {
  return parts.map(getPart).join('')
}

const getPart = function(part, index) {
  // Array index, i.e. object[INTEGER]
  if (Number.isInteger(Number(part))) {
    return `[${part}]`
  }

  const partA = String(part)

  // `object["NAME"]`
  if (!VALID_JS_NAME.test(partA)) {
    // Use JSON.stringify() to escape quotes
    return `[${JSON.stringify(partA)}]`
  }

  // `object.NAME`
  // No dots if at beginning of path
  if (index === 0) {
    return partA
  }

  return `.${partA}`
}

// RegExp describing property names that can be used as NAME in `object.NAME`
// in JavaScript
// They otherwise need to escaped as `object["NAME"]`
const VALID_JS_NAME = /^\p{ID_Start}[\p{ID_Continue}$\u200c\u200d]*$/u

module.exports = {
  getPath,
}
