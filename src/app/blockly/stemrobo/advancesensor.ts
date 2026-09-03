import * as Blockly from 'blockly/core';

Blockly.Blocks['stemrobosetvibration'] = {
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
          ]), 'value')
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setTooltip('Set the mode of a pin');
      
    }
  };
Blockly.Blocks['stemrobosettouch'] = {
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
          ]), 'value')
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setTooltip('Set the mode of a pin');
      
    }
  };  

Blockly.Blocks['stemrobosetrelay'] = {
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
          ]), 'value')
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setTooltip('Set the mode of a pin');
      
    }
  };  

  Blockly.Blocks['stemrobosetgas'] = {
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
            ["IO1", '4'],
            ["IO2", '5'],
            ["IO3", '6'],
            ["IO4", '7'],
            ["IO11", '2'],
            ["IO12", '1'],
          ]), 'value')
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setTooltip('Set the mode of a pin');
      
    }
  };  
  
  Blockly.Blocks['stemrobosetsoilmoisture'] = {
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
        ["IO1", '4'],
        ["IO2", '5'],
        ["IO3", '6'],
        ["IO4", '7'],
        ["IO11", '2'],
        ["IO12", '1'],
          ]), 'value')
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setTooltip('Set the mode of a pin');
      
    }
  };    

    Blockly.Blocks['stemroboVibration'] = {
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
    
      Blockly.Blocks['stemroboTouch'] = {
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
    
      Blockly.Blocks['stemroboGas'] = {
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
        
      Blockly.Blocks['stemroboSoil'] = {
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
                
        
     Blockly.Blocks['stemroboRelayOn'] = {
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
     
               Blockly.Blocks['stemroboRelayOff'] = {
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

Blockly.Blocks['stemrobosetsound'] = {
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
                     ]), 'value')
                 this.setPreviousStatement(true, null);
                 this.setNextStatement(true, null);
                 this.setTooltip('Set the mode of a pin');
                }
                };              
                          
               Blockly.Blocks['stemroboSound'] = {
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
 
Blockly.Blocks['stemroboOleddisplay'] = {
    init: function() {
      this.setColour("#FF12A0");
      this.appendDummyInput()
          .appendField('Setup OLED Display')
          this.appendDummyInput()
          .appendField('SDA')
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
          ]), 'sda')
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
          ]), 'scl')
      .appendField(new Blockly.FieldDropdown([
            ["0.96", '0'],
            ["1.3", '1'],
          ]), 'inch')
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setTooltip('Setup an OLED Display');
    }
};                       