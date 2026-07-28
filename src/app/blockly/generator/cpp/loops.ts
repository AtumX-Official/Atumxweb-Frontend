import { cppGenerator } from './index';

// Repeat block (for loop with fixed count)
cppGenerator.forBlock['repeat'] = function (block) {
  const times = block.getFieldValue('TIMES') || '0';
  const branch = this.statementToCode(block, 'DO');
  const loopVar = 'i'; // You can use a unique ID if needed
  const code = `for (int ${loopVar} = 0; ${loopVar} < ${times}; ${loopVar}++) {
${branch}}
`;
  return this.scrub_(block, code);
};

// Repeat While / Until
cppGenerator.forBlock['repeat_while'] = function (block) {
  const type = block.getFieldValue('TYPE');
  let condition = this.valueToCode(block, 'CONDITION', this.ORDER_NONE) || 'false';
  const branch = this.statementToCode(block, 'DO');

  if (type === 'UNTIL') {
    condition = `!(${condition})`;
  }

  const code = `while (${condition}) {
${branch}}
`;
  return this.scrub_(block, code);
};

// For Loop with start, end, step
cppGenerator.forBlock['for_loop'] = function (block) {
  const variable = block.getField('VAR').getText();
  const from = block.getFieldValue('FROM') || '0';
  const to = block.getFieldValue('TO') || '0';
  const by = block.getFieldValue('BY') || '1';
  const branch = this.statementToCode(block, 'DO');

  const increment = ` += ${by}`;
  const code = `for (int ${variable} = ${from}; ${variable} <= ${to}; ${variable}${increment}) {
${branch}}
`;
  return this.scrub_(block, code);
};

// For Each (assuming C++ vector or array)
cppGenerator.forBlock['for_each'] = function (block) {
  const variable = block.getField('VAR').getText();
  const list = this.valueToCode(block, 'LIST', this.ORDER_NONE) || 'list';
  const branch = this.statementToCode(block, 'DO');
  const code = `for (auto ${variable} : ${list}) {
${branch}}
`;
  return this.scrub_(block, code);
};

// Break / Continue
cppGenerator.forBlock['break_continue'] = function (block) {
  const action = block.getFieldValue('ACTION');
  const code = action.toLowerCase() + ';';

  return code;
};
