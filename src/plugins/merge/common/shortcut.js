'use strict'

// `task.parameters|validate.*: non-object` is shortcut for `{ enum: [value] }`
const mergeShortcutSchema = function({ specSchema, taskSchema }) {
  const type = getSchemaType({ taskSchema })
  const schema = { ...specSchema, type, enum: [taskSchema] }
  return schema
}

// When using the shortcut notation, we need to set the `type` to make sure it
// matches the value (in case it is not set, or set to several types, or set to
// a different type)
const getSchemaType = function({ taskSchema }) {
  const [type] = TYPES.find(([, condition]) => condition(taskSchema))
  return type
}

const TYPES = Object.entries({
  null: value => value === null,
  integer: Number.isInteger,
  number: value => typeof value === 'number' && !Number.isInteger(value),
  string: value => typeof value === 'string',
  boolean: value => typeof value === 'boolean',
  array: Array.isArray,
})

module.exports = {
  mergeShortcutSchema,
}