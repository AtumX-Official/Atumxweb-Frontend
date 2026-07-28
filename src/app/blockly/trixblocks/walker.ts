import * as Blockly from 'blockly/core';

  //move forward
  Blockly.Blocks['move_forward'] = {
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
  Blockly.Blocks['move_Backward'] = {
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
  
  // Pushup Block
  Blockly.Blocks['pushup'] = {
    init: function() {
      this.setColour("#19BCCF");
      this.appendDummyInput()
          .appendField('Pushup');
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setTooltip('Turn the specified number of degrees');
    }
  };
  
  // Greet Block
  Blockly.Blocks['greet'] = {
    init: function() {
      this.setColour("#19BCCF");
      this.appendDummyInput()
          .appendField('Greet');
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setTooltip('Turn the specified number of degrees');
    }
  };
  
  // Stand Block
  Blockly.Blocks['stand'] = {
    init: function() {
      this.setColour("#19BCCF");
      this.appendDummyInput()
          .appendField('Stand');
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setTooltip('Turn the specified number of degrees');
    }
  };
  
  // Dog Situp Block
  Blockly.Blocks['dogsitup'] = {
    init: function() {
      this.setColour("#19BCCF");
      this.appendDummyInput()
          .appendField('Dog Situp');
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setTooltip('Turn the specified number of degrees');
    }
  };
  Blockly.Blocks['walker_leg_control'] = {
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
            ]), 'dir');
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setTooltip('Move the specified leg in the given direction');
      }
    };
    
    // Calibrate Block
    Blockly.Blocks['calibrate'] = {
      init: function() {
        this.setColour("#19BCCF");
        this.appendDummyInput()
            .appendField('Calibrate');
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setTooltip('Turn the specified number of degrees');
      }
    };
    
    //Leg Control
  
   Blockly.Blocks['servo'] = {
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