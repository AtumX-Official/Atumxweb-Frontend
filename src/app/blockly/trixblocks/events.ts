import * as Blockly from 'blockly/core';

let setup={
    "type": "setup",
    "message0": "Setup %1 \n Loop %2",
    "args0": [
      {
        "type": "input_statement",
        "name": "setup",
        "check": "statement"
      } ,{
        "type": "input_statement",
        "name": "loop",
        "check": "statement"
      }
    ],
    "nextStatement": null, // Set to appropriate next statement type if needed
    "colour": "#8726F6"
  }
  
  Blockly.Blocks['setup'] = {
    init: function () {
      this.jsonInit(setup);
      this.setInputsInline(false);
    },
    customContextMenu: function(options : (Blockly.ContextMenuRegistry.ContextMenuOption | Blockly.ContextMenuRegistry.LegacyContextMenuOption)[]) {
      // Filter out “Inline Inputs” / “External Inputs”
      const filtered = options.filter(opt => opt.text !== 'External Inputs' && opt.text !== 'Inline Inputs');
      options.length = 0;
      Array.prototype.push.apply(options, filtered);
    }
  }
  

  Blockly.Blocks['setupanimal'] = {
        init: function() {
          this.setColour("#8726F6");
          this.appendDummyInput()
              .appendField('Setup')
              .appendField(new Blockly.FieldDropdown([
                ['Gripper', 'Gripper'],
                ['Walker', 'Walker'],
                ['Crawler', 'Crawler'],
              ]), 'value');              
              this.setPreviousStatement(true, null);
              this.setNextStatement(true, null);
              this.setTooltip('Change the color of all the Leds');
        }
      };
    