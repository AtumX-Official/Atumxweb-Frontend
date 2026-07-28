import * as Blockly from 'blockly/core';

Blockly.Blocks['sfsetvibration'] = {
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
          ]), 'value')
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setTooltip('Set the mode of a pin');
      
    }
  };

  //digital
Blockly.Blocks['sfsettouch'] = {
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
          ]), 'value')
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setTooltip('Set the mode of a pin');
      
    }
  };  

Blockly.Blocks['sfsetrelay'] = {
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
          ]), 'value')
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setTooltip('Set the mode of a pin');
      
    }
  };  

  Blockly.Blocks['sfsetgas'] = {
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
            ["IO1", '0'],
            ["IO2", '1'],
            ["IO8", '6'],
            ["IO13", '12'],
            ["IO14", '13'],
            ["IO15", '15'],
            ["IO16", '14'],
            ["IO18",'22'],
            ["IO19",'25'],
            ["IO20",'24'],
            ["IO21",'27'],
            ["IO22",'26'],
            ["IO23",'29'],
            ["IO24",'28'],
          ]), 'value')
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setTooltip('Set the mode of a pin');
      
    }
  };  
  
  Blockly.Blocks['sfsetsoilmoisture'] = {
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
            ["IO1", '0'],
            ["IO2", '1'],
            ["IO8", '6'],
            ["IO13", '12'],
            ["IO14", '13'],
            ["IO15", '15'],
            ["IO16", '14'],
            ["IO18",'22'],
            ["IO19",'25'],
            ["IO20",'24'],
            ["IO21",'27'],
            ["IO22",'26'],
            ["IO23",'29'],
            ["IO24",'28'],
          ]), 'value')
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setTooltip('Set the mode of a pin');
      
    }
  };    

   Blockly.Blocks['sfVibration'] = {
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
  
    Blockly.Blocks['sfTouch'] = {
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
  
    Blockly.Blocks['sfGas'] = {
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
      
    Blockly.Blocks['sfSoil'] = {
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
              
      
   Blockly.Blocks['sfRelayOn'] = {
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
   
             Blockly.Blocks['sfRelayOff'] = {
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

             Blockly.Blocks['sfsetsound'] = {
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
                        ["IO1", '0'],
                        ["IO2", '1'],
                        ["IO8", '6'],
                        ["IO13", '12'],
                        ["IO14", '13'],
                        ["IO15", '15'],
                        ["IO16", '14'],
                        ["IO18",'22'],
                        ["IO19",'25'],
                        ["IO20",'24'],
                        ["IO21",'27'],
                        ["IO22",'26'],
                        ["IO23",'29'],
                        ["IO24",'28'],
                     ]), 'value')
                     this.setPreviousStatement(true, null);
                     this.setNextStatement(true, null);
                     this.setTooltip('Set the mode of a pin');
                         }
                      };              
             
             Blockly.Blocks['sfSound'] = {
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
     
Blockly.Blocks['sfOleddisplay'] = {
    init: function() {
      this.setColour("#F98A08");
      this.appendDummyInput()
          .appendField('Setup OLED Display')
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
          ]), 'sda')
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
          ]), 'scl');
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setTooltip('Setup an OLED Display');
    }
};                         