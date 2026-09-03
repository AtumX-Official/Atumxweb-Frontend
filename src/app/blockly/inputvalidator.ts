import * as Blockly from 'blockly/core';
interface FieldWithAttachFlag extends Blockly.Field {
  _integerValidatorAttached?: boolean;
  _rangeValidatorAttached?: boolean;
}

export const integerOnlyValidator = function (newValue: string): string | null {
    if (/^\d+$/.test(newValue)) {
      return newValue;
    }
    return null; 
  };
  
export function integervalidatior(
  block: Blockly.Block,
  inputName: string
): void {
  const targetBlock = block.getInputTargetBlock(inputName);
  if (!targetBlock) return;
  if (targetBlock.type !== 'math_number') return;

  const numField = targetBlock.getField('NUM') as FieldWithAttachFlag | null;
  if (!numField) return;

  if (!numField._integerValidatorAttached) {
    numField.setValidator(integerOnlyValidator);
    numField._integerValidatorAttached = true;
  }
}
  
export const intergerlimit = function (newValue: string): string | null {
    if (newValue === '') return null;
    if (!/^\d+$/.test(newValue)) {
      return null; 
    }
    const value = Number(newValue);
    if (value > 255) {
      return '255'; 
    }
    return newValue; 
  };


export function validateStartEnd(block: Blockly.Block): void{
    const startBlock = block.getInputTargetBlock('START');
    const endBlock = block.getInputTargetBlock('END');
  
    if (!startBlock || !endBlock) return;
    if (startBlock.type !== 'math_number' || endBlock.type !== 'math_number') return;
  
    const startField = startBlock.getField('NUM') as FieldWithAttachFlag | null;
    const endField = endBlock.getField('NUM') as FieldWithAttachFlag | null;
    if (!startField || !endField) return;
  
    if (startField?._rangeValidatorAttached) return;
  
    const rangeValidator = function (this : Blockly.Field ,newValue: string) : string | null {
      if (!/^\d+$/.test(newValue)) return null;
  
      
      const isStart = this === startField;
  
      const startVal = isStart
        ? Number(newValue)
        : Number(startField.getValue());
  
      const endVal = isStart
        ? Number(endField.getValue())
        : Number(newValue);
  
      if (startVal >= endVal) {
        return null; // 🔴 reject + red highlight
      }
  
      return newValue; // ✅ accept
    };
  
    startField.setValidator(rangeValidator);
    endField.setValidator(rangeValidator);
  
    startField._rangeValidatorAttached = true;
  }
  
export function maxLengthValidator (newValue: string): string | null{
    if (newValue.length > 100) {
      return newValue.substring(0, 100); // trim to 100 chars
    }
    return newValue;
  };
    
  export  const speedlimit = function (newValue: string): string | null {
    if (newValue === '') return null;
    if (!/^\d+$/.test(newValue)) {
      return null; 
    }
    const value = Number(newValue);
    if (value > 100) {
      return '100'; 
    }
    return newValue; 
  };  

  export function forloopvalidator(text: string): string | null {
    if (text === '' || text === '-') return text;
  
    if (/^-?\d+$/.test(text)) return text;
  
    return null;
  }

  export const singleDigitValidator = function (newValue: string): string | null {
    if (newValue === '') return null;
    if (!/^\d+$/.test(newValue)) {
      return null; 
    }
    const value = Number(newValue);
    if (value > 9) {
      return '9'; 
    }
    return newValue; 
  };