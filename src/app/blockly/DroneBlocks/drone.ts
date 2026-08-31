import * as Blockly from 'blockly/core';
import { integervalidatior,intergerlimit } from '../inputvalidator';
import { ColorWheelField } from '../Helper/helperclass';
// Setup Drone Block
Blockly.Blocks['setup_drone'] = {
  init: function() {
    this.setColour("#5508F9");

    this.appendDummyInput()
        .appendField("Setup Drone");

    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);

    this.setTooltip("Initialize and setup the drone");
  }
};

// Move Direction Block
Blockly.Blocks['drone_move_direction'] = {
  init: function() {
    this.setColour("#5508F9");
    
    this.appendDummyInput()
        .appendField("Direction")
        .appendField(new Blockly.FieldDropdown([
          ["Forward", "FORWARD"],
          ["Backward", "BACKWARD"],
          ["Left", "LEFT"],
          ["Right", "RIGHT"],
          ["Up", "UP"],
          ["Down", "DOWN"]
        ]), "DIRECTION")
        .appendField("Speed")
        .appendField(new Blockly.FieldNumber(20, 20, 50), "SPEED") // default 20, min 20, max 50
        .appendField("Seconds")
        .appendField(new Blockly.FieldNumber(1, 0), "SECONDS") // default 1, min 0
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setTooltip("Move the arm in the selected direction");
  }
};

// Pitch Block
Blockly.Blocks['pitch_block'] = {
  init: function() {
    this.setColour("#5508F9");
    this.appendDummyInput()
        .appendField("Pitch");
    this.setOutput(true, null);
  }
};

// Roll Block
Blockly.Blocks['roll_block'] = {
  init: function() {
    this.setColour("#5508F9");
    this.appendDummyInput()
        .appendField("Roll");
    this.setOutput(true, null);
  }
};

// Barometer Block
Blockly.Blocks['barometer_block'] = {
  init: function() {
    this.setColour("#5508F9");
    this.appendDummyInput()
        .appendField("Barometer");
    this.setOutput(true, null);
  }
};

// Yaw Block
Blockly.Blocks['yaw_block'] = {
  init: function() {
    this.setColour("#5508F9");
    this.appendDummyInput()
        .appendField("Yaw");
    this.setOutput(true, null);
  }
};

// Set Motor PWM Block
Blockly.Blocks['set_motor_pwm'] = {
  init: function() {
    this.setColour("#5508F9");

    this.appendDummyInput()
        .appendField("Set")
        .appendField(new Blockly.FieldDropdown([
          ["M1", "DroneM1"],
          ["M2", "DroneM2"],
          ["M3", "DroneM3"],
          ["M4", "DroneM4"]
        ]), "MOTOR")
        .appendField("Speed")
        .appendField(new Blockly.FieldNumber(0, 0, 1000), "PWM");

    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setTooltip("Set selected motor PWM value (0–1000)");
  }
};


Blockly.Blocks['Droneconnect_us1'] = {
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
            ["IO14", '14'],
            ["IO21", '21'],
            ["IO47", '47'],
          ]), 'echo')
          .appendField('Trigger')
          .appendField(new Blockly.FieldDropdown([
            ["IO14", '14'],
            ["IO21", '21'],
            ["IO47", '47'],
          ]), 'trigger');
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setTooltip('Setup an ultrasonic sensor');
    }
};   


Blockly.Blocks['droneservo_init'] = {
  init: function() {
    this.setColour("#FF7104");
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
          ["IO14", '14'],
          ["IO21", '21'],
          ["IO47", '47'],
        ]), 'pin');
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setTooltip('This is a custom block with a dropdown field');
  }
};
 

