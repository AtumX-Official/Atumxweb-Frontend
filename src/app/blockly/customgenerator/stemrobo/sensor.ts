import customGenerator from "..";
import * as Blockly from 'blockly/core';

customGenerator.forBlock['stemrobosetup_DHT'] = function (block: Blockly.Block) {
    const pin = block.getFieldValue('pin')
        const jsonOutput = {
            DHTsetup: {
            pin           
          }
        };
        return JSON.stringify(jsonOutput);
}

customGenerator.forBlock['stemrobosetup_HB'] = function (block: Blockly.Block) {
    const pin = block.getFieldValue('pin')
        const jsonOutput = {
            HBsetup: {
            pin           
          }
        };
        return JSON.stringify(jsonOutput);
}

customGenerator.forBlock['stemrobosensor_pin'] = function (block: Blockly.Block) {
    const ID = block.getFieldValue('value')
    const pinumber = block.getFieldValue('pinnumber')
    const type = block.getFieldValue('type')
        const jsonOutput = {
            IRSetup: {
            ID,
            pinumber,
            type
          }
        };
        return JSON.stringify(jsonOutput);
}

customGenerator.forBlock['stemroboservo_init'] = function (block: Blockly.Block) {
    const ID = block.getFieldValue('ID')
    const pin = block.getFieldValue('pin')
        const jsonOutput = {
            servoinit: {
            ID,
            pin,
          }
        };
        return JSON.stringify(jsonOutput);
}

customGenerator.forBlock['stemroboconnect_ldr'] = function (block: Blockly.Block) {
    const ID = block.getFieldValue('value')
    const pinumber = block.getFieldValue('pinnumber')
        const jsonOutput = {
            LDRSetup: {
            ID,
            pinumber,
            type : 'ANALOG'
          }
        };
        return JSON.stringify(jsonOutput);
}

customGenerator.forBlock['stemroboconnect_us1'] = function (block: Blockly.Block) {
    const ID = block.getFieldValue('ID')
    const echo = block.getFieldValue('echo')
    const trigger = block.getFieldValue('trigger')
        const jsonOutput = {
            USSetup: {
            ID ,
            echo,
            trigger
          }
        };
        return JSON.stringify(jsonOutput);
}

customGenerator.forBlock['stemrobocolor_sensor_init'] = function (block: Blockly.Block) {
    const csda = block.getFieldValue('csda');
    const cscl = block.getFieldValue('cscl');
          const jsonOutput = {
            colorinit: {
            ID : 'CS1',
            csda,
            cscl
          }
        };
   return JSON.stringify(jsonOutput);
}


customGenerator.forBlock['stemrobosetvibration'] = function(block: Blockly.Block){
  const pinumber = block.getFieldValue('value');
  const mode = "INPUT";
    const jsonOutput = {
      pinsetup : {
          pinumber,
          mode
        }
  }
  return JSON.stringify(jsonOutput, null, 2);
}

customGenerator.forBlock['stemrobosettouch'] = function(block: Blockly.Block){
  const pinumber = block.getFieldValue('value');
  const mode = "INPUT";
    const jsonOutput = {
      pinsetup : {
          pinumber,
          mode
        }
  }
  return JSON.stringify(jsonOutput, null, 2);
}

customGenerator.forBlock['stemrobosetgas'] = function(block: Blockly.Block){
  const pinumber = block.getFieldValue('value');
  const mode = "INPUT";
    const jsonOutput = {
      pinsetup : {
          pinumber,
          mode
        }
  }
  return JSON.stringify(jsonOutput, null, 2);
}

customGenerator.forBlock['stemrobosetsoilmoisture'] = function(block: Blockly.Block){
  const pinumber = block.getFieldValue('value');
  const mode = "INPUT";
    const jsonOutput = {
      pinsetup : {
          pinumber,
          mode
        }
  }
  return JSON.stringify(jsonOutput, null, 2);
}

customGenerator.forBlock['stemrobosetrelay'] = function(block: Blockly.Block){
  const pinumber = block.getFieldValue('value');
  const mode = "OUTPUT";
    const jsonOutput = {
      pinsetup : {
          pinumber,
          mode
        }
  }
  return JSON.stringify(jsonOutput, null, 2);
}
customGenerator.forBlock['stemroboLCDsetup'] = function(block: Blockly.Block){
  const sda = block.getFieldValue('sda');
  const scl = block.getFieldValue('scl')
  const jsonOutput = {
    LCDSetup : {
        sda,
        scl
      }
}
return JSON.stringify(jsonOutput, null, 2);
}

customGenerator.forBlock['stemroboRelayOn'] = function(block: Blockly.Block){
  const ID = block.getFieldValue('value');
  const type = "digital";
  const value = 'LOW'
  let pin = null
  const workspace = block.workspace;
  const allBlocks = workspace.getAllBlocks(false);
  if (ID) {
  for (const b of allBlocks) {
    if (b.type === "stemrobosetrelay" && b.getFieldValue("ID") === ID) {
      pin = b.getFieldValue("value");
      break;
    }
  } }else {
    console.warn("Vibration ID is null or undefined");
  }
    const jsonOutput = {
      pinwrite : {
          pin,
          type,
          value
        }
  }
  return JSON.stringify(jsonOutput, null, 2);
}

customGenerator.forBlock['stemroboRelayOff'] = function(block: Blockly.Block){
  const ID = block.getFieldValue('value');
  const type = "digital";
  const value = 'HIGH'
  let pin
  const workspace = block.workspace;
  const allBlocks = workspace.getAllBlocks(false);
  if (ID) {
    for (const b of allBlocks) {
      if (b.type === "stemrobosetrelay" && b.getFieldValue("ID") === ID) {
        pin = b.getFieldValue("value");
        break;
      }
    } }else {
      console.warn("Vibration ID is null or undefined");
    }  
    const jsonOutput = {
      pinwrite : {
          pin,
          type,
          value
        }
  }
  return JSON.stringify(jsonOutput, null, 2);
}

customGenerator.forBlock['stemrobosetsound'] = function(block: Blockly.Block){
  const pinumber = block.getFieldValue('value');
  const mode = "INPUT";
    const jsonOutput = {
      pinsetup : {
          pinumber,
          mode
        }
  }
  return JSON.stringify(jsonOutput, null, 2);
}

customGenerator.forBlock['stemroboOleddisplay'] = function (block: Blockly.Block) {
  const sda = block.getFieldValue('sda')
  const scl = block.getFieldValue('scl')
  const displaytype = block.getFieldValue('inch')
      const jsonOutput = {
          displaysetup: {
           sda,
           scl,
           displaytype
        }
      };
      return JSON.stringify(jsonOutput);
}