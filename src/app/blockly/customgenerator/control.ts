import customGenerator from ".";
import {ColorGridField} from '../Helper/helperclass.js'

customGenerator.forBlock["led_control"] = function(block) {
  function hexToRgb(hex) {
    hex = hex.replace(/^#/, '');
    if (hex.length === 3) hex = hex.split('').map(x => x + x).join('');
    const bigint = parseInt(hex, 16);
    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;
    return { r, g, b };
  }

  let ln = customGenerator.valueToCode(block, 'value', 0);
  
  if (ln && (ln.startsWith('(') && ln.endsWith(')'))) {
      ln = ln.slice(1, -1);
  }
  if (ln && (ln.startsWith('"') && ln.endsWith('"'))) {
      ln = ln.slice(1, -1);
  }
  
  const color = block.getFieldValue('COLOR');
  const rgb = hexToRgb(color);

  let lnValue;

  // Check if ln is the JSON string from 'get_variable'
  if (ln && ln.startsWith('{"var":') && ln.endsWith('}')) {
      // Input is a variable block, parse the JSON string
      try {
          const parsedVar = JSON.parse(ln);
          lnValue = parsedVar; // Should be { var: "j" }
      } catch (e) {
          lnValue = ln;
      }
  } else if (!ln) {
    const shadowBlock = block.getInputTargetBlock('value');
    if (shadowBlock && shadowBlock.type === 'math_number') {
      lnValue = parseFloat(shadowBlock.getFieldValue('NUM'));
    } else {
      lnValue = null;
    }
  } else {
    // If ln looks like a JSON string from input_value, parse it
    if (typeof ln === "string" && ln.startsWith('{"value":')) {
      try {
        const parsed = JSON.parse(ln);
        lnValue = parsed.value;
      } catch (e) {
        lnValue = ln;
      }
    } else {
      lnValue = isNaN(ln) ? ln : Number(ln);
    }
  }
  const finalLnValue = (typeof lnValue === 'object' && lnValue !== null) 
    ? lnValue 
    : (isNaN(lnValue) ? lnValue : Number(lnValue));
  
  const jsonOutput = {
    sled: {
      ln: finalLnValue, // This will be { "var": "j" } for a variable
      R: rgb.r,
      G: rgb.g,
      B: rgb.b
    }
  };

  // Return the stringified JSON
  return JSON.stringify(jsonOutput, null, 2);
};
customGenerator.forBlock['math_number'] = function(block, generator) {
  const code = block.getFieldValue('NUM'); // still string from field
  return [code.toString(),0]; // ✅ first element must be string
};
customGenerator.forBlock["all_led_control"] = function(block){
    function hexToRgb(hex:any) {
        hex = hex.replace(/^#/, '');
        if (hex.length === 3) {
          hex = hex.split('').map(x => x + x).join('');
        }
        const bigint = parseInt(hex, 16);
        const r = (bigint >> 16) & 255;
        const g = (bigint >> 8) & 255;
        const b = bigint & 255;
        return { r, g, b };
      }
    const ln = block.getFieldValue('value')
    const color = block.getFieldValue('COLOR');
    const rgb = hexToRgb(color);
    const jsonOutput = {
      aled: {
        R: rgb.r,
        G: rgb.g,
        B: rgb.b
      }
    };
    return JSON.stringify(jsonOutput, null, 2); 
}

//not working
customGenerator.forBlock["testled_control"] = function (block) {
  const field = block.getField("value") as ColorGridField | null;
  if (!field) return JSON.stringify({ WLEDMat: { leds: [] } });

  const grid = field.getValue();
  const leds: any[] = [];

  const numRows = grid.length;
  for (let row = 0; row < numRows; row++) {
    const numCols = grid[row].length;
    for (let col = 0; col < numCols; col++) {
      const cell = grid[row][col];
      if (cell && typeof cell === "object" && "R" in cell && "G" in cell && "B" in cell) {
        // Only include filled (non-zero color) cells
        if (cell.R !== 0 || cell.G !== 0 || cell.B !== 0) {
          const ln = row * numCols + col + 1;
          leds.push([ln, cell.R, cell.G, cell.B]);
        }
      }
    }
  }

  const output = { WLEDMat: { leds } };
  return JSON.stringify(output);
};

customGenerator.forBlock["clear_all_led"] = function (block){
  const jsonOutput = {
    "aled": {
          "R": 0,
          "G": 0,
          "B": 0
        }
  };
  return JSON.stringify(jsonOutput)
}









  
customGenerator.forBlock["led_sequence"] = function(block){
    const id = block.getFieldValue('value')
    const jsonOutput = {
        pled: {
         ID : id
        }
      };
    return JSON.stringify(jsonOutput, null, 2); 
}  



customGenerator.forBlock["buzzer"] = function(block){
    const freq = block.getFieldValue('frequency') ; 
    const dur = block.getFieldValue('duration') ; // Default to '10' if not provided
    const jsonOutput = {
        buzt: {
            freq :freq,
            dur : dur
           }
      };
    return JSON.stringify(jsonOutput, null, 2); 
} 

customGenerator.forBlock["buzzer_preset"] = function(block){
    const id = block.getFieldValue('value');  
    const jsonOutput = {
      buzs: {
        ID : id
      }

      };
    return JSON.stringify(jsonOutput, null, 2); 
}


customGenerator.forBlock["delay"] = function(block){
    const ms = block.getFieldValue('ms') ; 
    const jsonOutput = {
        delay : {
            ms : ms
          }  
      };
    return JSON.stringify(jsonOutput, null, 2); 
}


customGenerator.forBlock["play_note"] = function(block){
  const NOTE_MAP = {
    "Middle C": "261.63"
  };

  const freqRaw = block.getFieldValue('frequency');
  const freq = NOTE_MAP[freqRaw] || freqRaw;

  const dur = block.getFieldValue('duration');

  return JSON.stringify({
    buzt: { freq, dur }
  }, null, 2);
}

customGenerator.forBlock['Button'] = function(block){
  const button = block.getFieldValue('button')
  const value = block.getFieldValue('value')
  const jsonOutput = {
    button,
    value
  }
  return [JSON.stringify(jsonOutput), 0]
}

