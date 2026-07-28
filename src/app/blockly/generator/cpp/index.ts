import * as Blockly from 'blockly/core';

// ------------------------------
// Generator Definition
// ------------------------------

export const cppGenerator = new Blockly.Generator('CPP');
cppGenerator.forBlock = {};

// Precedence constants
cppGenerator.ORDER_ATOMIC = 0;
cppGenerator.ORDER_MEMBER = 1;
cppGenerator.ORDER_FUNCTION_CALL = 2;
cppGenerator.ORDER_EXPONENTIATION = 3;
cppGenerator.ORDER_UNARY_SIGN = 4;
cppGenerator.ORDER_MULTIPLICATIVE = 5;
cppGenerator.ORDER_ADDITIVE = 6;
cppGenerator.ORDER_RELATIONAL = 7;
cppGenerator.ORDER_LOGICAL_NOT = 8;
cppGenerator.ORDER_LOGICAL_AND = 9;
cppGenerator.ORDER_LOGICAL_OR = 10;
cppGenerator.ORDER_CONDITIONAL = 11;
cppGenerator.ORDER_NONE = 99;

// Convert block to code
cppGenerator.blockToCode = function (block) {
  if (!block) return '';
  const fn = this.forBlock?.[block.type];
  if (typeof fn !== 'function') {
    console.warn(`CPP generator does not know how to generate code for block type "${block.type}"`);
    return '';
  }
  return fn.call(this, block);
};

// Handle statement inputs
cppGenerator.statementToCode = function (block, name) {
  const target = block?.getInputTargetBlock(name);
  if (!target) return '';
  const code = this.blockToCode(target);
  const line = Array.isArray(code) ? code[0] : code;
  return Blockly.Generator.prototype.prefixLines.call(this, line, '  ');
};

// Handle value inputs (conditions)
cppGenerator.valueToCode = function (block, name, outerOrder) {
  const targetBlock = block?.getInputTargetBlock(name);
  if (!targetBlock) return '';
  let code = this.blockToCode(targetBlock);
  if (!code) return '';
  if (Array.isArray(code)) {
    const [expression, innerOrder] = code;
    if (outerOrder && innerOrder && outerOrder > innerOrder) {
      return `(${expression})`;
    }
    return expression;
  }
  return code;
};

// Append next connected blocks
cppGenerator.scrub_ = function (block, code) {
  const nextBlock = block.getNextBlock();
  const nextCode = nextBlock ? this.blockToCode(nextBlock) : '';
  return code + (Array.isArray(nextCode) ? nextCode[0] : nextCode);
};

// Main workspace to code logic
cppGenerator.workspaceToCode = function (workspace) {
  const topBlocks = workspace.getTopBlocks(true);

  const setupLoopBlock = topBlocks.find(block => block.type === 'setup_loop');

  if (setupLoopBlock) {
    const code = this.blockToCode(setupLoopBlock);
    return Array.isArray(code) ? code[0] : code;
  }

  const setupCode = topBlocks
    .map(block => this.blockToCode(block))
    .map(code => (Array.isArray(code) ? code[0] : code))
    .join('\n');

  return `void setup() {\n${setupCode}\n}\n\nvoid loop() {\n  \n}`;
};

// ------------------------------
// Block: setup_loop
// ------------------------------

const setupLoopBlockDef = {
  type: 'setup_loop',
  message0: 'setup %1 loop %2',
  args0: [
    {
      type: 'input_statement',
      name: 'SETUP',
    },
    {
      type: 'input_statement',
      name: 'LOOP',
    }
  ],
  colour: 230,
  tooltip: 'Main program structure with setup and loop.',
  helpUrl: '',
  // ❌ Do NOT allow this block to be inside another
  // Don't add previousStatement or nextStatement
};

Blockly.Blocks['setup_loop'] = {
  init: function () {
    this.jsonInit(setupLoopBlockDef);
  }
};

cppGenerator.forBlock['setup_loop'] = function (block) {
  const setupCode = this.statementToCode(block, 'SETUP');
  const loopCode = this.statementToCode(block, 'LOOP');
  const trailingCode = this.scrub_(block, '');

  const code = `void setup() {\n${setupCode}}\n\nvoid loop() {\n${loopCode}${trailingCode}}\n`;
  return [code, this.ORDER_NONE];
};
