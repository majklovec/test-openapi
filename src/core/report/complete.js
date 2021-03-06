'use strict'

const { callReporters } = require('./call')
const { isSilentTask, filterTaskData } = require('./level')

// Reporting for each task.
// We ensure reporting output has same order as tasks definition.
// We do so by buffering each task until its reporting time comes.
const complete = async function(
  task,
  {
    config,
    startData,
    startData: {
      report,
      report: { reporters, taskKeys, tasks, index },
    },
    _plugins: plugins,
  },
) {
  // Save current task's result (i.e. reporting input)
  // `startData.report.tasks|index` are stateful and directly mutated because
  // they need to be shared between parallel tasks
  tasks[task.key] = task

  // Only use keys not reported yet
  const keys = taskKeys.slice(index)

  // Retrieve how many tasks should now be unbuffered
  const count = getCount({ keys, tasks })

  // Update index to last reported task
  report.index += count

  // `reporter.tick()` is like `reporter.complete()` except it is not buffered.
  // I.e. meant for example to increment a progress bar or spinner. Doing this
  // in `reporter.complete()` would make progress bar be buffered, which would
  // make it look it's stalling.
  // However we do want to buffer `reporter.complete()`, as reporters like TAP
  // add indexes on each task, i.e. need to be run in output order.
  // `reporter.tick()` does not get task as input.
  await callReporters({ reporters, type: 'tick' }, {}, { config, startData, plugins })

  // Unbuffer tasks, i.e. report them
  await completeTasks({ count, keys, tasks, reporters, config, startData, plugins })
}

const getCount = function({ keys, tasks }) {
  const count = keys.findIndex(key => tasks[key] === undefined)

  if (count === -1) {
    return keys.length
  }

  return count
}

const completeTasks = async function({
  count,
  keys,
  tasks,
  reporters,
  config,
  startData,
  plugins,
}) {
  const keysA = keys.slice(0, count)
  await completeTask({ keys: keysA, tasks, reporters, config, startData, plugins })
}

const completeTask = async function({
  keys: [key, ...keys],
  tasks,
  reporters,
  config,
  startData,
  plugins,
}) {
  if (key === undefined) {
    return
  }

  const task = tasks[key]
  await callComplete({ task, reporters, config, startData, plugins })

  // Async iteration through recursion
  await completeTask({ keys, tasks, reporters, config, startData, plugins })
}

const callComplete = async function({
  task,
  task: { error: { nested } = {} },
  reporters,
  config,
  startData,
  plugins,
}) {
  const arg = getArg.bind(null, { task, plugins })
  const context = getContext.bind(null, { task, config, startData, plugins })

  await callReporters({ reporters, type: 'complete' }, arg, context)

  if (nested === undefined) {
    return
  }

  // Recurse over `task.error.nested`
  await callComplete({ task: { ...nested, isNested: true }, reporters, config, startData, plugins })
}

const getArg = function({ task, plugins }, { options }) {
  return filterTaskData({ task, options, plugins })
}

const getContext = function({ task, config, startData, plugins }, { options }) {
  const silent = isSilentTask({ task, options })

  return { config, startData, plugins, silent }
}

module.exports = {
  complete,
}
