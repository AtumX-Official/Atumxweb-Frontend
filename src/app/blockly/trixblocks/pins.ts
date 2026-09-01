import * as Blockly from 'blockly/core';
import { integervalidatior,maxLengthValidator } from '../inputvalidator';

// Digital Read Block
Blockly.Blocks['digital_read'] = {
    init: function() {
      this.setColour("#B515D9");
      this.appendDummyInput()
          .appendField('Digital Read Pin')
          .appendField(new Blockly.FieldDropdown([
            ["IO1", '1'],
            ["IO2", '2'],
            ["IO3", '42'],
            ["IO4", '41'],
            ["IO5", '39'],
            ["IO6", '40'],
            ["IO7", '10'],
            ["IO8", '9'],
            ["IO9", '18'],
            ["IO10", '17'],
            ["IO11", '16'],
            ["IO12", '15'],
            ["IO13", '7'],
            ["IO14", '6'],
            ["IO15", '5'],
            ["IO16", '4'],
          ]), 'value');
      this.setOutput(true, 'Number');
      this.setTooltip('Read a digital value from a pin');
    }
  };

// Digital Write Block
Blockly.Blocks['digital_write'] = {
    init: function() {
      this.setColour("#B515D9");
      this.appendDummyInput()
          .appendField('Digital Write Pin')
          .appendField(new Blockly.FieldDropdown([
            ["IO1", '1'],
            ["IO2", '2'],
            ["IO3", '42'],
            ["IO4", '41'],
            ["IO5", '39'],
            ["IO6", '40'],
            ["IO7", '10'],
            ["IO8", '9'],
            ["IO9", '18'],
            ["IO10", '17'],
            ["IO11", '16'],
            ["IO12", '15'],
            ["IO13", '7'],
            ["IO14", '6'],
            ["IO15", '5'],
            ["IO16", '4'],
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
Blockly.Blocks['analog_read'] = {
    init: function() {
      this.setColour("#B515D9");
      this.appendDummyInput()
          .appendField('Analog Read Pin')
          .appendField(new Blockly.FieldDropdown([
            ["IO1", '1'],
            ["IO2", '2'],
            ["IO8", '9'],
            ["IO13", '7'],
            ["IO14", '6'],
            ["IO15", '5'],
            ["IO16", '4'],
          ]), 'value');
      this.setOutput(true, 'Number');
      this.setTooltip('Read an analog value from a pin');
      
    }
  };
 
  // Analog Write Block
  Blockly.Blocks['analog_write'] = {
    init: function() {
      this.setColour("#B515D9");
      this.appendDummyInput()
          .appendField('Analog Write Pin')
          .appendField(new Blockly.FieldDropdown([
            ["IO1", '1'],
            ["IO2", '2'],
            ["IO3", '42'],
            ["IO4", '41'],
            ["IO5", '39'],
            ["IO6", '40'],
            ["IO7", '10'],
            ["IO8", '9'],
            ["IO9", '18'],
            ["IO10", '17'],
            ["IO11", '16'],
            ["IO12", '15'],
            ["IO13", '7'],
            ["IO14", '6'],
            ["IO15", '5'],
            ["IO16", '4'],
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
Blockly.Blocks['pinmode'] = {
    init: function() {
      this.setColour("#B515D9");
      this.appendDummyInput()
          .appendField('Set pin')
          .appendField(new Blockly.FieldDropdown([
            ["IO1", '1'],
            ["IO2", '2'],
            ["IO3", '42'],
            ["IO4", '41'],
            ["IO5", '39'],
            ["IO6", '40'],
            ["IO7", '10'],
            ["IO8", '9'],
            ["IO9", '18'],
            ["IO10", '17'],
            ["IO11", '16'],
            ["IO12", '15'],
            ["IO13", '7'],
            ["IO14", '6'],
            ["IO15", '5'],
            ["IO16", '4'],
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
  
  Blockly.Blocks['LCDsetup'] = {
    init: function() {
      this.setColour("#FF12A0");
      this.appendDummyInput()
          .appendField('Setup LCD SDA')
          .appendField(new Blockly.FieldDropdown([
            ["IO1", '1'],
            ["IO2", '2'],
            ["IO3", '42'],
            ["IO4", '41'],
            ["IO5", '39'],
            ["IO6", '40'],
            ["IO7", '10'],
            ["IO8", '9'],
            ["IO9", '18'],
            ["IO10", '17'],
            ["IO11", '16'],
            ["IO12", '15'],
            ["IO13", '7'],
            ["IO14", '6'],
            ["IO15", '5'],
            ["IO16", '4'],
          ]), 'sda')
          .appendField('SCL')
          .appendField(new Blockly.FieldDropdown([
            ["IO1", '1'],
            ["IO2", '2'],
            ["IO3", '42'],
            ["IO4", '41'],
            ["IO5", '39'],
            ["IO6", '40'],
            ["IO7", '10'],
            ["IO8", '9'],
            ["IO9", '18'],
            ["IO10", '17'],
            ["IO11", '16'],
            ["IO12", '15'],
            ["IO13", '7'],
            ["IO14", '6'],
            ["IO15", '5'],
            ["IO16", '4'],
          ]), 'scl')  
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setTooltip('Write a digital value to a pin');
    }
  };

  Blockly.Blocks['LCDprint'] = {
    init: function() {
      this.setColour("#FF12A0")  
      this.appendDummyInput()
        .appendField('LCD - Print')
        .appendField(
          new Blockly.FieldTextInput('', maxLengthValidator),
          'str'
        );
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);        
      this.setTooltip('A string input field (max 100 characters)');
    }
  };     
  
  Blockly.Blocks['LCDPrintWS'] = {
    init: function() {
      this.setColour("#FF12A0");
      this.appendDummyInput()
      .appendField('LCD - Print')
      .appendField(new Blockly.FieldTextInput('',maxLengthValidator), 'str')
      .appendField('Scroll Direction')
      .appendField(new Blockly.FieldDropdown([
        ["Left", '0'],
        ["Right", '1'],
      ]), 'dir')
  this.setPreviousStatement(true, null);
  this.setNextStatement(true, null);
  this.setTooltip('Write a digital value to a pin');
    }
  }   
  
  Blockly.Blocks['LCDsetcursor'] = {
    init: function() {
      this.setColour("#FF12A0");
      this.appendDummyInput()
      .appendField('LCD - SetCursor Column')
      .appendField(new Blockly.FieldDropdown([
        ["1", '1'],
        ["2", '2'],
        ["3", '3'],
        ["4", '4'],
        ["5", '5'],
        ["6", '6'],
        ["7", '7'],
        ["8", '8'],
        ["9", '9'],
        ["10", '10'],
        ["11", '11'],
        ["12", '12'],
        ["13", '13'],
        ["14", '14'],
        ["15", '15'],
        ["16", '16'],
      ]), 'col')
      .appendField('Row')
      .appendField(new Blockly.FieldDropdown([
        ["1", '1'],
        ["2", '2'],
      ]), 'row')
  this.setPreviousStatement(true, null);
  this.setNextStatement(true, null);
  this.setTooltip('Write a digital value to a pin');
    }
  }     

  Blockly.Blocks['LCDcmd'] = {
    init: function() {
      this.setColour("#FF12A0");
      this.appendDummyInput()
      .appendField('LCD - Clear')
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
    }}  