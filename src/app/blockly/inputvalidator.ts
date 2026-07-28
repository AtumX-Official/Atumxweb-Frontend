export const integerOnlyValidator = function (newValue) {
    if (/^\d+$/.test(newValue)) {
      return newValue;
    }
    return null; 
  };
  
export function integervalidatior(block, inputName) {
    const targetBlock = block.getInputTargetBlock(inputName);
    if (!targetBlock) return;
    if (targetBlock.type !== 'math_number') return;
    const numField = targetBlock.getField('NUM');
      if (!numField._integerValidatorAttached) {
      numField.setValidator(integerOnlyValidator);
      numField._integerValidatorAttached = true;
    }
  }
  
export  const intergerlimit = function (newValue) {
    if (newValue === '') return null;
    if (!/^\d+$/.test(newValue)) {
      return null; 
    }
    const value = Number(newValue);
    if (value > 255) {
      return 255; 
    }
    return newValue; 
  };


export function validateStartEnd(block) {
    const startBlock = block.getInputTargetBlock('START');
    const endBlock = block.getInputTargetBlock('END');
  
    if (!startBlock || !endBlock) return;
    if (startBlock.type !== 'math_number' || endBlock.type !== 'math_number') return;
  
    const startField = startBlock.getField('NUM');
    const endField = endBlock.getField('NUM');
  
    if (startField._rangeValidatorAttached) return;
  
    const rangeValidator = function (newValue) {
      if (!/^\d+$/.test(newValue)) return null;
  
      const thisField = this;
      const isStart = thisField === startField;
  
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
  
export function maxLengthValidator (newValue: string) {
    if (newValue.length > 100) {
      return newValue.substring(0, 100); // trim to 100 chars
    }
    return newValue;
  };
    
  export  const speedlimit = function (newValue) {
    if (newValue === '') return null;
    if (!/^\d+$/.test(newValue)) {
      return null; 
    }
    const value = Number(newValue);
    if (value > 100) {
      return 100; 
    }
    return newValue; 
  };  

  export function forloopvalidator(text) {
    if (text === '' || text === '-') return text;
  
    if (/^-?\d+$/.test(text)) return text;
  
    return null;
  }

  export const singleDigitValidator = function (newValue) {
    if (newValue === '') return null;
    if (!/^\d+$/.test(newValue)) {
      return null; 
    }
    const value = Number(newValue);
    if (value > 9) {
      return 9; 
    }
    return newValue; 
  };