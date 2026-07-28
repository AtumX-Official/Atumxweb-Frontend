import * as Blockly from 'blockly/core';
import customGenerator from '..';

customGenerator.forBlock['drone_move_direction'] = function(block: Blockly.Block) {
  const direction = block.getFieldValue('DIRECTION');
  const speed = block.getFieldValue('SPEED');
  const sec = block.getFieldValue('SECONDS')
  let cmd = "";

  switch (direction) {
    case "FORWARD":
      cmd = "pitchF";
      break;
    case "BACKWARD":
      cmd = "pitchB";
      break;
    case "LEFT":
      cmd = "rollLeft";
      break;
    case "RIGHT":
      cmd = "rollRight";
      break;
    case "UP":
      cmd = "thrustup";
      break;
    case "DOWN":
      cmd = "thrustdown"; // change if your firmware uses something else
      break;
  }

  const jsonOutput = {
    droneCMD: {
      cmd: cmd,
      pct: speed,       // 0–100 percentage
      sec: sec           // default duration (you can change or add block input)
    }
  };

  return JSON.stringify(jsonOutput, null, 2);
};

customGenerator.forBlock['setup_drone'] = function(block: Blockly.Block) {
  const jsonOutput = {
    setupDrone: {
      setup: "Drone"
    }
  };

  return JSON.stringify(jsonOutput, null, 2);
};

customGenerator.forBlock['set_motor_pwm'] = function(block: Blockly.Block) {
  const droneMotor = block.getFieldValue('MOTOR');
  const pct = block.getFieldValue('PWM');
  //const sec = block.getFieldValue('SECONDS')

  const jsonOutput = {
    droneCMD: {
      cmd: droneMotor,
      pct: pct,        
    }
  };

  return JSON.stringify(jsonOutput, null, 2)
};

customGenerator.forBlock['droneservo_individual'] = function(block: Blockly.Block, generator: Blockly.CodeGenerator) {
  const ID = block.getFieldValue('ID');
  const angleBlock = block.getInputTargetBlock('ANGLE');

  let angle: any;

  if (!angleBlock) {
    // fallback to shadow default or empty
    const shadowValue = block.getFieldValue('ANGLE');
    angle = shadowValue ? Number(shadowValue) : 0;
  } else if (angleBlock.type === 'math_number') {
    angle = Number(angleBlock.getFieldValue('NUM'));
  }  else if (angleBlock.type === 'input_value') {
    angle = Number(angleBlock.getFieldValue('value'));
  }
  else if (angleBlock.type === 'get_variable') {
    angle = { var: angleBlock.getFieldValue('VAR') };
  } else {
    // fallback for other block types
    angle = generator.blockToCode(angleBlock);
  }

  const jsonOutput = {
    servo: {
      ID,
      angle
    }
  };

  return JSON.stringify(jsonOutput, null, 2);
};

customGenerator.forBlock['drone360ServoR'] = function(block: Blockly.Block){
  const ID = block.getFieldValue('ID')
  const dir = block.getFieldValue('dir')
  const speed = block.getFieldValue('speed')
 const jsonOutput = {
  servo360R:{
  ID,
  dir,
  speed
 }
}
 return JSON.stringify(jsonOutput);
}

customGenerator.forBlock['drone360ServoS'] = function(block: Blockly.Block){
  const ID = block.getFieldValue('ID')
 const jsonOutput = {
  servo360S:{
  ID
 }
}
 return JSON.stringify(jsonOutput);
}

customGenerator.forBlock["droneled"] = function(block) {
   const pin =  block.getFieldValue('pin');
  const state = block.getFieldValue('value'); // ON / OFF
  const jsonOutput = {
    droneled: {
      state: state,
      pin 
    }
  };

  return JSON.stringify(jsonOutput, null, 2);
};