import customPythonGenerator from '.'
import * as Blockly from 'blockly/core';

// Example: text block or string literal
customPythonGenerator.forBlock['custom_text'] = function (block: Blockly.Block) {
  const text = block.getFieldValue('TEXT') || ''
  return [`print(${JSON.stringify(text)})\n`, customPythonGenerator.ORDER_ATOMIC]
}
