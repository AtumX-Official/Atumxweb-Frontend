import * as Blockly from 'blockly/core';

// Function declaration block
const functionBlock = {
  type: 'function_declaration',
  message0: 'Function %1 \n %2',
  args0: [
    {
      type: 'field_input',
      name: 'function_name',
      text: 'myFunction'
    },
    {
      type: 'input_statement',
      name: 'function_body',
      check: null
    }
  ],
  previousStatement: null,
  nextStatement: null,
  colour: "#FF0CD2",
  tooltip: 'A function block that does not return a value.',
  helpUrl: ''
};

Blockly.Blocks['function_declaration'] = {
  init: function () {
    this.jsonInit(functionBlock);
  }
};

// Function call block
const functionCallBlock = {
  type: 'function_call',
  message0: 'Call function %1',
  args0: [
    {
      type: 'field_input',
      name: 'function_name',
      text: 'myFunction'
    }
  ],
  previousStatement: null,
  nextStatement: null,
  colour: "#FF0CD2",
  tooltip: 'Calls a function by name.',
  helpUrl: ''
};

Blockly.Blocks['function_call'] = {
  init: function () {
    this.jsonInit(functionCallBlock);
  }
};
