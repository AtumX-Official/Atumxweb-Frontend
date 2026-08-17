export const Displays = {
     SUBO: 
     `
<block type="cayoLCDsetup"></block>
<block type="LCDprint"></block>
<block type="LCDPrintWS"></block>
<block type="LCDsetcursor"></block>
<block type="LCDcmd"></block>
   <block type="lcd_print">
      <value name="CONTENT">
        <block type="text">
          <field name="TEXT"></field>
        </block>
      </value>
    </block>
<block type="cayoOleddisplay"></block>
<block type="oled_set_cursor"></block>
<block type="oled_set_font_size"></block>
<block type="oled_clear"></block>
<block type="Display"></block>
<block type="happy"></block>
<block type="alarm"></block>
<block type="conf"></block>   
   <block type="oled_print">
      <value name="CONTENT">
        <block type="text">
          <field name="TEXT"></field>
        </block>
      </value>
    </block>
`,
  CAYO :
  `
<block type="LCDsetup"></block>
<block type="LCDprint"></block>
<block type="LCDPrintWS"></block>
<block type="LCDsetcursor"></block>
<block type="LCDcmd"></block>
<block type="Oleddisplay"></block>
<block type="Display"></block>
<block type="happy"></block>
<block type="alarm"></block>
<block type="conf"></block>
  `,
  STEMROBO : `
  <block type="stemroboLCDsetup"></block>
<block type="LCDprint"></block>
<block type="LCDPrintWS"></block>
<block type="LCDsetcursor"></block>
<block type="LCDcmd"></block>
<block type="stemroboOleddisplay"></block>
<block type="Display"></block>
<block type="happy"></block>
<block type="alarm"></block>
<block type="conf"></block>   
  `,
  };