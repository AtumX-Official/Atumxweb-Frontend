import * as Blockly from 'blockly/core';
import { integervalidatior } from '../inputvalidator';
// Digital Read Block
Blockly.Blocks['sfdigital_read'] = {
    init: function() {
      this.setColour("#B515D9");
      this.appendDummyInput()
          .appendField('Digital Read Pin')
          .appendField(new Blockly.FieldDropdown([
            ["IO1", '0'],
            ["IO2", '1'],
            ["IO3", '3'],
            ["IO4", '2'],
            ["IO5", '5'],
            ["IO6", '4'],
            ["IO7", '7'],
            ["IO8", '6'],
            ["IO9", '9'],
            ["IO10", '8'],
            ["IO11", '11'],
            ["IO12", '10'],
            ["IO13", '12'],
            ["IO14", '13'],
            ["IO15", '15'],
            ["IO16", '14'],
            ["IO17",'23'],
            ["IO18",'22'],
            ["IO19",'25'],
            ["IO20",'24'],
            ["IO21",'27'],
            ["IO22",'26'],
            ["IO23",'29'],
            ["IO24",'28'],
          ]), 'value');
      this.setOutput(true, 'Number');
      this.setTooltip('Read a digital value from a pin');
    }
  };

// Digital Write Block
Blockly.Blocks['sfdigital_write'] = {
    init: function() {
      this.setColour("#B515D9");
      this.appendDummyInput()
          .appendField('Digital Write Pin')
          .appendField(new Blockly.FieldDropdown([
            ["IO1", '0'],
            ["IO2", '1'],
            ["IO3", '3'],
            ["IO4", '2'],
            ["IO5", '5'],
            ["IO6", '4'],
            ["IO7", '7'],
            ["IO8", '6'],
            ["IO9", '9'],
            ["IO10", '8'],
            ["IO11", '11'],
            ["IO12", '10'],
            ["IO13", '12'],
            ["IO14", '13'],
            ["IO15", '15'],
            ["IO16", '14'],
            ["IO17",'23'],
            ["IO18",'22'],
            ["IO19",'25'],
            ["IO20",'24'],
            ["IO21",'27'],
            ["IO22",'26'],
            ["IO23",'29'],
            ["IO24",'28'],
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
Blockly.Blocks['sfanalog_read'] = {
    init: function() {
      this.setColour("#B515D9");
      this.appendDummyInput()
          .appendField('Analog Read Pin')
          .appendField(new Blockly.FieldDropdown([
            ["IO1", '0'],
            ["IO2", '1'],
            ["IO8", '6'],
            ["IO13", '12'],
            ["IO14", '13'],
            ["IO15", '15'],
            ["IO16", '14'],
            ["IO18",'22'],
            ["IO19",'25'],
            ["IO20",'24'],
            ["IO21",'27'],
            ["IO22",'26'],
            ["IO23",'29'],
            ["IO24",'28'],
          ]), 'value');
      this.setOutput(true, 'Number');
      this.setTooltip('Read an analog value from a pin');
      
    }
  };
 
  // Analog Write Block
  Blockly.Blocks['sfanalog_write'] = {
    init: function() {
      this.setColour("#B515D9");
      this.appendDummyInput()
          .appendField('Analog Write Pin')
          .appendField(new Blockly.FieldDropdown([
            ["IO1", '0'],
            ["IO2", '1'],
            ["IO3", '3'],
            ["IO4", '2'],
            ["IO5", '5'],
            ["IO6", '4'],
            ["IO7", '7'],
            ["IO8", '6'],
            ["IO9", '9'],
            ["IO10", '8'],
            ["IO11", '11'],
            ["IO12", '10'],
            ["IO13", '12'],
            ["IO14", '13'],
            ["IO15", '15'],
            ["IO16", '14'],
            ["IO17",'23'],
            ["IO18",'22'],
            ["IO19",'25'],
            ["IO20",'24'],
            ["IO21",'27'],
            ["IO22",'26'],
            ["IO23",'29'],
            ["IO24",'28'],
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
Blockly.Blocks['sfpinmode'] = {
    init: function() {
      this.setColour("#B515D9");
      this.appendDummyInput()
          .appendField('Set pin')
          .appendField(new Blockly.FieldDropdown([
            ["IO1", '0'],
            ["IO2", '1'],
            ["IO3", '3'],
            ["IO4", '2'],
            ["IO5", '5'],
            ["IO6", '4'],
            ["IO7", '7'],
            ["IO8", '6'],
            ["IO9", '9'],
            ["IO10", '8'],
            ["IO11", '11'],
            ["IO12", '10'],
            ["IO13", '12'],
            ["IO14", '13'],
            ["IO15", '15'],
            ["IO16", '14'],
            ["IO17",'23'],
            ["IO18",'22'],
            ["IO19",'25'],
            ["IO20",'24'],
            ["IO21",'27'],
            ["IO22",'26'],
            ["IO23",'29'],
            ["IO24",'28'],
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
  
  Blockly.Blocks['sfLCDsetup'] = {
      init: function() {
        this.setColour("#FF12A0");
        this.appendDummyInput()
            .appendField('Setup LCD SDA')
            .appendField(new Blockly.FieldDropdown([
              ["IO1", '0'],
              ["IO2", '1'],
              ["IO3", '3'],
              ["IO4", '2'],
              ["IO5", '5'],
              ["IO6", '4'],
              ["IO7", '7'],
              ["IO8", '6'],
              ["IO9", '9'],
              ["IO10", '8'],
              ["IO11", '11'],
              ["IO12", '10'],
              ["IO13", '12'],
              ["IO14", '13'],
              ["IO15", '15'],
              ["IO16", '14'],
              ["IO17",'23'],
              ["IO18",'22'],
              ["IO19",'25'],
              ["IO20",'24'],
              ["IO21",'27'],
              ["IO22",'26'],
              ["IO23",'29'],
              ["IO24",'28'],
            ]), 'sda')
            .appendField('SCL')
            .appendField(new Blockly.FieldDropdown([
              ["IO1", '0'],
              ["IO2", '1'],
              ["IO3", '3'],
              ["IO4", '2'],
              ["IO5", '5'],
              ["IO6", '4'],
              ["IO7", '7'],
              ["IO8", '6'],
              ["IO9", '9'],
              ["IO10", '8'],
              ["IO11", '11'],
              ["IO12", '10'],
              ["IO13", '12'],
              ["IO14", '13'],
              ["IO15", '15'],
              ["IO16", '14'],
              ["IO17",'23'],
              ["IO18",'22'],
              ["IO19",'25'],
              ["IO20",'24'],
              ["IO21",'27'],
              ["IO22",'26'],
              ["IO23",'29'],
              ["IO24",'28'],
            ]), 'scl')  
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setTooltip('Write a digital value to a pin');
      }
    };