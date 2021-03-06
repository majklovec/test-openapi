'use strict'

// Add `METHOD URL (STATUS)` to reporting
const getTitle = function({ rawRequest, rawResponse }) {
  const url = getUrl(rawRequest)
  const status = getStatus(rawResponse)
  return [url, status].filter(part => part !== undefined).join(' ')
}

const getUrl = function({ method, url }) {
  if (method === undefined || url === undefined) {
    return
  }

  const urlA = url.replace(QUERY_REGEXP, '')

  return `${method.toUpperCase()} ${urlA}`
}

// Remove query variables from URL
const QUERY_REGEXP = /\?.*/

const getStatus = function({ status }) {
  if (status === undefined) {
    return
  }

  return `(${status})`
}

module.exports = {
  getTitle,
}
