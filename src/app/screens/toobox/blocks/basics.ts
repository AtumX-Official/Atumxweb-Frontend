export const Basic : Record<string, string> = {
    SNOWFLAKE: `
    <block type="setup"></block> 
       <block type="led_control">
   <value name="value">
    <shadow type="math_number">
      <field name="NUM">0</field>
    </shadow>
   </value>
   </block>
    <block type="all_led_control"></block>
    <block type="clear_all_led"></block>
    <block type="led_sequence"></block>
     <block type="serial_print">
      <value name="CONTENT">
        <block type="text">
          <field name="TEXT"></field>
        </block>
      </value>
    </block>
    <block type="delay"></block>
     `,
     SUBO: `
      <block type="setup"></block> 
      <block type="led_control">
  <value name="value">
    <shadow type="math_number">
      <field name="NUM">0</field>
    </shadow>
  </value>
</block>
  <block type="all_led_control"></block>
  <block type="led_sequence"></block>
  <block type="play_note"></block>
  <block type="buzzer"></block>
  <block type="buzzer_preset"></block>
  <block type="testled_control"></block>
  <block type="clear_all_led"></block>
  <block type="Button"></block>
   <block type="serial_print">
      <value name="CONTENT">
        <block type="text">
          <field name="TEXT"></field>
        </block>
      </value>
    </block>
    <block type="delay"></block>
  <block type="display_number">
  <value name="CONTENT">
    <block type="single_digit">
      <field name="NUM">0</field>
    </block>
  </value>
</block>
  `,
  CAYO :
  `
      <block type="setup"></block> 
        <block type="led_control">
  <value name="value">
    <shadow type="math_number">
      <field name="NUM">0</field>
    </shadow>
  </value>
</block>
    <block type="all_led_control"></block>
    <block type="clear_all_led"></block>
    <block type="led_sequence"></block>
    <block type="play_note"></block>
    <block type="buzzer"></block>
    <block type="buzzer_preset"></block>
     <block type="serial_print">
      <value name="CONTENT">
        <block type="text">
          <field name="TEXT"></field>
        </block>
      </value>
    </block>
    <block type="delay"></block>
  `,
  DRONE : `
        <block type="setup"></block> 
        <block type="serial_print">
      <value name="CONTENT">
        <block type="text">
          <field name="TEXT"></field>
        </block>
      </value>
    </block>
    <block type="delay"></block>
    <block type="droneled"></block>
    
  `
  };
  