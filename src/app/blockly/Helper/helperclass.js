import * as Blockly from 'blockly/core';
import { DropDownDiv } from "blockly";
import { FieldColour } from '@blockly/field-colour';
import iro from '@jaames/iro';


/**
 * This is the class for the color wheel.
 */
export class ColorWheelField extends FieldColour {
    /**
     * Class for the color picker.
     *
     * @param {string} color The starting color for the color.
     *  It's a hex value, #ff00ff.
     * @param {number} width Width of the color picker.
     * @param {ColorPickerProps} options The iro color wheel options.
     */
    constructor(color, width = 150, options = {}) {
      super(color);
      this.color = color;
      this.width = width;
      this.options = options;
    }
    /**
     * Constructs a ColorWheelField from a JSON arg object.
     * @param {!Object} options A JSON object with options.
     * @return {!ColorWheelField} The new field instance.
     * @package
     * @nocollapse
     */
    static fromJson(options) {
      return new ColorWheelField(
        options["color"],
        options["size"] || 150,
        options["options"] || {}
      );
    }
  
    /**
     * Over rides colour picker to show the popup.
     */
    showEditor_() {
      const editor = document.createElement("div");
      // Appends to the content div
      DropDownDiv.getContentDiv().appendChild(editor);
      // Add class so it can be styled easily
      editor.classList.add("blockly-color-wheel-container");
      // Will position the content.  The last argument is a
      // callback that used for cleanup.
  
      // eslint-disable-next-line new-cap
      const colorPicker = iro.ColorPicker(editor, {
        width: this.width, // controls the size of the color picker
        color: this.getValue(), // starts the color picker at a certain value,
        ...this.options, // These options will over ride everything
      });
  
      // Callback when the color picker changes
      colorPicker.on("color:change", (color) => {
        this.setValue(color.hexString);
      });
      DropDownDiv.showPositionedByField(this, () => editor.remove());
    }
  }
  
  
  /**
   * This is the class for the piano keyboard field.
   */
export class PianoKeyboardField extends Blockly.Field {
    /**
     * Class for the piano keyboard picker.
     *
     * @param {string} note The starting note for the keyboard.
     */
    constructor(note = "Middle C") {
      super(note);
      this.note = note;
    }
  
    /**
     * Constructs a PianoKeyboardField from a JSON arg object.
     * @param {!Object} options A JSON object with options.
     * @return {!PianoKeyboardField} The new field instance.
     * @package
     * @nocollapse
     */
    static fromJson(options) {
      return new PianoKeyboardField(options["note"] || "Middle C");
    }
  
