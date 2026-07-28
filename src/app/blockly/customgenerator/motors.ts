import customGenerator from ".";
import * as Blockly from 'blockly/core';

customGenerator.forBlock['setupMotor'] = function(block: Blockly.Block){
    const ID = block.getFieldValue('ID')
    const MA = block.getFieldValue('MA');
    const MB = block.getFieldValue('MB');
      const jsonOutput = {
        MotorSetup : {
            ID,
            MA,
            MB
          }
    }
    return JSON.stringify(jsonOutput, null, 2);
}

customGenerator.forBlock['sfsetupMotor'] = function(block: Blockly.Block){
  const ID = block.getFieldValue('ID')
  const MA = block.getFieldValue('MA');
  const MB = block.getFieldValue('MB');
    const jsonOutput = {
      MotorSetup : {
          ID,
          MA,
          MB
        }
  }
    return JSON.stringify(jsonOutput, null, 2);
}


customGenerator.forBlock['cayosetupMotor'] = function(block: Blockly.Block){
  const ID = block.getFieldValue('ID')
  const MA = block.getFieldValue('MA');
  const MB = block.getFieldValue('MB');
    const jsonOutput = {
      MotorSetup : {
          ID,
          MA,
          MB
        }
  }
    return JSON.stringify(jsonOutput, null, 2);
}

customGenerator.forBlock['runMotor'] = function(block: Blockly.Block){
    const ID = block.getFieldValue('ID')
    const dir = block.getFieldValue('dir');
    const speedblock = block.getInputTargetBlock('SPEED_INPUT');
    let speed: any = 0;
    // If Stop is selected, always force speed = 0
    if (dir !== 'S') {
      if (!speedblock) {
        speed = 0;
      } else if (speedblock.type === 'get_variable') {
        speed = { var: speedblock.getFieldValue('VAR') };
      } else if (speedblock.type === 'input_value') {
        speed = Number(speedblock.getFieldValue('value')) || 0;
      } 
    }      const jsonOutput = {
        MotorRun : {
        ID,
        dir,
        speed
          }
    }
    return JSON.stringify(jsonOutput, null, 2);
}

customGenerator.forBlock["motorrunpwm"] = function(block: Blockly.Block){
  const ID = block.getFieldValue('ID')
  const MA = block.getFieldValue('MA')
  const MB = block.getFieldValue('MB')
    const jsonOutput = {
      MotorRunPWM : {
      ID,
      MA,
      MB
        }
  }
  return JSON.stringify(jsonOutput, null, 2);
}
customGenerator.forBlock["subumotorset"] = function(block: Blockly.Block){
    const jsonOutput = {
      SubuMotorSetup : {
      "SMS" : "SMS"
        }
  }
  return JSON.stringify(jsonOutput, null, 2);
}
customGenerator.forBlock["runMotorsubu"] = function(block: Blockly.Block){
  const dir = block.getFieldValue('dir')
  const speed = block.getFieldValue('speed')
    const jsonOutput = {
      SubuMotorRun : {
      dir,
      speed,
        }
  }
  return JSON.stringify(jsonOutput, null, 2);
}
customGenerator.forBlock["subumotorpwm"] = function(block: Blockly.Block){
  const M1A = block.getFieldValue('M1A')
  const M1B = block.getFieldValue('M1B')
  const M2A = block.getFieldValue('M2A')
  const M2B = block.getFieldValue('M2B')
    const jsonOutput = {
      SubuMotorPWM : {
       M1A,
       M1B,
       M2A,
       M2B
        }
  }
  return JSON.stringify(jsonOutput, null, 2);
}
customGenerator.forBlock['setupjoystick'] = function(block:Blockly.Block){
const pinX = block.getFieldValue('pinX')
const pinY = block.getFieldValue('pinY')
const jsonOutput = {
  setupJoystick : {
    pinX,
    pinY
  }
}
return JSON.stringify(jsonOutput, null, 2);
}
customGenerator.forBlock['subumotorrun'] = function(block: Blockly.Block) {
  const dir = block.getFieldValue('dir');
  const speedblock = block.getInputTargetBlock('SPEED_INPUT');

  let speed: any = 0;

  // If Stop is selected, always force speed = 0
  if (dir !== 'S') {
    if (!speedblock) {
      speed = 0;
    } else if (speedblock.type === 'get_variable') {
      speed = { var: speedblock.getFieldValue('VAR') };
    } else if (speedblock.type === 'input_value') {
      speed = Number(speedblock.getFieldValue('value')) || 0;
    } 
  }

  const jsonOutput = {
    SubuMotorRun: {
      dir,
      speed
    }
  };

  return JSON.stringify(jsonOutput, null, 2);
};