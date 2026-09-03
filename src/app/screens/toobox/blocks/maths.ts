export const Maths : Record<string, string> = {
    SNOWFLAKE: `
       <block type="input_value"></block>
<block type="varmath">
 <value name="RIGHT">
<shadow type="math_number">
 <field name="NUM">0</field>
</shadow>
</value>
<value name="LEFT">
<shadow type="math_number">
 <field name="NUM">0</field>
</shadow>
</value>
</block>
    `,
    MATH_GENERIC: 
     `
    <block type="input_value"></block>
<block type="varmath">
<value name="RIGHT">
<shadow type="math_number">
<field name="NUM">0</field>
</shadow>
</value>
<value name="LEFT">
<shadow type="math_number">
<field name="NUM">0</field>
</shadow>
</value>
</block>
<block type="math_modulo">
  <value name="num">
<shadow type="math_number">
<field name="NUM">0</field>
</shadow>
</value>
<value name="den">
<shadow type="math_number">
<field name="NUM">0</field>
</shadow>
</value>
</block>
<block type="squareroot">
<value name="NUM">
<shadow type="math_number">
<field name="NUM">0</field>
</shadow>
</value>
</block>
<block type="evenodd">
<value name="value">
<shadow type="math_number">
<field name="NUM">0</field>
</shadow>
</block>
    <block type="random">
  <value name="START">
    <shadow type="math_number">
      <field name="NUM">0</field>
    </shadow>
  </value>
  <value name="END">
    <shadow type="math_number">
      <field name="NUM">100</field>
    </shadow>
  </value>
</block>
    `
  };