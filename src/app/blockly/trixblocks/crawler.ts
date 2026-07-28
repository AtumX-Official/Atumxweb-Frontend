import * as Blockly from 'blockly/core';

  Blockly.Blocks['crawlermove_forward'] = {
    init: function() {
      this.setColour("#19BCCF");
      this.appendDummyInput()
          .appendField('Move Forward')
          .appendField(new Blockly.FieldTextInput('10'), 'STEPS');
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setTooltip('Move forward by the specified number of steps');
    }
  };
  
  //move backward
  Blockly.Blocks['crawlermove_Backward'] = {
    init: function() {
      this.setColour("#19BCCF");
      this.appendDummyInput()
          .appendField('Move Backward')
          .appendField(new Blockly.FieldTextInput('10'), 'STEPS');
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setTooltip('Move backward by the specified number of steps');
    }
  };

//Move Left
  Blockly.Blocks['move_left'] = {
    init: function() {
      this.setColour("#19BCCF");
      this.appendDummyInput()
          .appendField('Turn Left')
          .appendField(new Blockly.FieldTextInput('10'), 'STEPS');
          this.setPreviousStatement(true, null);
          this.setNextStatement(true, null);
      this.setTooltip('Turn left by the specified number of steps');
    }
  };
  
  //Move Right
  Blockly.Blocks['move_right'] = {
    init: function() {
      this.setColour("#19BCCF");
      this.appendDummyInput()
          .appendField('Turn Right')
          .appendField(new Blockly.FieldTextInput('10'), 'STEPS');
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setTooltip('Turn right by the specified number of steps');
    }
  };
  
  //Dance Block
  Blockly.Blocks['dance'] = {
    init: function() {
      this.setColour("#19BCCF");
      this.appendDummyInput()
          .appendField('Dance');
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setTooltip('Turn the specified number of degrees');
    }
  };
  
  // Wave Block
  Blockly.Blocks['wave'] = {
    init: function() {
      this.setColour("#19BCCF");
      this.appendDummyInput()
          .appendField('Wave');
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setTooltip('Turn the specified number of degrees');
    }
  };
  
  // Fold Block
  Blockly.Blocks['fold'] = {
    init: function() {
      this.setColour("#19BCCF");
      this.appendDummyInput()
          .appendField('Fold');
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setTooltip('Turn the specified number of degrees');
    }
  };
  
  // Situp Block
  Blockly.Blocks['situp'] = {
    init: function() {
      this.setColour("#19BCCF");
      this.appendDummyInput()
          .appendField('Situp');
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setTooltip('Turn the specified number of degrees');
    }
  };
  

Blockly.Blocks['crawlercalibrate'] = {
        init: function() {
          this.setColour("#19BCCF");
          this.appendDummyInput()
              .appendField('Calibrate');
          this.setPreviousStatement(true, null);
          this.setNextStatement(true, null);
          this.setTooltip('Turn the specified number of degrees');
        }
      };

Blockly.Blocks['leg_control'] = {
      init: function() {
        this.setColour("#19BCCF"); // Specify the block's color
        this.appendDummyInput()
            .appendField('Move leg')
            .appendField(new Blockly.FieldDropdown([
              ['1', '1'],
              ['2', '2'],
              ['3', '3'],
              ['4', '4']
            ]), 'leg')
            .appendField('in')
            .appendField(new Blockly.FieldDropdown([
              ['F', 'F'],
              ['B', 'B'],
              ['L', 'L'],
              ['R', 'R']
            ]), 'dir');
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setTooltip('Move the specified leg in the given direction');
      }
    };

Blockly.Blocks['crawlerservo'] = {
    init: function() {
      this.setColour("#19BCCF");
      this.appendDummyInput()
          .appendField('Move')
          .appendField(new Blockly.FieldDropdown([
            ['Leg1', '1'],
            ['Leg2', '2'],
            ['Leg3', '3'],
            ['Leg4', '4']
          ]), 'leg')
          .appendField(new Blockly.FieldDropdown([
            ['Shoulder', 'Shoulder'],
            ['Knee', 'Knee']
          ]), 'part')
          .appendField(new Blockly.FieldTextInput('90'), 'angle')
          .appendField('Degrees');
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setTooltip('This is a custom block with a dropdown field');
    }
  };      