import * as Blockly from 'blockly/core';
import { singleDigitValidator } from '../inputvalidator';

Blockly.Blocks['serial_print'] = {
    init: function() {
      this.setColour("#8726F6");
      this.appendValueInput("CONTENT", 'Number')
          .appendField("Serial Print");
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setTooltip('Prints data to the console/serial port as human-readable ASCII text.');
    }
  };

  Blockly.Blocks['display_number'] = {
    init: function() {
      this.setColour("#8726F6");
  
      this.appendValueInput("CONTENT")
          .setCheck("Number")   
          .appendField("Display number on matrix");
  
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
  
      this.setTooltip('Display a single digit (0-9) on matrix.');
    }
  };
  Blockly.Blocks['single_digit'] = {
    init: function () {
      this.appendDummyInput()
         .appendField(new Blockly.FieldNumber(0,0,9),"Value");
  
      this.setOutput(true, "Number");   // still number output
      this.setColour("#5C81A6");
      this.setTooltip("Single digit (0-9)");
    }
  };