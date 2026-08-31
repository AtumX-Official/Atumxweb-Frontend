import { cppGenerator } from './index';

cppGenerator.forBlock['if'] = function (block) {
  const condition =
    cppGenerator.valueToCode(block, 'condition', cppGenerator.ORDER_NONE) || 'false';

  const statements_do =
    cppGenerator.statementToCode(block, 'do');

  const code = `if (${condition}) {\n${statements_do}}\n`;

  return cppGenerator.scrub_(block, code);
};

// Custom Compare block (==, !=, <, >, <=, >=)
cppGenerator.forBlock['custom_compare'] = function (block) {
  const operator = block.getFieldValue('OP');
  const left = cppGenerator.valueToCode(block, 'A', cppGenerator.ORDER_NONE) || '0';
  const right = cppGenerator.valueToCode(block, 'B', cppGenerator.ORDER_NONE) || '0';
  return `${left} ${operator} ${right}`;
};

// Logical AND / OR block
cppGenerator.forBlock['logical_operator'] = function (block) {
  const operator = block.getFieldValue('OP') === 'AND' ? '&&' : '||';
  const left = cppGenerator.valueToCode(block, 'A', cppGenerator.ORDER_NONE) || 'false';
  const right = cppGenerator.valueToCode(block, 'B', cppGenerator.ORDER_NONE) || 'false';
  return `${left} ${operator} ${right}`;
};

// NOT block
cppGenerator.forBlock['custom_not'] = function (block) {
  const value = cppGenerator.valueToCode(block, 'BOOL', cppGenerator.ORDER_NONE) || 'false';
  return `!(${value})`;
};

// True / False block
cppGenerator.forBlock['custom_boolean'] = function (block) {
  const value = block.getFieldValue('BOOL');
  return value === 'TRUE' ? 'true' : 'false';
};

// Null block
cppGenerator.forBlock['custom_null'] = function () {
  return 'nullptr';
};

// Ternary if-else block
cppGenerator.forBlock['custom_if_else'] = function (block) {
  const test = cppGenerator.valueToCode(block, 'TEST', cppGenerator.ORDER_NONE) || 'false';
  const ifTrue = cppGenerator.valueToCode(block, 'IF_TRUE', cppGenerator.ORDER_NONE) || '0';
  const ifFalse = cppGenerator.valueToCode(block, 'IF_FALSE', cppGenerator.ORDER_NONE) || '0';
  return `(${test}) ? (${ifTrue}) : (${ifFalse})`;
};