    /**
     * Override to show the piano keyboard popup.
     */
    showEditor_() {
      const editor = document.createElement("div");
      editor.classList.add("blockly-piano-keyboard-container");
  
      editor.querySelectorAll(".key").forEach(key => {
        key.addEventListener("click", () => {
          const note = key.getAttribute("data-key");
          this.setValue(note);
          // Add active class for feedback
          key.classList.add("active");
          setTimeout(() => key.classList.remove("active"), 150); // Remove after 150ms
      
          Blockly.DropDownDiv.hideWithoutAnimation(); // Close the keyboard after selection
        });
      });
  
      // Piano keys in HTML
      editor.innerHTML = `
      <!DOCTYPE html>
  <html lang="en" dir="ltr">
    <head>
      <meta charset="utf-8">
      <title>Playable Piano JavaScript | CodingNepal</title>
      <link rel="stylesheet" href="style.css">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <script src="script.js" defer></script>
    </head>
    <body>
     <div class="wrapper">
    <ul class="piano-keys">
    <li class="key white" data-key="Low C" data-frequency="130.81"><span></span></li>
    <li class="key black" data-key="Low C#" data-frequency="138.59"><span></span></li>
    <li class="key white" data-key="Low D" data-frequency="146.83"><span></span></li>
    <li class="key black" data-key="Low D#" data-frequency="155.56"><span></span></li>
    <li class="key white" data-key="Low E" data-frequency="164.81"><span></span></li>
    <li class="key white" data-key="Low F" data-frequency="174.61"><span></span></li>
    <li class="key black" data-key="Low F#" data-frequency="185.00"><span></span></li>
    <li class="key white" data-key="Low G" data-frequency="196.00"><span></span></li>
    <li class="key black" data-key="Low G#" data-frequency="207.65"><span></span></li>
    <li class="key white" data-key="Low A" data-frequency="220.00"><span></span></li>
    <li class="key black" data-key="Low A#" data-frequency="233.08"><span></span></li>
    <li class="key white" data-key="Low B" data-frequency="246.94"><span></span></li>
    <li class="key white" data-key="Middle C" data-frequency="261.63"><span></span></li>
    <li class="key black" data-key="Middle C#" data-frequency="277.18"><span></span></li>
    <li class="key white" data-key="Middle D" data-frequency="293.66"><span></span></li>
    <li class="key black" data-key="Middle D#" data-frequency="311.13"><span></span></li>
    <li class="key white" data-key="Middle E" data-frequency="329.63"><span></span></li>
    <li class="key white" data-key="Middle F" data-frequency="349.23"><span></span></li>
    <li class="key black" data-key="Middle F#" data-frequency="369.99"><span></span></li>
    <li class="key white" data-key="Middle G" data-frequency="392.00"><span></span></li>
    <li class="key black" data-key="Middle G#" data-frequency="415.30"><span></span></li>
    <li class="key white" data-key="Middle A" data-frequency="440.00"><span></span></li>
    <li class="key black" data-key="Middle A#" data-frequency="466.16"><span></span></li>
    <li class="key white" data-key="Middle B" data-frequency="493.88"><span></span></li>
    <li class="key white" data-key="High C" data-frequency="523.25"><span></span></li>
    <li class="key black" data-key="High C#" data-frequency="554.37"><span></span></li>
    <li class="key white" data-key="High D" data-frequency="587.33"><span></span></li>
    <li class="key black" data-key="High D#" data-frequency="622.25"><span></span></li>
    <li class="key white" data-key="High E" data-frequency="659.25"><span></span></li>
    <li class="key white" data-key="High F" data-frequency="698.46"><span></span></li>
    <li class="key black" data-key="High F#" data-frequency="739.99"><span></span></li>
    <li class="key white" data-key="High G" data-frequency="783.99"><span></span></li>
    <li class="key black" data-key="High G#" data-frequency="830.61"><span></span></li>
    <li class="key white" data-key="High A" data-frequency="880.00"><span></span></li>
    <li class="key black" data-key="High A#" data-frequency="932.33"><span></span></li>
    <li class="key white" data-key="High B" data-frequency="987.77"><span></span></li>
  </ul>
    <div class="display-key"></div>
  </div>
  </body>
  </html>
      `;
  
      // Add event listener to each key to select note
      editor.querySelectorAll(".white-key, .black-key").forEach(key => {
        key.addEventListener("click", () => {
          const note = key.getAttribute("data-note");
          this.setValue(note);
          DropDownDiv.hideWithoutAnimation(); // Close the keyboard after selection
        });
      });
        // Display key information on hover
    editor.querySelectorAll(".key").forEach(key => {
      key.addEventListener("mouseenter", () => {
        const keyDisplay = editor.querySelector(".display-key");
        keyDisplay.textContent = `${key.getAttribute("data-key").toUpperCase()}`;
      });
      key.addEventListener("mouseleave", () => {
        editor.querySelector(".display-key").textContent = "";
      });
    });
      // Handle key selection
      editor.querySelectorAll(".key").forEach(key => {
        key.addEventListener("click", () => {
          const frequency = key.getAttribute("data-frequency");
          this.setValue(frequency); 
          })})
      // Append the editor to the dropdown div
      Blockly.DropDownDiv.getContentDiv().appendChild(editor);
      Blockly.DropDownDiv.showPositionedByField(this, () => editor.remove());
    }
  }
  
  // CSS for the piano keyboard (add this to your CSS file or <style> tag)
  const style = document.createElement('style');
  style.textContent = `
  .wrapper {
    padding: 10px 15px;
    border-radius: 20px;
    background: #141414;
  }
  .wrapper header {
    display: flex;
    color: #B2B2B2;
    align-items: center;
    justify-content: space-between;
  }
  .volume-slider input {
    accent-color: #fff;
  }
  .keys-checkbox input {
    height: 15px;
    width: 30px;
    cursor: pointer;
    appearance: none;
    position: relative;
    background: #4B4B4B
  }
  .keys-checkbox input::before {
    content: "";
    position: absolute;
    top: 50%;
    left: 5px;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: #8c8c8c;
    transform: translateY(-50%);
    transition: all 0.3s ease;
  }
  .keys-checkbox input:checked::before {
    left: 35px;
    background: #fff;
  }
  .piano-keys {
    display: flex;
    list-style: none;
    margin-bottom: 20px;
    justify-content: space-evenly; /* Distribute the keys evenly */
  }
  .piano-keys .key {
    cursor: pointer;
    user-select: none;
    position: relative;
    text-transform: uppercase;
  }
  .piano-keys .key.active {
    box-shadow: inset -5px -10px 10px rgba(255, 255, 255, 0.3);
    transform: scale(0.95);
  }
  .piano-keys .black {
    z-index: 2;
    width: 15px;
    height: 50px;
    margin: 0 -11px 0 -11px;
    border-radius: 0 0 5px 5px;
    background: linear-gradient(#333, #000);
  }
  .piano-keys .black.active {
    box-shadow: inset -5px -10px 10px rgba(255,255,255,0.1);
    background:linear-gradient(to bottom, #000, #434343);
  }
  .piano-keys .white {
    height: 90px;
    width: 25px;
    border-radius: 8px;
    border: 1px solid #000;
    background: linear-gradient(#fff 96%, #eee 4%);
    margin: 0 3px;
  }
  .piano-keys .white.active {
    box-shadow: inset -5px 5px 20px rgba(0,0,0,0.2);
    background:linear-gradient(to bottom, #fff 0%, #eee 100%);
  }
  .piano-keys .key span {
    position: absolute;
    bottom: 20px;
    width: 100%;
    color: #A2A2A2;
    font-size: 1.13rem;
    text-align: center;
  }
  .piano-keys .key.hide span {
    display: none;
  }
  .piano-keys .black span {
    bottom: 13px;
    color: #888888;
  }
  .display-key {
    color: #FFFFFF;
    font-size: 16px;
    line-height: 1.5; /* adjust line height if needed */
    text-align: center;
  } 
  .key:hover {
    background-color: #ffd700; /* Gold color to highlight */
    box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.3); /* Shadow effect */
    transform: scale(1.05); /* Slightly increase size */
  }  
  .piano-keys .white:hover {
    background-color: #f0e68c; /* Lighter shade */
  }
  .piano-keys .black:hover {
    background-color: #555;
  }
  @media screen and (max-width: 815px) {
    .wrapper{
     margin-bottom : 10px; 
    }
    header {
      flex-direction: column;
    }
    header :where(h2, .column) {
      margin-bottom: 13px;
    }
    .volume-slider input {
      max-width: 100px;
    }
    .piano-keys {
      margin-top: 0px;
    }
    .piano-keys .key:where(:nth-child(9), :nth-child(10)) {
      display: none;
    }
    .piano-keys .black {
      height: 40px;
      width: 10px;
      border-radius: 0 0 5px 5px;
      margin: 0 -10px 0 -10px;
    }
    .piano-keys .white {
      height: 80px;
      width: 20px;
      margin : 0 4px;
      border-radius: 8px;
    }
  .display-key {
    color: #FFFFFF;
    font-size: 12px;
    line-height: 1.5; 
    text-align: center;
  }    
  }
  `;
  document.head.appendChild(style);
  
  const globalColorWheelContainer = document.createElement('div');
