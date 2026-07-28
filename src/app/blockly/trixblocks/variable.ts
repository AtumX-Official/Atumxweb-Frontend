import * as React from 'react';
import * as Blockly from 'blockly/core';
import { FieldTextButton } from '../Helper/helperclass';
import Swal from 'sweetalert2'; // Assuming you're using sweetalert2
import { useState } from 'react';
import DeleteVarImg from '../../components/supporting/assets/Deletevar.png';
import VariableImg from '../../components/supporting/assets/Variable.png'
let variable = {
"message0": 'Set %1 to %2',
"args0": [
 {
 "type": "field_label_serializable",
 "name": "VAR",
 },
 {
 "type": "input_value",
 "name": "VALUE"
 }
],
"previousStatement": null,
"nextStatement": null,
"colour": "#FF2C11",
"tooltip": 'Turn the specified number of degrees',
};

function ensureValidToolboxXml(xml: string): string {
if (!xml || !xml.trim()) {
 return '<xml id="toolbox"></xml>';
}

if (!xml.trim().startsWith('<xml')) {
 return `<xml id="toolbox">${xml}</xml>`;
}

return xml;
}
 const VARIABLE_BASE_TOOLBOX = `
<xml id="toolbox">
<block type="button_block"></block>
</xml>
`;
export function defineCustomBlocks(
workspaceRef: React.MutableRefObject<Blockly.WorkspaceSvg | null>,
toolboxXmlRef: React.MutableRefObject<string>,
setToolboxXml: (xml: string) => void,
modifiedToolboxes: React.MutableRefObject<Record<string, string>>
)
{
let varmathAdded = false;
Blockly.Blocks['button_block'] = {
  init: function () {
    this.appendDummyInput().appendField(
      new FieldTextButton('Create Variable', () => {

        const isDark = (window as any).appTheme === "dark";
        // Overlay
        const overlay = document.createElement("div");
        overlay.style.position = "fixed";
        overlay.style.top = "0";
        overlay.style.left = "0";
        overlay.style.width = "100%";
        overlay.style.height = "100%";
        overlay.style.background = "rgba(0,0,0,0.3)";
        overlay.style.display = "flex";
        overlay.style.alignItems = "center";
        overlay.style.justifyContent = "center";
        overlay.style.zIndex = "9999";

        // Popup
        const popup = document.createElement("div");
        popup.style.background = isDark ? "black" : "#EAEAEA";
        popup.style.color = isDark ? "white" : "black";
        popup.style.borderRadius = "8px";
        popup.style.width = "400px";
        popup.style.boxShadow = "0 4px 12px rgba(0,0,0,0.2)";
        popup.style.display = "flex";
        popup.style.flexDirection = "column";
        popup.style.padding = "18px";
        popup.style.gap = "10px";

        // ================= HEADER TEXT =================
        const headerRow = document.createElement("div");
        headerRow.style.display = "flex";
        headerRow.style.alignItems = "center";
        headerRow.style.gap = "8px";
        headerRow.style.fontWeight = "bold";
        headerRow.style.fontSize = "20px";

        const icon = document.createElement("img");
        icon.src = VariableImg; // your image
        icon.style.width = "28px";
        icon.style.height = "28px";

        const headerText = document.createElement("span");
        headerText.innerText = "ENTER VARIABLE NAME";

        headerRow.appendChild(icon);
        headerRow.appendChild(headerText);

        // ================= INPUT ROW =================
        const inputRow = document.createElement("div");
        inputRow.style.display = "flex";
        inputRow.style.alignItems = "center";
        inputRow.style.gap = "8px";

        const input = document.createElement("input");
        input.type = "text";
        input.placeholder = "Variable name";
        input.style.flex = "1";
        input.style.padding = "8px";
        input.style.border = "none";
        input.style.borderRadius = "6px";
        input.style.background = isDark ? "#1a1a1a" : "white";
        input.style.color = isDark ? "white" : "black";
        input.style.outline = "none";

        // ✔ confirm icon
        const confirmBtn = document.createElement("button");
        confirmBtn.innerText = "✔";
        confirmBtn.style.background = "#2EED08";
        confirmBtn.style.color = "white";
        confirmBtn.style.border = "none";
        confirmBtn.style.padding = "6px 10px";
        confirmBtn.style.borderRadius = "4px";
        confirmBtn.style.cursor = "pointer";

        // ✖ cancel icon
        const cancelBtn = document.createElement("button");
        cancelBtn.innerText = "✖";
        cancelBtn.style.background = "#FF4945";
        cancelBtn.style.color = "white";
        cancelBtn.style.border = "none";
        cancelBtn.style.padding = "6px 10px";
        cancelBtn.style.borderRadius = "4px";
        cancelBtn.style.cursor = "pointer";

        // Confirm logic
        confirmBtn.onclick = () => {
          const tempvariable = input.value.trim();
          if (!tempvariable) {
            input.style.boxShadow = "0 0 0 2px red";
            return;
          }

          let updatedXml =
            modifiedToolboxes.current["VARIABLE"] || VARIABLE_BASE_TOOLBOX;

          updatedXml = addBlock(updatedXml, "variable", "VAR", tempvariable);
          updatedXml = addBlock(updatedXml, "get_variable", "VAR", tempvariable);

          setToolboxXml(updatedXml);
          toolboxXmlRef.current = updatedXml;
          modifiedToolboxes.current["VARIABLE"] = updatedXml;

          const dom = Blockly.utils.xml.textToDom(updatedXml);
          workspaceRef.current?.updateToolbox(dom);

          document.body.removeChild(overlay);
          
        };
        input.addEventListener("keydown", (event) => {
          if (event.key === "Enter") {
            event.preventDefault();
            confirmBtn.click(); // Triggers the same logic as clicking ✔
          }
        });
        cancelBtn.onclick = () => {
          document.body.removeChild(overlay);
        };

        // Assemble
        inputRow.appendChild(input);
        inputRow.appendChild(confirmBtn);
        inputRow.appendChild(cancelBtn);

        popup.appendChild(headerRow);
        popup.appendChild(inputRow);

        overlay.appendChild(popup);
        document.body.appendChild(overlay);

        input.focus();
      })
    );

    this.setColour("#FF2C11");
    this.setTooltip('');
    this.setHelpUrl('');
    this.setMovable(false);
  }
};
Blockly.Blocks['get_variable'] = {
  init: function () {
    this.appendDummyInput()
      .appendField(new Blockly.FieldLabel('Var:'))
      .appendField(new Blockly.FieldLabelSerializable('VAR'), 'VAR');

    this.setOutput(true, 'Number');
    this.setColour("#FF2C11");
    this.setTooltip('Get the variable value');
    this.setMovable(true);
    this.setDeletable(true);
    // Right click menu
    //this.contextMenu = false;
    this.customContextMenu = (options) => {

      // Remove all default Blockly menu items
      options.length = 0;
    
      // Open popup immediately
      setTimeout(() => {
        this.showDeletePopup_();
      }, 0);
    };
  },


  showDeletePopup_: function () {
    const varName = this.getFieldValue('VAR');

    // Create overlay container
    const overlay = document.createElement('div');
    overlay.style.position = 'fixed';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.width = '100vw';
    overlay.style.height = '100vh';
    overlay.style.backgroundColor = 'rgba(0,0,0,0.6)';
    overlay.style.display = 'flex';
    overlay.style.alignItems = 'center';
    overlay.style.justifyContent = 'center';
    overlay.style.zIndex = '9999';

    // Create main popup
    const popup = document.createElement('div');
    popup.style.backgroundColor = '#F0F0F0';
    popup.style.borderRadius = '12px';
    popup.style.padding = '20px';
    popup.style.textAlign = 'center';
    popup.style.width = '450px';
    popup.style.boxShadow = '0 10px 25px rgba(0,0,0,0.2)';

    const img = document.createElement('img');
    img.src = DeleteVarImg;
    img.style.width = '100px';
    img.style.height = '100px';
    img.style.margin = '0 auto 15px auto';
    img.style.display = 'block';
    popup.appendChild(img);

    const title = document.createElement('h2');
    title.innerText = 'Delete variable?';
    title.style.fontSize = '20px';
    title.style.fontWeight = 'bold';
    title.style.marginBottom = '10px';
    popup.appendChild(title);

    const msg = document.createElement('p');
    msg.innerText = `Are you sure you want to permanently delete the variable "${varName}"?`;
    msg.style.marginBottom = '20px';
    msg.style.fontSize = '14px';
    popup.appendChild(msg);

    const btnContainer = document.createElement('div');
    btnContainer.style.display = 'flex';
    btnContainer.style.justifyContent = 'center';
    btnContainer.style.gap = '20px';

    const yesBtn = document.createElement('button');
    yesBtn.innerText = 'Yes';
    yesBtn.style.backgroundColor = '#2EED08';
    yesBtn.style.color = 'white';
    yesBtn.style.padding = '8px 20px';
    yesBtn.style.border = 'none';
    yesBtn.style.borderRadius = '10px';
    yesBtn.style.cursor = 'pointer';
    yesBtn.onclick = () => {
      document.body.removeChild(overlay);
      const workspace = workspaceRef.current;

      if (workspace) {
        const allBlocks = workspace.getAllBlocks(false);
    
        allBlocks.forEach(block => {
          const blockVar = block.getFieldValue('VAR');
    
          if (
            blockVar === varName &&
            (block.type === 'variable' || block.type === 'get_variable')
          ) {
            block.dispose(true);
          }
        });
      }    
      let updatedXml = modifiedToolboxes.current["VARIABLE"] || VARIABLE_BASE_TOOLBOX;
      updatedXml = removeBlock(updatedXml, "variable", "VAR", varName);
      updatedXml = removeBlock(updatedXml, "get_variable", "VAR", varName);
      setToolboxXml(updatedXml);
      toolboxXmlRef.current = updatedXml;
      modifiedToolboxes.current["VARIABLE"] = updatedXml;
      const dom = Blockly.utils.xml.textToDom(updatedXml);
      workspaceRef.current?.updateToolbox(dom);
    };

    const noBtn = document.createElement('button');
    noBtn.innerText = 'No';
    noBtn.style.backgroundColor = '#FF0000';
    noBtn.style.color = 'white';
    noBtn.style.padding = '8px 20px';
    noBtn.style.border = 'none';
    noBtn.style.borderRadius = '10px';
    noBtn.style.cursor = 'pointer';
    noBtn.onclick = () => document.body.removeChild(overlay);

    btnContainer.appendChild(yesBtn);
    btnContainer.appendChild(noBtn);
    popup.appendChild(btnContainer);
    overlay.appendChild(popup);
    document.body.appendChild(overlay);
  }
};
Blockly.Blocks['variable'] = {
  init: function () {
   this.jsonInit(variable);
   this.customContextMenu = (options) => {

    // Remove all default Blockly menu items
    options.length = 0;
  
    // Open popup immediately
    setTimeout(() => {
      this.showDeletePopup_();
    }, 0);
  };
  },
  showDeletePopup_: function () {
    const varName = this.getFieldValue('VAR');

    // Create overlay container
    const overlay = document.createElement('div');
    overlay.style.position = 'fixed';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.width = '100vw';
    overlay.style.height = '100vh';
    overlay.style.backgroundColor = 'rgba(0,0,0,0.6)';
    overlay.style.display = 'flex';
    overlay.style.alignItems = 'center';
    overlay.style.justifyContent = 'center';
    overlay.style.zIndex = '9999';

    // Create main popup
    const popup = document.createElement('div');
    popup.style.backgroundColor = '#F0F0F0';
    popup.style.borderRadius = '12px';
    popup.style.padding = '20px';
    popup.style.textAlign = 'center';
    popup.style.width = '450px';
    popup.style.boxShadow = '0 10px 25px rgba(0,0,0,0.2)';

    const img = document.createElement('img');
    img.src = DeleteVarImg;
    img.style.width = '100px';
    img.style.height = '100px';
    img.style.margin = '0 auto 15px auto';
    img.style.display = 'block';
    popup.appendChild(img);

    const title = document.createElement('h2');
    title.innerText = 'Delete variable?';
    title.style.fontSize = '20px';
    title.style.fontWeight = 'bold';
    title.style.marginBottom = '10px';
    popup.appendChild(title);

    const msg = document.createElement('p');
    msg.innerText = `Are you sure you want to permanently delete the variable "${varName}"?`;
    msg.style.marginBottom = '20px';
    msg.style.fontSize = '14px';
    popup.appendChild(msg);

    const btnContainer = document.createElement('div');
    btnContainer.style.display = 'flex';
    btnContainer.style.justifyContent = 'center';
    btnContainer.style.gap = '20px';

    const yesBtn = document.createElement('button');
    yesBtn.innerText = 'Yes';
    yesBtn.style.backgroundColor = '#2EED08';
    yesBtn.style.color = 'white';
    yesBtn.style.padding = '8px 20px';
    yesBtn.style.border = 'none';
    yesBtn.style.borderRadius = '10px';
    yesBtn.style.cursor = 'pointer';
    yesBtn.onclick = () => {
      document.body.removeChild(overlay);
      const workspace = workspaceRef.current;

      if (workspace) {
        const allBlocks = workspace.getAllBlocks(false);
    
        allBlocks.forEach(block => {
          const blockVar = block.getFieldValue('VAR');
    
          if (
            blockVar === varName &&
            (block.type === 'variable' || block.type === 'get_variable')
          ) {
            block.dispose(true);
          }
        });
      }    
      let updatedXml = modifiedToolboxes.current["VARIABLE"] || VARIABLE_BASE_TOOLBOX;
      updatedXml = removeBlock(updatedXml, "variable", "VAR", varName);
      updatedXml = removeBlock(updatedXml, "get_variable", "VAR", varName);
      setToolboxXml(updatedXml);
      toolboxXmlRef.current = updatedXml;
      modifiedToolboxes.current["VARIABLE"] = updatedXml;
      const dom = Blockly.utils.xml.textToDom(updatedXml);
      workspaceRef.current?.updateToolbox(dom);
    };

    const noBtn = document.createElement('button');
    noBtn.innerText = 'No';
    noBtn.style.backgroundColor = '#FF0000';
    noBtn.style.color = 'white';
    noBtn.style.padding = '8px 20px';
    noBtn.style.border = 'none';
    noBtn.style.borderRadius = '10px';
    noBtn.style.cursor = 'pointer';
    noBtn.onclick = () => document.body.removeChild(overlay);

    btnContainer.appendChild(yesBtn);
    btnContainer.appendChild(noBtn);
    popup.appendChild(btnContainer);
    overlay.appendChild(popup);
    document.body.appendChild(overlay);
  }
  };
}
export function addBlock(toolboxXml, blockType, fieldName, fieldValue) {
toolboxXml = ensureValidToolboxXml(toolboxXml);
const parser = new DOMParser();
const serializer = new XMLSerializer();
const xmlDoc = parser.parseFromString(toolboxXml, "text/xml");
const root = xmlDoc.documentElement;
if (!root || root.nodeName !== 'xml') {
return '<xml id="toolbox"></xml>';
}
const blocks = root.getElementsByTagName("block");
let blockExists = false;
for (let i = 0; i < blocks.length; i++) {
const block = blocks[i];
if (block.getAttribute("type") === blockType) {
 const fields = block.getElementsByTagName("field");
 for (let j = 0; j < fields.length; j++) {
 if (
 fields[j].getAttribute("name") === fieldName &&
 fields[j].textContent === fieldValue
 ) {
 blockExists = true;
 break;
 }
 }
}
}
if (!blockExists) {
const newBlock = xmlDoc.createElement("block");
newBlock.setAttribute("type", blockType);
const field = xmlDoc.createElement("field");
field.setAttribute("name", fieldName);
field.textContent = fieldValue;
newBlock.appendChild(field);
root.appendChild(newBlock);
}
return serializer.serializeToString(xmlDoc);
}

