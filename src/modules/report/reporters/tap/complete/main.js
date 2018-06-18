'use strict'

const { getResultType } = require('../../../utils')
const { getReportProps } = require('../../../props')

const { getErrorProps } = require('./error_props')

// Add TAP output for each task, as a single assert
const complete = function({ options: { tap }, ...task }, { config, plugins, silent }) {
  const assert = getAssert({ task, config, plugins })
  const message = tap.assert(assert)

  if (silent) {
    return ''
  }

  return message
}

const getAssert = function({ task, task: { key, error }, config, plugins }) {
  const { title, reportProps } = getReportProps({ task, config, plugins, noCore: true })

  const resultType = getResultType(task)

  const ok = resultType !== 'fail'
  const name = getName({ key, title })
  const directive = { skip: resultType === 'skip' }
  const errorProps = getErrorProps({ ok, error, reportProps })

  return { ok, name, directive, error: errorProps }
}

const getName = function({ key, title }) {
  if (title.trim() === '') {
    return key
  }

  return `${key} - ${title}`
}

module.exports = {
  complete,
}
