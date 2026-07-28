import * as Blockly from 'blockly/core';

Blockly.Blocks['cayosetvibration'] = {
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
            ["IO2", '39'],
            ["IO3", '13'],
            ["IO4", '38'],
            ["IO5", '14'],
            ["IO6", '48'],
            ["IO7", '42'],
            ["IO8", '5'],
          ]), 'value')
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setTooltip('Set the mode of a pin');
      
    }
  };
Blockly.Blocks['cayosettouch'] = {
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
            ["IO2", '39'],
            ["IO3", '13'],
            ["IO4", '38'],
            ["IO5", '14'],
            ["IO6", '48'],
            ["IO7", '42'],
            ["IO8", '5'],
          ]), 'value')
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setTooltip('Set the mode of a pin');
      
    }
  };  

Blockly.Blocks['cayosetrelay'] = {
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
            ["IO2", '39'],
            ["IO3", '13'],
            ["IO4", '38'],
            ["IO5", '14'],
            ["IO6", '48'],
            ["IO7", '42'],
            ["IO8", '5'],
          ]), 'value')
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setTooltip('Set the mode of a pin');
      
    }
  };  

  Blockly.Blocks['cayosetgas'] = {
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
        ["IO5", '14'],
        ["IO8", '5'],
          ]), 'value')
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setTooltip('Set the mode of a pin');
      
    }
  };  
  
  Blockly.Blocks['cayosetsoilmoisture'] = {
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
            ["IO5", '14'],
            ["IO8", '5'],
          ]), 'value')
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setTooltip('Set the mode of a pin');
      
    }
  };    

    Blockly.Blocks['cayoVibration'] = {
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
    
      Blockly.Blocks['cayoTouch'] = {
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
    
      Blockly.Blocks['cayoGas'] = {
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
        
      Blockly.Blocks['cayoSoil'] = {
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
                
        
     Blockly.Blocks['cayoRelayOn'] = {
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
     
               Blockly.Blocks['cayoRelayOff'] = {
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

Blockly.Blocks['cayosetsound'] = {
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
                    ["IO2", '39'],
                    ["IO3", '13'],
                    ["IO4", '38'],
                    ["IO5", '14'],
                    ["IO6", '48'],
                    ["IO7", '42'],
                    ["IO8", '5'],
                     ]), 'value')
                 this.setPreviousStatement(true, null);
                 this.setNextStatement(true, null);
                 this.setTooltip('Set the mode of a pin');
                }
                };              
                          
Blockly.Blocks['cayoSound'] = {
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
 
Blockly.Blocks['cayoOleddisplay'] = {
    init: function() {
      this.setColour("#FF12A0");
      this.appendDummyInput()
          .appendField('Setup OLED Display')
          this.appendDummyInput()
          .appendField('SDA')
          .appendField(new Blockly.FieldDropdown([
            ["IO1", '4'],
            ["IO2", '39'],
            ["IO3", '13'],
            ["IO4", '38'],
            ["IO5", '14'],
            ["IO6", '48'],
            ["IO7", '42'],
            ["IO8", '5'],
          ]), 'sda')
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

Blockly.Blocks['oled_set_cursor'] = {
  init: function() {
    this.setColour("#FF12A0");

    this.appendDummyInput()
        .appendField('OLED Set Cursor')
        .appendField('X')
        .appendField(new Blockly.FieldNumber(0) ,'x')
        .appendField('Y')
        .appendField(new Blockly.FieldNumber(0), 'y');

    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setTooltip('Set cursor position on OLED display');
  }
};


Blockly.Blocks['oled_set_font_size'] = {
  init: function() {
    this.setColour("#FF12A0");

    this.appendDummyInput()
        .appendField('OLED Set Font Size')
        .appendField(new Blockly.FieldNumber(1), 'size');

    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setTooltip('Set font size for OLED display');
  }
};

 Blockly.Blocks['oled_clear'] = {
    init: function() {
      this.setColour("#FF12A0");
      this.appendDummyInput()
          .appendField('OLED Clear')
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);        
      this.setTooltip("Skips the remaining statements in the loop and continues to the next iteration.");
    }
  }   


  Blockly.Blocks['oled_print'] = {
      init: function() {
        this.setColour("#FF12A0");
        this.appendValueInput("CONTENT", 'Number')
            .appendField("Oled Print");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setTooltip('Prints data to the console/serial port as human-readable ASCII text.');
      }
    };
  
    Blockly.Blocks['lcd_print'] = {
      init: function() {
        this.setColour("#FF12A0");
        this.appendValueInput("CONTENT", 'Number')
            .appendField("LCD Print");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setTooltip('Prints data to the console/serial port as human-readable ASCII text.');
      }
    };
     