import customGenerator from ".";
import * as Blockly from 'blockly/core';

customGenerator.forBlock['move_arm'] = function (block: Blockly.Block) {
    const X = block.getFieldValue('X')
    const Y = block.getFieldValue('Y')
    const Z = block.getFieldValue('Z')
        const jsonOutput = {
          botcmd: {
            cmd: 'move_arm',
            X,
            Y,
            Z
          }
        };
        return JSON.stringify(jsonOutput);
}

customGenerator.forBlock["move_gripper"] = function(block){
    const value = block.getFieldValue('l')
    const jsonOutput = {
        botcmd: {
          cmd : "move_gripper",
          l : value
        }
      };
    return JSON.stringify(jsonOutput, null, 2); 
} 