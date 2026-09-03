import customPythonGenerator from '.'
import * as Blockly from 'blockly/core';

customPythonGenerator.forBlock['repeat'] = function (block: Blockly.Block) {
  const times = block.getFieldValue('TIMES') || 0
  const doCode = customPythonGenerator.statementToCode(block, 'DO') || '    pass\n'
  return `for _ in range(${times}):\n${doCode}`
}

customPythonGenerator.forBlock['repeat_while'] = function (block: Blockly.Block) {
  const type = block.getFieldValue('TYPE')
  let condition = customPythonGenerator.valueToCode(block, 'CONDITION', customPythonGenerator.ORDER_NONE) || 'False'
  if (type === 'UNTIL') condition = `not (${condition})`
  const doCode = customPythonGenerator.statementToCode(block, 'DO') || '    pass\n'
  return `while ${condition}:\n${doCode}`
}

customPythonGenerator.forBlock['for_loop'] = function (block: Blockly.Block) {
  const variable = block.getField('VAR')?.getVariable().name
  const from = block.getFieldValue('FROM') || 0
  const to = block.getFieldValue('TO') || 0
  const by = block.getFieldValue('BY') || 1
  const doCode = customPythonGenerator.statementToCode(block, 'DO') || '    pass\n'
  const rangeEnd = parseInt(to) + (parseInt(by) > 0 ? 1 : -1)
  return `for ${variable} in range(${from}, ${rangeEnd}, ${by}):\n${doCode}`
}

customPythonGenerator.forBlock['for_each'] = function (block: Blockly.Block) {
  const variable = block.getField('VAR')?.getVariable().name
  const list = customPythonGenerator.valueToCode(block, 'LIST', customPythonGenerator.ORDER_NONE) || '[]'
  const doCode = customPythonGenerator.statementToCode(block, 'DO') || '    pass\n'
  return `for ${variable} in ${list}:\n${doCode}`
}

customPythonGenerator.forBlock['break_continue'] = function (block: Blockly.Block) {
  const action = block.getFieldValue('ACTION')
  return `${action.toLowerCase()}\n`
}