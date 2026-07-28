import * as Blockly from 'blockly/core';
import '@blockly/field-bitmap';
import {ColorWheelField,PianoKeyboardField} from '../Helper/helperclass'

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
      init: function() {
        this.setColour("#8726F6");
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