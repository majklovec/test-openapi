'use strict'

const { addErrorHandler } = require('../errors')
const { runHandlers } = require('../plugins')

// Run each `plugin.complete()`
const completeTask = async function({ task, plugins, config }) {
  await runHandlers({}, plugins, 'complete', { task, config })

  return task
}

const completeTaskHandler = function(error, { task }) {
  return { ...task, error }
}

const eCompleteTask = addErrorHandler(completeTask, completeTaskHandler)

module.exports = {
  completeTask: eCompleteTask,
}
