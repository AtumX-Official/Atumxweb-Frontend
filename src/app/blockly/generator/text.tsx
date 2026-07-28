import * as Blockly from 'blockly/core'

// Text block for Blockly
const textBlock = {
  type: 'custom_text',
  message0: 'print("%1");',
  args0: [
    {
      type: 'field_input',
      name: 'TEXT',
      text: '',
      check: 'String'
    }
  ],
  colour: '#FFAB19',
  tooltip: 'A block that outputs text.',
  helpUrl: '',
  previousStatement:null,
  nextStatement:null
}

Blockly.Blocks['custom_text'] = {
  init: function () {
    this.jsonInit(textBlock)
  }
}
