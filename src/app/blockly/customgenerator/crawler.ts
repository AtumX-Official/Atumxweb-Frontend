import customGenerator from ".";
import * as Blockly from 'blockly/core';

customGenerator.forBlock["crawlermove_forward"] = function(block : Blockly.Block){
    const steps = block.getFieldValue('STEPS') || '10'; // Default to '10' if not provided
    const jsonOutput = {
      botcmd: {
        cmd: 'move_forward',
        steps: steps
      }      
      };
    return JSON.stringify(jsonOutput, null, 2); 
  }
  
  customGenerator.forBlock["crawlermove_Backward"] = function(block : Blockly.Block){
    const steps = block.getFieldValue('STEPS') || '10'; // Default to '10' if not provided
    const jsonOutput = {
      botcmd: {
        cmd: 'move_backward',
        steps: steps
      }      
      };
    return JSON.stringify(jsonOutput, null, 2); 
  }

  customGenerator.forBlock["move_left"] = function(block : Blockly.Block){
    const steps = block.getFieldValue('STEPS') || '10'; // Default to '10' if not provided
        const jsonOutput = {
          botcmd: {
            cmd: 'move_left',
            steps: steps
          }
        };
    
        return JSON.stringify(jsonOutput);
  
}

customGenerator.forBlock["move_right"] = function(block : Blockly.Block){
    const steps = block.getFieldValue('STEPS') || '10'; // Default to '10' if not provided
        const jsonOutput = {
          botcmd: {
            cmd: 'move_right',
            steps: steps
          }
        };
    
        return JSON.stringify(jsonOutput);
}

customGenerator.forBlock["dance"] = function(){
        const jsonOutput = {
          botcmd: {
            cmd: 'dance'
          }
        };
    
        return JSON.stringify(jsonOutput);
}

customGenerator.forBlock["fold"] = function(){
        const jsonOutput = {
          botcmd: {
            cmd: 'fold'
          }
        };
        return JSON.stringify(jsonOutput);
}

customGenerator.forBlock["wave"] = function(){
        const jsonOutput = {
          botcmd: {
            cmd: 'wave'
        }
        };
    return JSON.stringify(jsonOutput);
}

customGenerator.forBlock["situp"] = function(){
        const jsonOutput = {
          botcmd: {
            cmd: 'situp'
          }
        };
    
        return JSON.stringify(jsonOutput);
}

customGenerator.forBlock["leg_control"] = function(block : Blockly.Block){
    const leg = block.getFieldValue('leg');
    const dir = block.getFieldValue('dir');  
    const jsonOutput = {
        legctrl : {
            leg,
            dir
          }
      }
    return JSON.stringify(jsonOutput, null, 2); 
}
  
  customGenerator.forBlock['crawlerservo'] = function(block : Blockly.Block){
    const leg = block.getFieldValue('leg');
    const part = block.getFieldValue('part');
    const angle = block.getFieldValue('angle');
  
    // Mapping table
    const mapping : Record<string, string> = {
      "1-Shoulder": "1",
      "1-Knee": "2",
      "2-Shoulder": "3",
      "2-Knee": "4",
      "3-Shoulder": "5",
      "3-Knee": "6",
      "4-Shoulder": "7",
      "4-Knee": "8"
    };
  
    const key = `${leg}-${part}`;
    const servoValue = mapping[key];
  
    // Fallback if mapping fails
    const finalServo = servoValue ? servoValue : "0";
  
    const jsonOutput = {
      botcmd: {
        cmd: "servo",
        servo: finalServo,
        angle
      }
    };
    return JSON.stringify(jsonOutput);
  }

  customGenerator.forBlock["crawlercalibrate"] = function(){
    const jsonOutput = {
        botcmd : {
          cmd : 'calibrate'
        }
      }
    return JSON.stringify(jsonOutput, null, 2); 
  }