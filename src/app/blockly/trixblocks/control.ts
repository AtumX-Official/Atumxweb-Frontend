import * as Blockly from 'blockly/core';
import '@blockly/field-bitmap';
import {ColorWheelField,PianoKeyboardField,ColorGridField} from '../Helper/helperclass'
import { integerOnlyValidator,integervalidatior,validateStartEnd } from '../inputvalidator';

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
      this.setColour("#8726F6");
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setTooltip("Play a musical note for a specified duration.");
      this.setHelpUrl("");
    }
  };

  
  // Set Led
  Blockly.Blocks['led_control'] = {
    init: function () {
      this.setColour("#8726F6");
  
      this.appendValueInput('value')
        .setCheck('Number')
        .appendField("Set LED");
  
      this.appendDummyInput()
        .appendField("to")
        .appendField(new ColorWheelField("#ff0000"), "COLOR");
  
      this.setInputsInline(true);
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setTooltip('Change the color of the selected LED');
  
      // 👇 apply red-field validation
      this.setOnChange(function () {
        integervalidatior(this, 'value');
      });
    }
  };
  
  
   //Set all Led
   Blockly.Blocks['all_led_control'] = {
      init: function() {
        this.setColour("#8726F6");
        this.appendDummyInput()
            .appendField("Set All Leds to")
            .appendField(new ColorWheelField("#ff0000"), "COLOR")
            this.setPreviousStatement(true, null);
            this.setNextStatement(true, null);
            this.setTooltip('Change the color of all the Leds');
      }
    };
  
  //Clear all Leds
  Blockly.Blocks['clear_all_led'] = {
      init: function() {
        this.setColour("#8726F6");
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
        this.setColour("#8726F6");
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
  
  
 
  
    //Play Buzzer Frequency
    Blockly.Blocks['buzzer'] = {
      init: function() {
        this.setColour("#8726F6");
        this.appendDummyInput()
            .appendField("Play Buzzer at Frequency")
            .appendField(new Blockly.FieldTextInput('', integerOnlyValidator),'frequency')    
            .appendField("(Hz) for")
            .appendField(new Blockly.FieldTextInput('', integerOnlyValidator),'duration')        
            .appendField("seconds")
            this.setPreviousStatement(true, null);
            this.setNextStatement(true, null);
            this.setTooltip('Change the color of all the Leds');
      }
    };
    
  //Play Buzzer Sequence   
  Blockly.Blocks['buzzer_preset'] = {
      init: function() {
        this.setColour("#8726F6");
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
  
  
  // Delay Block
  Blockly.Blocks['delay'] = {
    init: function() {
      this.setColour("#8726F6");
      this.appendDummyInput()
          .appendField('Delay')
          .appendField(new Blockly.FieldTextInput('1000',integerOnlyValidator), 'ms')
          .appendField('Milliseconds');
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setTooltip('Turn the specified number of degrees');
    }
  };
  
  
  Blockly.Blocks['Button'] = {
    init: function() {
      this.setColour("#8726F6");
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

    Blockly.Blocks['testled_control'] = {
          init: function () {
            this.setColour("#8726F6");
            this.appendDummyInput()
              .appendField("Set LED")
              .appendField(new ColorGridField(), "value");
              this.setPreviousStatement(true);
            this.setNextStatement(true);
            this.setTooltip('Set a 6x8 LED matrix with any color.');
          }
        };

        Blockly.Blocks['random'] = {
          init: function () {
            this.setColour('#2FADE7');
        
            this.appendValueInput('START')
              .setCheck('Number')
              .appendField('Random Number from');
        
            this.appendValueInput('END')
              .setCheck('Number')
              .appendField('to');
        
            this.setOutput(true, 'Number');
            this.setInputsInline(true);
            this.setTooltip('Generates a random number between the given range.');
        
            this.setOnChange(function () {
              validateStartEnd(this);
            });
          }
        };
        