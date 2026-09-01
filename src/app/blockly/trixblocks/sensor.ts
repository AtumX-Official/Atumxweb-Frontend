import * as Blockly from 'blockly/core';
import { integervalidatior } from '../inputvalidator';
import {ColorWheelField,PianoKeyboardField,ColorGridField} from '../Helper/helperclass'
//UltraSonic
Blockly.Blocks['US1'] = {
  init: function() {
    this.setColour("#FF7104");
    this.appendDummyInput()
        .appendField(new Blockly.FieldDropdown([
          ['Ultrasonic1', 'US1'],
          ['Ultrasonic2', 'US2'],
          ['Ultrasonic3', 'US3'],
        ]), 'value');
    this.setOutput(true, 'Number');
    this.setTooltip('This is a custom block with a dropdown field');
  }
  };

  //Servo Individual
  Blockly.Blocks['servo_individual'] = {
    init: function() {
      this.setColour("#4787FF");
  
      this.appendDummyInput()
          .appendField('180° Servo')
          .appendField(new Blockly.FieldDropdown([
            ['Servo1', 'Servo1'],
            ['Servo2', 'Servo2'],
            ['Servo3', 'Servo3'],
            ['Servo4', 'Servo4'],
            ['Servo5', 'Servo5'],
            ['Servo6', 'Servo6'],
          ]), 'ID')
          .appendField('write');
  
      // Value input for angle
      this.appendValueInput('ANGLE')
          .setCheck('Number')
          .appendField('degrees');
      // Shadow number default  
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setTooltip('Write angle to selected servo');
      this.setInputsInline(true);
      this.setOnChange( () =>  {
        integervalidatior(this, 'ANGLE');
      });
    }
  };

 //Setup Color
 Blockly.Blocks['color_sensor'] = {
    init: function() {
      this.setColour("#FF7104");
      this.appendDummyInput()
          .appendField('Color is')
          .appendField(new Blockly.FieldDropdown([
            ['Green', 'Green'],
            ['Black', 'Black'],
            ['Red', 'Red'],
            ['Blue', 'Blue'],
            ['White', 'White']
          ]), 'value');
      this.setOutput(true, 'Boolean');
      this.setTooltip('Check the color sensor for a specific color');
    }
  };

 //LDR
Blockly.Blocks['HBSensor'] = {
    init: function() {
      this.setColour("#FF7104");
      this.appendDummyInput()
          .appendField(new Blockly.FieldDropdown([
            ['HB1', 'HB1'],
            ['HB2', 'HB2'],
          ]), 'value');
      this.setOutput(true, 'Number');
      this.setTooltip('This is a custom block with a dropdown field');
    }
  };

Blockly.Blocks['DTHSensor'] = {
    init: function() {
      this.setColour("#FF7104");
      this.appendDummyInput()
          .appendField(new Blockly.FieldDropdown([
            ['DHTHum', 'DHTHum'],
            ['DHTTemp', 'DHTTemp'],
          ]), 'value');
      this.setOutput(true, 'Number');
      this.setTooltip('This is a custom block with a dropdown field');
    }
}; 

Blockly.Blocks['ldr'] = {
  init: function() {
    this.setColour("#FF7104");
    this.appendDummyInput()
        .appendField(new Blockly.FieldDropdown([
          ['LDR1', 'LDR1'],
          ['LDR2', 'LDR2'],
          ['LDR3', 'LDR3'],
          ['LDR4', 'LDR4']
        ]), 'value');
    this.setOutput(true, 'Number');
    this.setTooltip('This is a custom block with a dropdown field');
  }
};

 //IR1
 Blockly.Blocks['ir'] = {
    init: function() {
      this.setColour("#FF7104");
      this.appendDummyInput()
          .appendField(new Blockly.FieldDropdown([
            ['IR1', 'IR1'],
            ['IR2', 'IR2'],
            ['IR3', 'IR3'],
            ['IR4', 'IR4'],
            ['IR5', 'IR5'],
            ['IR6', 'IR6'],
            ['IR7', 'IR7'],
          ]), 'value');
      this.setOutput(true, 'Number');
      this.setTooltip('This is a custom block with a dropdown field');
    }
  }; 

  //DHTsetup
  Blockly.Blocks['setup_DHT'] = {
    init : function(){
      this.setColour("#FF7104");
      this.appendDummyInput()
          .appendField('Setup DHT Sensor pin')
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
          ]), 'pin');
          this.setPreviousStatement(true, null);
          this.setNextStatement(true, null);
      this.setTooltip('Read a digital value from a pin');
    }
  }
  
  //HBSetup
  Blockly.Blocks['setup_HB'] = {
    init : function(){
      this.setColour("#FF7104");
      this.appendDummyInput()
          .appendField('Setup HeartBeat Setup pin')
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
          ]), 'pin');
          this.setPreviousStatement(true, null);
          this.setNextStatement(true, null);
      this.setTooltip('Read a digital value from a pin');
    }
}

