import customGenerator from ".";
import * as Blockly from 'blockly/core';

// customGenerator.forBlock['color_sensor'] = function (block: Blockly.Block) {
//   const color = block.getFieldValue('value');
//   const jsonOutput = {
//   "color" :
//   {
//   "ID":"CS1",
//   "color": color
//    }
//   };
//   const codeString = JSON.stringify(jsonOutput, null, 2);
//   return [codeString, 0]; 
//   };
  
customGenerator.forBlock['servo_individual'] = function(block: Blockly.Block, generator: Blockly.CodeGenerator) {
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

customGenerator.forBlock['servo_init'] = function(block: Blockly.Block){
    const ID = block.getFieldValue('ID')
    const pin = block.getFieldValue('pin')
    const jsonOutput = {
        servoinit : {
            ID,
            pin
          }
    }
    return JSON.stringify(jsonOutput, null, 2);
}


customGenerator.forBlock['droneservo_init'] = function(block: Blockly.Block){
  const ID = block.getFieldValue('ID')
  const pin = block.getFieldValue('pin')
  const jsonOutput = {
      servoinit : {
          ID,
          pin
        }
  }
  return JSON.stringify(jsonOutput, null, 2);
}
customGenerator.forBlock['sensor_pin'] = function (block: Blockly.Block) {
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

customGenerator.forBlock['connect_ldr'] = function (block: Blockly.Block) {
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

customGenerator.forBlock['connect_us1'] = function (block: Blockly.Block) {
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
customGenerator.forBlock['Droneconnect_us1'] = function (block: Blockly.Block) {
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
customGenerator.forBlock['setup_DHT'] = function (block: Blockly.Block) {
    const pin = block.getFieldValue('pin')
        const jsonOutput = {
            DHTsetup: {
            pin           
          }
        };
        return JSON.stringify(jsonOutput);
}

customGenerator.forBlock['color_sensor_init'] = function (block: Blockly.Block) {
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

customGenerator.forBlock['US1'] = function(block: Blockly.Block) {
const sensor = block.getFieldValue('value')
const jsonOutput = {
  sensor 
}
return JSON.stringify(jsonOutput);
}


customGenerator.forBlock['360ServoR'] = function(block: Blockly.Block){
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

customGenerator.forBlock['360ServoS'] = function(block: Blockly.Block){
  const ID = block.getFieldValue('ID')
 const jsonOutput = {
  servo360S:{
  ID
 }
}
 return JSON.stringify(jsonOutput);
}

customGenerator.forBlock['setvibration'] = function(block: Blockly.Block){
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

customGenerator.forBlock['settouch'] = function(block: Blockly.Block){
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

customGenerator.forBlock['setgas'] = function(block: Blockly.Block){
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

customGenerator.forBlock['setsoilmoisture'] = function(block: Blockly.Block){
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

customGenerator.forBlock['setrelay'] = function(block: Blockly.Block){
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

customGenerator.forBlock['LCDsetup'] = function(block: Blockly.Block){
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

customGenerator.forBlock['LCDprint'] = function(block: Blockly.Block){
  const str = block.getFieldValue('str');
  const jsonOutput = {
    LCDPrint : {
        str
      }
}
return JSON.stringify(jsonOutput, null, 2);
}

customGenerator.forBlock['LCDPrintWS'] = function(block: Blockly.Block){
  const str = block.getFieldValue('str');
  const dir = block.getFieldValue('dir')
  const jsonOutput = {
    LCDPrintWS : {
        str,
        dir
      }
}
return JSON.stringify(jsonOutput, null, 2);
}

customGenerator.forBlock['LCDsetcursor'] = function(block: Blockly.Block){
  const col = block.getFieldValue('col');
  const row = block.getFieldValue('row')
  const jsonOutput = {
    LCDsetCursor : {
        col,
        row
      }
}
return JSON.stringify(jsonOutput, null, 2);
}

customGenerator.forBlock['LCDcmd'] = function(block: Blockly.Block){
  const jsonOutput = {
    LCDcmd : {
       "op" : "clear"
      }
}
return JSON.stringify(jsonOutput, null, 2);
}



customGenerator.forBlock['RelayOn'] = function(block: Blockly.Block){
  const ID = block.getFieldValue('value');
  const type = "digital";
  const value = 'LOW'
  let pin = null
  const workspace = block.workspace;
  const allBlocks = workspace.getAllBlocks(false);
  if (ID) {
  for (const b of allBlocks) {
    if (b.type === "setrelay" && b.getFieldValue("ID") === ID) {
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

customGenerator.forBlock['RelayOff'] = function(block: Blockly.Block){
  const ID = block.getFieldValue('value');
  const type = "digital";
  const value = 'HIGH'
  let pin
  const workspace = block.workspace;
  const allBlocks = workspace.getAllBlocks(false);
  if (ID) {
    for (const b of allBlocks) {
      if (b.type === "setrelay" && b.getFieldValue("ID") === ID) {
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

customGenerator.forBlock['setsound'] = function(block: Blockly.Block){
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

customGenerator.forBlock['Oleddisplay'] = function (block: Blockly.Block) {
  const sda = block.getFieldValue('sda')
  const scl = block.getFieldValue('scl')
      const jsonOutput = {
          displaysetup: {
           sda,
           scl
        }
      };
      return JSON.stringify(jsonOutput);
}

customGenerator.forBlock['Display'] = function (block) {
  const userText = block.getFieldValue('text') || "";
  const jsonOutput = {
    display :{
      "emotion": "Text",
      "text": userText
    }
  };
  return JSON.stringify(jsonOutput);
};

customGenerator.forBlock['happy'] = function (block) {
  const jsonOutput = {
    display : {
      "emotion" : "happy",
      "text" : ""
    }
  }
  return JSON.stringify(jsonOutput);
};

customGenerator.forBlock['alarm'] = function (block) {
  const jsonOutput = {
    display : {
      "emotion" : "Alarm",
      "text" : ""
    }
  }
  return JSON.stringify(jsonOutput);};

customGenerator.forBlock['conf'] = function (block) {
  const jsonOutput = {
    display : {
      "emotion" : "Conf",
      "text" : ""
    }
  }
  return JSON.stringify(jsonOutput);};

customGenerator.forBlock['displaytext'] = function (block) {
  return null; 
};


customGenerator.forBlock['oled_print'] = function (block: Blockly.Block) {
  const temp: any = {};
  const contentBlock = block.getInputTargetBlock('CONTENT');
  const workspace = block.workspace;
  const allBlocks = workspace.getAllBlocks(false);

  if (!contentBlock) return JSON.stringify({ OLEDPrint: { value: {} } });

  const type = contentBlock.type;

  const getValue = (field: string) => contentBlock.getFieldValue(field);

  if (type === "text" ) {
    const TEXT = getValue("TEXT");
    temp.OLEDPrint = {
      value: {
        TEXT
      }
    };
  }
  else if(type === "get_variable"){
      const VAR = getValue("VAR") ;
      temp.OLEDPrint = {
        value: {
          VAR
        }
      };

  }
  else if (type === "US1" || type === "ldr" || type === "ir" || type === "DTHSensor") {
    temp.OLEDPrint = {
      value: {
        sensor: getValue("value")
      }
    };
  }
  else if (type === "analog_read" || type === "sfanalog_read" || type === "cayoanalog_read" || type === "droneanalog_read") {
      temp.OLEDPrint = {
        value: {
          sensor : 'analog_read',
          pinumber: getValue("value")
        }
      };
    }
    else if (type === "digital_read" || type === "sfdigital_read" || type === "cayodigital_read" || type === 'dronedigital_read') {
      temp.OLEDPrint = {
        value: {
          sensor : 'digital_read',
          pinumber: getValue("value")
        }
      };
    }
    else if (type === "Vibration") {
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
    
      temp.OLEDPrint = {
        value: {
          sensor: "digital_read",
          pinumber: pinumber
        }
      };
    }     
    else if (type === "sfVibration") {
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
      temp.OLEDPrint = {
        value: {
          sensor: "digital_read",
          pinumber: pinumber
        }
      };
    }
    else if (type === "cayoVibration") {
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
      temp.OLEDPrint = {
        value: {
          sensor: "digital_read",
          pinumber: pinumber
        }
      };
    }
    else if (type === "Touch") {
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
      temp.OLEDPrint = {
        value: {
          sensor: "digital_read",
          pinumber: pinumber
        }
      };
    }
    else if (type === "cayoTouch") {
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
      temp.OLEDPrint = {
        value: {
          sensor: "digital_read",
          pinumber: pinumber
        }
      };
    }
    else if (type === "sfTouch") {
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
      temp.OLEDPrint = {
        value: {
          sensor: "digital_read",
          pinumber: pinumber
        }
      };
    }
    else if (type === "Relay") {
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
      temp.OLEDPrint = {
        value: {
          sensor: "digital_read", // vibration works like digital input
          pinumber 
        }
      };
    }
    else if (type === "cayoRelay") {
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
      temp.OLEDPrint = {
        value: {
          sensor: "digital_read", // vibration works like digital input
          pinumber 
        }
      };
    }
    else if (type === "sfRelay") {
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
      temp.OLEDPrint = {
        value: {
          sensor: "digital_read", // vibration works like digital input
          pinumber 
        }
      };
    }
    else if (type === "Gas") {
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
      temp.OLEDPrint = {
        value: {
          sensor: "analog_read", // vibration works like digital input
          pinumber 
        }
      };
    }
    else if (type === "sfGas") {
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
      temp.OLEDPrint = {
        value: {
          sensor: "analog_read", // vibration works like digital input
          pinumber 
        }
      };
    }
    else if (type === "cayoGas") {
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
      temp.OLEDPrint = {
        value: {
          sensor: "analog_read", // vibration works like digital input
          pinumber 
        }
      };
    }
    else if (type === "Soil") {
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
      temp.OLEDPrint = {
        value: {
          sensor: "analog_read", // vibration works like digital input
          pinumber 
        }
      };
    }
    else if (type === "sfSoil") {
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
      temp.OLEDPrint = {
        value: {
          sensor: "analog_read", // vibration works like digital input
          pinumber 
        }
      };
    }
    else if (type === "cayoSoil") {
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
        console.warn(" Vibration ID is null or undefined");
      }
      temp.OLEDPrint = {
        value: {
          sensor: "analog_read", // vibration works like digital input
          pinumber 
        }
      };
    }
    else if (type === "Sound") {
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
      temp.OLEDPrint = {
        value: {
          sensor: "digital_read",
          pinumber: pinumber
        }
      };
    }
    else if (type === "sfSound") {
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
      temp.OLEDPrint = {
        value: {
          sensor: "digital_read",
          pinumber: pinumber
        }
      };
    }
    else if (type === "cayoSound") {
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
      temp.OLEDPrint = {
        value: {
          sensor: "digital_read",
          pinumber: pinumber
        }
      };
    }
    else if(type === "colorsensor"){
      temp.OLEDPrint = {
        value: {
          sensor : 'CS',
          channel: getValue("value")
        }
      };
    }
  else if (type === "true_false_block") {
    temp.OLEDPrint = {
      value: {
        value: getValue("BOOL") === "TRUE" ? "1" : "0"
      }
    };
  }
  else if (type === "input_value") {
    temp.OLEDPrint = {
      value: {
        TEXT: `${getValue("value")}`
      }
    };
  }
  else if(type === "pitch_block"){
    temp.OLEDPrint = {
      value:{
      sensor: "DronePitch" 
      }
    };
  }
  else if(type === "roll_block"){
    temp.OLEDPrint = {
      value:{
        sensor: "DroneRoll" 
        }      };
  }
  else if(type === "yaw_block"){
    temp.OLEDPrint = {
      value:{
        sensor: "DroneYaw" 
        }      };
  }
  else if(type === "barometer_block"){
    temp.OLEDPrint = {
      value:{
        sensor: "DroneBarometer" 
        }      };
  }
  // else if (
  //   type === "digital_read" ||
  //   type === "analog_read" ||
  //   type === "sfanalog_read" ||
  //   type === "sfdigital_read"
  // ) {
  //   temp.OLEDPrint = {
  //     value: {
  //       sensor: handleAnalogDigitalRead(type),
  //       pinumber: getValue("value")
  //     }
  //   };
  // }
  else {
    temp.OLEDPrint = {
      value: {
        unknown: true,
        blockType: type
      }
    };
  }

  return JSON.stringify(temp);
};

customGenerator.forBlock['lcd_print'] = function (block: Blockly.Block) {
  const temp: any = {};
  const contentBlock = block.getInputTargetBlock('CONTENT');
  const workspace = block.workspace;
  const allBlocks = workspace.getAllBlocks(false);

  if (!contentBlock) return JSON.stringify({ LCDPrintP: { value: {} } });

  const type = contentBlock.type;

  const getValue = (field: string) => contentBlock.getFieldValue(field);

  if (type === "text" ) {
    const TEXT = getValue("TEXT");
    temp.LCDPrintP = {
      value: {
        TEXT
      }
    };
  }
  else if(type === "get_variable"){
      const VAR = getValue("VAR") ;
      temp.LCDPrintP = {
        value: {
          VAR
        }
      };

  }
  else if (type === "US1" || type === "ldr" || type === "ir" || type === "DTHSensor") {
    temp.LCDPrintP = {
      value: {
        sensor: getValue("value")
      }
    };
  }
  else if (type === "analog_read" || type === "sfanalog_read" || type === "cayoanalog_read" || type === "droneanalog_read") {
      temp.LCDPrintP = {
        value: {
          sensor : 'analog_read',
          pinumber: getValue("value")
        }
      };
    }
    else if (type === "digital_read" || type === "sfdigital_read" || type === "cayodigital_read" || type === 'dronedigital_read') {
      temp.LCDPrintP = {
        value: {
          sensor : 'digital_read',
          pinumber: getValue("value")
        }
      };
    }
    else if (type === "Vibration") {
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
    
      temp.LCDPrintP = {
        value: {
          sensor: "digital_read",
          pinumber: pinumber
        }
      };
    }     
    else if (type === "sfVibration") {
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
      temp.LCDPrintP = {
        value: {
          sensor: "digital_read",
          pinumber: pinumber
        }
      };
    }
    else if (type === "cayoVibration") {
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
      temp.LCDPrintP = {
        value: {
          sensor: "digital_read",
          pinumber: pinumber
        }
      };
    }
    else if (type === "Touch") {
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
      temp.LCDPrintP = {
        value: {
          sensor: "digital_read",
          pinumber: pinumber
        }
      };
    }
    else if (type === "cayoTouch") {
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
      temp.LCDPrintP = {
        value: {
          sensor: "digital_read",
          pinumber: pinumber
        }
      };
    }
    else if (type === "sfTouch") {
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
      temp.LCDPrintP = {
        value: {
          sensor: "digital_read",
          pinumber: pinumber
        }
      };
    }
    else if (type === "Relay") {
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
      temp.LCDPrintP = {
        value: {
          sensor: "digital_read", // vibration works like digital input
          pinumber 
        }
      };
    }
    else if (type === "cayoRelay") {
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
      temp.LCDPrintP = {
        value: {
          sensor: "digital_read", // vibration works like digital input
          pinumber 
        }
      };
    }
    else if (type === "sfRelay") {
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
      temp.LCDPrintP = {
        value: {
          sensor: "digital_read", // vibration works like digital input
          pinumber 
        }
      };
    }
    else if (type === "Gas") {
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
      temp.LCDPrintP = {
        value: {
          sensor: "analog_read", // vibration works like digital input
          pinumber 
        }
      };
    }
    else if (type === "sfGas") {
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
      temp.LCDPrintP = {
        value: {
          sensor: "analog_read", // vibration works like digital input
          pinumber 
        }
      };
    }
    else if (type === "cayoGas") {
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
      temp.LCDPrintP = {
        value: {
          sensor: "analog_read", // vibration works like digital input
          pinumber 
        }
      };
    }
    else if (type === "Soil") {
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
      temp.LCDPrintP = {
        value: {
          sensor: "analog_read", // vibration works like digital input
          pinumber 
        }
      };
    }
    else if (type === "sfSoil") {
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
      temp.LCDPrintP = {
        value: {
          sensor: "analog_read", // vibration works like digital input
          pinumber 
        }
      };
    }
    else if (type === "cayoSoil") {
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
        console.warn(" Vibration ID is null or undefined");
      }
      temp.LCDPrintP = {
        value: {
          sensor: "analog_read", // vibration works like digital input
          pinumber 
        }
      };
    }
    else if (type === "Sound") {
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
      temp.LCDPrintP = {
        value: {
          sensor: "digital_read",
          pinumber: pinumber
        }
      };
    }
    else if (type === "sfSound") {
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
      temp.LCDPrintP = {
        value: {
          sensor: "digital_read",
          pinumber: pinumber
        }
      };
    }
    else if (type === "cayoSound") {
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
      temp.LCDPrintP = {
        value: {
          sensor: "digital_read",
          pinumber: pinumber
        }
      };
    }
    else if(type === "colorsensor"){
      temp.LCDPrintP = {
        value: {
          sensor : 'CS',
          channel: getValue("value")
        }
      };
    }
  else if (type === "true_false_block") {
    temp.LCDPrintP = {
      value: {
        value: getValue("BOOL") === "TRUE" ? "1" : "0"
      }
    };
  }
  else if (type === "input_value") {
    temp.LCDPrintP = {
      value: {
        TEXT: `${getValue("value")}`
      }
    };
  }
  else if(type === "pitch_block"){
    temp.LCDPrintP = {
      value:{
      sensor: "DronePitch" 
      }
    };
  }
  else if(type === "roll_block"){
    temp.LCDPrintP = {
      value:{
        sensor: "DroneRoll" 
        }      };
  }
  else if(type === "yaw_block"){
    temp.LCDPrintP = {
      value:{
        sensor: "DroneYaw" 
        }      };
  }
  else if(type === "barometer_block"){
    temp.LCDPrintP = {
      value:{
        sensor: "DroneBarometer" 
        }      };
  }
  // else if (
  //   type === "digital_read" ||
  //   type === "analog_read" ||
  //   type === "sfanalog_read" ||
  //   type === "sfdigital_read"
  // ) {
  //   temp.LCDPrintP = {
  //     value: {
  //       sensor: handleAnalogDigitalRead(type),
  //       pinumber: getValue("value")
  //     }
  //   };
  // }
  else {
    temp.LCDPrintP = {
      value: {
        unknown: true,
        blockType: type
      }
    };
  }

  return JSON.stringify(temp);
};