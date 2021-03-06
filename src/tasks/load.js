'use strict'

const { promisify } = require('util')
const { readFile } = require('fs')

const fastGlob = require('fast-glob')
const { load: loadYaml, JSON_SCHEMA } = require('js-yaml')

const { isObject, sortArray, findCommonPrefix } = require('../utils')
const { addErrorHandler, TestOpenApiError } = require('../errors')

const { validateTaskFile } = require('./validate')
const { addTaskPath } = require('./path')

// Load YAML/JSON task files
const loadTasks = async function({ tasks }) {
  // Tasks can either be directly a plain object
  if (isObject(tasks)) {
    return tasks
  }

  // Can use globbing
  const paths = await fastGlob(tasks)

  // Ensure task object keys order is always the same, because it's the one
  // used for reporting and we want an ordered and stable output
  const pathsA = sortArray(paths)

  const commonPrefix = findCommonPrefix(pathsA)

  const tasksA = await Promise.all(pathsA.map(path => loadTaskFile({ path, commonPrefix })))
  const tasksB = Object.assign({}, ...tasksA)

  return tasksB
}

// Load and parse each task file in parallel
const loadTaskFile = async function({ path, commonPrefix }) {
  const content = await eReadFile(path)
  const tasks = eParseTaskFile({ path, content })

  validateTaskFile({ tasks, path })

  const tasksA = addTaskPath({ tasks, path, commonPrefix })
  return tasksA
}

const readFileHandler = function({ message }, path) {
  throw new TestOpenApiError(`Could not load task file '${path}': ${message}`)
}

const eReadFile = addErrorHandler(promisify(readFile), readFileHandler)

// YAML parsing
const parseTaskFile = function({ path, content }) {
  return loadYaml(content, { ...YAML_OPTS, filename: path })
}

const YAML_OPTS = {
  schema: JSON_SCHEMA,
  json: true,
  onWarning(error) {
    throw error
  },
}

const parseTaskFileHandler = function({ message }, { path }) {
  throw new TestOpenApiError(`Task file '${path}' is not valid YAML nor JSON: ${message}`)
}

const eParseTaskFile = addErrorHandler(parseTaskFile, parseTaskFileHandler)

module.exports = {
  loadTasks,
}
