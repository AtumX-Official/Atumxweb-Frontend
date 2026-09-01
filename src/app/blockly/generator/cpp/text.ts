import { cppGenerator } from './index';
import * as Blockly from 'blockly/core';

cppGenerator.forBlock['custom_text'] = function (block : Blockly.Block) {
  const text = block.getFieldValue('TEXT') || '';
  return [`cout << "${text}";`, cppGenerator.ORDER_ATOMIC];
};
