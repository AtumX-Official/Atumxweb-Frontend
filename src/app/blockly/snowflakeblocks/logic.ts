import * as Blockly from 'blockly/core';

// Input Value Block
Blockly.Blocks['input_value'] = {
  init: function() {
    this.setColour('#2EED08'); // Standard color for logic blocks
    this.appendDummyInput()
        .appendField('number')
        .appendField(new Blockly.FieldNumber(0), 'value');
    this.setOutput(true, 'Number');
    this.setTooltip('A number input field');
  }
};

//If Block
// Define a new block type called 'custom_if'
Blockly.Blocks['custom_if'] = {
  init: function() {
    this.appendValueInput("CONDITION")
        .setCheck("Boolean") // The input should accept a Boolean value
        .appendField("if");
    this.appendStatementInput("DO")
        .appendField("do");
    this.appendStatementInput("ELSE")
        .appendField("else");
    this.setColour("#F9087D"); // Set the desired color
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setTooltip('If the condition is true, execute the statements. Otherwise, execute the else statements.');
    this.setHelpUrl('https://developers.google.com/blockly/guides/create-custom-blocks/define-blocks');
  }
};

Blockly.Blocks['custom_logic_compare'] = {
  init: function() {
    this.appendValueInput("A") // First input
        .setCheck("Number")
    this.appendDummyInput() // Dropdown for comparison operators
        .appendField(new Blockly.FieldDropdown([
          ["=", "EQ"],
          ["≠", "NEQ"],
          [">", "GT"],     
           ["≥", "GTE"],
          ["<", "LT"],
          ["≤", "LTE"]
        ]), "OPERATOR");
        this.appendValueInput("B") // Second input
        .setCheck("Number")
    this.setOutput(true, "Boolean"); // Output type is Boolean
    this.setColour("#2EED08"); // Set the color of the block
    this.setTooltip('Compares two values.');
    this.setHelpUrl('https://developers.google.com/blockly/guides/create-custom-blocks/define-blocks');
  }
};

//Repeat block
Blockly.Blocks['custom_repeat'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("repeat");
    this.appendDummyInput()
        .appendField(new Blockly.FieldTextInput('10'), 'value')
        .appendField("times")
    this.appendStatementInput("DO")
        .appendField("do"); 
    this.setColour("#F9087D"); // Set the desired color
    this.setTooltip("Repeat the enclosed statements a given number of times."); 
    this.setHelpUrl("");
    this.setPreviousStatement(true, null); 
    this.setNextStatement(true, null); 
    this.setInputsInline(true); 
  }
};
