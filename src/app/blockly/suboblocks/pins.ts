import * as Blockly from 'blockly/core';
import { integervalidatior } from '../inputvalidator';
// Digital Read Block
Blockly.Blocks['cayodigital_read'] = {
    init: function() {
      this.setColour("#B515D9");
      this.appendDummyInput()
          .appendField('Digital Read Pin')
          .appendField(new Blockly.FieldDropdown([
            ["IO1", '4'],
            ["IO2", '39'],
            ["IO3", '13'],
            ["IO4", '38'],
            ["IO5", '14'],
            ["IO6", '48'],
            ["IO7", '42'],
            ["IO8", '5'],
          ]), 'value');
      this.setOutput(true, 'Number');
      this.setTooltip('Read a digital value from a pin');
    }
  };

// Digital Write Block
Blockly.Blocks['cayodigital_write'] = {
    init: function() {
      this.setColour("#B515D9");
      this.appendDummyInput()
          .appendField('Digital Write Pin')
          .appendField(new Blockly.FieldDropdown([
            ["IO1", '4'],
            ["IO2", '39'],
            ["IO3", '13'],
            ["IO4", '38'],
            ["IO5", '14'],
            ["IO6", '48'],
            ["IO7", '42'],
            ["IO8", '5'],
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
Blockly.Blocks['cayoanalog_read'] = {
    init: function() {
      this.setColour("#B515D9");
      this.appendDummyInput()
          .appendField('Analog Read Pin')
          .appendField(new Blockly.FieldDropdown([
            ["IO1", '4'],
            ["IO5", '14'],
            ["IO8", '5'],
          ]), 'value');
      this.setOutput(true, 'Number');
      this.setTooltip('Read an analog value from a pin');
      
    }
  };
 
  // Analog Write Block
  Blockly.Blocks['cayoanalog_write'] = {
    init: function() {
      this.setColour("#B515D9");
      this.appendDummyInput()
          .appendField('Analog Write Pin')
          .appendField(new Blockly.FieldDropdown([
            ["IO1", '4'],
            ["IO2", '39'],
            ["IO3", '13'],
            ["IO4", '38'],
            ["IO5", '14'],
            ["IO6", '48'],
            ["IO7", '42'],
            ["IO8", '5'],
          ]), 'pin')
          this.appendValueInput('value')
          .setCheck('Number')
          .appendField('value');
      this.setInputsInline(true);
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setTooltip('Write an analog value to a pin');
      this.setOnChange( () => {
        integervalidatior(this, 'value');
      });
    }
  };

// Pin Mode Block
Blockly.Blocks['cayopinmode'] = {
    init: function() {
      this.setColour("#B515D9");
      this.appendDummyInput()
          .appendField('Set pin')
          .appendField(new Blockly.FieldDropdown([
            ["IO1", '4'],
            ["IO2", '39'],
            ["IO3", '13'],
            ["IO4", '38'],
            ["IO5", '14'],
            ["IO6", '48'],
            ["IO7", '42'],
            ["IO8", '5'],
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
  
  Blockly.Blocks['cayoLCDsetup'] = {
      init: function() {
        this.setColour("#FF12A0");
        this.appendDummyInput()
            .appendField('Setup LCD SDA')
            .appendField(new Blockly.FieldDropdown([
              ["IO1", '4'],
              ["IO2", '39'],
              ["IO3", '13'],
              ["IO4", '38'],
              ["IO5", '14'],
              ["IO6", '48'],
              ["IO7", '42'],
              ["IO8", '5'],
            ]), 'sda')
            .appendField('SCL')
            .appendField(new Blockly.FieldDropdown([
              ["IO1", '4'],
              ["IO2", '39'],
              ["IO3", '13'],
              ["IO4", '38'],
              ["IO5", '14'],
              ["IO6", '48'],
              ["IO7", '42'],
              ["IO8", '5'],
            ]), 'scl')  
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setTooltip('Write a digital value to a pin');
      }
    };