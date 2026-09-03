import customGenerator from ".";
import * as Blockly from 'blockly/core';

customGenerator.forBlock['digital_write'] = function(block: Blockly.Block){
    const pin = block.getFieldValue('pin');
    const value = block.getFieldValue('value');
      const jsonOutput = {
        pinwrite : {
            pin,
            type : 'digital',
            value
          }
    }
    return JSON.stringify(jsonOutput, null, 2);
}

customGenerator.forBlock['analog_write'] = function(block: Blockly.Block){
    const pin = block.getFieldValue('pin');
    //const value = block.getFieldValue('value');
    let value = customGenerator.valueToCode(block, 'value', 0);
    if (value && (value.startsWith('(') && value.endsWith(')'))) {
      value = value.slice(1, -1);
  }
  if (value && (value.startsWith('"') && value.endsWith('"'))) {
      value = value.slice(1, -1);
  }
  let varValue;
 if (value && value.startsWith('{"var":') && value.endsWith('}')) {
  try {
      const parsedVar = JSON.parse(value);
      varValue = parsedVar; // Should be { var: "j" }
  } catch (e) {
      varValue = value;
  }
} else if (!value) {
const shadowBlock = block.getInputTargetBlock('value');
if (shadowBlock && shadowBlock.type === 'math_number') {
  varValue = parseFloat(shadowBlock.getFieldValue('NUM'));
} else {
  varValue = null;
}
}else{
  if (typeof value === "string" && value.startsWith('{"value":')){
    try {
      const parsed = JSON.parse(value);
      varValue = parsed.value;
    } catch(e){
      varValue = value;
    }
  }
  else {
    varValue = isNaN(value) ? value : Number(value);
  }
}  
const finalLnValue = (typeof varValue === 'object' && varValue !== null) 
? varValue 
: (isNaN(varValue) ? varValue : Number(varValue));
      const jsonOutput = {
        pinwrite : {
            pin,
            type : 'analog',
            value : finalLnValue 
          }
    }
    return JSON.stringify(jsonOutput, null, 2);
}

customGenerator.forBlock['pinmode'] = function(block: Blockly.Block){
    const pinumber = block.getFieldValue('value');
    const mode = block.getFieldValue('pinmode');
      const jsonOutput = {
        pinsetup : {
            pinumber,
            mode
          }
    }
    return JSON.stringify(jsonOutput, null, 2);
}

customGenerator.forBlock['dronepinmode'] = function(block: Blockly.Block){
  const pinumber = block.getFieldValue('value');
  const mode = block.getFieldValue('pinmode');
    const jsonOutput = {
      pinsetup : {
          pinumber,
          mode
        }
  }
  return JSON.stringify(jsonOutput, null, 2);
}


customGenerator.forBlock['dronedigital_write'] = function(block: Blockly.Block){
  const pin = block.getFieldValue('pin');
  const value = block.getFieldValue('value');
    const jsonOutput = {
      pinwrite : {
          pin,
          type : 'digital',
          value
        }
  }
  return JSON.stringify(jsonOutput, null, 2);
}
customGenerator.forBlock['droneanalog_write'] = function(block: Blockly.Block){
  const pin = block.getFieldValue('pin');
  //const value = block.getFieldValue('value');
  let value = customGenerator.valueToCode(block, 'value', 0);
  if (value && (value.startsWith('(') && value.endsWith(')'))) {
    value = value.slice(1, -1);
}
if (value && (value.startsWith('"') && value.endsWith('"'))) {
    value = value.slice(1, -1);
}
let varValue;
if (value && value.startsWith('{"var":') && value.endsWith('}')) {
try {
    const parsedVar = JSON.parse(value);
    varValue = parsedVar; // Should be { var: "j" }
} catch (e) {
    varValue = value;
}
} else if (!value) {
const shadowBlock = block.getInputTargetBlock('value');
if (shadowBlock && shadowBlock.type === 'math_number') {
varValue = parseFloat(shadowBlock.getFieldValue('NUM'));
} else {
varValue = null;
}
}else{
if (typeof value === "string" && value.startsWith('{"value":')){
  try {
    const parsed = JSON.parse(value);
    varValue = parsed.value;
  } catch(e){
    varValue = value;
  }
}
else {
  varValue = isNaN(value) ? value : Number(value);
}
}  
const finalLnValue = (typeof varValue === 'object' && varValue !== null) 
? varValue 
: (isNaN(varValue) ? varValue : Number(varValue));
    const jsonOutput = {
      pinwrite : {
          pin,
          type : 'analog',
          value : finalLnValue 
        }
  }
  return JSON.stringify(jsonOutput, null, 2);
}
customGenerator.forBlock['setupanimal'] = function(block: Blockly.Block, generator: any) {
  return '';
};