// Sensor Pin Block
Blockly.Blocks['sensor_pin'] = {
  init: function() {
    this.setColour("#FF7104");
    this.appendDummyInput()
        .appendField('Setup')
        .appendField(new Blockly.FieldDropdown([
          ['IR1', 'IR1'],
          ['IR2', 'IR2'],
          ['IR3', 'IR3'],
          ['IR4', 'IR4'],
          ['IR5', 'IR5'],
          ['IR6', 'IR6'],
          ['IR7', 'IR7']
        ]), 'value')
        .appendField('to')
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
        ]), 'pinnumber');
        this.appendDummyInput()
        .appendField('as')
        .appendField(new Blockly.FieldDropdown([
          ['DIGITAL', 'DIGITAL'],
          ['ANALOG', 'ANALOG']
        ]), 'type');
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setTooltip('Connect a sensor to a pin'); 
  }
};  

  //ColorSensor SDR
  Blockly.Blocks['color_sensor_init'] = {
    init: function() {
      this.setColour("#FF7104");
      this.appendDummyInput()
          .appendField('Color sensor SDA')
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
          ]), 'csda')
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
          ]), 'cscl');
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setTooltip('This is a custom block with a dropdown field');
    }
  };

//servo init
Blockly.Blocks['servo_init'] = {
  init: function() {
    this.setColour("#4787FF");
    this.appendDummyInput()
        .appendField('Attach servo')
        .appendField(new Blockly.FieldDropdown([
          ['Servo1', 'Servo1'],
          ['Servo2', 'Servo2'],
          ['Servo3', 'Servo3'],
          ['Servo4', 'Servo4'],
          ['Servo5', 'Servo5'],
          ['Servo6', 'Servo6'],
        ]), 'ID')
        .appendField('to')
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
        ]), 'pin');
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setTooltip('This is a custom block with a dropdown field');
  }
};
 
// Connect LDR Block
Blockly.Blocks['connect_ldr'] = {
    init: function() {
      this.setColour("#FF7104");
      this.appendDummyInput()
          .appendField('Setup')
          .appendField(new Blockly.FieldDropdown([
            ['LDR1', 'LDR1'],
            ['LDR2', 'LDR2'],
            ['LDR3', 'LDR3'],
            ['LDR4', 'LDR4'],
            ['LDR5', 'LDR5'],
            ['LDR6', 'LDR6'],
            ['LDR7', 'LDR7']
          ]), 'value')
          .appendField('to')
          .appendField(new Blockly.FieldDropdown([
            ["IO1", '1'],
            ["IO2", '2'],
            ["IO8", '9'],
            ["IO13", '7'],
            ["IO14", '6'],
            ["IO15", '5'],
            ["IO16", '4'],
          ]), 'pinnumber');
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setTooltip('Connect an LDR to a pin');
      
    }
  };

// Connect Ultrasonic Block
Blockly.Blocks['connect_us1'] = {
    init: function() {
      this.setColour("#FF7104");
      this.appendDummyInput()
          .appendField('Setup')
          .appendField(new Blockly.FieldDropdown([
            ['Ultrasonic1', 'US1'],
            ['Ultrasonic2', 'US2'],
            ['Ultrasonic3', 'US3'],
          ]), 'ID');
          this.appendDummyInput()
          .appendField('Echo')
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
          ]), 'echo')
          .appendField('Trigger')
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
          ]), 'trigger');
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setTooltip('Setup an ultrasonic sensor');
    }
}; 

//ColorSensor SDR
Blockly.Blocks['color_sensor_init'] = {
    init: function() {
      this.setColour("#FF7104");
      this.appendDummyInput()
          .appendField('Setup Color sensor');
      this.appendDummyInput()
          .appendField('SDA')
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
          ]), 'csda')
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
          ]), 'cscl');
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setTooltip('This is a custom block with a dropdown field');
    }
};


Blockly.Blocks['colorsensor'] = {
  init: function() {
    this.setColour("#FF7104");
    this.appendDummyInput()
        .appendField('Color Sensor')
        .appendField(new Blockly.FieldDropdown([
          ['r', 'R'],
          ['g', 'G'],
          ['b', 'B'],
        ]), 'value');
    this.setOutput(true, 'Boolean');
    this.setTooltip('Check the color sensor for a specific color');
  }
};