export function removeBlock(toolboxXml, blockType, fieldName, fieldValue) {
toolboxXml = ensureValidToolboxXml(toolboxXml);
const parser = new DOMParser();
const serializer = new XMLSerializer();
const xmlDoc = parser.parseFromString(toolboxXml, "text/xml");
const root = xmlDoc.documentElement;
if (!root || root.nodeName !== 'xml') {
return '<xml id="toolbox"></xml>';
}
const blocks = root.getElementsByTagName("block");
for (let i = blocks.length - 1; i >= 0; i--) {
const block = blocks[i];
if (block.getAttribute("type") === blockType) {
 const fields = block.getElementsByTagName("field");
 for (let j = 0; j < fields.length; j++) {
 if (
 fields[j].getAttribute("name") === fieldName &&
 fields[j].textContent === fieldValue
 ) {
 block.remove();
break;
}
 }
}
}
return serializer.serializeToString(xmlDoc);
}

export const restoreVariableBlocksToToolbox = ({
  workspace,
  modifiedToolboxes,
  toolboxXmlRef,
  setToolboxXml
}) => {

  if (!workspace) return;

  let updatedXml =
    modifiedToolboxes.current["VARIABLE"] ||
    VARIABLE_BASE_TOOLBOX;

  const allBlocks = workspace.getAllBlocks(false);

  const variableNames = new Set<string>();

  allBlocks.forEach((block) => {

    // variable block
    if (block.type === "variable") {

      const varName = block.getFieldValue("VAR");

      if (varName) {
        variableNames.add(varName);
      }
    }

    // getter block
    if (block.type === "get_variable") {

      const varName = block.getFieldValue("VAR");

      if (varName) {
        variableNames.add(varName);
      }
    }
  });

  variableNames.forEach((varName) => {

    updatedXml = addBlock(
      updatedXml,
      "variable",
      "VAR",
      varName
    );

    updatedXml = addBlock(
      updatedXml,
      "get_variable",
      "VAR",
      varName
    );
  });

  setToolboxXml(updatedXml);

  toolboxXmlRef.current = updatedXml;

  modifiedToolboxes.current["VARIABLE"] =
    updatedXml;

  const dom =
    Blockly.utils.xml.textToDom(updatedXml);
console.log("Updated Xml : ",updatedXml)
  workspace.updateToolbox(dom);
};