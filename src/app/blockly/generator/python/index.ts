import * as Blockly from 'blockly/core'

const customPythonGenerator : any = new Blockly.Generator('PYTHON')
customPythonGenerator.forBlock = {}

customPythonGenerator.ORDER_ATOMIC = 0
customPythonGenerator.ORDER_MEMBER = 1
customPythonGenerator.ORDER_FUNCTION_CALL = 2
customPythonGenerator.ORDER_EXPONENTIATION = 3
customPythonGenerator.ORDER_UNARY_SIGN = 4
customPythonGenerator.ORDER_MULTIPLICATIVE = 5
customPythonGenerator.ORDER_ADDITIVE = 6
customPythonGenerator.ORDER_RELATIONAL = 7
customPythonGenerator.ORDER_LOGICAL_NOT = 8
customPythonGenerator.ORDER_LOGICAL_AND = 9
customPythonGenerator.ORDER_LOGICAL_OR = 10
customPythonGenerator.ORDER_CONDITIONAL = 11
customPythonGenerator.ORDER_NONE = 99

customPythonGenerator.addIndentation = function (code : string) {
  return code
    .split('\n')
    .map(line => (line ? `    ${line}` : line))
    .join('\n')
}

customPythonGenerator.scrub_ = function (block : Blockly.Block, code : string) {
  const nextBlock = block.getNextBlock()
  const nextCode = nextBlock ? this.blockToCode(nextBlock) : ''
  return code + (Array.isArray(nextCode) ? nextCode[0] : nextCode)
}

customPythonGenerator.workspaceToCode = function (workspace: Blockly.Workspace ) {
  return workspace
    .getTopBlocks(true)
    .map((block: Blockly.Block) => {
      const code = this.blockToCode(block)
      return Array.isArray(code) ? code[0] : code
    })
    .join('\n')
}

customPythonGenerator.blockToCode = function (block: Blockly.Block | null) {
  if (!block) return ''
  const fn = this.forBlock?.[block.type]
  if (typeof fn !== 'function') {
    console.warn(`Missing generator for block type: ${block.type}`)
    return `# TODO: implement block '${block.type}'\n`
  }
  return fn.call(this, block)
}

customPythonGenerator.statementToCode = function (block: Blockly.Block | null, name: string) {
  const target = block?.getInputTargetBlock(name)
  if (!target) return ''
  const code = this.blockToCode(target)
  return this.addIndentation(Array.isArray(code) ? code[0] : code)
}

customPythonGenerator.valueToCode = function (block: Blockly.Block | null, name: string, order: number) {
  if (!block) return ''
  return Blockly.Generator.prototype.valueToCode.call(this, block, name, order)
}

customPythonGenerator.getOperatorSymbol = function (op : string) {
  const map : Record <string, string> = {
    EQ: '==',
    NEQ: '!=',
    LT: '<',
    GT: '>',
    LTE: '<=',
    GTE: '>=',
    AND: 'and',
    OR: 'or'
  }
  return map[op] || op
}

export default customPythonGenerator
