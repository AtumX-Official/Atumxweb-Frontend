import * as Blockly from 'blockly/core';




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




  //DHTsetup
  Blockly.Blocks['sfsetup_DHT'] = {
    init : function(){
      this.setColour("#FF7104");
      this.appendDummyInput()
          .appendField('Setup DHT Sensor pin')
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
          ]), 'pin');
          this.setPreviousStatement(true, null);
          this.setNextStatement(true, null);
      this.setTooltip('Read a digital value from a pin');
    }
  }
  
  //HBSetup
  Blockly.Blocks['sfsetup_HB'] = {
    init : function(){
      this.setColour("#FF7104");
      this.appendDummyInput()
          .appendField('Setup HeartBeat Setup pin')
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
          ]), 'pin');
          this.setPreviousStatement(true, null);
          this.setNextStatement(true, null);
      this.setTooltip('Read a digital value from a pin');
    }
}

// Sensor Pin Block
Blockly.Blocks['sfsensor_pin'] = {
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
  Blockly.Blocks['sfcolor_sensor_init'] = {
    init: function() {
      this.setColour("#FF7104");
      this.appendDummyInput()
          .appendField('Color sensor SDA')
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
          ]), 'csda')
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
          ]), 'cscl');
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setTooltip('This is a custom block with a dropdown field');
    }
  };

//servo init
Blockly.Blocks['sfservo_init'] = {
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
        ]), 'pin');
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setTooltip('This is a custom block with a dropdown field');
  }
};
 
// Connect LDR Block
Blockly.Blocks['sfconnect_ldr'] = {
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
          ]), 'pinnumber');
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setTooltip('Connect an LDR to a pin');
      
    }
  };

// Connect Ultrasonic Block
Blockly.Blocks['sfconnect_us1'] = {
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
          ]), 'echo')
          .appendField('Trigger')
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
          ]), 'trigger');
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setTooltip('Setup an ultrasonic sensor');
    }
}; 

//ColorSensor SDR
Blockly.Blocks['sfcolor_sensor_init'] = {
    init: function() {
      this.setColour("#FF7104");
      this.appendDummyInput()
          .appendField('Setup Color sensor');
      this.appendDummyInput()
          .appendField('SDA')
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
          ]), 'csda')
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
          ]), 'cscl');
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setTooltip('This is a custom block with a dropdown field');
    }
};
