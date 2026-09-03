import customPythonGenerator from '.'

customPythonGenerator.forBlock['if'] = function (block) {
  const condition = this.valueToCode(block, 'condition', this.ORDER_NONE) || 'False'
  const doCode = this.statementToCode(block, 'do') || '    pass\n'
  const code = `if ${condition}:\n${doCode}`
  return this.scrub_(block, code)
}

customPythonGenerator.forBlock['logical_if'] = function (block) {
  const left = this.valueToCode(block, 'LEFT', this.ORDER_LOGICAL_AND) || 'False'
  const right = this.valueToCode(block, 'RIGHT', this.ORDER_LOGICAL_AND) || 'False'
  const op = block.getFieldValue('LOGIC_OP') === 'AND' ? 'and' : 'or'
  return [`${left} ${op} ${right}`, this.ORDER_LOGICAL_AND]
}

customPythonGenerator.forBlock['custom_if_else'] = function (block) {
  const condition = this.valueToCode(block, 'COND', this.ORDER_CONDITIONAL) || 'False'
  const doCode = this.statementToCode(block, 'DO') || '    pass\n'
  const elseCode = this.statementToCode(block, 'ELSE') || '    pass\n'

  return `if ${condition}:\n${doCode}else:\n${elseCode}`
}

customPythonGenerator.forBlock['custom_compare'] = function (block) {
  const A = this.valueToCode(block, 'A', this.ORDER_ATOMIC) || 'None'
  const B = this.valueToCode(block, 'B', this.ORDER_ATOMIC) || 'None'
  const op = this.getOperatorSymbol(block.getFieldValue('OP'))
  return [`${A} ${op} ${B}`, this.ORDER_RELATIONAL]
}

customPythonGenerator.forBlock['logical_operator'] = function (block) {
  const A = this.valueToCode(block, 'A', this.ORDER_LOGICAL_AND) || 'False'
  const B = this.valueToCode(block, 'B', this.ORDER_LOGICAL_AND) || 'False'
  const op = this.getOperatorSymbol(block.getFieldValue('OP'))
  return [`${A} ${op} ${B}`, this.ORDER_LOGICAL_AND]
}

customPythonGenerator.forBlock['custom_not'] = function (block) {
  const val = this.valueToCode(block, 'BOOL', this.ORDER_LOGICAL_NOT) || 'False'
  return [`not ${val}`, this.ORDER_LOGICAL_NOT]
}

customPythonGenerator.forBlock['custom_boolean'] = function (block) {
  return [block.getFieldValue('BOOL') === 'TRUE' ? 'True' : 'False', this.ORDER_ATOMIC]
}

customPythonGenerator.forBlock['custom_null'] = function () {
  return ['None', customPythonGenerator.ORDER_ATOMIC]
}

export default customPythonGenerator
