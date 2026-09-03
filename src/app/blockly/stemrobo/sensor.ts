import * as Blockly from 'blockly/core';


  //DHTsetup
  Blockly.Blocks['stemrobosetup_DHT'] = {
    init : function(){
      this.setColour("#FF7104");
      this.appendDummyInput()
          .appendField('Setup DHT Sensor pin')
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
          ]), 'pin');
          this.setPreviousStatement(true, null);
          this.setNextStatement(true, null);
      this.setTooltip('Read a digital value from a pin');
    }
  }
  
  //HBSetup
  Blockly.Blocks['stemrobosetup_HB'] = {
    init : function(){
      this.setColour("#FF7104");
      this.appendDummyInput()
          .appendField('Setup HeartBeat Setup pin')
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
          ]), 'pin');
          this.setPreviousStatement(true, null);
          this.setNextStatement(true, null);
      this.setTooltip('Read a digital value from a pin');
    }
}

// Sensor Pin Block
Blockly.Blocks['stemrobosensor_pin'] = {
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
  Blockly.Blocks['stemrobocolor_sensor_init'] = {
    init: function() {
      this.setColour("#FF7104");
      this.appendDummyInput()
          .appendField('Color sensor SDA')
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
          ]), 'csda')
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
          ]), 'cscl');
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setTooltip('This is a custom block with a dropdown field');
    }
  };

//servo init
Blockly.Blocks['stemroboservo_init'] = {
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
        ]), 'pin');
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setTooltip('This is a custom block with a dropdown field');
  }
};
 
// Connect LDR Block
Blockly.Blocks['stemroboconnect_ldr'] = {
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
          ]), 'pinnumber');
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setTooltip('Connect an LDR to a pin');
      
    }
  };

// Connect Ultrasonic Block
Blockly.Blocks['stemroboconnect_us1'] = {
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
          ]), 'echo')
          .appendField('Trigger')
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
          ]), 'trigger');
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setTooltip('Setup an ultrasonic sensor');
    }
}; 