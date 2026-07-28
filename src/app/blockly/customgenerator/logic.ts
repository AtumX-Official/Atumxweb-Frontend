import { channel } from 'diagnostics_channel';
import customGenerator from '.'
import * as Blockly from 'blockly/core'

/**
 * Adds block(s) to a target object with sequential numeric keys.
 * Recursively expands function calls using inlineFunctionBody().
 */
function addToIndexedObject(
  block: Blockly.Block | null,
  target: Record<string, any>,
  startIndex: number = 0,
  insideMainContext: boolean = false
): number {
  let current = block;
  let index = startIndex;

  while (current) {
    const blockType = current.type;

    // --- Function Call Inlining ---
    if (blockType === 'function_call') {
      const funcName = current.getFieldValue('function_name');
      const inlined = inlineFunctionBody(funcName);

      inlined.forEach((entry) => {
        target[index.toString()] = entry;
        index++;
      });
    }

    // --- Normal Block ---
    else {
      const code = customGenerator.blockToCode(current);
      const entries = Array.isArray(code) ? code : [code];

      entries.forEach((entry) => {
        if (typeof entry === 'object' && entry !== null) {
          target[index.toString()] = entry;
        } else if (typeof entry === 'string' && entry.trim() !== '') {
          try {
            const parsed = JSON.parse(entry);
            target[index.toString()] = parsed;
          } catch (e) {
            console.warn('Invalid JSON from block:', entry);
          }
        }
        index++;
      });
    }

    current = current.getNextBlock();
  }

  return index;
}
function inlineFunctionBody(funcName: string, seen: Set<string> = new Set()): any[] {
  if (seen.has(funcName)) {
    console.warn('Recursive function detected:', funcName);
    return [{ type: 'function_call', function_name: funcName }];
  }

  const funcBody = customGenerator.__functionRegistry?.[funcName];
  if (!Array.isArray(funcBody)) {
    return [{ type: 'function_call', function_name: funcName }];
  }

  seen.add(funcName);
  const clone = JSON.parse(JSON.stringify(funcBody));
  const expanded = expandNestedCalls(clone, seen);
  seen.delete(funcName);

  return Array.isArray(expanded) ? expanded : [expanded];
}

/** Deeply expand function_call nodes inside nested structures like if.tcmd, repeat.do */
function expandNestedCalls(node: any, seen: Set<string>): any {
  if (Array.isArray(node)) {
    const expanded = node.map((n) => expandNestedCalls(n, seen));
  
    // Flatten ONLY if elements look like commands
    if (expanded.every(e => e && typeof e === 'object' && 'type' in e)) {
      return expanded.flat();
    }
  
    return expanded;
  }
  

  if (node && typeof node === 'object') {
    if (node.type === 'function_call') {
      return inlineFunctionBody(node.function_name, seen);
    }

    const clone: any = {};
    for (const [key, value] of Object.entries(node)) {
      clone[key] = expandNestedCalls(value, seen);
    }
    return clone;
  }

  return node;
}

