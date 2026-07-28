import * as Blockly from 'blockly/core';
import '@blockly/field-bitmap';

  Blockly.Blocks['Hello'] = {
      init: function() {
        this.setColour("#2926DC");
        this.appendDummyInput()
            .appendField('Hello')
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
      }
    };

    Blockly.Blocks['Pushup'] = {
        init: function() {
          this.setColour("#2926DC");
          this.appendDummyInput()
              .appendField('Push up')
          this.setPreviousStatement(true, null);
          this.setNextStatement(true, null);
        }
      };   

      Blockly.Blocks['Wiggle'] = {
        init: function() {
          this.setColour("#2926DC");
          this.appendDummyInput()
              .appendField('Wiggle')
          this.setPreviousStatement(true, null);
          this.setNextStatement(true, null);
        }
      };  

      Blockly.Blocks['Bow'] = {
        init: function() {
          this.setColour("#2926DC");
          this.appendDummyInput()
              .appendField('Bow')
          this.setPreviousStatement(true, null);
          this.setNextStatement(true, null);
        }
      };  

      Blockly.Blocks['Jump'] = {
        init: function() {
          this.setColour("#2926DC");
          this.appendDummyInput()
              .appendField('Jump')
          this.setPreviousStatement(true, null);
          this.setNextStatement(true, null);
        }
      };  