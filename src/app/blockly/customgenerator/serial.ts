import customGenerator from ".";
import * as Blockly from 'blockly/core';

customGenerator.forBlock['serial_print'] = function (block: Blockly.Block) {
    const temp: any = {};
    const contentBlock = block.getInputTargetBlock('CONTENT');
    const workspace = block.workspace;
    const allBlocks = workspace.getAllBlocks(false);

    if (!contentBlock) return JSON.stringify({ serialp: { value: {} } });
  
    const type = contentBlock.type;
  
    const getValue = (field: string) => contentBlock.getFieldValue(field);
  
    if (type === "text" ) {
      const TEXT = getValue("TEXT");
      temp.serialp = {
        value: {
          TEXT
        }
      };
    }
    else if(type === "get_variable"){
        const VAR = getValue("VAR") ;
        temp.serialp = {
          value: {
            VAR
          }
        };
  
    }
    else if (type === "US1" || type === "ldr" || type === "ir" || type === "DTHSensor") {
      temp.serialp = {
        value: {
          sensor: getValue("value")
        }
      };
    }
    else if (type === "analog_read" || type === "sfanalog_read" || type === "cayoanalog_read" || type === "droneanalog_read") {
        temp.serialp = {
          value: {
            sensor : 'analog_read',
            pinumber: getValue("value")
          }
        };
      }
      else if (type === "digital_read" || type === "sfdigital_read" || type === "cayodigital_read" || type === 'dronedigital_read') {
        temp.serialp = {
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
      
        temp.serialp = {
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
        temp.serialp = {
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
        temp.serialp = {
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
        temp.serialp = {
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
        temp.serialp = {
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
        temp.serialp = {
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
        temp.serialp = {
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
        temp.serialp = {
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
        temp.serialp = {
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
        temp.serialp = {
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
        temp.serialp = {
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
        temp.serialp = {
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
        temp.serialp = {
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
        temp.serialp = {
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
        temp.serialp = {
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
        temp.serialp = {
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
        temp.serialp = {
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
        temp.serialp = {
          value: {
            sensor: "digital_read",
            pinumber: pinumber
          }
        };
      }
      else if(type === "colorsensor"){
        temp.serialp = {
          value: {
            sensor : 'CS',
            channel: getValue("value")
          }
        };
      }
    else if (type === "true_false_block") {
      temp.serialp = {
        value: {
          value: getValue("BOOL") === "TRUE" ? "1" : "0"
        }
      };
    }
    else if (type === "input_value") {
      temp.serialp = {
        value: {
          TEXT: `${getValue("value")}`
        }
      };
    }
    else if(type === "pitch_block"){
      temp.serialp = {
        value:{
        sensor: "DronePitch" 
        }
      };
    }
    else if(type === "roll_block"){
      temp.serialp = {
        value:{
          sensor: "DroneRoll" 
          }      };
    }
    else if(type === "yaw_block"){
      temp.serialp = {
        value:{
          sensor: "DroneYaw" 
          }      };
    }
    else if(type === "barometer_block"){
      temp.serialp = {
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
    //   temp.serialp = {
    //     value: {
    //       sensor: handleAnalogDigitalRead(type),
    //       pinumber: getValue("value")
    //     }
    //   };
    // }
    else {
      temp.serialp = {
        value: {
          unknown: true,
          blockType: type
        }
      };
    }
  
    return JSON.stringify(temp);
  };
  
customGenerator.forBlock["display_number"] = function(block:Blockly.Block){
  const temp: any = {};
  const contentBlock = block.getInputTargetBlock('CONTENT');

  if (!contentBlock) return JSON.stringify({ serialp: { value: {} } });

  const type = contentBlock.type;

  const getValue = (field: string) => contentBlock.getFieldValue(field);
  if (type === "single_digit" ) {
    const TEXT = getValue("Value");
    temp.LEDSingleChar = {
      char: TEXT
    };
  }
  else if(type === "get_variable"){
    const VAR = getValue("VAR") ;
    temp.LEDSingleChar = {
      var: VAR
    };
}
else {
  temp.serialp = {
    value: {
      unknown: true,
      blockType: type
    }
  };
}

return JSON.stringify(temp);

}  