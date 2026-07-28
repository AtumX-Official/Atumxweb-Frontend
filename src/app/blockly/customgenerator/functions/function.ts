import * as Blockly from 'blockly/core';
import customGenerator from "..";

// Internal function registry
customGenerator.__functionRegistry = {};
const functionRegistry = customGenerator.__functionRegistry;

// Function Declaration Block Generator
customGenerator.forBlock['function_declaration'] = function (block: Blockly.Block) {
  const funcName = block.getFieldValue('function_name')?.trim();
  if (!funcName) return ''; // Skip invalid

  // Avoid overwriting repeatedly with incomplete blocks
  if (!functionRegistry[funcName]) {
    const funcBody = customGenerator.statementToCode(block, 'function_body');
    functionRegistry[funcName] = funcBody;
  }

  return ''; // Do not emit inline
};
// Function Call Block Generator (expanded inline)
customGenerator.forBlock['function_call'] = function (block: Blockly.Block) {
  const funcName = block.getFieldValue('function_name');
  const funcBody = customGenerator.__functionRegistry?.[funcName];

  // If the function exists, return the stored body (deep clone so edits won't mutate original)
  if (Array.isArray(funcBody)) {
    return funcBody.map(entry => JSON.parse(JSON.stringify(entry)));
  }

  // If function not found or empty, return nothing
  return [];
};
