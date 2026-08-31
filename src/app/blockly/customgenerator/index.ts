import * as Blockly from 'blockly/core'

const customGenerator: any = new Blockly.Generator('CUSTOM')

const functionRegistry: Record<string, any[]> = {}
customGenerator.__functionRegistry = functionRegistry
customGenerator.forBlock = {}
customGenerator.__mode = 'mode'

// Core blockToCode handler
customGenerator.blockToCode = function (block: Blockly.Block) {
   if (!block) return ''
   const func = this.forBlock?.[block.type]
   // The 'if' block now needs to return a single structured object, not an array of commands.
   return func ? func.call(this, block) : ''
}

// Support for nested statements (Processes a list of blocks and expands function calls)
customGenerator.statementToCode = function (block: Blockly.Block, inputName: string): any[] {
   const firstChild = block.getInputTargetBlock(inputName);
   if (!firstChild) return [];
    const result: any[] = [];
   let current: Blockly.Block | null = firstChild;
    while (current) {
      const blockType = current.type;
      // --- Function Call Expansion Logic ---
      if (blockType === 'function_call') {
        const funcName = current.getFieldValue('function_name');
        const funcBody = customGenerator.__functionRegistry?.[funcName];
         if (Array.isArray(funcBody)) {
           // Deep clone and push the function body commands
           funcBody.forEach((entry) =>
             result.push(JSON.parse(JSON.stringify(entry)))
           );
         } else {
           // Fallback if function is not defined/registered
           result.push({
             type: 'function_call',
             function_name: funcName
           });
         }
      }
      // --- Existing Block Conversion Logic ---
      else {
        // Blocks like 'aled' return a single object (e.g., { "aled": ... })
        const code = this.blockToCode(current); 
         if (Array.isArray(code)) {
           // Should not happen for most simple command blocks, but handles arrays if they occur
           code.forEach((item) => {
             if (item !== null && item !== undefined) result.push(item);
           });
         } else if (typeof code === 'object' && code !== null) {
            // New: Handle direct object return from blockToCode (e.g., if/repeat)
            result.push(code);
         } else if (typeof code === 'string') {
           try {
             // Handle JSON string return
             result.push(JSON.parse(code));
           } catch {
             console.warn('Invalid block JSON:', code);
           }
         }
      }
       current = current.getNextBlock();
    }
    return result;
};

// --- NEW UTILITY FUNCTION: statementToCodeNested ---
// Processes statements for nested blocks (like tcmd/fcmd in 'if') 
// and formats them into an indexed object (e.g., { "0": {...}, "1": {...} })
customGenerator.statementToCodeNested = function (block: Blockly.Block, inputName: string): Record<string, any> {
    const commands = customGenerator.statementToCode(block, inputName);
    const result: Record<string, any> = {};
    commands.forEach((cmd: any, index: number) => {
        result[index.toString()] = cmd;
    });
    return result;
}
// ---------------------------------------------------


// Prevent default scrub behavior
customGenerator.scrub_ = function (block: Blockly.Block, code: string, thisOnly: boolean) {
   return code
}
customGenerator.__errors = [];
customGenerator.reportError = function (error: unknown) {
  this.__errors.push(error);
};
// Main workspace-to-code
customGenerator.workspaceToCode = function (workspace: Blockly.Workspace): string {
    this.__errors = [];
    const blocks = workspace.getTopBlocks(true)
     const output = {
      mode: this.__mode || 'Board', 
      program: {
        setup: {},
        loop: {},
        // functions: {}
      }
     }
    // Clear function registry for fresh run
    Object.keys(customGenerator.__functionRegistry).forEach(key => delete customGenerator.__functionRegistry[key]);

    // === STEP 1: Register all function declarations ===
    const declarations: Blockly.Block[] = []
    blocks.forEach((top) => findFunctionDeclarations(top, declarations))
     declarations.forEach((block) => {
       const funcName = block.getFieldValue('function_name')?.trim()
       if (!funcName) return
        // The blockToCode for 'function_declaration' handles the registration
        customGenerator.blockToCode(block)
     })

    // === STEP 2: Now safely generate setup/loop using function calls ===
    // Note: addToIndexedObject is still responsible for the top level loop
    blocks.forEach((block) => {
       if (block.type === 'setup') {
         const setupInput = block.getInputTargetBlock('setup')
         const loopInput = block.getInputTargetBlock('loop')
         // addToIndexedObject handles the function expansion and indexing for top level
         addToIndexedObject(setupInput, output.program.setup, 0)
         addToIndexedObject(loopInput, output.program.loop, 0)
       } else if (block.type !== 'function_declaration') {
          // If a block is placed directly in the workspace, add it to loop
         addToIndexedObject(block, output.program.loop)
       }
    })
    return JSON.stringify({
      ...output,
      errors: this.__errors
    }, null, 2);
    }

// Recursively find all function declarations (No change needed here)
function findFunctionDeclarations(block: Blockly.Block | null, result: Blockly.Block[] = []) {
   if (!block) return result
   if (block.type === 'function_declaration') result.push(block)
    for (const input of block.inputList || []) {
      const child = input.connection?.targetBlock()
      if (child) findFunctionDeclarations(child, result)
    }
    const next = block.getNextBlock()
   if (next) findFunctionDeclarations(next, result)
    return result
}

// Adds block(s) to a target object with indexing (Simplified and relies on statementToCode)
function addToIndexedObject(
    block: Blockly.Block | null,
    target: Record<string, any>,
    startIndex: number = 0
): number {
    let current = block
    let index = startIndex
    while (current) {
        // Use statementToCode on the current block chain (starting with 'current')
        const codeEntries: unknown[] = customGenerator.statementToCode({ 
            getInputTargetBlock: (name: string) => (index === startIndex ? current : null), 
            getInput: () => ({ connection: { targetBlock: () => (index === startIndex ? current : null) } }) 
        }, 'DUMMY_INPUT_NAME'); 

        // Add the expanded entries to the target object
        codeEntries.forEach((entry) => {
            target[index.toString()] = entry;
            index++;
        });

        // Move to the next block in the chain
        current = current.getNextBlock();
    }
    return index;
}

// Handle toolbox refresh after function rename
Blockly.Extensions.register('defer_function_name_update', function (this: Blockly.Block) {
  this.getField('function_name')?.setValidator((newValue) => {
    setTimeout(() => {
      const workspace = this.workspace as Blockly.Workspace & {
        refreshToolboxSelection_?: () => void
      }
      workspace.refreshToolboxSelection_?.()
    }, 0)
    return newValue
  })
})

// Ensure extension gets mixed into declaration blocks
Blockly.Blocks['function_declaration']?.init?.call({
  jsonInit(this: any, config: any) {
    this.jsonInit(config)
    this.mixin({
      extensions: ['defer_function_name_update']
    })
  }
})

export default customGenerator