globalColorWheelContainer.id = 'global-color-wheel';
globalColorWheelContainer.style.position = 'absolute';
globalColorWheelContainer.style.zIndex = 9999;
globalColorWheelContainer.style.display = 'none'; // Initially hidden
document.body.appendChild(globalColorWheelContainer);

  export class ColorGridField extends Blockly.Field {
    constructor(value = null, opt_validator = null, opt_config = {}) {
      const defaultGrid = Array(6).fill().map(() => Array(8).fill('#808080'));
      const cloned = (value || defaultGrid).map(row => [...row]); // Deep copy
      super(cloned, opt_validator, opt_config);
  
      this.rows = 6;
      this.cols = 8;
      this.cellSize = opt_config.cellSize || 15;
      this.gap = opt_config.gap || 3;
      this.defaultColor = '#808080';
      this.emptyColor = '#808080';
      this.selectedColor = this.defaultColor;
    }
  
    static fromJson(options) {
      return new ColorGridField(options.value, undefined, options);
    }
  
    initView() {
      const svgGroup = this.fieldGroup_;
      while (svgGroup.firstChild) svgGroup.removeChild(svgGroup.firstChild);
  
      const svgNS = "http://www.w3.org/2000/svg";
      const inlineCellSize = this.cellSize;  // was this.cellSize * 0.6
      const inlineGap = this.gap;    
      const width = this.cols * (inlineCellSize + inlineGap) - inlineGap;
      const height = this.rows * (inlineCellSize + inlineGap) - inlineGap;
  
      const svg = document.createElementNS(svgNS, "svg");
      svg.setAttribute("width", width);
      svg.setAttribute("height", height);
  
      for (let r = 0; r < this.rows; r++) {
        for (let c = 0; c < this.cols; c++) {
          const rect = document.createElementNS(svgNS, "rect");
          rect.setAttribute("x", c * (inlineCellSize + inlineGap));
          rect.setAttribute("y", r * (inlineCellSize + inlineGap));
          rect.setAttribute("width", inlineCellSize);
          rect.setAttribute("height", inlineCellSize);
          rect.setAttribute("fill", this.value_[r][c]);
          rect.setAttribute("stroke", "#999");
          rect.setAttribute("rx", "2");
          svg.appendChild(rect);
        }
      }
      svgGroup.appendChild(svg);
    }
  
    dispose() {
      document.removeEventListener('mouseup', this._boundHandleMouseUp);
      super.dispose();
    }
  
    showEditor_() {
        const editorDiv = Blockly.DropDownDiv.getContentDiv();
        editorDiv.innerHTML = '';
      
        const wrapper = document.createElement('div');
        wrapper.style.display = 'flex';
        wrapper.style.flexDirection = 'column';
        wrapper.style.alignItems = 'center';
        wrapper.style.gap = '10px';
      
        // Default selected color
        let selectedColor = '#ff0000';
        this.selectedColor = selectedColor;
      
        // Color icon (clickable box)
        const colorIcon = document.createElement('div');
        colorIcon.style.width = '30px';
        colorIcon.style.height = '30px';
        colorIcon.style.borderRadius = '50%';
        colorIcon.style.background = selectedColor;
        colorIcon.style.border = '2px solid #999';
        colorIcon.style.cursor = 'pointer';
        colorIcon.title = 'Pick a color';
        colorIcon.addEventListener('click', () => {
          const isVisible = globalColorWheelContainer.style.display === 'block';
          if (isVisible) {
            globalColorWheelContainer.style.display = 'none';
            globalColorWheelContainer.innerHTML = '';
          } else {
            const fieldRect = this.getAbsoluteXY_();
            const fieldSize = this.getSize();
            globalColorWheelContainer.style.left = `${fieldRect.x + fieldSize.width + 45}px`;
            globalColorWheelContainer.style.top = `${fieldRect.y}px`;
            globalColorWheelContainer.style.display = 'block';
            globalColorWheelContainer.innerHTML = '';
        
            const wheel = document.createElement('div');
            wheel.style.width = '180px';
            wheel.style.height = '180px';
            globalColorWheelContainer.appendChild(wheel);
        
            const picker = new iro.ColorPicker(wheel, {
              width: 180,
              color: selectedColor
            });
        
            picker.on('color:change', (color) => {
              selectedColor = color.hexString;
              this.selectedColor = selectedColor;
              colorIcon.style.background = selectedColor;
            });
          }
        });
        // Grid section
        const gridContainer = document.createElement('div');
        gridContainer.style.display = 'grid';
        gridContainer.style.gridTemplateColumns = `repeat(${this.cols}, ${this.cellSize}px)`;
        gridContainer.style.gridGap = `${this.gap}px`;
        gridContainer.style.padding = '8px';
      
        let isMouseDown = false;
      
        const handleMouseDown = (r, c, cell) => {
          isMouseDown = true;
          const currentColor = this.value_[r][c];
          const isSameColor = currentColor.toLowerCase() === this.selectedColor.toLowerCase();
      
          if (isSameColor) {
            this.value_[r][c] = this.emptyColor;
            cell.style.background = this.emptyColor;
          } else {
            this.value_[r][c] = this.selectedColor;
            cell.style.background = this.selectedColor;
          }
        };
      
        const handleMouseOver = (r, c, cell) => {
          if (!isMouseDown) return;
          this.value_[r][c] = this.selectedColor;
          cell.style.background = this.selectedColor;
        };
      
        const handleMouseUp = () => {
          isMouseDown = false;
          this.render_();
        };
      
        document.addEventListener('mouseup', handleMouseUp);
        this._boundHandleMouseUp = handleMouseUp;
      
        for (let r = 0; r < this.rows; r++) {
          for (let c = 0; c < this.cols; c++) {
            const cell = document.createElement('div');
            cell.style.width = `${this.cellSize}px`;
            cell.style.height = `${this.cellSize}px`;
            cell.style.border = '1px solid #ccc';
            cell.style.background = this.value_[r][c];
            cell.style.cursor = 'pointer';
      
            cell.addEventListener('mousedown', () => handleMouseDown(r, c, cell));
            cell.addEventListener('mouseover', () => handleMouseOver(r, c, cell));
      
            gridContainer.appendChild(cell);
          }
        }
      
        // Clear button
        const clearButton = document.createElement('button');
        clearButton.innerText = 'Clear';
        clearButton.addEventListener('click', () => {
          for (let r = 0; r < this.rows; r++) {
            for (let c = 0; c < this.cols; c++) {
              this.value_[r][c] = this.emptyColor;
              const index = r * this.cols + c;
              gridContainer.children[index].style.background = this.emptyColor;
            }
          }
          this.render_();
        });
        clearButton.style.marginTop = '12px';
        clearButton.style.background = '#ffffff';
        clearButton.style.color = '#000';
        clearButton.style.border = '1px solid #ccc';
        clearButton.style.borderRadius = '5px';
        clearButton.style.padding = '5px 12px';
        clearButton.style.cursor = 'pointer';
      
        const layoutRow = document.createElement('div');
        layoutRow.style.display = 'flex';
        layoutRow.style.flexDirection = 'row';
        layoutRow.style.alignItems = 'center';
        layoutRow.style.justifyContent = 'center';
        layoutRow.style.gap = '12px';
        
        // Add grid and color icon side by side
        layoutRow.appendChild(gridContainer);
        layoutRow.appendChild(colorIcon);
        
        // Add everything to wrapper
        wrapper.appendChild(layoutRow);
        wrapper.appendChild(clearButton);
        editorDiv.appendChild(wrapper);
        
      
        Blockly.DropDownDiv.setColour(this.sourceBlock_.style.colourPrimary, '#fff');
        Blockly.DropDownDiv.showPositionedByField(this, () => {
          globalColorWheelContainer.style.display = 'none';
        });
      }
  
    getValue() {
      return this.value_.map(row =>
        row.map(color => {
          if (!color || typeof color !== 'string') return null;
    
          // If it's the empty color, treat as unfilled (null)
          if (color.toLowerCase() === this.emptyColor.toLowerCase()) return null;
    
          const bigint = parseInt(color.slice(1), 16);
          return {
            R: (bigint >> 16) & 255,
            G: (bigint >> 8) & 255,
            B: bigint & 255
          };
        })
      );
    }
    
  
    setValue(newValue) {
      if (!Array.isArray(newValue)) return;
    
      this.value_ = newValue.map(row => row.map(cell => {
        // If value is already a hex string, return as-is
        if (typeof cell === 'string' && /^#[0-9a-f]{6}$/i.test(cell)) return cell;
    
        // If value is RGB object (e.g. {R: 255, G: 0, B: 0})
        if (typeof cell === 'object' && cell !== null && 'R' in cell) {
          const { R, G, B } = cell;
          const toHex = v => v.toString(16).padStart(2, '0');
          return `#${toHex(R)}${toHex(G)}${toHex(B)}`;
        }
    
        // Fallback to empty color
        return this.emptyColor;
      }));
    
      this.render_();
    }
    
  
    render_() {
      if (!this.fieldGroup_) return;
      this.initView();
      this.updateSize_();
    }
  
    getSize() {
      const width = this.cols * (this.cellSize + this.gap) - this.gap;
      const height = this.rows * (this.cellSize + this.gap) - this.gap;
      return new Blockly.utils.Size(width, height);  
    }
  
    doClassValidation_(value) {
      return value;
    }
  
    applyColour() {}
  }
  
export class FieldTextButton extends Blockly.FieldLabel {
    constructor(text, callback, opt_validator) {
      super(text, opt_validator);
      this.clickHandler_ = callback;
    }
    bindEvents_() {
      super.bindEvents_();
      Blockly.browserEvents.bind(this.getClickTarget_(), 'click', this, this.clickHandler_);
    }
    getClickTarget_() {
      return this.textElement_;
    }
  }