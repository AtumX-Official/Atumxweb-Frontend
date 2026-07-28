import * as Blockly from 'blockly/core'

//Repeat for
const doRepeat = {
  type: 'repeat',
  message0: 'Repeat %1 times\n do %2',
  args0: [
    {
      type: 'field_number',
      name: 'TIMES',
      min: 0
    },
    {
      type: 'input_statement',
      name: 'DO',
      check: null
    }
  ],
  inputsInline: true,
  previousStatement: null,
  nextStatement: null,
  colour: '#F9A826',
  tooltip: "Repeats the 'Do' block a specified number of times.",
  helpUrl: ''
}

Blockly.Blocks['repeat'] = {
  init: function () {
    this.jsonInit(doRepeat)
  }
}

//Repeat While and Repeat Until
const doRepeatWhile = {
  type: 'repeat_while',
  message0: 'Repeat %1 %2\n do %3',
  args0: [
    {
      type: 'field_dropdown',
      name: 'TYPE',
      options: [
        ['while', 'WHILE'],
        ['until', 'UNTIL']
      ]
    },
    {
      type: 'input_value',
      name: 'CONDITION',
      check: 'Boolean'
    },
    {
      type: 'input_statement',
      name: 'DO',
      check: null
    }
  ],
  previousStatement: null,
  nextStatement: null,
  colour: '#F9A826',
  tooltip: "Repeats the 'Do' block while the condition is true.",
  helpUrl: ''
}

Blockly.Blocks['repeat_while'] = {
  init: function () {
    this.jsonInit(doRepeatWhile)
  }
}

//For Loop
const doForLoop = {
  type: 'for_loop',
  message0: 'count with %1 from %2 to %3 by %4\n do %5',
  args0: [
    {
      type: 'field_variable',
      name: 'VAR',
      variable: 'i'
    },
    {
      type: 'field_number',
      name: 'FROM',
      value: 0,
      min: 0
    },
    {
      type: 'field_number',
      name: 'TO',
      value: 10,
      min: 0
    },
    {
      type: 'field_number',
      name: 'BY',
      value: 1,
      min: 1
    },
    {
      type: 'input_statement',
      name: 'DO',
      check: null
    }
  ],
  previousStatement: null,
  nextStatement: null,
  colour: '#F9A826',
  tooltip: "Repeats the 'Do' block for each value of the variable from start to end.",
  helpUrl: ''
}

Blockly.Blocks['for_loop'] = {
  init: function () {
    this.jsonInit(doForLoop)
  }
}

//For each
const doForEach = {
  type: 'for_each',
  message0: 'for each %1 in list %2 do %3',
  args0: [
    {
      type: 'field_variable',
      name: 'VAR',
      variable: 'item'
    },
    {
      type: 'input_value',
      name: 'LIST',
      check: 'Array'
    },
    {
      type: 'input_statement',
      name: 'DO',
      check: null
    }
  ],
  previousStatement: null,
  nextStatement: null,
  colour: '#F9A826',
  tooltip: "Repeats the 'Do' block for each item in the list.",
  helpUrl: ''
}

Blockly.Blocks['for_each'] = {
  init: function () {
    this.jsonInit(doForEach)
  }
}

//Break / Continue
const doBreakContinue = {
  type: 'break_continue',
  message0: '%1 of the loop %2',
  args0: [
    {
      type: 'field_dropdown',
      name: 'ACTION',
      options: [
        ['break', 'BREAK'],
        ['continue', 'CONTINUE']
      ]
    },
    {
      type: 'input_dummy'
    }
  ],
  previousStatement: null,
  nextStatement: null,
  colour: '#F9A845',
  tooltip: 'Breaks or continues the current loop.',
  helpUrl: ''
}

Blockly.Blocks['break_continue'] = {
  init: function () {
    this.jsonInit(doBreakContinue)
  }
}