const getConditionFromBlock = (condBlock: Blockly.Block | null) => {
  if (!condBlock) return null;
  if (condBlock.type === 'custom_compare' || condBlock.type === 'logical_if' || condBlock.type.startsWith('ai_')) {
    try {
     // Use blockToCode to execute the block's own generator
    const raw = customGenerator.blockToCode(condBlock);
     // raw will be an array [code, order], e.g., ['{"sensor": "a", ...}', 0]
    const jsonString = Array.isArray(raw) ? raw[0] : raw;
    
     if (typeof jsonString === 'string') {
    // Successfully run the custom_compare generator and parsed its output
    return JSON.parse(jsonString);
     }
    } catch (e) {
    console.warn(`Failed to process ${condBlock.type} with blockToCode:`, e);
     // Fallback to null if generator/parsing fails
    return null;
    }
    }
  // 1) even/odd block
  if (condBlock.type === 'evenodd') {
    const operation = condBlock.getFieldValue('operation');
    const valueBlock = condBlock.getInputTargetBlock('value');

    if (valueBlock?.type === 'get_variable') {
      return { operation, value: { var: valueBlock.getFieldValue('VAR') } };
    }

    return { operation, value: customGenerator.valueToCode(condBlock, 'value', 0) || '0' };
  }

  // 2) button
  if (condBlock.type === 'Button') {
    return {
      sensor: condBlock.getFieldValue('button'),
      operator: 'EQ',
      value: condBlock.getFieldValue('value'),
    };
  }

  // 3) color sensor
  if (condBlock.type === 'color_sensor') {
    return {
      sensor: 'CS1',
      operator: 'EQ',
      color: condBlock.getFieldValue('value'),
    };
  }
  if(condBlock.type === 'colorsensor'){
    const channel = condBlock.getFieldValue("value"); 
    const value = condBlock.getFieldValue("value") 
      return {
        sensor: 'CS',
        operator: 'EQ',
        channel: channel,
      };
  }

  // 4) logical operators (they commonly expose JSON under "JSON")
  const logicalTypes = new Set(['logical_and', 'logical_or', 'logical']);
  if (logicalTypes.has(condBlock.type)) {
    try {
      const raw = customGenerator.valueToCode(condBlock, 'JSON', 0);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }

  const tryInputs = ['JSON', 'B', 'A', 'value', 'LEFT', 'RIGHT', 'IF', 'COND'];
  for (const inputName of tryInputs) {
    try {
      // some blocks will return ["..."] or [jsonString, order] or just string.
      const raw = customGenerator.valueToCode(condBlock, inputName, 0);
      if (!raw) continue;
      // raw might be an array [code, order] if generator returns that; handle string only
      if (Array.isArray(raw)) {
        const maybe = raw[0];
        if (typeof maybe === 'string') {
          try { return JSON.parse(maybe); } catch { continue; }
        }
      }
      if (typeof raw === 'string') {
        try { return JSON.parse(raw); } catch { continue; }
      }
    } catch (e) {
      // input doesn't exist on this block — safe to ignore
      continue;
    }
  }

  // nothing parsed
  return null;
};
function isLogicalIfJson(obj: any) {
  return (
    obj &&
    typeof obj === 'object' &&
    obj.op &&
    obj.lcond &&
    obj.rcond
  );
}

function unwrapNotCondition(condBlock: Blockly.Block | null) {
  if (!condBlock) return { cond: null, hasNot: false };

  // IF condition starts with NOT
  if (condBlock.type === 'custom_not') {
    const inner = condBlock.getInputTargetBlock('BOOL');
    const innerCond = getConditionFromBlock(inner);

    if (innerCond && typeof innerCond === 'object') {

      // 🔥 CASE 1: logical_if → push NOT into both sides
      if (
        isLogicalIfJson(innerCond) &&
        innerCond.lcond?.sensor &&
        innerCond.rcond?.sensor
      ) {
        return {
          cond: {
            ...innerCond,
            lcond: { ...innerCond.lcond, not: 1 },
            rcond: { ...innerCond.rcond, not: 1 }
          },
          hasNot: true
        };
      }

      // ✅ CASE 2: custom_compare or others → normal NOT
      return {
        cond: { ...innerCond, not: 1 },
        hasNot: true
      };
    }

    return { cond: null, hasNot: true };
  }

  // Normal condition
  return {
    cond: getConditionFromBlock(condBlock),
    hasNot: false
  };
}


customGenerator.forBlock['custom_if_else'] = function (block: Blockly.Block) {
  const condCode = customGenerator.valueToCode(block, 'COND', 0);

  // Parse condition
  let condition = {};
  let isLogicalIf = false;
  try {
    if (condCode) {
      const parsed = JSON.parse(condCode);
      condition = parsed;
      if (
        parsed.hasOwnProperty('op') &&
        parsed.hasOwnProperty('lcond') &&
        parsed.hasOwnProperty('rcond')
      ) {
        isLogicalIf = true;
      }
    }
  } catch (e) {
    console.warn('Invalid condition JSON:', condCode);
  }

  // ✅ Use addToIndexedObject for nested DO and ELSE
  const doContainer: Record<string, any> = {};
  const elseContainer: Record<string, any> = {};
  const doBlock = block.getInputTargetBlock('DO');
  const elseBlock = block.getInputTargetBlock('ELSE');

  if (doBlock) addToIndexedObject(doBlock, doContainer, 0);
  if (elseBlock) addToIndexedObject(elseBlock, elseContainer, 0);

  // Build final structure
  const result: any = {};
  if (isLogicalIf) {
    result['ifoa'] = {
      ...condition,
      tcmd: doContainer,
      ecmd: elseContainer,
    };
  } else {
    result['if'] = {
      cond: condition,
      tcmd: doContainer,
      ecmd: elseContainer,
    };
  }

  return JSON.stringify(result);
};


customGenerator.forBlock['input_value'] = function (block: Blockly.Block) {
  const value = block.getFieldValue('value') || '0'

  const jsonOutput = { value }

  // Return a tuple: [code, precedence]
  return [JSON.stringify(jsonOutput), 0] // 0 is the precedence
}

customGenerator.forBlock['custom_compare'] = function (block: Blockly.Block) {
  const sensorBlock = block.getInputTargetBlock('A')
  const operator = block.getFieldValue('OP')
  const workspace = block.workspace
  const allBlocks = workspace.getAllBlocks(false)

  let comparisonTuple = '0' // Default value
  if (!sensorBlock) {
    throw new Error('No sensor block connected to the comparison input.')
  }

  let sensor, pinnumber
  let parsedValue = 0
  let channel
  switch (sensorBlock.type) {
    case 'US1':
    case 'ldr':
    case 'ir':
    case 'DTHSensor':
      sensor = sensorBlock.getFieldValue('value')
      comparisonTuple = customGenerator.valueToCode(block, 'B', 0) || '0'
      break
    case 'get_variable':
    case 'input_value':
      sensor = sensorBlock.getFieldValue('VAR')
      comparisonTuple = customGenerator.valueToCode(block, 'B', 0) || '0'
      break
    case 'digital_read':
    case 'analog_read':
    case 'cayodigital_read':
    case 'sfdigital_read':
    case 'cayoanalog_read':
    case 'sfanalog_read':  
    case 'dronedigital_read' :
    case 'droneanalog_read' :   
    const typeMap = {
      cayodigital_read: 'digital_read',
      sfdigital_read: 'digital_read',
      cayoanalog_read: 'analog_read',
      sfanalog_read: 'analog_read'
    }   
    sensor = typeMap[sensorBlock.type] || sensorBlock.type
    pinnumber = sensorBlock.getFieldValue('value')
      comparisonTuple = customGenerator.valueToCode(block, 'B', 0) || '0'
      break
    case 'Vibration':
      sensor = 'digital_read'
      for (const b of allBlocks) {
        if (b.type === 'setvibration') {
          pinnumber = b.getFieldValue('value')
          break // take the first one found (or last if you prefer)
        }
      }
      comparisonTuple = customGenerator.valueToCode(block, 'B', 0) || '0'
      break
    case 'Touch':
      sensor = 'digital_read'
      for (const b of allBlocks) {
        if (b.type === 'settouch') {
          pinnumber = b.getFieldValue('value')
          break // take the first one found (or last if you prefer)
        }
      }
      comparisonTuple = customGenerator.valueToCode(block, 'B', 0) || '0'
      break
    case 'Relay':
      sensor = 'digital_read'
      for (const b of allBlocks) {
        if (b.type === 'setrelay') {
          pinnumber = b.getFieldValue('value')
          break // take the first one found (or last if you prefer)
        }
      }
      comparisonTuple = customGenerator.valueToCode(block, 'B', 0) || '0'
      break
    case 'Gas':
      sensor = 'analog_read'
      for (const b of allBlocks) {
        if (b.type === 'setgas') {
          pinnumber = b.getFieldValue('value')
          break // take the first one found (or last if you prefer)
        }
      }
      comparisonTuple = customGenerator.valueToCode(block, 'B', 0) || '0'
      break
    case 'Soil':
      sensor = 'analog_read'
      for (const b of allBlocks) {
        if (b.type === 'setgas') {
          pinnumber = b.getFieldValue('value')
          break // take the first one found (or last if you prefer)
        }
      }
      comparisonTuple = customGenerator.valueToCode(block, 'B', 0) || '0'
      break
    case 'sfVibration':
      sensor = 'digital_read'
      for (const b of allBlocks) {
        if (b.type === 'sfsetvibration') {
          pinnumber = b.getFieldValue('value')
          break // take the first one found (or last if you prefer)
        }
      }
      comparisonTuple = customGenerator.valueToCode(block, 'B', 0) || '0'
      break
    case 'sfTouch':
      sensor = 'digital_read'
      for (const b of allBlocks) {
        if (b.type === 'sfsettouch') {
          pinnumber = b.getFieldValue('value')
          break // take the first one found (or last if you prefer)
        }
      }
      comparisonTuple = customGenerator.valueToCode(block, 'B', 0) || '0'
      break
    case 'sfRelay':
      sensor = 'digital_read'
      for (const b of allBlocks) {
        if (b.type === 'sfsetrelay') {
          pinnumber = b.getFieldValue('value')
          break // take the first one found (or last if you prefer)
        }
      }
      comparisonTuple = customGenerator.valueToCode(block, 'B', 0) || '0'
      break
    case 'sfGas':
      sensor = 'analog_read'
      for (const b of allBlocks) {
        if (b.type === 'sfsetgas') {
          pinnumber = b.getFieldValue('value')
          break // take the first one found (or last if you prefer)
        }
      }
      comparisonTuple = customGenerator.valueToCode(block, 'B', 0) || '0'
      break
    case 'sfSoil':
      sensor = 'analog_read'
      for (const b of allBlocks) {
        if (b.type === 'sfsetgas') {
          pinnumber = b.getFieldValue('value')
          break // take the first one found (or last if you prefer)
        }
      }
      comparisonTuple = customGenerator.valueToCode(block, 'B', 0) || '0'
      break
    case 'cayoVibration':
      sensor = 'digital_read'
      for (const b of allBlocks) {
        if (b.type === 'setvibration') {
          pinnumber = b.getFieldValue('value')
          break // take the first one found (or last if you prefer)
        }
      }
      comparisonTuple = customGenerator.valueToCode(block, 'B', 0) || '0'
      break
    case 'cayoTouch':
      sensor = 'digital_read'
      for (const b of allBlocks) {
        if (b.type === 'cayosettouch') {
          pinnumber = b.getFieldValue('value')
          break // take the first one found (or last if you prefer)
        }
      }
      comparisonTuple = customGenerator.valueToCode(block, 'B', 0) || '0'
      break
    case 'cayoRelay':
      sensor = 'digital_read'
      for (const b of allBlocks) {
        if (b.type === 'cayosetrelay') {
          pinnumber = b.getFieldValue('value')
          break // take the first one found (or last if you prefer)
        }
      }
      comparisonTuple = customGenerator.valueToCode(block, 'B', 0) || '0'
      break
    case 'cayoGas':
      sensor = 'analog_read'
      for (const b of allBlocks) {
        if (b.type === 'cayosetgas') {
          pinnumber = b.getFieldValue('value')
          break // take the first one found (or last if you prefer)
        }
      }
      comparisonTuple = customGenerator.valueToCode(block, 'B', 0) || '0'
      break
    case 'cayoSoil':
      sensor = 'analog_read'
      for (const b of allBlocks) {
        if (b.type === 'cayosetgas') {
          pinnumber = b.getFieldValue('value')
          break // take the first one found (or last if you prefer)
        }
      }
      comparisonTuple = customGenerator.valueToCode(block, 'B', 0) || '0'
      break
     case 'colorsensor':
      sensor = 'CS'
      for (const b of allBlocks) {
        if (b.type === 'colorsensor') {
          channel = b.getFieldValue('value')
          break // take the first one found (or last if you prefer)
        }
      }      comparisonTuple = customGenerator.valueToCode(block, 'B', 0) || '0'
     break 
    default:
      throw new Error(`Unknown sensor type: '${sensorBlock.type}'`)
  }
  try {
    const parsed = JSON.parse(comparisonTuple)
    parsedValue = parsed.value ?? 0 // Default to 0 if `value` is missing
  } catch (e) {
    console.warn('Failed to parse comparisonTuple:', comparisonTuple, e)
  }
 
  
const jsonOutput = {
    sensor: sensor,
    ...(channel && {channel}),
    operator: operator,
    value: parsedValue,
    ...(pinnumber && { pinnumber }),
  }

  // Return a tuple [code, order] since this is a value block
  return [JSON.stringify(jsonOutput, null, 2), 0] // 0 = precedence (like ORDER_ATOMIC)
}

customGenerator.forBlock['logical_if'] = function (block) {
  const op = block.getFieldValue('LOGIC_OP') // "AND" or "OR"

  const leftBlock = block.getInputTargetBlock('LEFT')
  const rightBlock = block.getInputTargetBlock('RIGHT')

  // Helper to build condition
  const buildCond = (condBlock) => {
    if (!condBlock) return {}
    if (condBlock.type === "custom_compare") {
      try {
        const [jsonStr] = customGenerator.forBlock['custom_compare'](condBlock);
        return JSON.parse(jsonStr);
      } catch (e) {
        console.warn("Failed to parse custom_compare output", e);
        return {};
      }
    }

    // CASE ① — custom_logic_compare-like structure (has A/B inputs)
    if (condBlock?.inputs?.A && condBlock?.inputs?.B) {
      const aBlock = condBlock.inputs.A.block
      const bBlock = condBlock.inputs.B.block
      const opField = condBlock.getFieldValue('OP')

      // Special case: Button blocks
      if (aBlock?.type === 'Button') {
        return {
          sensor: aBlock.getFieldValue('button'), // "ButtonL" / "ButtonR"
          operator: 'EQ',
          value: aBlock.getFieldValue('value'),
          pinumber: aBlock.getFieldValue('button')
        }
      }

      return {
        sensor:
          aBlock?.type === 'get_variable'
            ? aBlock?.getFieldValue('VAR')
            : aBlock?.getFieldValue('value'),
        operator: opField,
        value: bBlock?.getFieldValue('value') || '1',
        pinumber: aBlock?.getFieldValue('value') || ''
      }
    }

    // CASE ② — direct sensor (no comparison block)
    if (condBlock.type === 'Button') {
      return {
        sensor: condBlock.getFieldValue('button'), // "ButtonL"/"ButtonR"
        operator: 'EQ',
        value: condBlock.getFieldValue('value'),
        pinumber: condBlock.getFieldValue('button')
      }
    }

    return {
      sensor: condBlock.type,
      operator: 'EQ',
      pinumber: condBlock.getFieldValue('value'),
      value: '1'
    }
  }

  const lcond = buildCond(leftBlock)
  const rcond = buildCond(rightBlock)
  let parent = block.getParent();
// ✅ Correct NOT detection for value blocks
let hasNot = false;

const outputConn = block.outputConnection;
if (outputConn && outputConn.targetConnection) {
  const wrapper = outputConn.targetConnection.getSourceBlock();
  if (wrapper && wrapper.type === 'custom_not') {
    hasNot = true;
    console.log("Found NOT block wrapping logical_if!");
  }
}
  
  const tmp: any = {
    op,
    lcond,
    rcond,
    
  }

 

  return [JSON.stringify(tmp, null, 2), 0]
}

customGenerator.forBlock['Button'] = function (block: Blockly.Block) {
  // Extract fields directly
  const sensor = block.getFieldValue('button')
  const value = block.getFieldValue('value')

  const jsonOutput = {
    sensor: sensor,
    operator: 'EQ',
    value: value
  }

  // Return as JSON string with atomic order
  return [JSON.stringify(jsonOutput, null, 2), 0]
}

customGenerator.forBlock['custom_if'] = function (block: Blockly.Block) {
  const mainCondBlock = block.getInputTargetBlock('IF0');
  const { cond: mainCond } = unwrapNotCondition(mainCondBlock);
  const mainIsLogical =
    mainCond &&
    typeof mainCond === 'object' &&
    mainCond.hasOwnProperty('op') &&
    mainCond.hasOwnProperty('lcond') &&
    mainCond.hasOwnProperty('rcond');

  // ---------- build main IF tcmd using addToIndexedObject ----------
  const mainTcmd: Record<string, any> = {};
  const mainDo = block.getInputTargetBlock('DO0');
  if (mainDo) addToIndexedObject(mainDo, mainTcmd, 0);

  // prepare IF entry (we always represent the first IF as IF0 when producing "elseif" root)
  const makeEntryForCondition = (cond: any, tcmd: Record<string, any>) => {
    const isLogical =
      cond &&
      typeof cond === 'object' &&
      cond.hasOwnProperty('op') &&
      cond.hasOwnProperty('lcond') &&
      cond.hasOwnProperty('rcond');

    if (isLogical) {
      // logical style: spread op/lcond/rcond at top level
      return { ...cond, tcmd };
    } else {
      return { cond: cond, tcmd };
    }
  };

  const IF0Entry = makeEntryForCondition(mainCond, mainTcmd);

  // ---------- collect ELSEIF(s) and ELSE ----------
  const elseifEntries: Record<string, any> = {};
  let elseTcmd: Record<string, any> = {};
  let hasElse = false;
  let elseifIndex = 1;
  const keyPrefix = mainIsLogical ? 'IFOA' : 'IF';
  let next = block.getNextBlock();
  while (next) {
    // only handle elseif / else directly attached in chain
    if (next.type === 'custom_elseif') {
      // parse condition from the IF input of the elseif block
      const elseifCondBlock = next.getInputTargetBlock('IF');
      const { cond: elseifCond } = unwrapNotCondition(elseifCondBlock);
      // build tcmd for this elseif's DO
      const elseifTcmd: Record<string, any> = {};
      const elseifDo = next.getInputTargetBlock('DO');
      if (elseifDo) addToIndexedObject(elseifDo, elseifTcmd, 0);

      // produce key name IF1, IF2, etc (always IFn regardless of logical type)
      const isElseIfLogical =
      elseifCond &&
      typeof elseifCond === 'object' &&
      elseifCond.hasOwnProperty('op') &&
      elseifCond.hasOwnProperty('lcond') &&
      elseifCond.hasOwnProperty('rcond');
    
    const key = `${isElseIfLogical ? 'IFOA' : 'IF'}${elseifIndex}`;
          // entry: if logical, include op/lcond/rcond spread, else cond: ...
      const entry =
        elseifCond &&
        typeof elseifCond === 'object' &&
        elseifCond.hasOwnProperty('op') &&
        elseifCond.hasOwnProperty('lcond') &&
        elseifCond.hasOwnProperty('rcond')
          ? { ...elseifCond, tcmd: elseifTcmd }
          : { cond: elseifCond, tcmd: elseifTcmd };

      elseifEntries[key] = entry;
      next.processed = true;
      elseifIndex++;
    } else if (next.type === 'custom_else') {
      const tmp: Record<string, any> = {};
      const elseDo = next.getInputTargetBlock('DO');
      if (elseDo) addToIndexedObject(elseDo, tmp, 0);
      elseTcmd = tmp;
      hasElse = Object.keys(elseTcmd).length > 0;
      next.processed = true;
    }

    next = next.getNextBlock();
  }

  const hasElseIf = Object.keys(elseifEntries).length > 0;

  // ---------- produce final JSON according to rules ----------
  let result: any = {};

  // CASE A: there are ELSEIFs (or ELSE + ELSEIF) — produce the 'elseif' root
  if (hasElseIf) {
    // start with IF0
    const obj: Record<string, any> = {};
// Use the determined prefix for the first entry
const IF0Key = `${keyPrefix}0`;
obj[IF0Key] = IF0Entry; // This is the IF0 or IFOA0 entry
    // attach other IFn entries
    for (const [k, v] of Object.entries(elseifEntries)) {
      obj[k] = v;
    }

    // attach ecmd if present
    if (hasElse) obj['ecmd'] = elseTcmd;

    result = { elseif: obj };
  }

  // CASE B: no ELSEIF
  else {
    // if the main IF is logical -> produce 'ifoa'
    if (mainIsLogical) {
      const out: any = { ...mainCond, tcmd: mainTcmd };
      if (hasElse) out.ecmd = elseTcmd;
      result = { ifoa: out };
    } else {
      // normal single IF
      const out: any = { cond: mainCond, tcmd: mainTcmd };
      if (hasElse) out.ecmd = elseTcmd;
      result = { if: out };
    }
  }

  // final stringify
  return JSON.stringify(result, null, 2);
};



customGenerator.forBlock['custom_elseif'] = function (block: Blockly.Block) {

  return '';
};


customGenerator.forBlock['custom_else'] = function (block: Blockly.Block) {
return '';
};

customGenerator.forBlock['custom_repeat_ext'] = function (block: Blockly.Block) {
  // Get the block connected to TIMES
  const timesBlock = block.getInputTargetBlock('TIMES')

  let times: any
  if (!timesBlock) {
    // If no connected block, use shadow value
    const shadowValue = block.getFieldValue('TIMES')
    times = shadowValue ? parseInt(shadowValue, 10) : 0
  } else if (timesBlock.type === 'math_number') {
    times = Number(timesBlock.getFieldValue('NUM'))
  } else if (timesBlock.type === 'input_value') {
    times = Number(timesBlock.getFieldValue('value'))
  } else if (timesBlock.type === 'get_variable') {
    times = { var: timesBlock.getFieldValue('VAR') }
  } else {
    // fallback: generate code from connected block
    times = customGenerator.blockToCode(timesBlock)
  }

  // Process DO blocks
  const arrayToIndexedObject = (arr: Record<string, any>[]) =>
    arr.reduce((acc, item, index) => {
      acc[index] = item
      return acc
    }, {})

  const doBlocks: any[] = []
  let current = block.getInputTargetBlock('DO')

  while (current) {
    let code = customGenerator.blockToCode(current)

    // handle arrays (from function_call)
    if (Array.isArray(code)) {
      doBlocks.push(...code)
    } else if (typeof code === 'string') {
      try {
        doBlocks.push(JSON.parse(code))
      } catch {}
    } else if (code && typeof code === 'object') {
      doBlocks.push(code)
    }

    current = current.getNextBlock()
  }

  // convert to indexed object
  const doContainer: Record<string, any> = {}
  doBlocks.forEach((item, i) => (doContainer[i.toString()] = item))

  return JSON.stringify({
    repeat: { times, do: doContainer }
  })
}

customGenerator.forBlock['break'] = function(){
  const result = {
    break: {
      "break" : "break"
    }
  };
  return JSON.stringify(result);
}

customGenerator.forBlock['continue'] = function(){
  const result = {
    continue: {
      "continue" : "continue"
    }
  };
  return JSON.stringify(result);
}

customGenerator.forBlock['forloop'] = function(block: Blockly.Block) {

  const cond = block.getInputTargetBlock('condition');
  const from = block.getFieldValue('FROM');
  const to = block.getFieldValue('TO');
  const by = block.getFieldValue('BY');

  let times: any = null;

  if (cond) {
    if (cond.type === 'get_variable') {
      times = { var: cond.getFieldValue('VAR') };
    } else {
      let raw = customGenerator.blockToCode(cond);
      try { times = JSON.parse(raw); } catch { times = raw; }
    }
  }

  // --- Process DO blocks ---
  const arrayToIndexedObject = (arr: Record<string, any>[]) =>
    arr.reduce((acc, item, index) => { acc[index] = item; return acc; }, {});

  const doBlocks: Record<string, any>[] = [];
  let currentBlock = block.getInputTargetBlock('DO');

  while (currentBlock) {
    const code = customGenerator.blockToCode(currentBlock);
    if (typeof code === "string") {
      try { doBlocks.push(JSON.parse(code)); }
      catch { console.warn("Invalid JSON:", code); }
    }
    currentBlock = currentBlock.getNextBlock();
  }

  // -----------------------------------------
  // BUILD OBJECT IN THE CORRECT ORDER
  // -----------------------------------------
  const forloopObj: any = {};

  // 1️⃣ Insert var first (if exists)
  if (times && typeof times === "object" && times.var) {
    forloopObj.var = times.var;
  }

  // 2️⃣ Insert remaining fields
  forloopObj.from = from;
  forloopObj.to = to;
  forloopObj.by = by;
  forloopObj.cmd = arrayToIndexedObject(doBlocks);

  const result = { forloop: forloopObj };

  return JSON.stringify(result);
};


customGenerator.forBlock['while'] = function (block) {

  // --- Convert DO blocks ---
  const arrayToIndexedObject = (arr) =>
    arr.reduce((acc, item, index) => {
      acc[index] = item;
      return acc;
    }, {});

  const processDo = () => {
    const list = [];
    let b = block.getInputTargetBlock("DO0");

    while (b) {
      const code = customGenerator.blockToCode(b);
      if (typeof code === "string") {
        try { list.push(JSON.parse(code)); }
        catch { console.warn("Invalid JSON in DO block:", code); }
      }
      b = b.getNextBlock();
    }

    return arrayToIndexedObject(list);
  };

  // --- Get condition block ---
  const condBlock = block.getInputTargetBlock("cond");

  let condition = null;

  if (condBlock) {
    // custom_compare
    if (condBlock.type === "custom_compare") {
      const [jsonStr] = customGenerator.forBlock["custom_compare"](condBlock);
      condition = JSON.parse(jsonStr);
    }

    // logical_if
    else if (condBlock.type === "logical_if") {
      const [jsonStr] = customGenerator.forBlock["logical_if"](condBlock);
      condition = JSON.parse(jsonStr);
    }
  }

  // --- FINAL JSON WITHOUT extra "condition": { condition } ---
  const result = {
    whileloop: {
      cond: condition || {},
      cmd: processDo()
    }
  };

  return JSON.stringify(result, null, 2);
};