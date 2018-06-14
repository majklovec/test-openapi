'use strict'

const { omitBy } = require('lodash')

const { orange, indentValue, stringifyValue, highlightValue } = require('../utils')

const { getCoreErrorProps } = require('./core_error_props')

// Get `task.errorProps`, i.e. plugin-specific error properties printed on reporting
const getErrorProps = function({ task, plugins }) {
  const reportFuncs = plugins
    .map(({ report: { errorProps } = {} }) => errorProps)
    .filter(reportFunc => reportFunc !== undefined)

  // Core has merging priority
  const reportFuncsA = [...reportFuncs, getCoreErrorProps]

  const reportResult = reportFuncsA.map(reportFunc => getPluginErrorProps({ reportFunc, task }))

  const title = getTitle({ reportResult })

  const errorProps = reportResult.map(({ errorProps }) => errorProps)
  const errorPropsA = Object.assign({}, ...errorProps)

  const errorPropsB = printErrorProps({ errorProps: errorPropsA })
  return { title, errorProps: errorPropsB }
}

const getPluginErrorProps = function({ reportFunc, task }) {
  const errorProps = reportFunc(task)

  const { title, ...errorPropsA } = omitBy(errorProps, isEmptyProp)
  return { title, errorProps: errorPropsA }
}

// Do not print error.* properties that are not present
const isEmptyProp = function(value) {
  return value === undefined
}

const getTitle = function({ reportResult }) {
  return reportResult
    .map(({ title }) => title)
    .filter(title => title !== undefined && title.trim() !== '')
    .join(' ')
}

const printErrorProps = function({ errorProps }) {
  return Object.entries(errorProps)
    .map(printErrorProp)
    .join('\n\n')
}

// Print `error.*` properties in error printed message
const printErrorProp = function([name, value]) {
  // Stringify and prettify to YAML
  const string = stringifyValue(value)
  // Syntax highlighting, unless already highlighted
  const stringA = highlightValue({ string })
  // Indentation if multiline
  const stringB = indentValue({ string: stringA })
  // Prefix with `errorProp.name`
  return `${orange(`${name}:`)} ${stringB}`
}

module.exports = {
  getErrorProps,
}