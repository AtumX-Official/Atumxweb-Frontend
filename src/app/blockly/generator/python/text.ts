import customPythonGenerator from '.'

// Example: text block or string literal
customPythonGenerator.forBlock['custom_text'] = function (block) {
  const text = block.getFieldValue('TEXT') || ''
  return [`print(${JSON.stringify(text)})\n`, customPythonGenerator.ORDER_ATOMIC]
}
