import * as Blockly from 'blockly/core';
import { integervalidatior } from '../inputvalidator';
Blockly.Blocks['varmath'] = {
    init: function () {
      this.appendValueInput('LEFT')
        .setCheck('Number');
      this.appendDummyInput()
        .appendField(new Blockly.FieldDropdown([
          ['+', 'ADD'],
          ['-', 'SUBTRACT'],
          ['/', 'DIVIDE'],
          ['×', 'MULTIPLY']
        ]), 'OPERATOR')
        this.appendValueInput('RIGHT')
        .setCheck('Number')
    this.setColour("#2FADE7");
    this.setOutput(true, 'Number');
    this.setOnChange( () => {
      integervalidatior(this, 'LEFT');
      integervalidatior(this, 'RIGHT');
    });
}
  };

Blockly.Blocks['math_modulo'] = {
    init: function() {
      this.setColour('#2FADE7'); // Standard color for logic blocks
      this.appendDummyInput()
      .appendField('remainder of ')
      this.appendValueInput('num')
          .setCheck('Number')
          this.appendDummyInput()
          .appendField('÷')
      this.appendValueInput('den')
          .setCheck('Number')
      this.setInputsInline(true);
      this.setOutput(true, 'Number');
      this.setTooltip(Blockly.Msg.MATH_MODULO_TOOLTIP);
      this.setOnChange( () => {
        integervalidatior(this, 'num');
        integervalidatior(this, 'den');
      });
    }
  };

  Blockly.Blocks['squareroot'] = {
    init: function() {
        this.setColour('#2FADE7'); // Standard color for logic blocks
        this.appendValueInput('NUM')
          .setCheck('Number')
          .appendField('square root'); 
      this.setOutput(true, 'Number');
      this.setTooltip(Blockly.Msg.MATH_SINGLE_TOOLTIP_ROOT);
      this.setOnChange( () =>  {
        integervalidatior(this, 'NUM');
      });
    }
  };

  Blockly.Blocks['evenodd'] = {
    init: function () {
      this.appendValueInput('value')
        .setCheck('Number');
      this.appendDummyInput()
      .appendField('is')
        .appendField(new Blockly.FieldDropdown([
          ['even', 'even'],
          ['odd', 'odd'],
        ]), 'operation')
    this.setColour("#2FADE7");
    this.setOutput(true, 'Boolean');
    this.setOnChange( () =>  {
      integervalidatior(this, 'value');
    });
}
  };  