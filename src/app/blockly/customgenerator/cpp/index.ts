import * as Blockly from 'blockly/core';

const cppGenerator = new Blockly.Generator('CPP');

// Keep code formatting clean
cppGenerator.scrub_ = function (
  _block: Blockly.Block,
  code: string,
): string {
  return code;
};

// Convert entire workspace to C++ code
cppGenerator.workspaceToCode = function (workspace: Blockly.Workspace): string {
  const blocks = workspace.getTopBlocks(true);
  let code = '';

  const generateBlockChainCode = (block: Blockly.Block | null): string => {
    let current = block;
    let result = '';
    while (current) {
      const blockCode = this.blockToCode(current);
      if (typeof blockCode === 'string') {
        result += blockCode + '\n';
      } else if (Array.isArray(blockCode) && typeof blockCode[0] === 'string') {
        result += blockCode[0] + '\n';
      }
      current = current.getNextBlock();
    }
    return result;
  };

  blocks.forEach((block) => {
    if (block.type === 'setup') {
      const setupInput = block.getInputTargetBlock('setup');
      const loopInput = block.getInputTargetBlock('loop');

      const setupCode = generateBlockChainCode.call(this, setupInput);
      const loopCode = generateBlockChainCode.call(this, loopInput);

      code += '// Setup\n' + setupCode;
      code += '\n// Loop\nwhile(true) {\n' + indent(loopCode) + '}\n';
    } else {
      // fallback for non-setup blocks
      code += generateBlockChainCode.call(this, block);
    }
  });

  return code.trim();
};

// Helper: indent lines
function indent(code: string, spaces = 2): string {
  return code
    .split('\n')
    .map(line => ' '.repeat(spaces) + line)
    .join('\n');
}

export default cppGenerator;
