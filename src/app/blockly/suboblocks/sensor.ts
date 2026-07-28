import * as Blockly from 'blockly/core';


  //DHTsetup
  Blockly.Blocks['cayosetup_DHT'] = {
    init : function(){
      this.setColour("#FF7104");
      this.appendDummyInput()
          .appendField('Setup DHT Sensor pin')
          .appendField(new Blockly.FieldDropdown([
            ["IO1", '4'],
            ["IO2", '39'],
            ["IO3", '13'],
            ["IO4", '38'],
            ["IO5", '14'],
            ["IO6", '48'],
            ["IO7", '42'],
            ["IO8", '5'],
          ]), 'pin');
          this.setPreviousStatement(true, null);
          this.setNextStatement(true, null);
      this.setTooltip('Read a digital value from a pin');
    }
  }
  
  //HBSetup
  Blockly.Blocks['cayosetup_HB'] = {
    init : function(){
      this.setColour("#FF7104");
      this.appendDummyInput()
          .appendField('Setup HeartBeat Setup pin')
          .appendField(new Blockly.FieldDropdown([
            ["IO1", '4'],
            ["IO2", '39'],
            ["IO3", '13'],
            ["IO4", '38'],
            ["IO5", '14'],
            ["IO6", '48'],
            ["IO7", '42'],
            ["IO8", '5']
          ]), 'pin');
          this.setPreviousStatement(true, null);
          this.setNextStatement(true, null);
      this.setTooltip('Read a digital value from a pin');
    }
}

// Sensor Pin Block
Blockly.Blocks['cayosensor_pin'] = {
  init: function () {
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
        // ✅ Full digital list as default — covers all possible saved values
        ["IO1", '4'],
        ["IO2", '39'],
        ["IO3", '13'],
        ["IO4", '38'],
        ["IO5", '14'],
        ["IO6", '48'],
        ["IO7", '42'],
        ["IO8", '5']
      ]), 'pinnumber');

    this.appendDummyInput()
      .appendField('as')
      .appendField(new Blockly.FieldDropdown([
        ['DIGITAL', 'DIGITAL'],
        ['ANALOG', 'ANALOG']
      ]), 'type');

    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
  },

  onchange: function (event) {
    if (
      event?.type === Blockly.Events.BLOCK_CREATE ||
      this.workspace?.isLoading
    ) {
      return;
    }

    const type = this.getFieldValue('type');
    const pinField = this.getField('pinnumber');

    if (!pinField) return;

    const currentValue = pinField.getValue();

    const digitalOptions = [
      ["IO1", '4'],
      ["IO2", '39'],
      ["IO3", '13'],
      ["IO4", '38'],
      ["IO5", '14'],
      ["IO6", '48'],
      ["IO7", '42'],
      ["IO8", '5']
    ];

    const analogOptions = [
      ["IO1", '4'],
      ["IO5", '14'],
      ["IO8", '5'],
    ];

    const newOptions = type === 'ANALOG' ? analogOptions : digitalOptions;

    pinField.menuGenerator_ = newOptions;

    const isValid = newOptions.some(option => option[1] === currentValue);
    if (!isValid) {
      pinField.setValue(newOptions[0][1]);
    }
  }
};

  //ColorSensor SDR
  Blockly.Blocks['cayocolor_sensor_init'] = {
    init: function() {
      this.setColour("#FF7104");
      this.appendDummyInput()
          .appendField('Color sensor SDA')
          .appendField(new Blockly.FieldDropdown([
            ["IO1", '4'],
            ["IO2", '39'],
            ["IO3", '13'],
            ["IO4", '38'],
            ["IO5", '14'],
            ["IO6", '48'],
            ["IO7", '42'],
            ["IO8", '5'],
          ]), 'csda')
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
          ]), 'cscl');
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setTooltip('This is a custom block with a dropdown field');
    }
  };

//servo init
Blockly.Blocks['cayoservo_init'] = {
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
          ["IO2", '39'],
          ["IO3", '13'],
          ["IO4", '38'],
          ["IO5", '14'],
          ["IO6", '48'],
          ["IO7", '42'],
          ["IO8", '5'],
        ]), 'pin');
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setTooltip('This is a custom block with a dropdown field');
  }
};
 
// Connect LDR Block
Blockly.Blocks['cayoconnect_ldr'] = {
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
            ["IO5", '14'],
            ["IO8", '5'],
          ]), 'pinnumber');
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setTooltip('Connect an LDR to a pin');
      
    }
  };

// Connect Ultrasonic Block
Blockly.Blocks['cayoconnect_us1'] = {
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
            ["IO2", '39'],
            ["IO3", '13'],
            ["IO4", '38'],
            ["IO5", '14'],
            ["IO6", '48'],
            ["IO7", '42'],
            ["IO8", '5'],
          ]), 'echo')
          .appendField('Trigger')
          .appendField(new Blockly.FieldDropdown([
            ["IO1", '4'],
            ["IO2", '39'],
            ["IO3", '13'],
            ["IO4", '38'],
            ["IO5", '14'],
            ["IO6", '48'],
            ["IO7", '42'],
            ["IO8", '5'],
          ]), 'trigger');
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setTooltip('Setup an ultrasonic sensor');
    }
}; 