Blockly.Blocks['droneled'] = {
  init: function() {
    this.setColour("#8726F6");
    this.appendDummyInput()
        .appendField("Set LED")
        .appendField(new Blockly.FieldDropdown([
          ['IO7', '7'],
          ['IO15', '15'],
        ]), 'pin')
        .appendField(new Blockly.FieldDropdown([
          ['ON', 'ON'],
          ['OFF', 'OFF'],
        ]), 'value');
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setTooltip('Change the color of all the Leds');
  }
};

 Blockly.Blocks['droneservo_individual'] = {
    init: function() {
      this.setColour("#FF7104");
  
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
      this.setInputsInline(true);
      this.setOnChange(() => {
        integervalidatior(this, 'ANGLE');
    });
    }
  };


Blockly.Blocks['drone360ServoR'] = {
    init: function() {
      this.setColour("#FF7104");
      this.appendDummyInput()
          .appendField('360° Servo Run')
          .appendField(new Blockly.FieldDropdown([
            ['Servo1', 'Servo1'],
            ['Servo2', 'Servo2'],
            ['Servo3', 'Servo3'],
          ]), 'ID')
          this.appendDummyInput()
          .appendField('Direction')
          .appendField(new Blockly.FieldDropdown([
            ["Clockwise", '0'],
            ["Anticlockwise", '1'],
          ]), 'dir')
          .appendField('Speed')
          .appendField(new Blockly.FieldTextInput('0',intergerlimit),'speed')
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setTooltip('This is a custom block with a dropdown field');
    }
  };
  
Blockly.Blocks['drone360ServoS'] = {
    init: function() {
      this.setColour("#FF7104");
      this.appendDummyInput()
          .appendField('360° Servo Stop')
          .appendField(new Blockly.FieldDropdown([
            ['Servo1', 'Servo1'],
            ['Servo2', 'Servo2'],
            ['Servo3', 'Servo3'],
          ]), 'ID')
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setTooltip('This is a custom block with a dropdown field');
    }
  };  


Blockly.Blocks['dronedigital_read'] = {
    init: function() {
      this.setColour("#B515D9");
      this.appendDummyInput()
          .appendField('Digital Read Pin')
          .appendField(new Blockly.FieldDropdown([
          ["IO14", '14'],
          ["IO21", '21'],
          ["IO47", '47'],
          ]), 'value');
      this.setOutput(true, 'Number');
      this.setTooltip('Read a digital value from a pin');
    }
  };

// Digital Write Block
Blockly.Blocks['dronedigital_write'] = {
    init: function() {
      this.setColour("#B515D9");
      this.appendDummyInput()
          .appendField('Digital Write Pin')
          .appendField(new Blockly.FieldDropdown([
            ["IO14", '14'],
            ["IO21", '21'],
            ["IO47", '47'],
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
Blockly.Blocks['droneanalog_read'] = {
    init: function() {
      this.setColour("#B515D9");
      this.appendDummyInput()
          .appendField('Analog Read Pin')
          .appendField(new Blockly.FieldDropdown([
            ["IO14", '14'],
            ["IO21", '21'],
            ["IO47", '47'],
          ]), 'value');
      this.setOutput(true, 'Number');
      this.setTooltip('Read an analog value from a pin');
      
    }
  };
 
  // Analog Write Block
  Blockly.Blocks['droneanalog_write'] = {
    init: function() {
      this.setColour("#B515D9");
      this.appendDummyInput()
          .appendField('Analog Write Pin')
          .appendField(new Blockly.FieldDropdown([
            ["IO14", '14'],
            ["IO21", '21'],
            ["IO47", '47'],
          ]), 'pin')
          this.appendValueInput('value')
          .setCheck('Number')
          .appendField('value');
      this.setInputsInline(true);
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setTooltip('Write an analog value to a pin');
      this.setOnChange(() => {
        integervalidatior(this, 'value');
      });
    }
  };

// Pin Mode Block
Blockly.Blocks['dronepinmode'] = {
    init: function() {
      this.setColour("#B515D9");
      this.appendDummyInput()
          .appendField('Set pin')
          .appendField(new Blockly.FieldDropdown([
            ["IO14", '14'],
            ["IO21", '21'],
            ["IO47", '47'],
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
    