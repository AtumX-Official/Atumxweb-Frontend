import * as Blockly from 'blockly/core';
import '@blockly/field-bitmap';

  Blockly.Blocks['move_gripper'] = {
    init: function() {
      this.setColour("#19BCCF");
      this.appendDummyInput()
          .appendField("Gripper open ")          
          .appendField(new Blockly.FieldNumber(), 'l')
          .appendField("cm")
          this.setPreviousStatement(true, null);
          this.setNextStatement(true, null);
          this.setTooltip('Change the color of all the Leds');
    }
  };

    Blockly.Blocks['move_arm'] = {
      init: function() {
        this.setColour("#19BCCF");
        this.appendDummyInput()
            .appendField('Move Arm to x')
            .appendField(new Blockly.FieldTextInput('10'), 'X')
            .appendField('y')
            .appendField(new Blockly.FieldTextInput('10'), 'Y')
            .appendField('z')
            .appendField(new Blockly.FieldTextInput('10'), 'Z')
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setTooltip('Move the gripper to the specified coordinates');
      }
    };