import customPythonGenerator from '.'
import * as Blockly from 'blockly/core';

customPythonGenerator.forBlock['if'] = function (block: Blockly.Block) {
  const condition = this.valueToCode(block, 'condition', this.ORDER_NONE) || 'False'
  const doCode = this.statementToCode(block, 'do') || '    pass\n'
  const code = `if ${condition}:\n${doCode}`
  return this.scrub_(block, code)
}

customPythonGenerator.forBlock['custom_if_else'] = function (block: Blockly.Block) {
  const test = this.valueToCode(block, 'TEST', this.ORDER_CONDITIONAL) || 'False'
  const ifTrue = this.statementToCode(block, 'IF_TRUE') || 'None'
  const ifFalse = this.statementToCode(block, 'IF_FALSE') || 'None'

  // Return the expression with proper parentheses for safety
  const code = `if ${test}:
    ${ifTrue}\nelse:
    ${ifFalse}
  `
  return [code, this.ORDER_CONDITIONAL]
}

customPythonGenerator.forBlock['custom_compare'] = function (block: Blockly.Block) {
  const A = this.valueToCode(block, 'A', this.ORDER_ATOMIC) || 'None'
  const B = this.valueToCode(block, 'B', this.ORDER_ATOMIC) || 'None'
  const op = this.getOperatorSymbol(block.getFieldValue('OP'))
  return [`${A} ${op} ${B}`, this.ORDER_RELATIONAL]
}

customPythonGenerator.forBlock['logical_operator'] = function (block: Blockly.Block) {
  const A = this.valueToCode(block, 'A', this.ORDER_LOGICAL_AND) || 'False'
  const B = this.valueToCode(block, 'B', this.ORDER_LOGICAL_AND) || 'False'
  const op = this.getOperatorSymbol(block.getFieldValue('OP'))
  return [`${A} ${op} ${B}`, this.ORDER_LOGICAL_AND]
}

customPythonGenerator.forBlock['custom_not'] = function (block: Blockly.Block) {
  const val = this.valueToCode(block, 'BOOL', this.ORDER_LOGICAL_NOT) || 'False'
  return [`not ${val}`, this.ORDER_LOGICAL_NOT]
}

customPythonGenerator.forBlock['custom_boolean'] = function (block: Blockly.Block) {
  return [block.getFieldValue('BOOL') === 'TRUE' ? 'True' : 'False', this.ORDER_ATOMIC]
}

customPythonGenerator.forBlock['custom_null'] = function () {
  return ['None', customPythonGenerator.ORDER_ATOMIC]
}

export default customPythonGenerator
