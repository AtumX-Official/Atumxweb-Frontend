import * as Blockly from 'blockly/core';
import { intergerlimit } from '../inputvalidator';
Blockly.Blocks['360ServoR'] = {
    init: function() {
      this.setColour("#4787FF");
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
  
Blockly.Blocks['360ServoS'] = {
    init: function() {
      this.setColour("#4787FF");
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
  
Blockly.Blocks['setvibration'] = {
      init: function() {
        this.setColour("#FF7104");
        this.appendDummyInput()
            .appendField('Setup')
            .appendField(new Blockly.FieldDropdown([
              ['Vibration1', 'V1'],
              ['Vibration2', 'V2'],
              ['Vibration3', 'V3'],
            ]), 'ID')
            .appendField('pin')
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
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setTooltip('Set the mode of a pin');
        
      }
    };
  
    //digital
Blockly.Blocks['settouch'] = {
      init: function() {
        this.setColour("#FF7104");
        this.appendDummyInput()
            .appendField('Setup')
            .appendField(new Blockly.FieldDropdown([
              ['Touch1', 'T1'],
              ['Touch2', 'T2'],
              ['Touch3', 'T3'],
            ]), 'ID')
            .appendField('pin')
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
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setTooltip('Set the mode of a pin');
        
      }
    };  
  
Blockly.Blocks['setrelay'] = {
      init: function() {
        this.setColour("#4787FF");
        this.appendDummyInput()
        .appendField('Setup')
        .appendField(new Blockly.FieldDropdown([
          ['Relay1', 'R1'],
          ['Relay2','R2'],
          ['Relay3', 'R3'],
        ]), 'ID')
        .appendField('pin')          
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
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setTooltip('Set the mode of a pin');
        
      }
    };  
    
Blockly.Blocks['setgas'] = {
      init: function() {
        this.setColour("#FF7104");
        this.appendDummyInput()
        .appendField('Setup')          
        .appendField(new Blockly.FieldDropdown([
          ['Gas1', 'G1'],
          ['Gas2', 'G2'],
          ['Gas3', 'G3'],
        ]), 'ID')
        .appendField('pin')          
        .appendField(new Blockly.FieldDropdown([
              ["IO1", '1'],
              ["IO2", '2'],
              ["IO8", '9'],
              ["IO13", '7'],
              ["IO14", '6'],
              ["IO15", '5'],
              ["IO16", '4'],
            ]), 'value')
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setTooltip('Set the mode of a pin');
        
      }
    };  
    
Blockly.Blocks['setsoilmoisture'] = {
      init: function() {
        this.setColour("#FF7104");
        this.appendDummyInput()
        .appendField('Setup')
        .appendField(new Blockly.FieldDropdown([
          ['SoilMoisture1', 'SO1'],
          ['SoilMoisture2','SO2'],
          ['SoilMoisture3', 'SO3'],
        ]), 'ID')
        .appendField('pin')             
        .appendField(new Blockly.FieldDropdown([
              ["IO1", '1'],
              ["IO2", '2'],
              ["IO8", '9'],
              ["IO13", '7'],
              ["IO14", '6'],
              ["IO15", '5'],
              ["IO16", '4'],
            ]), 'value')
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setTooltip('Set the mode of a pin');
        
      }
    };    
  
Blockly.Blocks['Vibration'] = {
      init: function() {
        this.setColour("#FF7104");
        this.appendDummyInput()
            .appendField(new Blockly.FieldDropdown([
              ['Vibration1', 'V1'],
              ['Vibration2', 'V2'],
              ['Vibration3', 'V3'],
            ]), 'VIB_ID');
        this.setOutput(true, 'Number');
        this.setTooltip('This is a custom block with a dropdown field');
      }
      };
  
Blockly.Blocks['Touch'] = {
        init: function() {
          this.setColour("#FF7104");
          this.appendDummyInput()
              .appendField(new Blockly.FieldDropdown([
                ['Touch1', 'T1'],
                ['Touch2', 'T2'],
                ['Touch3', 'T3'],
              ]), 'value');
          this.setOutput(true, 'Number');
          this.setTooltip('This is a custom block with a dropdown field');
        }
        };
  
Blockly.Blocks['Gas'] = {
          init: function() {
            this.setColour("#FF7104");
            this.appendDummyInput()
                .appendField(new Blockly.FieldDropdown([
                  ['Gas1', 'G1'],
                  ['Gas2', 'G2'],
                  ['Gas3', 'G3'],
                ]), 'value');
            this.setOutput(true, 'Number');
            this.setTooltip('This is a custom block with a dropdown field');
          }
          };
      
Blockly.Blocks['Soil'] = {
            init: function() {
              this.setColour("#FF7104");
              this.appendDummyInput()
                  .appendField(new Blockly.FieldDropdown([
                    ['SoilMoisture1', 'SO1'],
                    ['SoilMoisture2', 'SO2'],
                    ['SoilMoisture3', 'SO3'],
                  ]), 'value');
              this.setOutput(true, 'Number');
              this.setTooltip('This is a custom block with a dropdown field');
            }
            };
              
  
Blockly.Blocks['RelayOn'] = {
              init: function() {
                this.setColour("#4787FF");
                this.appendDummyInput()
                .appendField(new Blockly.FieldDropdown([
                  ['Relay1', 'R1'],
                  ['Relay2', 'R2'],
                  ['Relay3', 'R3'],
                ]), 'value')
                .appendField('On')
                this.setPreviousStatement(true, null);
                this.setNextStatement(true, null);
                this.setTooltip('This is a custom block with a dropdown field');
                this.setInputsInline(true);
              }
            };         
  
Blockly.Blocks['RelayOff'] = {
              init: function() {
                this.setColour("#4787FF");
                this.appendDummyInput()
                .appendField(new Blockly.FieldDropdown([
                  ['Relay1', 'R1'],
                  ['Relay2', 'R2'],
                  ['Relay3', 'R3'],
                ]), 'value')
                .appendField('Off')
                this.setPreviousStatement(true, null);
                this.setNextStatement(true, null);
                this.setTooltip('This is a custom block with a dropdown field');
                this.setInputsInline(true);
              }
            };               

Blockly.Blocks['setsound'] = {
    init: function() {
        this.setColour("#FF7104");
        this.appendDummyInput()
        .appendField('Setup')
        .appendField(new Blockly.FieldDropdown([
         ['Sound1', 'S1'],
         ['Sound2', 'S2'],
         ['Sound2', 'S3'],
        ]), 'ID')
        .appendField('pin')
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
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setTooltip('Set the mode of a pin');
            }
         };              

Blockly.Blocks['Sound'] = {
         init: function() {
        this.setColour("#FF7104");
        this.appendDummyInput()
       .appendField(new Blockly.FieldDropdown([
        ['Sound1', 'S1'],
        ['Sound2', 'S2'],
        ['Sound3', 'S3'],
         ]), 'value');
        this.setOutput(true, 'Number');
        this.setTooltip('This is a custom block with a dropdown field');
        }
        };         

Blockly.Blocks['Oleddisplay'] = {
    init: function() {
      this.setColour("#FF12A0");
      this.appendDummyInput()
          .appendField('Setup OLED Display')
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
          .appendField('inch')
          .appendField(new Blockly.FieldDropdown([
            ["0.96", '0'],
            ["1.3", '1'],
          ]), 'inch')
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setTooltip('Setup an OLED Display');
    }
};         

Blockly.Blocks['Display'] = {
  init: function() {
    this.setColour("#FF12A0");
    this.appendDummyInput()
        .appendField('OLED - Display text')
        .appendField(new Blockly.FieldTextInput(''), 'text')
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setTooltip('Setup an OLED Display');
  }
};         

Blockly.Blocks['happy'] = {
      init: function() {
        this.setColour("#FF12A0");
        this.appendDummyInput()
            .appendField("OLED - Happy")
            this.setPreviousStatement(true, null);
            this.setNextStatement(true, null);
            this.setTooltip('Change the color of all the Leds');
      }
    };
  
    Blockly.Blocks['alarm'] = {
      init: function() {
        this.setColour("#FF12A0");
        this.appendDummyInput()
            .appendField("OLED - Alarm")
            this.setPreviousStatement(true, null);
            this.setNextStatement(true, null);
            this.setTooltip('Change the color of all the Leds');
      }
    };    
   
    Blockly.Blocks['conf'] = {
      init: function() {
        this.setColour("#FF12A0");
        this.appendDummyInput()
            .appendField("OLED - Confetti")
            this.setPreviousStatement(true, null);
            this.setNextStatement(true, null);
            this.setTooltip('Change the color of all the Leds');
      }
    };      

   
    Blockly.Blocks['displaytext'] = {
      init: function() {
        this.setColour("#FF7104");
        this.appendDummyInput()
            .appendField("Text")
            this.setPreviousStatement(true, null);
            this.setNextStatement(true, null);
            this.setTooltip('Change the color of all the Leds');
      }
    };     