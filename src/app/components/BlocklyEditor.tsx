import React, { useRef, useEffect } from 'react';
import * as Blockly from 'blockly';
import 'blockly/blocks';
import 'blockly/javascript';
import 'blockly/blockly.css';

interface BlocklyEditorProps {
  toolboxXml: string; // toolbox XML string
  defineBlocks: () => void; // function to register custom blocks
}

const BlocklyEditor: React.FC<BlocklyEditorProps> = ({ toolboxXml, defineBlocks }) => {
  const blocklyDiv = useRef<HTMLDivElement>(null);
  const workspaceRef = useRef<Blockly.WorkspaceSvg | null>(null);

  useEffect(() => {
    // (Re)define custom blocks
    defineBlocks();

    // Destroy previous workspace (important when switching toolboxes)
    if (workspaceRef.current) {
      workspaceRef.current.dispose();
    }

    // Convert XML string to actual DOM
    const parser = new DOMParser();
    const toolboxDom = parser.parseFromString(toolboxXml, 'text/xml');

    // Inject workspace with new toolbox
    if (blocklyDiv.current) {
      workspaceRef.current = Blockly.inject(blocklyDiv.current, {
        toolbox: toolboxDom.documentElement,
        trashcan: true,
        scrollbars: true,
      });

      workspaceRef.current.addChangeListener(() => {
        const code = Blockly.JavaScript.workspaceToCode(workspaceRef.current!);
        console.log('[Generated Code]', code);
      });
    }

    return () => {
      workspaceRef.current?.dispose();
    };
  }, [toolboxXml, defineBlocks]); // re-run when blocks/toolbox change

  return (
    <div
      ref={blocklyDiv}
      className="m-5"
      style={{ height: '75vh', width: '80vw' }}
    />
  );
};

export default BlocklyEditor;
