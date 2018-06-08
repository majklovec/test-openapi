'use strict'

// Fire each `plugin.returnValue()` if available to transform `task` return
// value for each plugin
const getTaskReturn = function({ task, task: { key }, originalTask, plugins }) {
  const taskReturns = plugins.map(plugin => getReturnObj({ task, originalTask, plugin }))

  return Object.assign({ key }, ...taskReturns)
}

const getReturnObj = function({ task, originalTask, plugin: { returnValue, name } }) {
  if (typeof returnValue === 'function') {
    const taskReturn = returnValue(task[name], originalTask[name])
    return { [name]: taskReturn }
  }

  // `plugin.returnValue: false` means no task return
  if (returnValue === false) {
    return
  }

  // `plugin.returnValue: true` means return task.PLUGIN.*
  if (returnValue === true && task[name] !== undefined) {
    return { [name]: task[name] }
  }

  // defaults to return originalTask.PLUGIN.*
  if (originalTask[name] !== undefined) {
    return { [name]: originalTask[name] }
  }
}

module.exports = {
  getTaskReturn,
}
