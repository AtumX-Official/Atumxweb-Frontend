import * as Blockly from 'blockly/core';
import { intergerlimit,speedlimit } from '../inputvalidator';
Blockly.Blocks['setupMotor'] = {
  init: function() {
    this.setColour("#4787FF");
    this.appendDummyInput()
          .appendField('Setup')
          .appendField(new Blockly.FieldDropdown([
            ['Motor1', 'Motor1'],
            ['Motor2', 'Motor2'],
            ['Motor3', 'Motor3'],
            ['Motor4', 'Motor4'],
          ]), 'ID')
    this.appendDummyInput()
       .appendField("MA")
      .appendField(new Blockly.FieldDropdown([
        ["IO1", '1'], ["IO2", '2'], ["IO3", '42'], ["IO4", '41'],
        ["IO5", '39'], ["IO6", '40'], ["IO7", '10'], ["IO8", '9'],
        ["IO9", '18'], ["IO10", '17'], ["IO11", '16'], ["IO12", '15'],
        ["IO13", '7'], ["IO14", '6'], ["IO15", '5'], ["IO16", '4'],
      ]), 'MA');
    this.appendDummyInput()
        .appendField("MB")
      .appendField(new Blockly.FieldDropdown([
        ["IO1", '1'], ["IO2", '2'], ["IO3", '42'], ["IO4", '41'],
        ["IO5", '39'], ["IO6", '40'], ["IO7", '10'], ["IO8", '9'],
        ["IO9", '18'], ["IO10", '17'], ["IO11", '16'], ["IO12", '15'],
        ["IO13", '7'], ["IO14", '6'], ["IO15", '5'], ["IO16", '4'],
      ]), 'MB');
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setTooltip('Setup motor with 4 pin dropdowns');
  }
};

 Blockly.Blocks['sfsetupMotor'] = {
      init: function() {
        this.setColour("#4787FF");
        this.appendDummyInput()
        .appendField('Setup')
        .appendField(new Blockly.FieldDropdown([
          ['Motor1', 'Motor1'],
          ['Motor2', 'Motor2'],
          ['Motor3', 'Motor3'],
          ['Motor4', 'Motor4'],
        ]), 'ID')    
        // Dropdown 1
        this.appendDummyInput()
          .appendField("MA")
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
          ]), 'MA');
            this.appendDummyInput()
            .appendField("MB")
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
          ]), 'MB');
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setTooltip('Setup motor with 4 pin dropdowns');
      }
    };


