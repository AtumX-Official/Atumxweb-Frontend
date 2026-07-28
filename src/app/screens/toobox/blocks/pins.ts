export const Pins = {
    SNOWFLAKE: `
       <block type="sfdigital_read"></block>
        <block type="sfdigital_write"></block>
        <block type="sfanalog_read"></block>
<block type="sfanalog_write">
      <value name="value">
      <shadow type="math_number">
      <field name="NUM">0</field>
      </shadow>
      </value>
      </block>       
      <block type="sfpinmode"></block>
    `,
     SUBO: 
     `
     <block type="cayodigital_read"></block>
    <block type="cayodigital_write"></block>
    <block type="cayoanalog_read"></block>
      <block type="cayoanalog_write">
      <value name="value">
      <shadow type="math_number">
      <field name="NUM">0</field>
      </shadow>
     </value>
      </block>
    <block type="cayopinmode"></block>
    `,
  CAYO :
  `
     <block type="digital_read"></block>
    <block type="digital_write"></block>
    <block type="analog_read"></block>
<block type="analog_write">
  <value name="value">
    <shadow type="math_number">
      <field name="NUM">0</field>
    </shadow>
  </value>
    </block>  
    <block type="pinmode"></block>
  `,
  DRONE : `
   <block type="dronedigital_read"></block>
    <block type="dronedigital_write"></block>
    <block type="droneanalog_read"></block>
<block type="droneanalog_write">
  <value name="value">
    <shadow type="math_number">
      <field name="NUM">0</field>
    </shadow>
  </value>
    </block>  
    <block type="dronepinmode"></block>
  `
  };