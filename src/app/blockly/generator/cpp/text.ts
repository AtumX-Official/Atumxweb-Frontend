import { cppGenerator } from './index';

cppGenerator.forBlock['custom_text'] = function (block) {
  const text = block.getFieldValue('TEXT') || '';
  return [`cout << "${text}";`, cppGenerator.ORDER_ATOMIC];
};
