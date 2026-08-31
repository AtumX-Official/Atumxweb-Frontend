import customGenerator from ".";
import * as Blockly from 'blockly/core';



function resolveStaticNumber(blk: Blockly.Block | null): number | null {
  if (!blk) return null;

  // CASE 1: Literal number block
  if (blk.type === 'math_number') {
    const val = Number(blk.getFieldValue('NUM'));
    return Number.isFinite(val) ? val : null;
  }

  // CASE 2: input_value block (with FieldTextInput)
  if (blk.type === 'input_value') {
    const field = blk.getField('value'); // get the field object
    if (!field) return null;
    const val = Number(field.getValue()); // read typed value
    return Number.isFinite(val) ? val : null;
  }
  if (blk.type === 'get_variable') {
    return getVariableAssignedValue(blk);
  }

  // Anything else (variable, expression) → dynamic → can't validate
  return null;
}

function getVariableAssignedValue(varBlock: Blockly.Block): number | null {
  if (!varBlock || varBlock.type !== 'get_variable') return null;

  const varName = varBlock.getFieldValue('VAR');

  // Look for the corresponding 'variable' block in workspace
  const workspace = varBlock.workspace;
  const allBlocks = workspace?.getAllBlocks(false) || [];

  for (const blk of allBlocks) {
    if (blk.type === 'variable' && blk.getFieldValue('VAR') === varName) {
      // Get the assigned value
      return resolveStaticNumber(blk.getInputTargetBlock('VALUE'));
    }
  }

  return null; // No assignment found
}

