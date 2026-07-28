import customGenerator from "..";
import * as Blockly from 'blockly/core';

customGenerator.forBlock['cayosetup_DHT'] = function (block: Blockly.Block) {
    const pin = block.getFieldValue('pin')
        const jsonOutput = {
            DHTsetup: {
            pin           
          }
        };
        return JSON.stringify(jsonOutput);
}

customGenerator.forBlock['cayosetup_HB'] = function (block: Blockly.Block) {
    const pin = block.getFieldValue('pin')
        const jsonOutput = {
            HBsetup: {
            pin           
          }
        };
        return JSON.stringify(jsonOutput);
}

customGenerator.forBlock['cayosensor_pin'] = function (block: Blockly.Block) {
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

customGenerator.forBlock['cayoservo_init'] = function (block: Blockly.Block) {
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

customGenerator.forBlock['cayoconnect_ldr'] = function (block: Blockly.Block) {
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

customGenerator.forBlock['cayoconnect_us1'] = function (block: Blockly.Block) {
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

customGenerator.forBlock['cayocolor_sensor_init'] = function (block: Blockly.Block) {
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


customGenerator.forBlock['cayosetvibration'] = function(block: Blockly.Block){
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

customGenerator.forBlock['cayosettouch'] = function(block: Blockly.Block){
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

customGenerator.forBlock['cayosetgas'] = function(block: Blockly.Block){
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

customGenerator.forBlock['cayosetsoilmoisture'] = function(block: Blockly.Block){
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

customGenerator.forBlock['cayosetrelay'] = function(block: Blockly.Block){
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
customGenerator.forBlock['cayoLCDsetup'] = function(block: Blockly.Block){
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

customGenerator.forBlock['cayoRelayOn'] = function(block: Blockly.Block){
  const ID = block.getFieldValue('value');
  const type = "digital";
  const value = 'LOW'
  let pin = null
  const workspace = block.workspace;
  const allBlocks = workspace.getAllBlocks(false);
  if (ID) {
  for (const b of allBlocks) {
    if (b.type === "cayosetrelay" && b.getFieldValue("ID") === ID) {
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

customGenerator.forBlock['cayoRelayOff'] = function(block: Blockly.Block){
  const ID = block.getFieldValue('value');
  const type = "digital";
  const value = 'HIGH'
  let pin
  const workspace = block.workspace;
  const allBlocks = workspace.getAllBlocks(false);
  if (ID) {
    for (const b of allBlocks) {
      if (b.type === "cayosetrelay" && b.getFieldValue("ID") === ID) {
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

customGenerator.forBlock['cayosetsound'] = function(block: Blockly.Block){
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

customGenerator.forBlock['cayoOleddisplay'] = function (block: Blockly.Block) {
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

customGenerator.forBlock['oled_set_cursor'] = function (block: Blockly.Block) {
  const x = block.getFieldValue('x')
  const y = block.getFieldValue('y')
  const jsonOutput = {
    OLEDSetcursor: {
       x,
       y,
    }
      };
      return JSON.stringify(jsonOutput);
}
customGenerator.forBlock['oled_set_font_size'] = function (block: Blockly.Block) {
  const fs = block.getFieldValue('size')
  const jsonOutput = {
    OLEDSetfontsize: {
      fs
    }
      };
      return JSON.stringify(jsonOutput);
}

customGenerator.forBlock['oled_clear'] = function (block: Blockly.Block) {
  const jsonOutput = {
    OLEDClearDisplay: {
        "disp": "clear"
    }
      };
      return JSON.stringify(jsonOutput);
}