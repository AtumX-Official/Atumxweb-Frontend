import * as Blockly from 'blockly/core';
import { integervalidatior } from '../inputvalidator';
// Digital Read Block
Blockly.Blocks['stemrobodigital_read'] = {
    init: function() {
      this.setColour("#B515D9");
      this.appendDummyInput()
          .appendField('Digital Read Pin')
          .appendField(new Blockly.FieldDropdown([
            ["IO1", '4'],
            ["IO2", '5'],
            ["IO3", '6'],
            ["IO4", '7'],
            ["IO5", '15'],
            ["IO6", '16'],
            ["IO7", '21'],
            ["IO8", '47'],
            ["IO9", '48'],
            ["IO10",'38'],
            ["IO11", '2'],
            ["IO12", '1']
          ]), 'value');
      this.setOutput(true, 'Number');
      this.setTooltip('Read a digital value from a pin');
    }
  };

// Digital Write Block
Blockly.Blocks['stemrobodigital_write'] = {
    init: function() {
      this.setColour("#B515D9");
      this.appendDummyInput()
          .appendField('Digital Write Pin')
          .appendField(new Blockly.FieldDropdown([
            ["IO1", '4'],
            ["IO2", '5'],
            ["IO3", '6'],
            ["IO4", '7'],
            ["IO5", '15'],
            ["IO6", '16'],
            ["IO7", '21'],
            ["IO8", '47'],
            ["IO9", '48'],
            ["IO10",'38'],
            ["IO11", '2'],
            ["IO12", '1']
          ]), 'pin')
          .appendField('value')
          .appendField(new Blockly.FieldDropdown([
            ['HIGH', 'HIGH'],
            ['LOW', 'LOW']
          ]), 'value');
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setTooltip('Write a digital value to a pin');
      
    }
  };

  // Analog Read Block
Blockly.Blocks['stemroboanalog_read'] = {
    init: function() {
      this.setColour("#B515D9");
      this.appendDummyInput()
          .appendField('Analog Read Pin')
          .appendField(new Blockly.FieldDropdown([
            ["IO1", '4'],
            ["IO2", '5'],
            ["IO3", '6'],
            ["IO4", '7'],
            ["IO11", '2'],
            ["IO12", '1'],
          ]), 'value');
      this.setOutput(true, 'Number');
      this.setTooltip('Read an analog value from a pin');
      
    }
  };
 
  // Analog Write Block
  Blockly.Blocks['stemroboanalog_write'] = {
    init: function() {
      this.setColour("#B515D9");
      this.appendDummyInput()
          .appendField('Analog Write Pin')
          .appendField(new Blockly.FieldDropdown([
            ["IO1", '4'],
            ["IO2", '5'],
            ["IO3", '6'],
            ["IO4", '7'],
            ["IO5", '15'],
            ["IO6", '16'],
            ["IO7", '21'],
            ["IO8", '47'],
            ["IO9", '48'],
            ["IO10",'38'],
            ["IO11", '2'],
            ["IO12", '1']
          ]), 'pin')
          this.appendValueInput('value')
          .setCheck('Number')
          .appendField('value');
      this.setInputsInline(true);
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setTooltip('Write an analog value to a pin');
      this.setOnChange(function () {
        integervalidatior(this, 'value');
      });
    }
  };

// Pin Mode Block
Blockly.Blocks['stemrobopinmode'] = {
    init: function() {
      this.setColour("#B515D9");
      this.appendDummyInput()
          .appendField('Set pin')
          .appendField(new Blockly.FieldDropdown([
            ["IO1", '4'],
            ["IO2", '5'],
            ["IO3", '6'],
            ["IO4", '7'],
            ["IO5", '15'],
            ["IO6", '16'],
            ["IO7", '21'],
            ["IO8", '47'],
            ["IO9", '48'],
            ["IO10",'38'],
            ["IO11", '2'],
            ["IO12", '1']
          ]), 'value')
          .appendField('as')
          .appendField(new Blockly.FieldDropdown([
            ['OUTPUT', 'OUTPUT'],
            ['INPUT', 'INPUT']
          ]), 'pinmode');
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setTooltip('Set the mode of a pin');
      
    }
  };
  
  Blockly.Blocks['stemroboLCDsetup'] = {
      init: function() {
        this.setColour("#FF12A0");
        this.appendDummyInput()
            .appendField('Setup LCD SDA')
            .appendField(new Blockly.FieldDropdown([
                ["IO1", '4'],
                ["IO2", '5'],
                ["IO3", '6'],
                ["IO4", '7'],
                ["IO5", '15'],
                ["IO6", '16'],
                ["IO7", '21'],
                ["IO8", '47'],
                ["IO9", '48'],
                ["IO10",'38'],
                ["IO11", '2'],
                ["IO12", '1']
            ]), 'sda')
            .appendField('SCL')
            .appendField(new Blockly.FieldDropdown([
                ["IO1", '4'],
            ["IO2", '5'],
            ["IO3", '6'],
            ["IO4", '7'],
            ["IO5", '15'],
            ["IO6", '16'],
            ["IO7", '21'],
            ["IO8", '47'],
            ["IO9", '48'],
            ["IO10",'38'],
            ["IO11", '2'],
            ["IO12", '1']
            ]), 'scl')  
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setTooltip('Write a digital value to a pin');
      }
    };