customGenerator.forBlock['varmath'] = function(block: Blockly.Block) {
    const leftBlock = block.getInputTargetBlock('LEFT');
    let varName = '';
    if (leftBlock && leftBlock.type === 'get_variable') {
      varName = leftBlock.getFieldValue('VAR');
    }
    const operator = block.getFieldValue('OPERATOR');
    const value = block.getFieldValue('RIGHT');
    const temp = {
      "varmath": {
        "name": varName,
        "operator": operator,
        "value": value
      }
    };
  
    return JSON.stringify(temp); // or just `return temp;` depending on how your workspace uses it
  };
  
  customGenerator.forBlock['variable'] = function (block: Blockly.Block) {
    const valueBlock = block.getInputTargetBlock('VALUE');
    const varName = block.getFieldValue('VAR');
    const workspace = block.workspace;
    const allBlocks = workspace.getAllBlocks(false);

    if (!valueBlock) {
      return JSON.stringify({ varset: { name: varName, value: null } });
    }
  
    const valueBlockType = valueBlock.type;
    const getValue = (field: string) => valueBlock.getFieldValue(field);
  
    let temp: any = {};
  
    if (valueBlockType === "US1" || valueBlockType === "ldr" || valueBlockType === "ir" || valueBlockType === "DTHSensor") {
      temp = {
        varset: {
          name: varName,
          sensor: getValue("value")
        }
      };
    }
    else if (valueBlockType === "pitch_block"){
      temp = {
        varset: {
          name: varName,
          sensor: "DronePitch"
        }
      };
    }
    else if (valueBlockType === "roll_block"){
      temp = {
        varset: {
          name: varName,
          sensor: "DroneRoll"
        }
      };
    }
    else if (valueBlockType === "yaw_block"){
      temp = {
        varset: {
          name: varName,
          sensor: "DroneYaw"
        }
      };
    }
    else if (valueBlockType === "barometer_block"){
      temp = {
        varset: {
          name: varName,
          sensor: "DroneBarometer"
        }
      };
    }
    else if (
      valueBlockType === "analog_read" ||
      valueBlockType === "sfanalog_read" ||
      valueBlockType === "cayoanalog_read"||
      valueBlockType === "droneanalog_read"
    ) {
      temp = {
        varset: {
          name: varName,
          sensor: "analog_read",
          pinumber: getValue("value")
        }
      };
    }
    else if (
      valueBlockType === "digital_read" ||
      valueBlockType === "sfdigital_read" ||
      valueBlockType === "cayodigital_read" ||
      valueBlockType === "dronedigital_read"
    ) {
      temp = {
        varset: {
          name: varName,
          sensor: "digital_read",
          pinumber: getValue("value")
        }
      };
    }
    else if (valueBlockType === "input_value") {
      temp = {
        varset: {
          name: varName,
          Value: getValue("value") 
        }
      };
    }
    else if (valueBlockType === "random") {

      const startBlock = valueBlock.getInputTargetBlock('START');
      const endBlock   = valueBlock.getInputTargetBlock('END');
    
      const startVal = resolveStaticNumber(startBlock);
      const endVal   = resolveStaticNumber(endBlock);
    
      // 🔴 Validate whenever BOTH are statically known
      if (startVal !== null && endVal !== null) {
        if (startVal >= endVal) {
          customGenerator.reportError({
            type: "RANDOM_RANGE_ERROR",
            blockId: valueBlock.id,
            message: "Random block error: START must be less than END"
          });
        }
      }
    
      const getRandomValue = (blk: Blockly.Block | null) => {
        if (!blk) return null;
    
        if (blk.type === 'math_number') {
          return Number(blk.getFieldValue('NUM'));
        }
        if (blk.type === 'input_value') {
          return Number(blk.getFieldValue('value'));
        }
        if (blk.type === 'get_variable') {
          return { var: blk.getFieldValue('VAR') };
        }
    
        return customGenerator.blockToCode(blk);
      };
    
      temp = {
        varset: {
          name: varName,
          rand: {
            rmin: getRandomValue(startBlock),
            rmax: getRandomValue(endBlock)
          }
        }
      };
    }       
    else if(valueBlockType === "Vibration"){
      const vibrationID = getValue('VIB_ID');
      let pinumber = null;
      if (vibrationID) {
        for (const b of allBlocks) {
          if (b.type === "setvibration" && b.getFieldValue("ID") === vibrationID) {
            pinumber = b.getFieldValue("value");
            break;
          }
        }
      } else {
        console.warn("Vibration ID is null or undefined");
      }
      temp = {
        varset: {
          name: varName,
          sensor: "digital_read",
          pinumber
        }
      };
    }
    else if(valueBlockType === "sfVibration"){
      const vibrationID = getValue('VIB_ID');
      let pinumber = null;
      if (vibrationID) {
        for (const b of allBlocks) {
          if (b.type === "sfsetvibration" && b.getFieldValue("ID") === vibrationID) {
            pinumber = b.getFieldValue("value");
            break;
          }
        }
      } else {
        console.warn("Vibration ID is null or undefined");
      }
      temp = {
        varset: {
          name: varName,
          sensor: "digital_read",
          pinumber
        }
      };
    }
    else if(valueBlockType === "cayoVibration"){
      const vibrationID = getValue('VIB_ID');
      let pinumber = null;
      if (vibrationID) {
        for (const b of allBlocks) {
          if (b.type === "cayosetvibration" && b.getFieldValue("ID") === vibrationID) {
            pinumber = b.getFieldValue("value");
            break;
          }
        }
      } else {
        console.warn("Vibration ID is null or undefined");
      }
      temp = {
        varset: {
          name: varName,
          sensor: "digital_read",
          pinumber
        }
      };
    }
    else if(valueBlockType === "Touch"){
      const vibrationID = getValue('value');
      let pinumber = null;
      if (vibrationID) {
        for (const b of allBlocks) {
          if (b.type === "settouch" && b.getFieldValue("ID") === vibrationID) {
            pinumber = b.getFieldValue("value");
            break;
          }
        }
      } else {
        console.warn("Vibration ID is null or undefined");
      }
      temp = {
        varset: {
          name: varName,
          sensor: "digital_read",
          pinumber
        }
      };
    }
    else if(valueBlockType === "sfTouch"){
      const vibrationID = getValue('value');
      let pinumber = null;
      if (vibrationID) {
        for (const b of allBlocks) {
          if (b.type === "sfsettouch" && b.getFieldValue("ID") === vibrationID) {
            pinumber = b.getFieldValue("value");
            break;
          }
        }
      } else {
        console.warn("Vibration ID is null or undefined");
      }
      temp = {
        varset: {
          name: varName,
          sensor: "digital_read",
          pinumber
        }
      };
    }
    else if(valueBlockType === "cayoTouch"){
      const vibrationID = getValue('value');
      let pinumber = null;
      if (vibrationID) {
        for (const b of allBlocks) {
          if (b.type === "cayosettouch" && b.getFieldValue("ID") === vibrationID) {
            pinumber = b.getFieldValue("value");
            break;
          }
        }
      } else {
        console.warn("Vibration ID is null or undefined");
      }
      temp = {
        varset: {
          name: varName,
          sensor: "digital_read",
          pinumber
        }
      };
    }
    else if(valueBlockType === "Relay"){
      const vibrationID = getValue('value');
      let pinumber = null;
      if (vibrationID) {
        for (const b of allBlocks) {
          if (b.type === "setrelay" && b.getFieldValue("ID") === vibrationID) {
            pinumber = b.getFieldValue("value");
            break;
          }
        }
      } else {
        console.warn("Vibration ID is null or undefined");
      }
      temp = {
        varset: {
          name: varName,
          sensor: "digital_read",
          pinumber
        }
      };
    }
    else if(valueBlockType === "sfRelay"){
      const vibrationID = getValue('value');
      let pinumber = null;
      if (vibrationID) {
        for (const b of allBlocks) {
          if (b.type === "sfsetrelay" && b.getFieldValue("ID") === vibrationID) {
            pinumber = b.getFieldValue("value");
            break;
          }
        }
      } else {
        console.warn("Vibration ID is null or undefined");
      }
      temp = {
        varset: {
          name: varName,
          sensor: "digital_read",
          pinumber
        }
      };
    }
    else if(valueBlockType === "cayoRelay"){
      const vibrationID = getValue('value');
      let pinumber = null;
      if (vibrationID) {
        for (const b of allBlocks) {
          if (b.type === "cayosetrelay" && b.getFieldValue("ID") === vibrationID) {
            pinumber = b.getFieldValue("value");
            break;
          }
        }
      } else {
        console.warn("Vibration ID is null or undefined");
      }
      temp = {
        varset: {
          name: varName,
          sensor: "digital_read",
          pinumber
        }
      };
    }
    else if(valueBlockType === "Gas"){
      const vibrationID = getValue('value');
      let pinumber = null;
      if (vibrationID) {
        for (const b of allBlocks) {
          if (b.type === "setgas" && b.getFieldValue("ID") === vibrationID) {
            pinumber = b.getFieldValue("value");
            break;
          }
        }
      } else {
        console.warn("Vibration ID is null or undefined");
      }
      temp = {
        varset: {
          name: varName,
          sensor: "analog_read",
          pinumber
        }
      };
    }
    else if(valueBlockType === "sfGas"){
      const vibrationID = getValue('value');
      let pinumber = null;
      if (vibrationID) {
        for (const b of allBlocks) {
          if (b.type === "sfsetgas" && b.getFieldValue("ID") === vibrationID) {
            pinumber = b.getFieldValue("value");
            break;
          }
        }
      } else {
        console.warn("Vibration ID is null or undefined");
      }
      temp = {
        varset: {
          name: varName,
          sensor: "analog_read",
          pinumber
        }
      };
    }
    else if(valueBlockType === "cayoGas"){
      const vibrationID = getValue('value');
      let pinumber = null;
      if (vibrationID) {
        for (const b of allBlocks) {
          if (b.type === "cayosetgas" && b.getFieldValue("ID") === vibrationID) {
            pinumber = b.getFieldValue("value");
            break;
          }
        }
      } else {
        console.warn("Vibration ID is null or undefined");
      }
      temp = {
        varset: {
          name: varName,
          sensor: "analog_read",
          pinumber
        }
      };
    }
    else if(valueBlockType === "Soil"){
      const vibrationID = getValue('value');
      let pinumber = null;
      if (vibrationID) {
        for (const b of allBlocks) {
          if (b.type === "setsoilmoisture" && b.getFieldValue("ID") === vibrationID) {
            pinumber = b.getFieldValue("value");
            break;
          }
        }
      } else {
        console.warn("Vibration ID is null or undefined");
      }
      temp = {
        varset: {
          name: varName,
          sensor: "analog_read",
          pinumber
        }
      };
    }
    else if(valueBlockType === "sfSoil"){
      const vibrationID = getValue('value');
      let pinumber = null;
      if (vibrationID) {
        for (const b of allBlocks) {
          if (b.type === "sfsetsoilmoisture" && b.getFieldValue("ID") === vibrationID) {
            pinumber = b.getFieldValue("value");
            break;
          }
        }
      } else {
        console.warn("Vibration ID is null or undefined");
      }
      temp = {
        varset: {
          name: varName,
          sensor: "analog_read",
          pinumber
        }
      };
    }
    else if(valueBlockType === "cayoSoil"){
      const vibrationID = getValue('value');
      let pinumber = null;
      if (vibrationID) {
        for (const b of allBlocks) {
          if (b.type === "cayosetsoilmoisture" && b.getFieldValue("ID") === vibrationID) {
            pinumber = b.getFieldValue("value");
            break;
          }
        }
      } else {
        console.warn("Vibration ID is null or undefined");
      }
      temp = {
        varset: {
          name: varName,
          sensor: "analog_read",
          pinumber
        }
      };
    }
    else if(valueBlockType === "Sound"){
      const vibrationID = getValue('value');
      let pinumber = null;
      if (vibrationID) {
        for (const b of allBlocks) {
          if (b.type === "setsound" && b.getFieldValue("ID") === vibrationID) {
            pinumber = b.getFieldValue("value");
            break;
          }
        }
      } else {
        console.warn("Vibration ID is null or undefined");
      }
      temp = {
        varset: {
          name: varName,
          sensor: "digital_read",
          pinumber
        }
      };
    }
    else if(valueBlockType === "sfSound"){
      const vibrationID = getValue('value');
      let pinumber = null;
      if (vibrationID) {
        for (const b of allBlocks) {
          if (b.type === "sfsetsound" && b.getFieldValue("ID") === vibrationID) {
            pinumber = b.getFieldValue("value");
            break;
          }
        }
      } else {
        console.warn("Vibration ID is null or undefined");
      }
      temp = {
        varset: {
          name: varName,
          sensor: "digital_read",
          pinumber
        }
      };
    }
    else if(valueBlockType === "cayoSound"){
      const vibrationID = getValue('value');
      let pinumber = null;
      if (vibrationID) {
        for (const b of allBlocks) {
          if (b.type === "cayosetsound" && b.getFieldValue("ID") === vibrationID) {
            pinumber = b.getFieldValue("value");
            break;
          }
        }
      } else {
        console.warn("Vibration ID is null or undefined");
      }
      temp = {
        varset: {
          name: varName,
          sensor: "digital_read",
          pinumber
        }
      };
    }
    else if(valueBlockType === 'squareroot'){
      const numBlock = valueBlock.getInputTargetBlock('NUM');
      let valValue;
      if (numBlock) {
        if (numBlock.type === 'math_number') {
            valValue = Number(numBlock.getFieldValue('NUM'));
        } 
        else if (numBlock.type === 'get_variable') {
            valValue = { var: numBlock.getFieldValue('VAR') };
        } 
        else {
            valValue = customGenerator.blockToCode(numBlock);
            try {
                valValue = JSON.parse(valValue);
            } catch (e) {
            }
        }
    } else {
        valValue = 0;
    }
    temp = {
        varsqrt: {
            var: varName,
            val: valValue
        }
    };
    }
else if (valueBlockType === 'math_modulo') {
    const dividendBlock = valueBlock.getInputTargetBlock('num');
  let numValue;

  if (dividendBlock) {
      if (dividendBlock.type === 'math_number') {
          numValue = Number(dividendBlock.getFieldValue('NUM'));
      } 
      else if (dividendBlock.type === 'get_variable') {
          numValue = { var: dividendBlock.getFieldValue('VAR') };
      }
      else {
          let code = customGenerator.blockToCode(dividendBlock);
          try {
              numValue = JSON.parse(code);
          } catch (e) {
              numValue = code; 
          }
      }
  } else {
      numValue = 0; 
  }
  const divisorBlock = valueBlock.getInputTargetBlock('den');
  let denValue;

  if (divisorBlock) {
      if (divisorBlock.type === 'math_number') {
          denValue = Number(divisorBlock.getFieldValue('NUM'));
      } 
      else if (divisorBlock.type === 'get_variable') {
          denValue = { var: divisorBlock.getFieldValue('VAR') };
      }
      else {
          let code = customGenerator.blockToCode(divisorBlock);
          try {
              denValue = JSON.parse(code);
          } catch (e) {
              denValue = code; 
          }
      }
  } else {
      denValue = 0;
  }
  temp = {
      rem: {
          resvar: varName,
          num: numValue,
          den: denValue
      }
  };
}
   // ... inside customGenerator.forBlock['variable'] ...

else if (valueBlockType === 'varmath') {
    
  const operator = valueBlock.getFieldValue('OPERATOR');
  const leftBlock = valueBlock.getInputTargetBlock('LEFT');
  let lvalValue;

  if (leftBlock) {
      if (leftBlock.type === 'math_number') {
          lvalValue = Number(leftBlock.getFieldValue('NUM'));
      } 
      else if (leftBlock.type === 'get_variable') {
          lvalValue = { var: leftBlock.getFieldValue('VAR') };
      }
      else {
          let code = customGenerator.blockToCode(leftBlock);
          try {
              lvalValue = JSON.parse(code);
          } catch (e) {
              lvalValue = code; 
          }
      }
  } else {
      lvalValue = 0; 
  }
  const rightBlock = valueBlock.getInputTargetBlock('RIGHT');
  let rvalValue;

  if (rightBlock) {
      if (rightBlock.type === 'math_number') {
          rvalValue = Number(rightBlock.getFieldValue('NUM'));
      } 
      else if (rightBlock.type === 'get_variable') {
          rvalValue = { var: rightBlock.getFieldValue('VAR') };
      }
      else {
          let code = customGenerator.blockToCode(rightBlock);
          try {
              rvalValue = JSON.parse(code);
          } catch (e) {
              rvalValue = code; 
          }
      }
  } else {
      rvalValue = 0;
  }
  temp = {
      varmath2: {
          resvar: varName, 
          lval: lvalValue,
          rval: rvalValue,
          operator: operator 
      }
  };
}
else if(valueBlockType === 'joystickread'){
  const axis = valueBlock.getFieldValue('axis')
   temp ={
    JoystickRead : {
      resvar: varName,
      axis 
    }
   }
}

else if (valueBlockType === 'colorsensor'){
  const channel = valueBlock.getFieldValue("value");

  temp = {
    varset: {
      name: varName,
      sensor: 'CS',
      channel: channel
    }
  };
}
// ... (rest of the generator function) ...
    else {
      temp = {
        varset: {
          name: varName,
          unknown: true,
          blockType: valueBlockType
        }
      };
    }
    return JSON.stringify(temp);
  };
  
  customGenerator.forBlock['get_variable'] = function(block: Blockly.Block, generator: Blockly.CodeGenerator) {
    const varName = block.getFieldValue('VAR');
    // encode as JSON string so it’s still valid string
    return [JSON.stringify({ var: varName }), 0];
  };  
