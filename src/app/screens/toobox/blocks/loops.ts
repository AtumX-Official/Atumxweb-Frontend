export const Loop : Record<string, string> = {
    
    SNOWFLAKE: `
 <block type="custom_repeat_ext">
      <value name="TIMES">
    <shadow type="math_number">
      <field name="NUM">0</field>
    </shadow>
  </value>
    </block>       `,
     LOOP_GENERIC: `
      <block type="custom_repeat_ext">
      <value name="TIMES">
    <shadow type="math_number">
      <field name="NUM">0</field>
    </shadow>
  </value>
    </block>     
    <block type="forloop"></block>
    <block type="while"></block> 
    <block type="continue"></block>
    <block type="break"></block>
    `,
  };