Blockly.Blocks['cayosetupMotor'] = {
         init: function() {
           this.setColour("#4787FF");
           this.appendDummyInput()
           .appendField('Setup')
           .appendField(new Blockly.FieldDropdown([
             ['Motor1', 'Motor1'],
             ['Motor2', 'Motor2'],
             ['Motor3', 'Motor3'],
             ['Motor4', 'Motor4'],
           ]), 'ID')       
           this.appendDummyInput()
               .appendField("MA")
             .appendField(new Blockly.FieldDropdown([
              ["IO1", '4'],
              ["IO2", '39'],
              ["IO3", '13'],
              ["IO4", '38'],
              ["IO5", '14'],
              ["IO6", '48'],
              ["IO7", '42'],
              ["IO8", '5'],
             ]), 'MA');
            this.appendDummyInput()
               .appendField("MB")
             .appendField(new Blockly.FieldDropdown([
              ["IO1", '4'],
              ["IO2", '39'],
              ["IO3", '13'],
              ["IO4", '38'],
              ["IO5", '14'],
              ["IO6", '48'],
              ["IO7", '42'],
              ["IO8", '5'],
             ]), 'MB');       
           this.setPreviousStatement(true, null);
           this.setNextStatement(true, null);
           this.setTooltip('Setup motor with 4 pin dropdowns');
         }
       };    


   
      Blockly.Blocks['runMotorsubu'] = {
        init: function () {
          this.setColour("#2926DC");
      
          this.appendDummyInput('DIR_INPUT')
            .appendField('Direction')
            .appendField(
              new Blockly.FieldDropdown(
                [
                  ["Forward", 'F'],
                  ["Backward", 'B'],
                  ["Left", 'L'],
                  ["Right", 'R'],
                  ["Stop", 'S'],
                ],
                (newValue) => this.updateSpeedVisibility_(newValue)
              ),
              'dir'
            );
      
          this.appendDummyInput('SPEED_INPUT')
            .appendField('Speed')
            .appendField(
              new Blockly.FieldTextInput('0', speedlimit),
              'speed'
            );
      
          this.setPreviousStatement(true);
          this.setNextStatement(true);
          this.setTooltip('Run motor with direction and speed');
      
          // Initial state
          this.updateSpeedVisibility_(this.getFieldValue('dir'));
        },
      
        /** ✅ SAVE MUTATION STATE */
        saveExtraState: function () {
          return {
            dir: this.getFieldValue('dir')
          };
        },
      
        /** ✅ RESTORE MUTATION STATE (CALLED ON IMPORT) */
        loadExtraState: function (state : {dir? : string}) : void {
          if (state?.dir) {
            this.setFieldValue(state.dir, 'dir');
            this.updateSpeedVisibility_(state.dir);
          }
        },
      
        /** ✅ SINGLE SOURCE OF SHAPE CHANGE */
        updateSpeedVisibility_: function (dir : string) : void {
          const speedInput = this.getInput('SPEED_INPUT');
          const speedField = this.getField('speed');
          if (!speedInput || !speedField) return;
      
          if (dir === 'S') {
            speedField.setValue('0');
            speedInput.setVisible(false);
          } else {
            speedInput.setVisible(true);
          }
        }
      };
      
      Blockly.Blocks['setupjoystick'] = {
        init:function(){
          this.setColour("#FF7104");
          this.appendDummyInput()
         .appendField('Setup Joystick')
         this.appendDummyInput()  
         .appendField('Pin x')
         .appendField(new Blockly.FieldDropdown([
          ["IO1", '4'],
          ["IO5", '14'],
          ["IO8", '5'],
          ]), 'pinX')
         this.appendDummyInput() 
         .appendField('Pin y')
         .appendField(new Blockly.FieldDropdown([
          ["IO1", '4'],
          ["IO5", '14'],
          ["IO8", '5'],
          ]), 'pinY') 
         this.setPreviousStatement(true, null);
         this.setNextStatement(true, null);
        this.setTooltip('Write a digital value to a pin');
         }
        } 
        Blockly.Blocks['joystickread']={
         init:function(){
          this.setColour("#FF7104");
          this.appendDummyInput()
          .appendField('Joystick axis')
          .appendField(new Blockly.FieldDropdown([
            ["X", 'X'],
            ["Y", 'Y'],          
            ]), 'axis') 
            this.setOutput(true, 'Number');
            this.setInputsInline(true); // inputs appear on the same line
        }
        }
              
    
        Blockly.Blocks["runMotor"] = {
          init: function () {
            this.setColour("#4787FF");
        
            this.appendDummyInput()
              .appendField("Run")
              .appendField(
                new Blockly.FieldDropdown([
                  ["Motor1", "Motor1"],
                  ["Motor2", "Motor2"],
                  ["Motor3", "Motor3"],
                  ["Motor4", "Motor4"],
                ]),
                "ID"
              );
        
            this.appendDummyInput("DIR_INPUT")
              .appendField("Direction")
              .appendField(
                new Blockly.FieldDropdown(
                  [
                    ["Forward", "F"],
                    ["Backward", "B"],
                    ["Stop", "S"],
                  ],
                  (newValue) => {
                    this.updateSpeedVisibility_(newValue);
                    return newValue;
                  }
                ),
                "dir"
              );
        
            // ✅ BLOCK INPUT instead of text field
            this.appendValueInput("SPEED_INPUT")
              .setCheck(null)
              .appendField("Speed");
        
            this.setPreviousStatement(true, null);
            this.setNextStatement(true, null);
        
            this.setInputsInline(true);
        
            this.setTooltip("Run selected motor with direction and speed");
        
            // Initial visibility
            this.updateSpeedVisibility_(this.getFieldValue("dir"));
          },
        
          /** SAVE STATE */
          saveExtraState: function () {
            const speedInput = this.getInput("SPEED_INPUT");
            const targetBlock = speedInput?.connection?.targetBlock();
        
            return {
              dir: this.getFieldValue("dir"),
              hasSpeedBlock: !!targetBlock,
            };
          },
        
          /** RESTORE STATE */
          loadExtraState: function (state : {dir? : string}) : void {
            if (state?.dir) {
              this.setFieldValue(state.dir, "dir");
        
              setTimeout(() => {
                this.updateSpeedVisibility_(state.dir);
              }, 0);
            }
          },
        
          /** SHOW/HIDE SPEED INPUT */
          updateSpeedVisibility_: function (dir : string) : void {
            const speedInput = this.getInput("SPEED_INPUT");
        
            if (!speedInput) return;
        
            speedInput.setVisible(dir !== "S");
          },
        };

    Blockly.Blocks["subumotorset"] = {
      init: function() {
        this.setColour("#2926DC");
        this.appendDummyInput()
            .appendField('Setup Motor Expansion')
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);        
        this.setTooltip("Skips the remaining statements in the loop and continues to the next iteration.");
      }
    }  
         
    Blockly.Blocks["subumotorpwm"] = {
      init: function () {
     this.setColour("#2926DC");
    this.appendDummyInput()
     .appendField("Motor Expansion-PWM");
     
    this.appendDummyInput()
     .appendField("M1A")
     .appendField(new Blockly.FieldTextInput("0", intergerlimit), "M1A");
    
    this.appendDummyInput()
     .appendField("M1B")
     .appendField(new Blockly.FieldTextInput("0", intergerlimit), "M1B");
     
    this.appendDummyInput()
     .appendField("M2A")
     .appendField(new Blockly.FieldTextInput("0", intergerlimit), "M2A");
    this.appendDummyInput()
     .appendField("M2B")
     .appendField(new Blockly.FieldTextInput("0", intergerlimit), "M2B");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setTooltip("Write PWM values to motor channels");
    },
    onchange: function (event : Blockly.Events.Abstract) {
    if (!event || event.type !== Blockly.Events.BLOCK_CHANGE) return;
    if ((event as Blockly.Events.BlockChange).blockId !== this.id) return;

    const changeEvent = event as Blockly.Events.BlockChange;
    if (changeEvent.blockId !== this.id) return;

    const enforcePair = (a : string, b : string) => {
     const fieldA = this.getField(a);
     const fieldB = this.getField(b);
    
     if (!fieldA || !fieldB) return;
      
     const valA = Number(fieldA.getValue()) || 0;
     const valB = Number(fieldB.getValue()) || 0;
    
     // If A > 0 → B = 0
     if (changeEvent.name === a && valA > 0 && valB !== 0) {
     fieldB.setValue("0");
     }
     // If B > 0 → A = 0
     if (changeEvent.name === b && valB > 0 && valA !== 0) {
     fieldA.setValue("0");
     }
    };
 
    enforcePair("M1A", "M1B");
    enforcePair("M2A", "M2B");
     }
     };  

    Blockly.Blocks["motorrunpwm"] = {
      init: function() {
        this.setColour("#4787FF");
        this.appendDummyInput()
              .appendField('Motor PWM')
              .appendField(new Blockly.FieldDropdown([
                ['Motor1', 'Motor1'],
                ['Motor2', 'Motor2'],
                ['Motor3', 'Motor3'],
                ['Motor4', 'Motor4'],
              ]), 'ID')
        this.appendDummyInput()
           .appendField("MA")
           .appendField(new Blockly.FieldTextInput('', intergerlimit),'MA')   
           this.appendDummyInput()
        .appendField("MB")
        .appendField(new Blockly.FieldTextInput('', intergerlimit),'MB') 
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
       this.setTooltip('Write a digital value to a pin');  
            }
    }  

    Blockly.Blocks['subumotorrun'] = {
      init: function () {
        this.setColour("#2926DC");
    
        this.appendDummyInput('DIR_INPUT')
          .appendField('Direction')
          .appendField(
            new Blockly.FieldDropdown(
              [
                ["Forward", 'F'],
                ["Backward", 'B'],
                ["Left", 'L'],
                ["Right", 'R'],
                ["Stop", 'S'],
              ],
              (newValue) => {
                this.updateSpeedVisibility_(newValue);
                return newValue;
              }
            ),
            'dir'
          );
    
        this.appendValueInput('SPEED_INPUT')
          .setCheck(null)
          .appendField('Speed');
    
        this.setPreviousStatement(true);
        this.setNextStatement(true);
        this.setInputsInline(true); // <-- keeps both in single line
        this.setTooltip('Run motor with direction and speed');
      },
    
      saveExtraState: function () {
        const speedInput = this.getInput('SPEED_INPUT');
        const targetBlock = speedInput?.connection?.targetBlock();
      
        return {
          dir: this.getFieldValue('dir'),
          hasSpeedBlock: !!targetBlock,
        };
      },
    
      loadExtraState: function (state : {dir? : string}) : void {
        if (state?.dir) {
          this.setFieldValue(state.dir, 'dir');
      
          // Delay so Blockly finishes reconnecting inputs first
          setTimeout(() => {
            this.updateSpeedVisibility_(state.dir);
          }, 0);
        }
      },
    
      updateSpeedVisibility_: function (dir : string) : void {
        const speedInput = this.getInput('SPEED_INPUT');
        if (!speedInput) return;
    
        speedInput.setVisible(dir !== 'S');
    
        
      }
    };

    Blockly.Blocks['stemrobosetupMotor'] = {
      init: function() {
        this.setColour("#4787FF");
        this.appendDummyInput()
              .appendField('Setup')
              .appendField(new Blockly.FieldDropdown([
                ['Motor1', 'Motor1'],
                ['Motor2', 'Motor2'],
                ['Motor3', 'Motor3'],
                ['Motor4', 'Motor4'],
              ]), 'ID')
        this.appendDummyInput()
           .appendField("MA")
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
          ]), 'MA');
        this.appendDummyInput()
            .appendField("MB")
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
          ]), 'MB');
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setTooltip('Setup motor with 4 pin dropdowns');
      }
    };