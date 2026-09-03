import * as Blockly from 'blockly/core';
import { integervalidatior,integerOnlyValidator,forloopvalidator } from '../inputvalidator';


// Input Value Block
Blockly.Blocks['input_value'] = {
  init: function() {
    this.setColour('#2FADE7'); // Standard color for logic blocks
    this.appendDummyInput()
        .appendField('number')
        .appendField(new Blockly.FieldTextInput('0', integerOnlyValidator),'value')    
    this.setOutput(true, 'Number');
    this.setTooltip('A number input field');
  }
};

//If Block
// Define a new block type called 'custom_if'

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
  "colour": "#FF0CD2",
  "tooltip": "Compare two values using =, ≠, <, >, ≤, ≥",
  "helpUrl": ""
};

Blockly.Blocks['custom_compare'] = {
  init: function () {
    this.jsonInit(customCompareBlock);
  }
};


Blockly.Blocks['logical_if'] = {
  init: function () {
    this.appendValueInput('LEFT')
        .setCheck(['Boolean', 'Number']);  // Accept both Boolean and Number inputs
    this.appendDummyInput()
        .appendField(new Blockly.FieldDropdown([
            ['AND', 'AND'],
            ['OR', 'OR'],
        ]), 'LOGIC_OP');  // Dropdown with logic operators

    this.appendValueInput('RIGHT')
        .setCheck(['Boolean', 'Number'])  // Accept both Boolean and Number inputs
    this.setColour('#FF0CD2');
    this.setOutput(true, ['Boolean', 'Number']);  // Output both Boolean and Number values
    this.setTooltip('Performs logical operations and supports boolean and numeric inputs.');
  }
};

Blockly.Blocks['custom_repeat_ext'] = {
  init: function() {
    this.setColour("#1ECE21"); // Set the desired color

    this.appendDummyInput()
        .appendField("repeat");

    // Value input for number of repetitions
    this.appendValueInput('TIMES')
        .setCheck('Number')
        .appendField("TIMES"); // Label next to input

    this.appendStatementInput("DO")
        .appendField("do");

    this.setTooltip("Repeat the enclosed statements a given number of times."); 
    this.setHelpUrl("");
    this.setPreviousStatement(true, null); 
    this.setNextStatement(true, null); 
    this.setInputsInline(true);
    this.setOnChange(function ( this: Blockly.Block) {
      integervalidatior(this, 'TIMES');
          });
  }
};
Blockly.Blocks['custom_if_else'] = {
  init: function () {
    this.appendValueInput('COND')
      .setCheck(null)
      .appendField('if');

    this.appendStatementInput('DO')
      .setCheck(null)
      .appendField('do');

    this.appendStatementInput('ELSE')
      .setCheck(null)
      .appendField('else');

    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour("#FF0CD2");
    this.setTooltip('Custom if block with condition, do, and else');
    this.setHelpUrl('');
  }
};

Blockly.Blocks['custom_if'] = {
  init: function() {
    this.appendValueInput('IF0')
        .setCheck('Boolean')
        .appendField('if');
    this.appendStatementInput('DO0')
        .appendField('do');
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour('#FF0CD2');
    this.setTooltip('Custom If Block');
    this.setHelpUrl('');
    this.elseifCount_ = 0;  // Keep track of linked else ifs
    this.elseCount_ = 0;    // Keep track if else is attached
  }
};

Blockly.Blocks['custom_elseif'] = {
  init: function() {
    this.appendValueInput('IF')
        .setCheck('Boolean')
        .appendField('else if');
    this.appendStatementInput('DO')
        .appendField('do');
    this.setPreviousStatement(true, null);  // can attach to if or previous else if
    this.setNextStatement(true, null);      // can attach else if / else
    this.setColour('#FF0CD2');
    this.setTooltip('Custom Else If Block');
  }
};


Blockly.Blocks['custom_else'] = {
  init: function () {
    this.appendStatementInput('DO')
        .appendField('else');
    this.setPreviousStatement(true, null); // can attach to if or else if
    this.setNextStatement(true, null);     // allow chaining for generator traversal
    this.setColour('#FF0CD2');
    this.setTooltip('Custom Else Block');
  }
};

Blockly.Blocks['forloop'] = {
  init: function() {
    this.setColour("#1ECE21"); // Set the desired color
    this.appendDummyInput()
        .appendField("for");
    this.appendValueInput('condition')
        .setCheck('Number')
        this.appendDummyInput()
        .appendField("from")
        .appendField(new Blockly.FieldTextInput('0', forloopvalidator),'FROM')    
    this.appendDummyInput()
        .appendField("to")
        .appendField(new Blockly.FieldTextInput('0', forloopvalidator),'TO')    
    this.appendDummyInput()
        .appendField("by")
        .appendField(new Blockly.FieldTextInput('0', forloopvalidator),'BY')    
    this.appendStatementInput("DO")
        .appendField("do");
    this.setTooltip("Repeat the enclosed statements a given number of times."); 
    this.setPreviousStatement(true, null); 
    this.setNextStatement(true, null); 
    this.setInputsInline(true);
  }
};
Blockly.Blocks['break'] = {
  init: function() {
    this.setColour("#1ECE21");
    this.appendDummyInput()
        .appendField('break')
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);        
    this.setTooltip("Immediately exits the nearest loop.");
  }
}      
 Blockly.Blocks['continue'] = {
    init: function() {
      this.setColour("#1ECE21");
      this.appendDummyInput()
          .appendField('continue')
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);        
      this.setTooltip("Skips the remaining statements in the loop and continues to the next iteration.");
    }
  }      

  Blockly.Blocks['while'] = {
    init: function() {
      this.appendValueInput('cond')
          .setCheck('Boolean')
          .appendField('while');
      this.appendStatementInput('DO0')
          .setCheck(null)
          .appendField('do');
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour('#1ECE21');
      this.setTooltip('while block');
      this.setHelpUrl('');
      this.elseifCount_ = 0;  // Keep track of linked else ifs
      this.elseCount_ = 0;    // Keep track if else is attached
    }
  };

  Blockly.Blocks['custom_not'] = {
    init: function() {
      this.appendValueInput("BOOL")
          .setCheck("Boolean") 
          .appendField("not"); 
      this.setOutput(true, "Boolean"); 
      this.setColour('#FF0CD2');
      this.setTooltip('Returns true if the input is false, and false if the input is true (logical NOT operation).');
      this.setHelpUrl('https://developers.google.com/blockly/guides/create-custom-blocks/define-blocks');
    }
  };