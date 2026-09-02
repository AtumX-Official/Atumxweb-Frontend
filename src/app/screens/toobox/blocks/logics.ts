export const Logic : Record<string, string> = {
    SNOWFLAKE: `
      <block type="custom_if"></block>
        <block type="custom_else"></block>
        <block type="custom_elseif"></block>
         <block type="custom_compare"></block>
      <block type="logical_if"></block>
    `,
    LOGIC_GENERIC: 
     `
    <block type="custom_if"></block>
        <block type="custom_else"></block>
        <block type="custom_elseif"></block>
        <block type="custom_compare"></block>
        <block type="logical_if"></block>
        <block type="function_declaration"></block>
      <block type="function_call"></block>
      <block type="custom_not"></block>
    `,
  };