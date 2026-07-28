import customGenerator from ".";

customGenerator.forBlock["Hello"] = function(){
    const jsonOutput = {
        Playmocmd : {
            cmd : 'hello'
          }    
      };
    return JSON.stringify(jsonOutput, null, 2); 
}

customGenerator.forBlock["Pushup"] = function(){
    const jsonOutput = {
        Playmocmd : {
            cmd : 'pushup'
          }    
      };
    return JSON.stringify(jsonOutput, null, 2); 
}

customGenerator.forBlock["Wiggle"] = function(){
    const jsonOutput = {
        Playmocmd : {
            cmd : 'wiggle'
          }    
      };
    return JSON.stringify(jsonOutput, null, 2); 
}

customGenerator.forBlock["Bow"] = function(){
    const jsonOutput = {
        Playmocmd : {
            cmd : 'bow'
          }    
      };
    return JSON.stringify(jsonOutput, null, 2); 
}

customGenerator.forBlock["Jump"] = function(){
    const jsonOutput = {
        Playmocmd : {
            cmd : 'jump'
          }    
      };
    return JSON.stringify(jsonOutput, null, 2); 
}