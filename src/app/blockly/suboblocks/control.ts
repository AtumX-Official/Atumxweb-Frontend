import * as Blockly from 'blockly/core';
import {ColorWheelField,PianoKeyboardField,ColorGridField} from '../Helper/helperclass'

// Example block definition using the custom field
 Blockly.Blocks['play_note'] = {
    init: function() {
      this.appendDummyInput()
        .appendField("play note")
        .appendField(new PianoKeyboardField("Middle C"), "frequency")
        .appendField("for")
        .appendField(new Blockly.FieldDropdown([
          ["1", "1"],
          ["1/2", "0.5"],
          ["1/4", "0.25"],
          ["1/8", "0.125"]
        ]), "duration")
        .appendField("beat");
      this.setColour("#5508F9");
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setTooltip("Play a musical note for a specified duration.");
      this.setHelpUrl("");
    }
  };
  // Move Gripper
  Blockly.Blocks['move_arm'] = {
    init: function() {
      this.setColour("#5508F9");
      this.appendDummyInput()
          .appendField('Move Arm to x')
          .appendField(new Blockly.FieldTextInput('10'), 'X')
          .appendField('y')
          .appendField(new Blockly.FieldTextInput('10'), 'Y')
          .appendField('z')
          .appendField(new Blockly.FieldTextInput('10'), 'Z')
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setTooltip('Move the gripper to the specified coordinates');
    }
  };

  Blockly.Blocks['led_control'] = {
    init: function() {
      this.setColour("#5508F9");
      this.appendDummyInput()
          .appendField("Set LED")
          .appendField(new Blockly.FieldTextInput(), 'value')
          .appendField("to") 
          .appendField(new ColorWheelField("#ff0000"), "COLOR")
          this.setPreviousStatement(true, null);
          this.setNextStatement(true, null);
          this.setTooltip('Change the color of the Leds');
    }
  };
  
   //Set all Led
  Blockly.Blocks['all_led_control'] = {
      init: function() {
        this.setColour("#5508F9");
        this.appendDummyInput()
            .appendField("Set All Leds to")
            .appendField(new ColorWheelField("#ff0000"), "COLOR")
            this.setPreviousStatement(true, null);
            this.setNextStatement(true, null);
            this.setTooltip('Change the color of all the Leds');
      }
    };
    
    Blockly.Blocks['testled_control'] = {
      init: function () {
        this.setColour("#5508F9");
        this.appendDummyInput()
          .appendField("Set LED")
          .appendField(new ColorGridField(), "value");
          this.setPreviousStatement(true);
        this.setNextStatement(true);
        this.setTooltip('Set a 5x7 LED matrix with any color.');
      }
    };
  //Clear all Leds
  Blockly.Blocks['clear_all_led'] = {
      init: function() {
        this.setColour("#5508F9");
        this.appendDummyInput()
            .appendField("Clear All Leds")
            this.setPreviousStatement(true, null);
            this.setNextStatement(true, null);
            this.setTooltip('Change the color of all the Leds');
      }
    };
    
   //Play Led Sequence
   Blockly.Blocks['led_sequence'] = {
      init: function() {
        this.setColour("#5508F9");
        this.appendDummyInput()
            .appendField("Play Led Sequence")
            .appendField(new Blockly.FieldDropdown([
              ['Sequence1', '1'],
              ['Sequence2', '2'],
              ['Sequence3', '3'],
              ['Sequence4', '4'],
              ['Sequence5', '5'],
            ]), 'value');
            this.setPreviousStatement(true, null);
            this.setNextStatement(true, null);
            this.setTooltip('Change the color of all the Leds');
      }
    };
  
  
  //Gripper 
   Blockly.Blocks['move_gripper'] = {
    init: function() {
      this.setColour("#5508F9");
      this.appendDummyInput()
          .appendField("Gripper open ")          
          .appendField(new Blockly.FieldNumber(), 'l')
          .appendField("cm")
          this.setPreviousStatement(true, null);
          this.setNextStatement(true, null);
          this.setTooltip('Change the color of all the Leds');
    }
  };
  
    //Play Buzzer Frequency
    Blockly.Blocks['buzzer'] = {
      init: function() {
        this.setColour("#5508F9");
        this.appendDummyInput()
            .appendField("Play Buzzer at Frequency")
            .appendField(new Blockly.FieldNumber(), 'frequency')
            .appendField("(Hz) for")
            .appendField(new Blockly.FieldNumber(), 'duration')
            .appendField("seconds")
            this.setPreviousStatement(true, null);
            this.setNextStatement(true, null);
            this.setTooltip('Change the color of all the Leds');
      }
    };
    
  //Play Buzzer Sequence   
  Blockly.Blocks['buzzer_preset'] = {
      init: function() {
        this.setColour("#5508F9");
        this.appendDummyInput()
            .appendField("Play Buzzer Sequence")
            .appendField(new Blockly.FieldDropdown([
              ['Sequence1', '1'],
              ['Sequence2', '2'],
              ['Sequence3', '3'],
              ['Sequence4', '4'],
              ['Sequence5', '5'],
            ]), 'value');
            this.setPreviousStatement(true, null);
            this.setNextStatement(true, null);
            this.setTooltip('Change the color of all the Leds');
      }
    };
  
  //move forward
  Blockly.Blocks['move_forward'] = {
    init: function() {
      this.setColour("#19CF40");
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
      this.setColour("#19CF40");
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
      this.setColour("#19CF40");
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
      this.setColour("#19CF40");
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
      this.setColour("#19CF40");
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
      this.setColour("#19CF40");
      this.appendDummyInput()
          .appendField('Dog Situp');
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setTooltip('Turn the specified number of degrees');
    }
  };
  
  // Delay Block
  Blockly.Blocks['delay'] = {
    init: function() {
      this.setColour("#2CC042");
      this.appendDummyInput()
          .appendField('Delay')
          .appendField(new Blockly.FieldTextInput('1000'), 'ms')
          .appendField('Milliseconds');
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setTooltip('Turn the specified number of degrees');
    }
  };
  
  // Calibrate Block
  Blockly.Blocks['calibrate'] = {
    init: function() {
      this.setColour("#19CF40");
      this.appendDummyInput()
          .appendField('Calibrate');
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setTooltip('Turn the specified number of degrees');
    }
  };
  
  //Leg Control
  Blockly.Blocks['leg_control'] = {
    init: function() {
      this.setColour("#19CF40"); // Specify the block's color
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
  
  //Move Left
  Blockly.Blocks['move_left'] = {
    init: function() {
      this.setColour("#5508F9");
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
      this.setColour("#5508F9");
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
      this.setColour("#5508F9");
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
      this.setColour("#5508F9");
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
      this.setColour("#5508F9");
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
      this.setColour("#5508F9");
      this.appendDummyInput()
          .appendField('Situp');
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setTooltip('Turn the specified number of degrees');
    }
  };
  
  //servo
  Blockly.Blocks['servo'] = {
    init: function() {
      this.setColour("#5508F9");
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
  
  Blockly.Blocks['walker_leg_control'] = {
    init: function() {
      this.setColour("#5508F9"); // Specify the block's color
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
  Blockly.Blocks['Button'] = {
    init: function() {
      this.setColour("#5508F9");
      this.appendDummyInput()
          .appendField(new Blockly.FieldDropdown([
            ['ButtonL', 'ButtonL'],
            ['ButtonR', 'ButtonR'],
          ]), 'button');
           this.appendDummyInput()
          .appendField(new Blockly.FieldDropdown([
            ['Clicked', '1'],
            ['Not Clicked', '0'],
          ]), 'value');
      this.setOutput(true, 'Boolean');
      this.setTooltip('This is a custom block with a dropdown field');
    }
    };