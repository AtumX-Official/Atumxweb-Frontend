import * as Blockly from 'blockly/core'
//IF-DO
const doIf = {
  type: 'if',
  message0: 'If %1 Do %2',
  args0: [
    {
      type: 'input_value',
      name: 'condition',
      check: null
    },
    {
      type: 'input_statement',
      name: 'do',
      check: null
    }
  ],
  nextStatement: null,
  previousStatement: null,
  colour: 210,
  tooltip: "Executes the 'Do' block if the condition is true."
}

Blockly.Blocks['if'] = {
  init: function () {
    this.jsonInit(doIf)
  }
}
//COMPARE
const customCompareBlock = {
  "type": "custom_compare",
  "message0": "%1 %2 %3",
  "args0": [
    {
      "type": "input_value",
      "name": "A"
    },
    {
      "type": "field_dropdown",
      "name": "OP",
      "options": [
        ["=", "EQ"],
        ["≠", "NEQ"],
        ["<", "LT"],
        [">", "GT"],
        ["≤", "LTE"],
        ["≥", "GTE"]
      ]
    },
    {
      "type": "input_value",
      "name": "B"
    }
  ],
  "inputsInline": true,
  "output": "Boolean",
  "colour": "#2EED08",
  "tooltip": "Compare two values using =, ≠, <, >, ≤, ≥",
  "helpUrl": ""
};

Blockly.Blocks['custom_compare'] = {
  init: function () {
    this.jsonInit(customCompareBlock);
  }
};

//LOGICAL OPERATOR
const logicalBlock = {
  "type": "logical_operator",
  "message0": "%1 %2 %3",
  "args0": [
    {
      "type": "input_value",
      "name": "A",
      "check": "Boolean"
    },
    {
      "type": "field_dropdown",
      "name": "OP",
      "options": [
        ["and", "AND"],
        ["or", "OR"]
      ]
    },
    {
      "type": "input_value",
      "name": "B",
      "check": "Boolean"
    }
  ],
  "inputsInline": true,
  "output": "Boolean",
  "colour": "#2EED08",
  "tooltip": "Logical AND / OR operation",
  "helpUrl": ""
};

Blockly.Blocks['logical_operator'] = {
  init: function () {
    this.jsonInit(logicalBlock);
  }
};
//
const customNotBlock = {
  "type": "custom_not",
  "message0": "not %1",
  "args0": [
    {
      "type": "input_value",
      "name": "BOOL",
      "check": "Boolean"
    }
  ],
  "output": "Boolean",
  "colour": 210,
  "tooltip": "Returns true if the input is false.",
  "helpUrl": ""
};

Blockly.Blocks['custom_not'] = {
  init: function () {
    this.jsonInit(customNotBlock);
  }
};
//BOOLEAN DROPDOWN
const booleanDropdownBlock = {
  "type": "custom_boolean",
  "message0": "%1",
  "args0": [
    {
      "type": "field_dropdown",
      "name": "BOOL",
      "options": [
        ["true", "TRUE"],
        ["false", "FALSE"]
      ]
    }
  ],
  "output": "Boolean",
  "colour": 210,
  "tooltip": "Boolean true or false value",
  "helpUrl": ""
};

Blockly.Blocks['custom_boolean'] = {
  init: function () {
    this.jsonInit(booleanDropdownBlock);
  }
};
//
const nullBlock = {
  "type": "custom_null",
  "message0": "null",
  "output": null,
  "colour": 210,
  "tooltip": "Null value",
  "helpUrl": ""
};

Blockly.Blocks['custom_null'] = {
  init: function () {
    this.jsonInit(nullBlock);
  }
};
//

